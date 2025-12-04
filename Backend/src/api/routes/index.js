import { Router } from 'express';
import planRoutes from './plan.route.js';
import userRoutes from './user.route.js';

const router = Router();

router.use('/plans', planRoutes);
router.use('/users', userRoutes);

export default router;



