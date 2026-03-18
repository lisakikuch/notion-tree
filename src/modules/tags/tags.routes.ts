import express from 'express';
import { requireAuth } from '@/lib/auth/index.js';
import { validate } from '@/lib/validation/validate.js'
import { createTagBodySchema, tagParamsSchema } from '@/modules/tags/tags.schemas.js';
import { asyncHandler } from '@/lib/http/asyncHandler.js';
import * as tagsController from '@/modules/tags/tags.controller.js';

const router = express.Router();

router.get(
    '/',
    requireAuth,
    asyncHandler(tagsController.listTags)
);

router.post(
    '/',
    requireAuth,
    validate({ body: createTagBodySchema }),
    asyncHandler(tagsController.createTag)
);

router.delete(
    '/:id',
    requireAuth,
    validate({ params: tagParamsSchema }),
    asyncHandler(tagsController.deleteTag)
);

export default router;