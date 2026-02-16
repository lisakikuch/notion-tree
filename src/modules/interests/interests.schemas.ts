import { z } from 'zod';

// Shared Primitives
const uuidSchema = z.uuid();

const nonEmptyTrimmedString = z
    .string()
    .trim()
    .min(1, 'Must not be empty');

const optionalTrimmedText = z
    .string()
    .trim()
    .min(1)
    .transform((val) => (val === '' ? undefined : val))
    .optional();

const sortSchema = z.enum(['asc', 'desc']).default('desc');

// Cursor Handling
const cursorPayloadSchema = z.object({
    lastAccessedAt: z.iso.datetime(),
    id: uuidSchema,
});

// schema that validates the string is a valid cursor
const cursorStringSchema = z.string().superRefine((val, ctx) => {
    try {
        const json = Buffer.from(val, 'base64').toString('utf-8');
        const parsed = JSON.parse(json);
        const res = cursorPayloadSchema.safeParse(parsed);
        if (!res.success) {
            ctx.addIssue({ code: 'custom', message: 'Invalid cursor format' });
        }
    } catch {
        ctx.addIssue({ code: 'custom', message: 'Invalid cursor format' });
    }
});

// GET /interests
export const listInterestsQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(50).default(20),
    cursor: cursorStringSchema,
    sort: sortSchema,
    tagId: uuidSchema.optional(),
});

// Resource Object (used in create + patch)
const resourceSchema = z.object({
    title: nonEmptyTrimmedString,
    url: z.url().optional(),
});

// POST /interests
export const createInterestBodySchema = z
    .object({
        title: nonEmptyTrimmedString,
        reflection: optionalTrimmedText,
        resources: z.array(resourceSchema).optional(),
        tagIds: z.array(uuidSchema).optional()
    });

// PATCH /interests/:id
export const patchInterestBodySchema = z
    .object({
        title: nonEmptyTrimmedString,
        reflection: optionalTrimmedText,
        tagIds: z.array(uuidSchema).optional(),
        resources: z.array(resourceSchema).optional(),
    })
    .refine(
        (obj) =>
            obj.title !== undefined ||
            obj.reflection !== undefined ||
            obj.tagIds !== undefined ||
            obj.resources !== undefined,
        {
            message: 'At least one field must be provided',
        }
    );

// Params
export const interestIdParamsSchema = z
    .object({
        id: uuidSchema,
    })