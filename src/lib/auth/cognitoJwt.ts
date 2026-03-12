import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { UnauthorizedError } from '@/lib/http/errors.js';

const {
  COGNITO_USER_POOL_ID,
  COGNITO_APP_CLIENT_ID,
} = process.env;

if (!COGNITO_USER_POOL_ID || !COGNITO_APP_CLIENT_ID) {
  throw new Error('Missing Cognito configuration');
}

const verifier = CognitoJwtVerifier.create({
    userPoolId: COGNITO_USER_POOL_ID,
    tokenUse: 'access',
    clientId: COGNITO_APP_CLIENT_ID,
})

export async function verifyToken(token: string) {
    try {
        return await verifier.verify(token);
    } catch {
        throw new UnauthorizedError('Invalid token');
    }
}