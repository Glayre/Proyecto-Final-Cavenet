/**
 * @file contrato.js
 * @description Definición de rutas para la gestión de contratos.
 * Contiene los endpoints principales para crear y listar contratos.
 */

import { Router } from "express";
import { crearContrato, listarContratos } from "../controllers/contrato.controller.js";

const router = Router();

/**
 * @route POST /api/contrato
 * @description Crea un nuevo contrato con los datos enviados en el cuerpo de la petición.
 * @access Público
 * 
 * @example
 * // Request Body (JSON)
 * {
 *   "nombres": "Juan",
 *   "apellidos": "Pérez",
 *   "cedula": "12345678",
 *   "correo": "juan@example.com",
 *   "plan": "FullHD"
 * }
 * 
 * // Response (201)
 * {
 *   "mensaje": "Contrato creado exitosamente",
 *   "contrato": { ... }
 * }
 */
router.post("/", crearContrato);

/**
 * @route GET /api/contrato
 * @description Obtiene la lista completa de contratos registrados.
 * @access Público
 * 
 * @example
 * // Response (200)
 * [
 *   {
 *     "id": 1,
 *     "nombres": "Juan",
 *     "apellidos": "Pérez",
 *     "correo": "juan@example.com",
 *     "plan": "FullHD",
 *     "fechaCreacion": "2025-12-29T07:30:00.000Z"
 *   }
 * ]
 */
router.get("/", listarContratos);

export default router;
