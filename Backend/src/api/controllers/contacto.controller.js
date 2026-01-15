/**
 * @file contacto.controller.js
 * @description Lógica para procesar y almacenar los mensajes del formulario de contacto.
 */

import Contacto from "../models/contacto.model.js";

/**
 * Recibir y guardar un nuevo mensaje de contacto
 */
export const enviarMensajeContacto = async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;

    // 1. Validaciones básicas
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ 
        error: "Todos los campos son obligatorios (nombre, email, mensaje)." 
      });
    }

    // 2. Crear el registro en la base de datos
    const nuevoContacto = new Contacto({
      nombre,
      email,
      mensaje
    });

    await nuevoContacto.save();

    // 3. Respuesta de éxito
    res.status(201).json({
      message: "¡Mensaje enviado con éxito! Un asesor te contactará pronto.",
      data: nuevoContacto
    });

  } catch (error) {
    res.status(500).json({ 
      error: "Hubo un error al procesar tu mensaje.", 
      detalle: error.message 
    });
  }
};

/**
 * Listar todos los mensajes recibidos (Solo para Admin)
 */
export const listarMensajesContacto = async (req, res) => {
  try {
    const mensajes = await Contacto.find().sort({ createdAt: -1 }); // Los más recientes primero
    res.status(200).json(mensajes);
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener los mensajes.", 
      detalle: error.message 
    });
  }
};