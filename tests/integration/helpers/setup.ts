import { beforeEach, afterEach, afterAll } from 'vitest';
import { mockVerifyToken, resetMockVerifyToken } from './auth.js';
import { resetDatabase, disconnectDatabase } from '../helpers/db.js';

beforeEach(async () => {
    await resetDatabase();
    mockVerifyToken();
});

afterEach(() => {
    resetMockVerifyToken();
});

afterAll(async () => {
    await disconnectDatabase();
});
