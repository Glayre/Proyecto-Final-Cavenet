import { Router } from 'express';
import {
  createUser,
  login,
  updateUser,
  getUsers,
  getUserById,
  deleteUser
} from '../controllers/user.controller.js';
import authMiddleware, { isAdmin } from '../middleware/auth.middleware.js'; // Importa también isAdmin

/**
 * Enrutador de usuarios.
 *
 * Define las rutas relacionadas con la gestión de usuarios en la aplicación.
 * Incluye operaciones de registro, login, obtención, actualización y eliminación
 * con niveles de acceso diferenciados (público, autenticado y administrador).
 *
 * @constant
 * @type {express.Router}
 *
 * @example
 * // Uso en index.js
 * import userRoutes from './user.route.js';
 * router.use('/users', userRoutes);
 */
const router = Router();

/**
 * Registro de usuario.
 *
 * @route POST /users/register
 * @access Público (no requiere token)
 * @param {Object} req.body - Datos del usuario a registrar.
 * @returns {Object} JSON con el usuario creado.
 */
router.post('/register', createUser);

/**
 * Login de usuario.
 *
 * @route POST /users/login
 * @access Público (no requiere token)
 * @param {Object} req.body - Credenciales de acceso (email y contraseña).
 * @returns {Object} JSON con token JWT y datos del usuario.
 */
router.post('/login', login);

/**
 * Obtener todos los usuarios.
 *
 * @route GET /users
 * @access Privado (requiere autenticación y rol administrador)
 * @returns {Array<Object>} Lista de usuarios activos.
 */
router.get('/', authMiddleware(true), isAdmin, getUsers);

/**
 * Obtener usuario por ID.
 *
 * @route GET /users/:id
 * @access Privado (requiere autenticación)
 * @param {string} req.params.id - ID del usuario.
 * @returns {Object} JSON con el usuario encontrado.
 */
router.get('/:id', authMiddleware(true), getUserById);

/**
 * Actualizar usuario (actualización parcial).
 *
 * @route PATCH /users/:id
 * @access Privado (requiere autenticación)
 * @param {string} req.params.id - ID del usuario a actualizar.
 * @param {Object} req.body - Campos a actualizar (parciales).
 * @returns {Object} JSON con el usuario actualizado.
 */
router.patch('/:id', authMiddleware(true), updateUser);

/**
 * Eliminar usuario (soft delete).
 *
 * @route DELETE /users/:id
 * @access Privado (requiere autenticación)
 * @param {string} req.params.id - ID del usuario a eliminar.
 * @returns {Object} JSON con confirmación de eliminación.
 */
router.delete('/:id', authMiddleware(true), isAdmin, deleteUser);

export default router;
