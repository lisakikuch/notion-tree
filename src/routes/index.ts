import { Router } from 'express';
import authRoutes from '@/modules/auth/auth.route.js';
import interestsRoutes from '@/modules/interests/interests.routes.js';
import tagsRoutes from '@/modules/tags/tags.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/interests', interestsRoutes);
router.use('/tags', tagsRoutes);

export default router;