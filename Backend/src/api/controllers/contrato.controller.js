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
 * Devuelve el contrato creado con el plan y usuario populados.
 * 
 * @param {import("express").Request} req - Objeto de la petición HTTP
 * @param {import("express").Response} res - Objeto de la respuesta HTTP
 * 
 * @example
 * // POST /api/contratos
 * {
 *   "clienteId": "65a1234567890",
 *   "planId": "65b9876543210",
 *   "correoAlternativo": "bGK2D@example.com"
 * }
 */
export const crearContrato = async (req, res) => {
  try {
    const { clienteId, planId } = req.body;

    // 1️⃣ Validar cliente
    const cliente = await User.findById(clienteId);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // 2️⃣ Validar plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: "Plan no encontrado" });
    }
    /**
     * Esquema de contrato con validaciones.
     *
     * - clienteId: referencia a User
     * - planId: referencia a Plan
     * - plan: obligatorio
     * - nombres: obligatorio, mínimo 2 caracteres
     * - apellidos: obligatorio
     * - cedula: obligatorio, solo números (7 a 9 dígitos)
     * - correo: obligatorio, formato válido
     * - telefono: opcional, 11 dígitos
     * - correoAlternativo: opcional, formato válido
     */

    const nuevoContrato = {
      clienteId: cliente._id, 
      planId: plan._id,
      plan: plan.nombre,
      nombres: cliente.nombre,
      apellidos: cliente.apellido,
      correo: cliente.email,
      telefono: cliente.telefono,
      cedula: cliente.cedula,
      correoAlternativo: req.body.correoAlternativo,
    }

    // 3️⃣ Crear contrato
    const contrato = new Contrato(nuevoContrato);
    await contrato.save();
    // Actuaalizar usuario para reflejar que tiene un contrato activo y su plan
    cliente.planId = plan._id;
    cliente.contratoId = contrato._id;

    await cliente.save();


    res.status(201).json({mensaje: "Contrato creado exitosamente", datos: contrato});
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
      .populate("planId")
      .populate("clienteId");

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

    const contrato = await Contrato.findOne({ usuarioId })
      .populate("planId")
      .populate("usuarioId");

    if (!contrato) {
      return res.status(404).json({ error: "No se encontró contrato para este usuario" });
    }

    res.status(200).json(contrato);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener contrato", detalle: error.message });
  }
};

