import { vi } from 'vitest';
import { verifyToken } from '@/lib/auth/cognitoJwt.js';

vi.mock('@/lib/auth/cognitoJwt.js', () => ({
    verifyToken: vi.fn(),
}));

export function mockVerifyToken(userId: string = 'test-user-id') {
    const mockedVerifyToken = vi.mocked(verifyToken);
    mockedVerifyToken.mockResolvedValue({
        sub: userId,
    } as any);
}

export function resetMockVerifyToken() {
    vi.mocked(verifyToken).mockReset();
}