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
    .transform((val) => (val === "" ? null : val))
    .optional();

const sortSchema = z.enum(['asc', 'desc']).default('desc');

// GET /interests
export const listInterestsQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(50).default(20),
    cursor: z.string().min(1).optional(),
    sort: sortSchema,
});

// POST /interests
export const createInterestBodySchema = z
    .object({
        title: nonEmptyTrimmedString,
        reflection: optionalTrimmedText,
        tagIds: z.array(uuidSchema).optional()
    });

// PATCH /interests/:id
export const patchInterestBodySchema = z
    .object({
        title: nonEmptyTrimmedString.optional(),
        reflection: optionalTrimmedText,
        tagIds: z.array(uuidSchema).optional(),
    })
    .refine(
        (obj) =>
            obj.title !== undefined ||
            obj.reflection !== undefined ||
            obj.tagIds !== undefined,
        { message: "At least one field must be provided" }
    );

// Params
export const interestIdParamsSchema = z
    .object({
        id: uuidSchema,
    })