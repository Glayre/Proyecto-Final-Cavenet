import { Router } from 'express';
import {
  createUser,
  login,
  updateUser,
  getUsers,
  getUserById,
  deleteUser,
  recoverPassword, // 👈 Controlador para recuperación de contraseña
  resetPassword,    // 👈 Nuevo controlador para restablecer contraseña
  reportarPago  // 👈 Nuevo controlador para reportar pago
} from '../controllers/user.controller.js';
import authMiddleware, { isAdmin } from '../middleware/auth.middleware.js';

/**
 * User Routes Module
 *
 * Este módulo define todas las rutas relacionadas con la gestión de usuarios
 * dentro de la aplicación. Incluye operaciones de registro, autenticación,
 * recuperación de contraseña, restablecimiento de contraseña, obtención,
 * actualización y eliminación de usuarios.
 *
 * @module routes/user
 * @requires express
 * @requires controllers/user.controller
 * @requires middleware/auth.middleware
 */

const router = Router();

/**
 * @route POST /users/register
 * @group Users - Operaciones relacionadas con usuarios
 * @summary Registro de un nuevo usuario
 * @access Público
 */
router.post('/register', createUser);

/**
 * @route POST /users/login
 * @group Users
 * @summary Autenticación de usuario
 * @access Público
 */
router.post('/login', login);

/**
 * @route POST /users/recover
 * @group Users
 * @summary Recuperación de contraseña
 * @access Público
 * @description Envía un correo de recuperación al usuario con instrucciones
 */
router.post('/recover', recoverPassword);

/**
 * @route POST /users/reset-password
 * @group Users
 * @summary Restablecer contraseña
 * @access Público
 * @description Permite al usuario establecer una nueva contraseña usando un token de recuperación
 */
router.post('/reset-password', resetPassword);

/**
 * @route GET /users
 * @group Users
 * @summary Obtener todos los usuarios activos
 * @access Privado (requiere autenticación y rol administrador)
 */
router.get('/', authMiddleware(true), isAdmin, getUsers);

/**
 * @route GET /users/:id
 * @group Users
 * @summary Obtener un usuario por ID
 * @access Privado (requiere autenticación)
 */
router.get('/:id', authMiddleware(true), getUserById);

/**
 * @route PATCH /users/:id
 * @group Users
 * @summary Actualizar parcialmente un usuario
 * @access Privado (requiere autenticación)
 */
router.patch('/:id', authMiddleware(true), updateUser);

/**
 * @route DELETE /users/:id
 * @group Users
 * @summary Eliminar un usuario (soft delete)
 * @access Privado (requiere autenticación y rol administrador)
 */
router.delete('/:id', authMiddleware(true), isAdmin, deleteUser);

/**
 * @route POST /users/reporte-pago
 * @group Users
 * @summary Reportar pago manual
 * @access Público
 * @description Permite al usuario reportar un pago con nombre, correo y referencia bancaria
 */
router.post('/reporte-pago', reportarPago);

export default router;
