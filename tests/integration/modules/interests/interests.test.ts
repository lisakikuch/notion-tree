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