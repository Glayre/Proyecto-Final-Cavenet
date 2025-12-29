/**
 * @file contrato.controller.js
 * @description Controlador de contratos. Maneja la lógica de creación y consulta de contratos en MongoDB.
 */

import Contrato from "../models/contrato.model.js";

/**
 * Crear un nuevo contrato
 * @function crearContrato
 * @param {import("express").Request} req - Objeto de la petición HTTP
 * @param {import("express").Response} res - Objeto de la respuesta HTTP
 */
export const crearContrato = async (req, res) => {
  try {
    // Crear instancia del modelo con los datos recibidos
    const contrato = new Contrato(req.body);

    // Guardar en MongoDB
    await contrato.save();

    res.status(201).json({
      mensaje: "Contrato creado exitosamente",
      contrato,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Listar todos los contratos
 * @function listarContratos
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const listarContratos = async (req, res) => {
  try {
    const contratos = await Contrato.find(); // 🔹 consulta en MongoDB
    res.status(200).json(contratos);
  } catch (error) {
    res.status(500).json({ error: "Error al listar contratos" });
  }
};
