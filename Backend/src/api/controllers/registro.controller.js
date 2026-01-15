/**
 * @file registro.controller.js
 * @description Controlador actualizado para gestionar registros con modelo simplificado.
 */

import Registro from "../models/registro.model.js";

/**
 * 1️⃣ CREAR UN REGISTRO (POST)
 */
export const crearRegistro = async (req, res) => {
  try {
    // Extraemos los datos del body
    // Nota: 'plan' ahora es el nombre del plan enviado desde el frontend
    const {
      nombres, apellidos, cedula, correo, plan,
      telefono, ciudad, callePrincipal, calleSecundaria,
      numeroCasa, fechaNacimiento, otroContacto, correoAlternativo
    } = req.body;

    // 1. Validar campos obligatorios básicos (Nombres, Apellidos, Cédula, Correo, Teléfono y PLAN)
    if (!nombres || !apellidos || !cedula || !correo || !plan || !telefono) {
      return res.status(400).json({ 
        error: "Faltan campos obligatorios",
        detalle: "Verifique que nombres, apellidos, cédula, correo, teléfono y plan estén presentes."
      });
    }

    // 2. Crear el nuevo registro usando el modelo simplificado
    const nuevoRegistro = new Registro({
      plan, // Se guarda el string directamente (Ej: "Plan Hogar Básico")
      nombres,
      apellidos,
      cedula,
      correo,
      telefono,
      ciudad,
      callePrincipal,
      calleSecundaria,
      numeroCasa,
      fechaNacimiento,
      otroContacto,
      correoAlternativo
    });

    // 3. Guardar en la base de datos
    await nuevoRegistro.save();

    return res.status(201).json({ 
      mensaje: "✅ Registro guardado exitosamente", 
      datos: nuevoRegistro 
    });

  } catch (error) {
    console.error("❌ ERROR EN REGISTRO.CONTROLLER:", error);

    // Manejo de Error 11000 (Cédula Duplicada)
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: "Cédula ya registrada", 
        detalle: "Ya existe una solicitud en proceso con este número de cédula." 
      });
    }

    // Error genérico del servidor
    return res.status(500).json({ 
      error: "Error interno del servidor", 
      detalle: error.message 
    });
  }
};

/**
 * 2️⃣ LISTAR TODOS LOS REGISTROS (GET)
 */
export const listarRegistros = async (req, res) => {
  try {
    // Ya no usamos .populate("planId") porque el plan es un String directo
    const registros = await Registro.find().sort({ createdAt: -1 });
    res.status(200).json(registros);
  } catch (error) {
    console.error("❌ ERROR AL LISTAR:", error);
    res.status(500).json({ error: "Error al listar registros" });
  }
};

/**
 * 3️⃣ ACTUALIZAR ESTADO (PUT)
 */
export const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observaciones } = req.body;
    
    const actualizado = await Registro.findByIdAndUpdate(
      id, 
      { estado, observaciones }, 
      { new: true }
    );

    if (!actualizado) {
      return res.status(404).json({ error: "No se encontró el registro" });
    }

    res.status(200).json({ mensaje: "Estado actualizado", datos: actualizado });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar estado" });
  }
};