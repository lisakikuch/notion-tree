import {z} from 'zod';

export const createTagBodySchema = z.object({
    name: z.string().trim().min(1, 'Must not be empty'),
});

export const tagParamsSchema = z.object({
    id: z.uuid('Invalid tag ID'),
});

export type CreateTagBody = z.infer<typeof createTagBodySchema>;
export type TagParams = z.infer<typeof tagParamsSchema>;