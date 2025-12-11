import { Router } from 'express';
import * as controller from '../controllers/plan.controller.js';
import authMiddleware, { isAdmin } from '../middleware/auth.middleware.js';

/**
 * Enrutador de planes.
 *
 * Define las rutas relacionadas con la gestión de planes en la aplicación.
 * Incluye operaciones CRUD protegidas por middleware de autenticación
 * para garantizar que solo usuarios autorizados puedan realizar cambios.
 *
 * @constant
 * @type {express.Router}
 *
 * @example
 * // Uso en index.js
 * import planRoutes from './plan.route.js';
 * router.use('/plans', planRoutes);
 */
const router = Router();

/**
 * Obtener todos los planes disponibles.
 *
 * @route GET /plans
 * @access Público
 * @returns {Array<Object>} Lista de planes disponibles.
 */
router.get('/', controller.getPlans);

/**
 * Obtener un plan específico por ID.
 *
 * @route GET /plans/:id
 * @access Público
 * @param {string} req.params.id - ID del plan a consultar.
 * @returns {Object} JSON con los datos del plan encontrado.
 */
router.get('/:id', controller.getPlanById);

/**
 * Crear un nuevo plan.
 *
 * @route POST /plans
 * @access Privado (solo administradores, requiere JWT)
 * @param {Object} req.body - Datos del plan a crear.
 * @param {string} req.body.nombre - Nombre del plan.
 * @param {number} req.body.velocidadMbps - Velocidad en Mbps.
 * @param {number} req.body.precioUSD - Precio en dólares.
 * @param {string} req.body.tipo - Tipo de plan ("hogar" o "pyme").
 * @returns {Object} JSON con el plan creado.
 */
router.post('/', authMiddleware(true), isAdmin, controller.createPlan);

/**
 * Actualizar un plan existente por ID (actualización parcial).
 *
 * @route PATCH /plans/:id
 * @access Privado (solo administradores, requiere JWT)
 * @param {string} req.params.id - ID del plan a actualizar.
 * @param {Object} req.body - Campos a actualizar (parciales).
 * @returns {Object} JSON con el plan actualizado.
 */
router.patch('/:id', authMiddleware(true), isAdmin, controller.updatePlan);

/**
 * Eliminar un plan existente por ID.
 *
 * @route DELETE /plans/:id
 * @access Privado (solo administradores, requiere JWT)
 * @param {string} req.params.id - ID del plan a eliminar.
 * @returns {Object} JSON con confirmación de eliminación.
 */
router.delete('/:id', authMiddleware(true), isAdmin, controller.deletePlan);

export default router;
