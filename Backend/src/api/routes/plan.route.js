import { Router } from "express";
import {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
} from "../controllers/plan.controller.js";
import authMiddleware, { isAdmin } from "../middleware/auth.middleware.js";

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
 */
router.get("/", getPlans);

/**
 * Obtener un plan específico por ID.
 *
 * @route GET /plans/:id
 * @access Público
 */
router.get("/:id", getPlanById);

/**
 * Crear un nuevo plan (solo admin).
 *
 * @route POST /plans
 * @access Privado (admin)
 */
router.post("/", authMiddleware(true), isAdmin, createPlan);

// /**
//  * Contratar un plan (cliente autenticado).
//  *
//  * @route POST /plans/contratar
//  * @access Privado (cliente)
//  */
// router.post("/contratar", authMiddleware(true), contratarPlan);

/**
 * Actualizar un plan existente por ID.
 *
 * @route PATCH /plans/:id
 * @access Privado (admin)
 */
router.patch("/:id", authMiddleware(true), isAdmin, updatePlan);

/**
 * Eliminar un plan existente por ID.
 *
 * @route DELETE /plans/:id
 * @access Privado (admin)
 */
router.delete("/:id", authMiddleware(true), isAdmin, deletePlan);

export default router;
