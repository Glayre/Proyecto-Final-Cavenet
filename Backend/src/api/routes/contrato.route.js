/**
 * @file contrato.route.js
 * @description Definición de rutas para la gestión de contratos.
 * Solo accesible por el administrador para vincular clientes con planes.
 */

import { Router } from "express";
import { crearContrato, listarContratos, actualizarEstadoContrato } from "../controllers/contrato.controller.js";
import authMiddleware, { isAdmin } from "../middleware/auth.middleware.js"; // 👈 Middleware de seguridad

const router = Router();

/**
 * @route POST /api/contrato
 * @description Crea un nuevo contrato. Solo el administrador tiene permiso.
 * @access Privado (Admin)
 * * @example
 * // Request Body (JSON)
 * {
 * "clienteId": "65a1b...",
 * "planId": "65b2c...",
 * "correoAlternativo": "admin@empresa.com"
 * }
 */
// Aplicamos verifyToken para validar que está logueado e isAdmin para el rol
router.post("/", authMiddleware(true),  isAdmin, crearContrato);

/**
 * @route GET /api/contrato
 * @description Obtiene la lista completa de contratos (Vista administrativa).
 * @access Privado (Admin)
 */
router.get("/", authMiddleware(true), isAdmin, listarContratos);

/**
 * @route PATCH /api/contrato/:id
 * @description Actualiza el estado de un contrato (activo/suspendido).
 * @access Privado (Admin)
 */
router.patch("/:id", authMiddleware(true), isAdmin, actualizarEstadoContrato);

export default router;