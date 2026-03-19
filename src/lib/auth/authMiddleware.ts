import type { RequestHandler } from 'express';
import { verifyToken } from '@/lib/auth/cognitoJwt.js';
import { UnauthorizedError } from '@/lib/http/errors.js';

const auth: RequestHandler = async (req, res, next) => {

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
export default auth;
