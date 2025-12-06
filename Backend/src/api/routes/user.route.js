import { Router } from 'express';
import {
  createUser,
  login,
  updateUser,
  getUsers,
  getUserById,
  deleteUser
} from '../controllers/user.controller.js';
import authMiddleware, { isAdmin } from '../middleware/auth.middleware.js'; // 🔹 importa también isAdmin

const router = Router();

// 🔓 Registro de usuario (sin token)
router.post('/register', createUser);

// 🔓 Login de usuario (sin token)
router.post('/login', login);

// 🔐 Obtener todos los usuarios (solo administradores)
router.get('/', authMiddleware(true), isAdmin, getUsers);

// 🔐 Obtener usuario por ID (cualquier usuario autenticado)
router.get('/:id', authMiddleware(true), getUserById);

// 🔐 Actualizar usuario
router.patch('/:id', authMiddleware(true), updateUser);

// 🔐 Eliminar usuario
router.delete('/:id', authMiddleware(true), deleteUser);

export default router;
