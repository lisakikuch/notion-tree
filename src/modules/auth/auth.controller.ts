import type { RequestHandler } from 'express';
import { loginWithCognito, refreshWithCognito } from '@/lib/auth/cognitoAuth.js';
import { UnauthorizedError } from '@/lib/http/errors.js';

const { NODE_ENV } = process.env;

export const login: RequestHandler = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new UnauthorizedError('Email and password are required'));
        }

        // Backend talks to Cognito securely
        const authResult = await loginWithCognito(email, password);
        const { AccessToken, RefreshToken, ExpiresIn } = authResult;

        // Set the secure cookie
        res.cookie('refreshToken', RefreshToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: '/api/auth/refresh',
        });

        // Only send Access Token to JS
        res.status(200).json({ accessToken: AccessToken, expiresIn: ExpiresIn });
    } catch (error) {
        next(error);
    }
};

export const refresh: RequestHandler = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return next(new UnauthorizedError("Missing refresh token"));
        }

        const { AccessToken, ExpiresIn } = await refreshWithCognito(refreshToken);

        res.status(200).json({ accessToken: AccessToken, expiresIn: ExpiresIn });
    } catch (error) {
        next(error);
    }
};

export const logout: RequestHandler = (_req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'none',
        path: '/api/auth/refresh',
    });
    res.status(200).json({ message: 'Logged out' });
};