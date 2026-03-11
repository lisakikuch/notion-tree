import { Router } from 'express';
import * as interestsController from '@/modules/interests/interests.controller.js';
import auth from '@/lib/auth/authMiddleware.js';
import { validate } from '@/lib/validation/validate.js';
import { asyncHandler } from '@/lib/http/asyncHandler.js';
import {
    listInterestsQuerySchema,
    createInterestBodySchema,
    patchInterestBodySchema,
    interestIdParamsSchema
} from '@/modules/interests/interests.schemas.js';

const router = Router();

router.get(
    '/',
    auth,
    validate({ query: listInterestsQuerySchema }),
    asyncHandler(interestsController.listInterests)
);

router.post(
    '/', 
    auth, 
    validate({ body: createInterestBodySchema }),
    asyncHandler(interestsController.createInterest)
);

router.patch(
    '/:id', 
    auth, 
    validate({ params: interestIdParamsSchema, body: patchInterestBodySchema }),
    asyncHandler(interestsController.patchInterest)
);

router.delete(
    '/:id', 
    auth, 
    validate({ params: interestIdParamsSchema }),
    asyncHandler(interestsController.deleteInterest)
);

export default router;