import { Router } from "express";
import planRoutes from "./plan.route.js";
import userRoutes from "./user.route.js";
import contractRoutes from "./contrato.route.js";
import invoiceRoutes from "./invoice.route.js";
import registroRoutes from "./registro.route.js"; 
import contactoRoutes from "./contacto.routes.js"; // 👈 Se usa la 's' para coincidir con tu archivo físico

/**
 * Enrutador principal de la API.
 *
 * Este archivo centraliza todas las rutas de la aplicación y las organiza bajo
 * prefijos específicos para mantener una estructura modular, escalable y clara.
 *
 * @constant
 * @type {express.Router}
 */
const router = Router();

/**
 * Rutas de planes.
 * Prefijo: /api/plans
 */
router.use("/plans", planRoutes);

/**
 * Rutas de usuarios.
 * Prefijo: /api/users
 */
router.use("/users", userRoutes);

/**
 * Rutas de facturas.
 * Prefijo: /api/invoices
 */
router.use("/invoices", invoiceRoutes);

/**
 * Rutas de registros.
 * Prefijo: /api/registro
 */ 
router.use("/registro", registroRoutes);

/** * Rutas de contratos.
 * Prefijo: /api/contrato
 */
router.use("/contrato", contractRoutes);

/** * Rutas de contacto.
 * * Gestiona los mensajes enviados desde el formulario de la página principal.
 * Prefijo: /api/contacto
 * * @example 
 * POST /api/contacto // Para enviar el formulario
 * GET /api/contacto  // Para listar mensajes recibidos
 */
router.use("/contacto", contactoRoutes); // 👈 Registro habilitado

export default router;