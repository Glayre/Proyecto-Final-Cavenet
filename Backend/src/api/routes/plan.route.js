import { Router } from 'express';
import * as controller from '../controllers/plan.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', controller.getPlans);
router.post('/', authMiddleware(true), controller.createPlan);
router.put('/:id', authMiddleware(true), controller.updatePlan);
router.delete('/:id', authMiddleware(true), controller.deletePlan);

export default router;
