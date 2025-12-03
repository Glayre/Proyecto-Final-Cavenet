import { Router } from 'express';
import authRoutes from './auth.route.js';
import planRoutes from './plan.route.js';
import userRoutes from './user.route.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/plans', planRoutes);
router.use('/users', userRoutes);

export default router;

//import { Router } from 'express';
//import authRoutes from './auth.routes.js';


//const router = Router();

//router.use('/auth', authRoutes);


//export default router;
