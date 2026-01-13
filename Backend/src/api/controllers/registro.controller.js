/**
 * @file registro.controller.js
 * @description Controlador de registros. Maneja la lógica de creación y consulta de registros en MongoDB.
 */

import Registro from "../models/registro.model.js";
import User from "../models/user.model.js";       // Modelo de usuarios
import Plan from "../models/plan.model.js";       // Modelo de planes
import bcrypt from "bcrypt";                      // Para generar passwordHash

/**
 * Crear un nuevo registro
 * 
 * @function crearRegistro
 * @description Crea un usuario y un registro asociado al plan seleccionado.
 * Valida campos obligatorios, evita duplicados y devuelve el registro creado.
 * 
 * @param {import("express").Request} req - Objeto de la petición HTTP
 * @param {import("express").Response} res - Objeto de la respuesta HTTP
 * 
 * @example
 * // POST /api/registro
 * {
 *   "nombres": "Juan",
 *   "apellidos": "Pérez",
 *   "cedula": "12345678",
 *   "correo": "juan@example.com",
 *   "plan": "Plan Hogar Básico"
 * }
 */
export const crearRegistro = async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      cedula,
      fechaNacimiento,
      correo,
      ciudad,
      callePrincipal,
      calleSecundaria,
      numeroCasa,
      plan,
      telefono,
      otroContacto,
      correoAlternativo
    } = req.body;

    // 1️⃣ Validar campos obligatorios
    if (!nombres || !apellidos || !cedula || !correo || !plan) {
      return res.status(400).json({ error: "Faltan campos obligatorios para el registro" });
    }

    // 2️⃣ Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ cedula });
    if (usuarioExistente) {
      return res.status(409).json({ error: "Ya existe un usuario con esta cédula" });
    }

    // 3️⃣ Buscar el plan por nombre
    const planDoc = await Plan.findOne({ nombre: plan });
    if (!planDoc) {
      return res.status(404).json({ error: "Plan no encontrado" });
    }

    // 4️⃣ Generar passwordHash temporal
    const passwordHash = await bcrypt.hash("Temporal1234", 10);

    // 5️⃣ Crear usuario (ya no necesita referencia a Direccion)
    const nuevoUsuario = new User({
      nombre: nombres,
      apellido: apellidos,
      cedula,
      email: correo,
      telefono,
      passwordHash
    });
    await nuevoUsuario.save();

    // 6️⃣ Crear registro con dirección integrada
    const nuevoRegistro = new Registro({
      clienteId: nuevoUsuario._id,
      planId: planDoc._id,
      plan: planDoc.nombre,
      nombres,
      apellidos,
      cedula,
      correo,
      telefono,
      otroContacto,
      correoAlternativo,
      fechaNacimiento,
      ciudad,
      callePrincipal,
      calleSecundaria,
      numeroCasa
    });
    await nuevoRegistro.save();

    // 7️⃣ Vincular usuario con registro y plan
    nuevoUsuario.planId = planDoc._id;
    nuevoUsuario.registroId = nuevoRegistro._id;
    await nuevoUsuario.save();

    // 8️⃣ Respuesta exitosa
    res.status(201).json({
      mensaje: "Registro creado exitosamente",
      datos: nuevoRegistro
    });
  } catch (error) {
    res.status(500).json({ error: "Error al crear registro", detalle: error.message });
  }
};

/**
 * Listar todos los registros
 * 
 * @function listarRegistros
 * @description Devuelve todos los registros con el plan y usuario populados.
 * 
 * @param {import("express").Request} req - Objeto de la petición HTTP
 * @param {import("express").Response} res - Objeto de la respuesta HTTP
 * 
 * @example
 * // GET /api/registro
 */
export const listarRegistros = async (req, res) => {
  try {
    const registros = await Registro.find()
      .populate("planId")
      .populate("clienteId");

    res.status(200).json(registros);
  } catch (error) {
    res.status(500).json({ error: "Error al listar registros", detalle: error.message });
  }
};

/**
 * Obtener registro por usuario
 * 
 * @function obtenerRegistroPorUsuario
 * @description Busca el registro de un usuario específico y devuelve el plan populado.
 * 
 * @param {import("express").Request} req - Objeto de la petición HTTP
 * @param {import("express").Response} res - Objeto de la respuesta HTTP
 * 
 * @example
 * // GET /api/registro/usuario/:clienteId
 */
export const obtenerRegistroPorUsuario = async (req, res) => {
  try {
    const { clienteId } = req.params;

    const registro = await Registro.findOne({ clienteId })
      .populate("planId")
      .populate("clienteId");

    if (!registro) {
      return res.status(404).json({ error: "No se encontró registro para este usuario" });
    }

    res.status(200).json(registro);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener registro", detalle: error.message });
  }
};
