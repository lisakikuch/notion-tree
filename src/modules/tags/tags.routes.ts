import express from 'express';
import auth from '@/lib/auth/authMiddleware.js';
import { validate } from '@/lib/validation/validate.js'
import { createTagBodySchema, tagParamsSchema } from '@/modules/tags/tags.schemas.js';
import { asyncHandler } from '@/lib/http/asyncHandler.js';
import * as tagsController from '@/modules/tags/tags.controller.js';

const router = express.Router();

router.get(
    '/:',
    auth,
    asyncHandler(tagsController.listTags)
);

router.post(
    '/',
    auth,
    validate({ body: createTagBodySchema }),
    asyncHandler(tagsController.createTag)
);

router.delete(
    '/:id',
    auth,
    validate({ params: tagParamsSchema }),
    asyncHandler(tagsController.deleteTag)
);

export default router;