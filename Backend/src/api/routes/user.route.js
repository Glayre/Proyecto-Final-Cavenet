import { Router } from 'express';
import * as controller from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware(true), controller.getUsers);
router.get('/:id', authMiddleware(true), controller.getUserById);
router.put('/:id', authMiddleware(true), controller.updateUser);
router.delete('/:id', authMiddleware(true), controller.deleteUser);

export default router;
