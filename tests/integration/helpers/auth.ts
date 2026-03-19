import { vi } from 'vitest';
import { verifyToken } from '@/lib/auth/cognitoJwt.js';
import { loginWithCognito, refreshWithCognito } from '@/lib/auth/cognitoAuth.js';
import { UnauthorizedError } from '@/lib/http/errors.js';

vi.mock('@/lib/auth/cognitoJwt.js', () => ({
    verifyToken: vi.fn(),
}));

vi.mock('@/lib/auth/cognitoAuth.js', () => ({
    loginWithCognito: vi.fn(),
    refreshWithCognito: vi.fn(),
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

export function mockLoginWithCognito() {
    vi.mocked(loginWithCognito).mockResolvedValue({
        AccessToken: 'mock-access-token',
        RefreshToken: 'mock-refresh-token',
        ExpiresIn: 3600,
    });
}

export function mockRefreshWithCognito() {
    vi.mocked(refreshWithCognito).mockResolvedValue({
        AccessToken: 'mock-new-access-token',
        ExpiresIn: 3600,
    });
}

export function mockRefreshWithCognitoFailure() {
    vi.mocked(refreshWithCognito).mockRejectedValue(
        new UnauthorizedError('Token expired')
    );
}