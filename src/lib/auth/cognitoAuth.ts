import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { UnauthorizedError } from '@/lib/http/errors.js';

const {
    COGNITO_APP_CLIENT_ID,
    AWS_REGION
} = process.env;

const client = new CognitoIdentityProviderClient({ region: AWS_REGION || 'us-east-1' });

export async function loginWithCognito(email: string, password: string) {
    if (!COGNITO_APP_CLIENT_ID) throw new Error('Missing Cognito config');

    try {
        const command = new InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            },
            ClientId: COGNITO_APP_CLIENT_ID,
        });

        const res = await client.send(command);

        if (!res.AuthenticationResult) {
            throw new UnauthorizedError('Invalid credentials');
        }

        return {
            AccessToken: res.AuthenticationResult.AccessToken,
            RefreshToken: res.AuthenticationResult.RefreshToken,
            ExpiresIn: res.AuthenticationResult.ExpiresIn,
        };
    } catch (error) {
        if (error instanceof UnauthorizedError) throw error;
        console.error('Cognito error:', error);
        throw new UnauthorizedError('Login failed: Invalid email or password');
    }
}

export async function refreshWithCognito(refreshToken: string) {
    if (!COGNITO_APP_CLIENT_ID) throw new Error("Missing Cognito config");

    const command = new InitiateAuthCommand({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        AuthParameters: {
            REFRESH_TOKEN: refreshToken,
        },
        ClientId: COGNITO_APP_CLIENT_ID,
    });

    const res = await client.send(command);

    if (!res.AuthenticationResult?.AccessToken) {
        throw new UnauthorizedError("Could not refresh session");
    }

    return {
        AccessToken: res.AuthenticationResult.AccessToken,
        ExpiresIn: res.AuthenticationResult.ExpiresIn,
    };
}