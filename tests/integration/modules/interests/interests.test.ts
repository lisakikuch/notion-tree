import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '@/app.js';
import * as db from './../../helpers/db.js';

describe('Interests API Integration Tests', () => {

    describe('Authentication and Tenant Isolation', () => {
        it('Authentication: returns 401 if no token is provided', async () => {
            const res = await request(app)
                .post('/api/interests')
                .send({
                    title: 'Test-Interest'
                });
            expect(res.status).toBe(401);
        });
    });

    describe('GET /interests', () => {
        it('returns an empty list when no interests exist', async () => {
            const res = await request(app)
                .get('/api/interests')
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.items)).toBe(true);
            expect(res.body.items).toHaveLength(0);
        });

        it('returns a list of interests for the authenticated user in date descending order', async () => {
            const userId = 'test-user-id';
            await db.createSingleTestInterest(userId, 'Interest 1', 'Reflection 1');
            await db.createSingleTestInterest(userId, 'Interest 2', 'Reflection 2');
            await db.createSingleTestInterest(userId, 'Interest 3', 'Reflection 3');

            const res = await request(app)
                .get('/api/interests')
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(200);
            expect(res.body.items).toHaveLength(3);
            expect(res.body.items[0].title).toBe('Interest 3'); // Assuming descending order
            expect(res.body.items[2].title).toBe('Interest 1');
        });

        it('enforces tenant isolation (does not return other users\' interests)', async () => {
            await db.createMultipleTestInterests([
                { userId: 'test-user-id', title: 'My Interest', reflection: 'My Reflection' },
                { userId: 'other-user-id', title: 'Other Interest', reflection: 'Other Reflection' },
            ]);

            const res = await request(app)
                .get('/api/interests')
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(200);
            expect(res.body.items).toHaveLength(1);
            expect(res.body.items[0].title).toBe('My Interest');
        });

        it('includes tags in the response if present', async () => {
            const tag = await db.createSingleTestTag('test-user-id', 'Learning');
            await db.createTestInterestWithTags({
                title: 'Interest with Tags',
                userId: 'test-user-id',
                tagIds: [tag.id],
            });

            const res = await request(app)
                .get('/api/interests')
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(200);
            expect(res.body.items[0].tags).toBeDefined();
            expect(res.body.items[0].tags[0].name).toBe('Learning');
        });

        it('paginates correctly using limit and cursor', async () => {
            const userId = 'test-user-id';
            await db.createMultipleTestInterests([
                { userId, title: 'Interest A', reflection: 'Ref A' },
                { userId, title: 'Interest B', reflection: 'Ref B' },
                { userId, title: 'Interest C', reflection: 'Ref C' }
            ])

            // --- PAGE 1 ---
            // Fetch with limit=2
            const page1Res = await request(app)
                .get('/api/interests?limit=2')
                .set('Authorization', 'Bearer test-token');

            expect(page1Res.status).toBe(200);
            expect(page1Res.body.items).toHaveLength(2);
            // Since we created 3 items and requested 2, there should be a next page
            expect(typeof page1Res.body.nextCursor).toBe('string');
            expect(page1Res.body.nextCursor).not.toBeNull();

            // --- PAGE 2 ---
            // Fetch remaining items using the cursor from Page 1
            const page2Res = await request(app)
                .get(`/api/interests?limit=2&cursor=${page1Res.body.nextCursor}`)
                .set('Authorization', 'Bearer test-token');

            expect(page2Res.status).toBe(200);
            expect(page2Res.body.items).toHaveLength(1); // Only 1 item left
            // Since this is the end of the list, nextCursor should be null
            expect(page2Res.body.nextCursor).toBeNull();

            // Ensure no overlap of items between pages
            const page1Ids = page1Res.body.items.map((i: any) => i.id);
            expect(page1Ids).not.toContain(page2Res.body.items[0].id);
        });

        it('sorts interests correctly based on the sort parameter', async () => {
            const userId = 'test-user-id';

            await db.createMultipleTestInterests([
                { userId, title: 'Interest A', reflection: 'Ref A' },
                { userId, title: 'Interest B', reflection: 'Ref B' },
            ])

            // Fetch ascending
            const ascRes = await request(app)
                .get('/api/interests?sort=asc')
                .set('Authorization', 'Bearer test-token');

            expect(ascRes.status).toBe(200);

            // Fetch descending
            const descRes = await request(app)
                .get('/api/interests?sort=desc')
                .set('Authorization', 'Bearer test-token');

            expect(descRes.status).toBe(200);

            // Validate that the arrays are exact reverses of each other
            const ascIds = ascRes.body.items.map((i: any) => i.id);
            const descIds = descRes.body.items.map((i: any) => i.id);

            expect(ascIds[0]).toBe(descIds[descIds.length - 1]);
            expect(ascIds[ascIds.length - 1]).toBe(descIds[0]);
        });

        it('returns 422 validation error for query parameters outside allowed boundaries', async () => {
            // Test limit > max (50) defined in schema
            const overLimitRes = await request(app)
                .get('/api/interests?limit=100')
                .set('Authorization', 'Bearer test-token');

            expect(overLimitRes.status).toBe(422);
            expect(overLimitRes.body.message).toContain('Validation failed');

            // Test limit < min (1)
            const underLimitRes = await request(app)
                .get('/api/interests?limit=0')
                .set('Authorization', 'Bearer test-token');

            expect(underLimitRes.status).toBe(422);

            // Test invalid sort enum
            const invalidSortRes = await request(app)
                .get('/api/interests?sort=random')
                .set('Authorization', 'Bearer test-token');

            expect(invalidSortRes.status).toBe(422);
        });
    });

    describe('POST /interests', () => {
        it('creates a new interest successfully', async () => {
            const res = await request(app)
                .post('/api/interests')
                .set('Authorization', 'Bearer test-token')
                .send({
                    title: 'New Interest',
                    reflection: 'This is a reflection.',
                });

            expect(res.status).toBe(201);
            expect(res.body.title).toBe('New Interest');
            expect(res.body.id).toBeDefined();
        });

        it('creates a new interest with tags successfully', async () => {
            await db.createMultipleTestTags([
                { userId: 'test-user-id', name: 'Tag1' },
                { userId: 'test-user-id', name: 'Tag2' },
            ]);

            const tags = await db.findManyTagsByUserId('test-user-id');
            const tagIds = tags.map((t) => t.id);

            const res = await request(app)
                .post('/api/interests')
                .set('Authorization', 'Bearer test-token')
                .send({
                    title: 'Interest with Tags',
                    reflection: 'This interest has tags.',
                    tagIds,
                });

            expect(res.status).toBe(201);
            expect(res.body.title).toBe('Interest with Tags');

            const interestInDB = await db.findInterestByIdWithTags(
                res.body.id
            );

            expect(interestInDB).toBeDefined();
            expect(interestInDB?.tags).toHaveLength(2);
        });

        it('returns validation error for missing mandatory field', async () => {
            const res = await request(app)
                .post('/api/interests')
                .set('Authorization', 'Bearer test-token')
                .send({
                    // title is intentionally omitted
                    reflection: 'This is a reflection without a title.',
                });
            expect(res.status).toBe(422);
        });

        it('returns 404 if provided tagIds do not exist', async () => {
            const res = await request(app)
                .post('/api/interests')
                .set('Authorization', 'Bearer test-token')
                .send({
                    title: 'Invalid Tags Test',
                    tagIds: ['123e4567-e89b-12d3-a456-426614174000'], // Fake UUID
                });

            expect(res.status).toBe(404);
        })
    });

    describe('PATCH /interests/:id', () => {
        it('patches an interest successfully', async () => {
            const interest = await db.createSingleTestInterest('test-user-id', 'Interest to Patch', 'Reflection');

            const res = await request(app)
                .patch(`/api/interests/${interest.id}`)
                .set('Authorization', 'Bearer test-token')
                .send({
                    title: 'Updated Title',
                    reflection: 'Updated Reflection',
                });

            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Updated Title');
            expect(res.body.reflection).toBe('Updated Reflection');

            const updatedInterest = await db.findInterestById(interest.id);
            expect(updatedInterest?.title).toBe('Updated Title');
        })

        it('replaces existing tags with new ones', async () => {
            const tagA = await db.createSingleTestTag('test-user-id', 'Tag A');
            const tagB = await db.createSingleTestTag('test-user-id', 'Tag B');

            const interest = await db.createTestInterestWithTags({
                title: 'Test Interest',
                userId: 'test-user-id',
                tagIds: [tagA.id],
            });

            const res = await request(app)
                .patch(`/api/interests/${interest.id}`)
                .set('Authorization', 'Bearer test-token')
                .send({
                    tagIds: [tagB.id],
                });

            expect(res.status).toBe(200);

            const interestInDb = await db.findInterestByIdWithTags(interest.id);

            expect(interestInDb?.tags).toHaveLength(1);
            expect(interestInDb?.tags?.[0]?.tagId).toBe(tagB.id);
        })

        it('returns validation error if the request body is completely empty', async () => {
            const interest = await db.createSingleTestInterest('test-user-id', 'Test Title', 'Test Reflection');

            const res = await request(app)
                .patch(`/api/interests/${interest.id}`)
                .set('Authorization', 'Bearer test-token')
                .send({});

            expect(res.status).toBe(422);
        });

        it('returns validation error for an invalid UUID in the params', async () => {
            const interest = await db.createSingleTestInterest('test-user-id', 'Test Title', 'Test Reflection');

            const res = await request(app)
                .patch('/api/interests/invalid-uuid')
                .set('Authorization', 'Bearer test-token')
                .send({ title: 'Test Title' });

            expect(res.status).toBe(422);
        });
    });

    describe('DELETE /interests/:id', () => {
        it('deletes an interest successfully', async () => {
            const tag = await db.createSingleTestTag('test-user-id', 'Test Tag');
            const interest = await db.createTestInterestWithTags({
                title: 'Test Interest',
                userId: 'test-user-id',
                tagIds: [tag.id],
            });

            const res = await request(app)
                .delete(`/api/interests/${interest.id}`)
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(204);

            const deletedInterest = await db.findInterestById(interest.id);
            expect(deletedInterest).toBeNull();

            const joinRecords = await db.findInterestTagJoin(interest.id);
            expect(joinRecords).toHaveLength(0);

            const remainingTag = await db.findTagById(tag.id);
            expect(remainingTag).not.toBeNull();
        });

        it('returns 404 if trying to delete a non-existent interest', async () => {
            const randomUuid = '123e4567-e89b-12d3-a456-426614174000';
            const res = await request(app)
                .delete(`/api/interests/${randomUuid}`)
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(404);
        });

        it('returns 404 if a user tries to delete another user interest', async () => {
            const anotherUserInterest = await db.createSingleTestInterest('another-user-id', 'Another User Interest Title', 'Another User Interest Reflection');

            const res = await request(app)
                .delete(`/api/interests/${anotherUserInterest.id}`)
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(404);
        })
    });
});