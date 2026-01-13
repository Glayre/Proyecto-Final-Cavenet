import { Router } from "express";
import {
  createInvoice,
  getAllInvoices,
  getInvoicesByClient,
  updateInvoice,
  getInvoiceById
} from "../controllers/invoice.controller.js";
import authMiddleware, { isAdmin } from "../middleware/auth.middleware.js";

/**
 * Enrutador de facturas.
 *
 * Define las rutas relacionadas con la gestión de facturas en la aplicación.
 * Incluye operaciones protegidas por middleware de autenticación y control de roles
 * para garantizar que solo usuarios autorizados puedan realizar cambios.
 *
 * @constant
 * @type {express.Router}
 *
 * @example
 * // Uso en index.js
 * import invoiceRoutes from './invoice.route.js';
 * router.use('/invoices', invoiceRoutes);
 */
const router = Router();

/**
 * Crear una nueva factura (solo administrador).
 *
 * @route POST /api/invoices
 * @access Admin (JWT requerido)
 * @example
 * POST http://localhost:4000/api/invoices
 * Body:
 * {
 *   "clienteId": "ID_DEL_CLIENTE",
 *   "planId": "ID_DEL_PLAN",
 *   "mes": "NOVIEMBRE 2025",
 *   "montoUSD": 35
 * }
 */
router.post("/", authMiddleware(true), isAdmin, createInvoice);

/**
 * Obtener todas las facturas (solo administrador).
 *
 * @route GET /api/invoices
 * @access Admin (JWT requerido)
 * @example
 * GET http://localhost:4000/api/invoices
 */
router.get("/", authMiddleware(true), isAdmin, getAllInvoices);

/**
 * Obtener facturas de un cliente (el propio cliente o admin).
 *
 * @route GET /api/invoices/:clienteId
 * @access Cliente/Admin (JWT requerido)
 * @example
 * GET http://localhost:4000/api/invoices/ID_DEL_CLIENTE
 */
router.get("/:clienteId", authMiddleware(true), getInvoicesByClient);

/**
 * Actualizar estado de una factura.
 *
 * El cliente puede marcar como "pagado" su propia factura,
 * y el administrador puede marcar como "vencida".
 *
 * @route PATCH /api/invoices/:id
 * @access Cliente/Admin (JWT requerido)
 * @example
 * PATCH http://localhost:4000/api/invoices/ID_DE_FACTURA
 * Body:
 * {
 *   "estado": "pagado",
 *   "referenciaPago": "123456"
 * }
 */
router.patch("/:id", authMiddleware(true), updateInvoice);

/**
 * Obtener una factura por ID (el propio cliente o admin).
 *
 * @route GET /api/invoices/und/:id
 * @access Cliente/Admin (JWT requerido)
 * @example
 * GET http://localhost:4000/api/invoices/und/ID_DE_FACTURA
 */
router.get("/und/:id", authMiddleware(true), getInvoiceById);




/**
 * Exportar el enrutador de facturas.
 *
 * @exports router
 */
export default router;

