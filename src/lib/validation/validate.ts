import type { RequestHandler } from 'express';
import { ZodError, type z } from 'zod';
import { ValidationError } from '@/lib/http/errors.js';

type Schemas = Partial<{
    body: z.ZodTypeAny;
    query: z.ZodTypeAny;
    params: z.ZodTypeAny
}>;

export function validate(schemas: Schemas): RequestHandler {
    return (req, res, next) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body) as typeof req.body;
            }
            if (schemas.query) {
                req.query = schemas.query.parse(req.query) as typeof req.query;
            }
            if (schemas.params) {
                req.params = schemas.params.parse(req.params) as typeof req.params;
            }
            return next()
        } catch (err) {
            if (err instanceof ZodError) {
                return next(new ValidationError('Validation failed', err.issues));
            }
            return next(err);
        }
    };
}