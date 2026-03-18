import type { RequestHandler } from 'express';

export const devAuth: RequestHandler = (req, res, next) => {
    const DEV_USER_ID = process.env.DEV_USER_ID

    if (!DEV_USER_ID) {
        return res.status(500).json({ error: 'DEV_USER_ID environment variable is not set' });
    }

    req.user = { sub: DEV_USER_ID }
    console.warn('Using development authentication with user ID:', DEV_USER_ID);
    return next();
}
