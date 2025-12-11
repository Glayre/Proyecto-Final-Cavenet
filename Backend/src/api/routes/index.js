import { Router } from "express";
import planRoutes from "./plan.route.js";
import userRoutes from "./user.route.js";
import invoiceRoutes from "./invoiceroute.js";

/**
 * Enrutador principal de la API.
 *
 * Este archivo centraliza todas las rutas de la aplicación y las organiza bajo
 * prefijos específicos para mantener una estructura modular, escalable y clara.
 *
 * @constant
 * @type {express.Router}
 *
 * @example
 * // Uso en server.js
 * import routes from "./api/routes/index.js";
 * app.use("/api", routes);
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
 * PUT /api/plans/:id
 * DELETE /api/plans/:id
 */
router.use("/plans", planRoutes);

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
 * GET /api/users/:id
 */
router.use("/users", userRoutes);

/**
 * Rutas de facturas.
 *
 * Todas las rutas relacionadas con la gestión de facturas estarán disponibles
 * bajo el prefijo `/invoices`.
 *
 * @example
 * POST /api/invoices        // Crear factura (solo admin)
 * GET /api/invoices         // Obtener todas las facturas (solo admin)
 * GET /api/invoices/:id     // Obtener facturas de un cliente
 * PATCH /api/invoices/:id   // Actualizar estado de factura (pago/vencida)
 */
router.use("/invoices", invoiceRoutes);

export default router;
