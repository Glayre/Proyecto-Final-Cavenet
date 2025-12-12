import Plan from "../models/plan.model.js";
import Invoice from "../models/invoice.model.js";
import regex from "../../utils/regex.js";

/**
 * Crear un nuevo plan con validaciones.
 *
 * @async
 * @function createPlan
 * @param {import("express").Request} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Datos del plan a crear.
 * @param {string} req.body.nombre - Nombre del plan.
 * @param {number} req.body.velocidadMbps - Velocidad en Mbps.
 * @param {number} req.body.precioUSD - Precio en dólares.
 * @param {string} req.body.tipo - Tipo de plan ("hogar" o "pyme").
 * @param {import("express").Response} res - Objeto de respuesta HTTP.
 * @param {Function} next - Middleware para manejo de errores.
 * @returns {Promise<void>} Devuelve el plan creado en formato JSON.
 */
export async function createPlan(req, res, next) {
  try {
    const { nombre, velocidadMbps, precioUSD, tipo } = req.body;

    if (!regex.text.test(nombre)) {
      return res.status(400).json({ error: "Nombre inválido (solo letras, entre 2 y 200 caracteres)" });
    }
    if (typeof velocidadMbps !== "number" || velocidadMbps <= 0) {
      return res.status(400).json({ error: "Velocidad inválida (debe ser un número positivo)" });
    }
    if (typeof precioUSD !== "number" || precioUSD <= 0) {
      return res.status(400).json({ error: "Precio inválido (debe ser un número positivo)" });
    }
    if (!["hogar", "pyme"].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido (solo se acepta "hogar" o "pyme")' });
    }

    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
}

/**
 * Contratar un plan (cliente) y generar factura automática.
 *
 * @async
 * @function contratarPlan
 * @param {import("express").Request} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Datos de contratación.
 * @param {string} req.body.planId - ID del plan a contratar.
 * @param {import("express").Response} res - Objeto de respuesta HTTP.
 * @param {Function} next - Middleware para manejo de errores.
 * @returns {Promise<void>} Devuelve el plan contratado y la factura generada.
 */
export async function contratarPlan(req, res, next) {
  try {
    const { planId } = req.body;
    const clienteId = req.user._id; // cliente autenticado

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ error: "Plan no encontrado" });

    // 🔹 Crear factura automática
    const fechaEmision = new Date();
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaEmision.getDate() + 30);

    const invoice = await Invoice.create({
      clienteId,
      planId,
      mes: fechaEmision.toLocaleString("es-VE", { month: "long", year: "numeric" }).toUpperCase(),
      montoUSD: plan.precioUSD,
      fechaEmision,
      fechaVencimiento,
      estado: "pendiente"
    });

    console.log("✅ Factura creada automáticamente:", invoice._id);

    res.status(201).json({
      message: "Plan contratado y factura generada automáticamente",
      plan,
      invoice
    });
  } catch (err) {
    console.error("❌ Error al contratar plan:", err);
    next(err);
  }
}

/**
 * Actualizar un plan existente con validaciones.
 *
 * @async
 * @function updatePlan
 * @param {import("express").Request} req - Objeto de solicitud HTTP.
 * @param {string} req.params.id - ID del plan a actualizar.
 * @param {Object} req.body - Campos a actualizar.
 * @returns {Promise<void>} Devuelve el plan actualizado.
 */
export async function updatePlan(req, res, next) {
  try {
    const { nombre, velocidadMbps, precioUSD, tipo } = req.body;

    if (nombre && !regex.text.test(nombre)) {
      return res.status(400).json({ error: "Nombre inválido" });
    }
    if (velocidadMbps && (typeof velocidadMbps !== "number" || velocidadMbps <= 0)) {
      return res.status(400).json({ error: "Velocidad inválida" });
    }
    if (precioUSD && (typeof precioUSD !== "number" || precioUSD <= 0)) {
      return res.status(400).json({ error: "Precio inválido" });
    }
    if (tipo && !["hogar", "pyme"].includes(tipo)) {
      return res.status(400).json({ error: "Tipo inválido" });
    }

    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(plan);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener todos los planes disponibles.
 *
 * @async
 * @function getPlans
 * @returns {Promise<void>} Devuelve un array de planes en formato JSON.
 */
export async function getPlans(req, res, next) {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener un plan por su ID.
 *
 * @async
 * @function getPlanById
 * @param {string} req.params.id - ID del plan.
 * @returns {Promise<void>} Devuelve el plan encontrado.
 */
export async function getPlanById(req, res, next) {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: "Plan no encontrado" });
    res.json(plan);
  } catch (err) {
    next(err);
  }
}

/**
 * Eliminar un plan por su ID.
 *
 * @async
 * @function deletePlan
 * @param {string} req.params.id - ID del plan.
 * @returns {Promise<void>} Devuelve confirmación de eliminación.
 */
export async function deletePlan(req, res, next) {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
