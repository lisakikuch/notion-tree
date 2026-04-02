import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../../src/app.js';
import { mockLoginWithCognito, mockRefreshWithCognito, mockRefreshWithCognitoFailure } from './../../helpers/auth.js';

describe('Auth API Integration Tests', () => {

    describe('POST /login', () => {
        it('returns accessToken and sets httpOnly refresh cookie on success', async () => {
            mockLoginWithCognito();

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'user@example.com', password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body.accessToken).toBe('mock-access-token');
            expect(res.body.expiresIn).toBe(3600);

            // Verify the cookie was set with correct flags
            const cookie = res.headers['set-cookie']?.[0] as string;
            expect(cookie).toMatch(/refreshToken=/);
            expect(cookie).toMatch(/HttpOnly/i);
            expect(cookie).toMatch(/Path=\/api\/auth\/refresh/i);
        });

        it('returns 401 for missing credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'user@example.com' }); // missing password

            expect(res.status).toBe(401);
        });
    });

    describe('POST /refresh', () => {
        it('returns a new accessToken when a valid refresh cookie is provided', async () => {
            mockRefreshWithCognito();

            const res = await request(app)
                .post('/api/auth/refresh')
                .set('Cookie', 'refreshToken=mock-refresh-token');

            expect(res.status).toBe(200);
            expect(res.body.accessToken).toBe('mock-new-access-token');
            expect(res.body.expiresIn).toBe(3600);
        });

        it('returns 401 if no refresh token cookie is provided', async () => {
            const res = await request(app)
                .post('/api/auth/refresh');
            // No cookie set

            expect(res.status).toBe(401);
        });

        it('returns 401 if the refresh token is expired or invalid', async () => {
            mockRefreshWithCognitoFailure();

            const res = await request(app)
                .post('/api/auth/refresh')
                .set('Cookie', 'refreshToken=expired-token');

            expect(res.status).toBe(401);
        });
    });

    describe('POST /logout', () => {
        it('clears the refresh token cookie', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .set('Cookie', 'refreshToken=mock-refresh-token');

            expect(res.status).toBe(200);

            const cookie = res.headers['set-cookie']?.[0] as string;
            // A cleared cookie has Max-Age=0 or an expired date
            expect(cookie).toMatch(/refreshToken=/);
            expect(cookie).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);
        });
    });

    describe('Login → Refresh flow', () => {
        it('can use the cookie from login to call refresh', async () => {
            mockLoginWithCognito();
            mockRefreshWithCognito();

            // Step 1: Login
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: 'user@example.com', password: 'password123' });

            expect(loginRes.status).toBe(200);

            // Step 2: Extract cookie and use it for refresh
            const cookie = loginRes.headers['set-cookie']?.[0] as string;

            const refreshRes = await request(app)
                .post('/api/auth/refresh')
                .set('Cookie', cookie);

            expect(refreshRes.status).toBe(200);
            expect(refreshRes.body.accessToken).toBeDefined();
        });
    });
});