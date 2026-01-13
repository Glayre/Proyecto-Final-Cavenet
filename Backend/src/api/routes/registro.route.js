/**
 * @file registro.js
 * @description Definición de rutas para la gestión de registros.
 * Contiene los endpoints principales para crear y listar registros.
 */

import { Router } from "express";
import { crearRegistro, listarRegistros } from "../controllers/registro.controller.js";

const router = Router();

/**
 * @route POST /api/registro
 * @description Crea un nuevo registro con los datos enviados en el cuerpo de la petición.
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
 *   "mensaje": "Registro creado exitosamente",
 *   "registro": { ... }
 * }
 */
router.post("/", crearRegistro);

/**
 * @route GET /api/registro
 * @description Obtiene la lista completa de registros almacenados.
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
router.get("/", listarRegistros);

export default router;
