import {z} from 'zod';

// POST /tags
export const createTagBodySchema = z.object({
    name: z.string().trim().min(1, 'Must not be empty'),
});
