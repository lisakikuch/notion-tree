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
                (req as any).body = schemas.body.parse(req.body)
            }
            if (schemas.query) {
                (req as any).query = schemas.query.parse(req.query)
            }
            if (schemas.params) {
                (req as any).params = schemas.params.parse(req.params);
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