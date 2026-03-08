import express from 'express';
import auth from '@/lib/auth/authMiddleware.js';
import { validate } from '@/lib/validation/validate.js'
import { createTagBodySchema } from './tags.schemas.js';
import { asyncHandler } from '@/lib/http/asyncHandler.js';
const router = express.Router();

router.get('/:', auth,);
router.post('/', auth, validate({ body: createTagBodySchema }));