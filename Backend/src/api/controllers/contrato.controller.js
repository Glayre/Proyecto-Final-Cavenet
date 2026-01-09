/**
 * @file contrato.controller.js
 * @description Controlador de contratos. Maneja la lógica de creación y consulta de contratos en MongoDB.
 */

import Contrato from "../models/contrato.model.js";
import User from "../models/user.model.js";   // Modelo de usuarios
import Plan from "../models/plan.model.js";   // Modelo de planes

/**
 * Crear un nuevo contrato
 * 
 * @function crearContrato
 * @description Valida que el usuario y el plan existan antes de crear el contrato. 
 * Devuelve el contrato creado con el plan populado.
 * 
 * @param {import("express").Request} req - Objeto de la petición HTTP
 * @param {import("express").Response} res - Objeto de la respuesta HTTP
 * 
 * @example
 * // POST /api/contratos
 * {
 *   "usuarioid": "65a1234567890",
 *   "planid": "65b9876543210",
 *   "nombres": "Juan",
 *   "apellidos": "Pérez",
 *   "correo": "juan@test.com"
 * }
 */
export const crearContrato = async (req, res) => {
  try {
    const { usuarioid, planid, ...resto } = req.body;

    // 1️⃣ Validar usuario
    const usuario = await User.findById(usuarioid);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // 2️⃣ Validar plan
    const plan = await Plan.findById(planid);
    if (!plan) {
      return res.status(404).json({ error: "Plan no encontrado" });
    }

    // 3️⃣ Crear contrato
    const contrato = new Contrato({ usuarioid, planid, ...resto });
    await contrato.save();

    // 4️⃣ Populate para devolver plan y usuario completos
    const contratoConDatos = await contrato.populate("planid").populate("usuarioid");

    res.status(201).json({
      mensaje: "Contrato creado exitosamente",
      contrato: contratoConDatos,
    });
  } catch (error) {
    res.status(400).json({ error: "Error al crear contrato", detalle: error.message });
  }
};

/**
 * Listar todos los contratos
 * 
 * @function listarContratos
 * @description Devuelve todos los contratos con el plan y usuario populados.
 * 
 * @param {import("express").Request} req - Objeto de la petición HTTP
 * @param {import("express").Response} res - Objeto de la respuesta HTTP
 * 
 * @example
 * // GET /api/contratos
 */
export const listarContratos = async (req, res) => {
  try {
    const contratos = await Contrato.find()
      .populate("planid")
      .populate("usuarioid");

    res.status(200).json(contratos);
  } catch (error) {
    res.status(500).json({ error: "Error al listar contratos", detalle: error.message });
  }
};

/**
 * Obtener contrato por usuario
 * 
 * @function obtenerContratoPorUsuario
 * @description Busca el contrato de un usuario específico y devuelve el plan populado.
 * 
 * @param {import("express").Request} req - Objeto de la petición HTTP
 * @param {import("express").Response} res - Objeto de la respuesta HTTP
 * 
 * @example
 * // GET /api/contratos/usuario/:usuarioId
 */
export const obtenerContratoPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const contrato = await Contrato.findOne({ usuarioid: usuarioId })
      .populate("planid")
      .populate("usuarioid");

    if (!contrato) {
      return res.status(404).json({ error: "No se encontró contrato para este usuario" });
    }

    res.status(200).json(contrato);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener contrato", detalle: error.message });
  }
};
