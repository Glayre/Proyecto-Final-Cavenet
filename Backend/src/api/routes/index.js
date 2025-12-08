import { Router } from 'express';
import planRoutes from './plan.route.js';
import userRoutes from './user.route.js';

/**
 * Enrutador principal de la API.
 *
 * Este archivo centraliza las rutas de la aplicación y las organiza bajo
 * prefijos específicos para mantener una estructura modular y escalable.
 *
 * @constant
 * @type {express.Router}
 *
 * @example
 * // Uso en app.js
 * import routes from './api/routes/index.js';
 * app.use('/api', routes);
 */
const router = Router();

/**
 * Rutas de planes.
 *
 * Todas las rutas relacionadas con la gestión de planes estarán disponibles
 * bajo el prefijo `/plans`.
 *
 * @example
 * GET /api/plans
 * POST /api/plans
 */
router.use('/plans', planRoutes);

/**
 * Rutas de usuarios.
 *
 * Todas las rutas relacionadas con la gestión de usuarios estarán disponibles
 * bajo el prefijo `/users`.
 *
 * @example
 * POST /api/users/register
 * POST /api/users/login
 * GET /api/users
 */
router.use('/users', userRoutes);

export default router;
