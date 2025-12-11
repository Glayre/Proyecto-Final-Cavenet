import Invoice from "../models/invoice.model.js";
import Plan from "../models/plan.model.js";

/**
 * Crear una nueva factura (solo administrador).
 *
 * @async
 * @function createInvoice
 * @param {import("express").Request} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Datos de la factura.
 * @param {string} req.body.clienteId - ID del cliente asociado.
 * @param {string} req.body.planId - ID del plan contratado.
 * @param {string} req.body.mes - Mes de facturación (ejemplo: "DICIEMBRE 2025").
 * @param {number} req.body.montoUSD - Monto de la factura en dólares.
 * @param {string} [req.body.referenciaPago] - Referencia opcional del pago.
 * @param {import("express").Response} res - Objeto de respuesta HTTP.
 * @param {Function} next - Middleware para manejo de errores.
 * @returns {Promise<void>} Devuelve la factura creada en formato JSON.
 */
export async function createInvoice(req, res, next) {
  try {
    console.log("➡️ Body recibido en createInvoice:", req.body);
    console.log("➡️ Usuario autenticado:", req.user);

    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado. Solo administradores pueden crear facturas." });
    }

    const { clienteId, planId, mes, montoUSD, referenciaPago } = req.body;

    if (!clienteId || !planId || !mes || !montoUSD) {
      return res.status(400).json({ error: "Debe especificar clienteId, planId, mes y montoUSD" });
    }

    const fechaEmision = new Date();
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaEmision.getDate() + 30);

    const invoice = await Invoice.create({
      clienteId,
      planId,
      mes,
      montoUSD,
      referenciaPago,
      fechaEmision,
      fechaVencimiento,
    });

    console.log("✅ Factura creada:", invoice._id);

    res.status(201).json(invoice);
  } catch (err) {
    console.error("❌ Error al crear factura:", err);
    next(err);
  }
}

/**
 * Obtener todas las facturas (solo administrador).
 *
 * @async
 * @function getAllInvoices
 * @param {import("express").Request} req - Objeto de solicitud HTTP.
 * @param {import("express").Response} res - Objeto de respuesta HTTP.
 * @param {Function} next - Middleware para manejo de errores.
 * @returns {Promise<void>} Devuelve un array de facturas en formato JSON.
 */
export async function getAllInvoices(req, res, next) {
  try {
    console.log("➡️ Usuario autenticado:", req.user);

    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado. Solo administradores pueden ver todas las facturas." });
    }

    const invoices = await Invoice.find().populate("planId clienteId");
    console.log("✅ Facturas encontradas:", invoices.length);

    res.json(invoices);
  } catch (err) {
    console.error("❌ Error en getAllInvoices:", err);
    next(err);
  }
}

/**
 * Obtener facturas de un cliente (el propio cliente o admin).
 *
 * @async
 * @function getInvoicesByClient
 * @param {import("express").Request} req - Objeto de solicitud HTTP.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {string} req.params.clienteId - ID del cliente.
 * @param {import("express").Response} res - Objeto de respuesta HTTP.
 * @param {Function} next - Middleware para manejo de errores.
 * @returns {Promise<void>} Devuelve un array de facturas en formato JSON.
 */
export async function getInvoicesByClient(req, res, next) {
  try {
    const { clienteId } = req.params;
    console.log("➡️ Usuario autenticado:", req.user);
    console.log("➡️ Cliente solicitado:", clienteId);

    if (req.user.rol !== "admin" && req.user._id.toString() !== clienteId) {
      return res.status(403).json({ error: "Acceso denegado. No puede ver facturas de otros clientes." });
    }

    const invoices = await Invoice.find({ clienteId }).populate("planId clienteId");
    console.log("✅ Facturas encontradas para cliente:", invoices.length);

    res.json(invoices);
  } catch (err) {
    console.error("❌ Error en getInvoicesByClient:", err);
    next(err);
  }
}

/**
 * Actualizar estado de una factura (ej. marcar como pagada o vencida).
 *
 * @async
 * @function updateInvoice
 * @param {import("express").Request} req - Objeto de solicitud HTTP.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {string} req.params.id - ID de la factura.
 * @param {Object} req.body - Datos de actualización.
 * @param {string} req.body.estado - Nuevo estado ("pendiente", "pagado", "vencido").
 * @param {string} [req.body.referenciaPago] - Referencia del pago.
 * @param {import("express").Response} res - Objeto de respuesta HTTP.
 * @param {Function} next - Middleware para manejo de errores.
 * @returns {Promise<void>} Devuelve la factura actualizada.
 */
export async function updateInvoice(req, res, next) {
  try {
    const { id } = req.params;
    const { estado, referenciaPago } = req.body;

    console.log("➡️ Usuario autenticado:", req.user);
    console.log("➡️ Actualizando factura:", id, "con estado:", estado);

    if (!["pendiente", "pagado", "vencido"].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ error: "Factura no encontrada" });

    // Validaciones de rol
    if (estado === "vencido" && req.user.rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado. Solo administradores pueden marcar facturas como vencidas." });
    }

    if (estado === "pagado" && req.user._id.toString() !== invoice.clienteId.toString() && req.user.rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado. Solo el cliente dueño o el admin pueden pagar esta factura." });
    }

    invoice.estado = estado;
    invoice.referenciaPago = referenciaPago;

    if (estado === "pagado") {
      invoice.fechaPago = new Date();

      const plan = await Plan.findById(invoice.planId);
      if (plan && !plan.activo) {
        plan.activo = true;
        await plan.save();
        console.log("✅ Plan reactivado:", plan._id);
      }
    }

    await invoice.save();
    console.log("✅ Factura actualizada:", invoice._id);

    res.json(invoice);
  } catch (err) {
    console.error("❌ Error en updateInvoice:", err);
    next(err);
  }
}
