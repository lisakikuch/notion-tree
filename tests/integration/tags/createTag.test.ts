import { describe, it, expect, beforeEach, vi, afterAll } from 'vitest';
import request from 'supertest';
import app from '@/app.js';

import { resetDatabase } from '../../helpers/db.js';

vi.mock('@/lib/auth/cognitoJwt.js', () => ({
    verifyToken: vi.fn(),
}));

import { verifyToken } from '@/lib/auth/cognitoJwt.js';

const mockedVerifyToken = vi.mocked(verifyToken);

describe('POST /tags', () => {
    beforeEach(async () => {
        await resetDatabase();
        mockedVerifyToken.mockResolvedValue({
            sub: 'test-user-id',
        } as any);
    });

    afterAll(async () => {
        const prisma = (await import('@/lib/prisma.js')).default;
        await prisma.$disconnect();
    });

    it('creates a tag successfully', async () => {
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
