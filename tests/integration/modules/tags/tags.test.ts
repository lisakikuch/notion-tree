import { describe, it, expect } from 'vitest';
import { mockVerifyToken } from './../../helpers/auth.js';
import request from 'supertest';
import app from '../../../../src/app.js';
import { createMultipleTestTags, createSingleTestTag, findTagById } from './../../helpers/db.js';

describe('Tags API Integration Tests', () => {

    describe('Authentication and Tenant Isolation', () => {
        it('Authentication: returns 401 if no token is provided', async () => {
            const res = await request(app)
                .post('/api/tags')
                .send({
                    name: 'Test-Tag',
                });
            expect(res.status).toBe(401);
        });

        it('Tenant Isolation: does not allow access to tags of other users', async () => {
            await createMultipleTestTags(
                [
                    { userId: 'user-1', name: 'User 1 Tag' },
                    { userId: 'user-2', name: 'User 2 Tag' },
                ]);

            mockVerifyToken('user-1');

            const res = await request(app)
                .get('/api/tags')
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0]).toMatchObject({
                name: 'User 1 Tag',
            });
        });
    });

    describe('GET /tags', () => {
        it('returns tags sorted alphabetically', async () => {
            const userId = 'test-user-id';

            await createMultipleTestTags([
                { userId, name: 'Banana' },
                { userId, name: 'apple' },
                { userId, name: 'Cherry' },
            ]);

            const res = await request(app)
                .get('/api/tags')
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(3);
            expect(res.body.data[0].name).toBe('apple');
            expect(res.body.data[1].name).toBe('Banana');
            expect(res.body.data[2].name).toBe('Cherry');
        });

        it('returns empty array if user has no tags', async () => {

            const res = await request(app)
                .get('/api/tags')
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual([]);
        });
    });

    describe('POST /tags', () => {
        it('creates a tag and returns 201', async () => {
            const res = await request(app)
                .post('/api/tags')
                .set('Authorization', 'Bearer test-token')
                .send({
                    name: 'Test-Tag',
                });

            expect(res.status).toBe(201);
            expect(res.body).toMatchObject({
                name: 'Test-Tag',
            });
            expect(res.body.id).toBeDefined();
        });

        it('rejects empty tag name', async () => {
            const res = await request(app)
                .post('/api/tags')
                .set('Authorization', 'Bearer test-token')
                .send({
                    name: '',
                });
            expect(res.status).toBe(422);
        });

        it('rejects duplicate tag names', async () => {
            await request(app)
                .post('/api/tags')
                .set('Authorization', 'Bearer test-token')
                .send({
                    name: 'Test-Tag',
                });

            const res = await request(app)
                .post('/api/tags')
                .set('Authorization', 'Bearer test-token')
                .send({
                    name: 'test-tag',
                });

            expect(res.status).toBe(409);
        });
    });

    describe('DELETE /tags/:id', () => {
        it('deletes a tag and returns 204', async () => {
            const tag = await createSingleTestTag('test-user-id', 'Tag to Delete');

            const res = await request(app)
                .delete(`/api/tags/${tag.id}`)
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(204);

            const deletedTag = await findTagById(tag.id);
            expect(deletedTag).toBeNull();
        });

        it('returns 404 if tag does not exist', async () => {
            const randomUuid = '123e4567-e89b-12d3-a456-426614174000';

            const res = await request(app)
                .delete(`/api/tags/${randomUuid}`)
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(404);
        });

        it('returns validation error for invalid UUID', async () => {
            const res = await request(app)
                .delete('/api/tags/invalid-uuid')
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(422);
        });

        it('returns 404 if tag belongs to another user', async () => {
            const tag = await createSingleTestTag('other-user-id', 'Other User Tag');
            const res = await request(app)
                .delete(`/api/tags/${tag.id}`)
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(404);
        });
    });
});