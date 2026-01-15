import Contrato from "../models/contrato.model.js";
import User from "../models/user.model.js";
import Plan from "../models/plan.model.js";

/**
 * Crear un nuevo contrato
 * @description Vincula un usuario existente con un plan y guarda un correo alternativo.
 */
export const crearContrato = async (req, res) => {
  try {
    const { clienteId, planId, correoAlternativo } = req.body;

    // 1️⃣ Validar campos obligatorios
    if (!clienteId || !planId || !correoAlternativo) {
      return res.status(400).json({ error: "Faltan campos: clienteId, planId o correoAlternativo" });
    }

    // 🟢 NUEVA VALIDACIÓN: Verificar si el cliente ya tiene un contrato existente
    const contratoExistente = await Contrato.findOne({ clienteId });
    if (contratoExistente) {
      return res.status(400).json({ 
        error: "El cliente ya posee un contrato vinculado. No se permiten duplicados." 
      });
    }

    // 2️⃣ Verificar que el usuario existe
    const usuario = await User.findById(clienteId);
    if (!usuario) {
      return res.status(404).json({ error: "El usuario (clienteId) no existe" });
    }

    // 3️⃣ Verificar que el plan existe
    const planDoc = await Plan.findById(planId);
    if (!planDoc) {
      return res.status(404).json({ error: "El plan (planId) no existe" });
    }

    // 4️⃣ Crear el documento de Contrato
    const nuevoContrato = new Contrato({
      clienteId,
      planId,
      correoAlternativo
    });
    await nuevoContrato.save();

    // 5️⃣ Actualizar el usuario para que refleje su nuevo plan
    usuario.planId = planId;
    await usuario.save();

    // 6️⃣ Respuesta exitosa
    res.status(201).json({
      mensaje: "Contrato vinculado y creado exitosamente",
      datos: nuevoContrato
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al procesar el contrato", 
      detalle: error.message 
    });
  }
};

/**
 * Listar contratos (Admin)
 */
export const listarContratos = async (req, res) => {
  try {
    const contratos = await Contrato.find()
      .populate("clienteId", "nombre apellido cedula email")
      .populate("planId", "nombre precioUSD");

    res.status(200).json(contratos);
  } catch (error) {
    res.status(500).json({ error: "Error al listar contratos", detalle: error.message });
  }
};

/**
 * Actualizar estado del contrato (Suspender/Activar)
 */
export const actualizarEstadoContrato = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!["activo", "suspendido"].includes(estado)) {
      return res.status(400).json({ error: "Estado no válido. Use 'activo' o 'suspendido'" });
    }

    const contratoActualizado = await Contrato.findByIdAndUpdate(
      id,
      { estado }, 
      { new: true, runValidators: true }
    );

    if (!contratoActualizado) {
      return res.status(404).json({ error: "Contrato no encontrado" });
    }

    res.status(200).json({
      mensaje: `Contrato actualizado a ${estado} exitosamente`,
      datos: contratoActualizado
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al actualizar el estado del contrato", 
      detalle: error.message 
    });
  }
};