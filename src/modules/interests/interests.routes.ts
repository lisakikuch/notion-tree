import express from 'express';
import auth from '@/lib/auth/authMiddleware.js';
import { validate } from '@/lib/validation/validate.js';
import { asyncHandler } from '@/lib/http/asyncHandler.js';
import { listInterestsQuerySchema, createInterestBodySchema, patchInterestBodySchema, interestIdParamsSchema } from '@/modules/interests/interests.schemas.js';
const router = express.Router();

router.get('/', auth, validate({ query: listInterestsQuerySchema }));
router.post('/', auth, validate({ body: createInterestBodySchema }));
router.patch('/:id', auth, validate({ params: interestIdParamsSchema, body: patchInterestBodySchema }));
router.delete('/:id', auth, validate({ params: interestIdParamsSchema }));