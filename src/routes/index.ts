import {Router } from 'express';
import interestsRoutes from '@/modules/interests/interests.routes.js';
import tagsRoutes from '@/modules/tags/tags.routes.js';

const router = Router();

router.use('/interests', interestsRoutes);
router.use('/tags', tagsRoutes);

export default router;