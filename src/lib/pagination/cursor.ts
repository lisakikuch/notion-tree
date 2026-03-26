import { z } from 'zod';
import { BadRequestError } from '@/lib/http/errors.js';

export type CursorPayload = {
    updatedAt: Date;
    id: string;
};

const cursorPayloadWireSchema = z.object({
    updatedAt: z.iso.datetime(),
    id: z.uuid(),
});

export function decodeCursor(cursorString: string): CursorPayload {
    try {
        if (!cursorString) {
            throw new BadRequestError("Invalid cursor format");
        }
        // 1) base64 -> json string
        const json = Buffer.from(cursorString, 'base64').toString('utf-8');
        // 2) json -> object
        const parsedUnknown = JSON.parse(json);
        // 3) validate shape
        const parsed = cursorPayloadWireSchema.parse(parsedUnknown);
        // 4) convert ISO -> Date
        const dt = new Date(parsed.updatedAt);
        if (Number.isNaN(dt.getTime())) {
            throw new BadRequestError('Invalid cursor format');
        }

        return { updatedAt: dt, id: parsed.id }
    } catch (err) {
        if (err instanceof z.ZodError) {
            throw new BadRequestError('Invalid cursor format', err.issues);
        }
        if (err instanceof BadRequestError) throw err;
        throw new BadRequestError('Invalid cursor format');
    }
}

export function encodeCursor(payload: CursorPayload): string {
    const wire = {
        updatedAt: payload.updatedAt.toISOString(),
        id: payload.id,
    };

    return Buffer.from(JSON.stringify(wire), 'utf-8').toString('base64');
}