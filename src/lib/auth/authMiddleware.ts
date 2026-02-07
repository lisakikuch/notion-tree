// src/lib/auth/authMiddleware.ts

import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/lib/auth/cognitoJwt.js';
import { UnauthorizedError } from '@/lib/http/errors.js';

const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const DEV_USER_ID = process.env.DEV_USER_ID

    if (process.env.NODE_ENV === 'development' && DEV_USER_ID) {
        req.user = { sub: DEV_USER_ID }
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return next(new UnauthorizedError('Missing Authorization header'));
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
        return next(new UnauthorizedError('Missing token'));
    }

    try {
        const payload = await verifyToken(token);
        req.user = { sub: payload.sub };
        return next();
    } catch (err) {
        return next(err);
    }
}
export default authMiddleware;
