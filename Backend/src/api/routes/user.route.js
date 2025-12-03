import { Router } from 'express';
import {
  createUser,
  updateUser,
  getUsers,
  getUserById,
  deleteUser
} from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

// Crear usuario
router.post('/', authMiddleware(true), createUser);

// Obtener todos los usuarios
router.get('/', authMiddleware(true), getUsers);

// Obtener usuario por ID
router.get('/:id', authMiddleware(true), getUserById);

// Actualizar usuario
router.put('/:id', authMiddleware(true), updateUser);

// Eliminar usuario
router.delete('/:id', authMiddleware(true), deleteUser);

export default router;
