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
    // Solo admin puede crear facturas
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

    res.status(201).json(invoice);
  } catch (err) {
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
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado. Solo administradores pueden ver todas las facturas." });
    }

    const invoices = await Invoice.find().populate("planId clienteId");
    res.json(invoices);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener facturas de un cliente (el propio cliente).
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

    // Solo el cliente dueño de la factura o el admin puede verlas
    if (req.user.rol !== "admin" && req.user._id.toString() !== clienteId) {
      return res.status(403).json({ error: "Acceso denegado. No puede ver facturas de otros clientes." });
    }

    const invoices = await Invoice.find({ clienteId }).populate("planId clienteId");
    res.json(invoices);
  } catch (err) {
    next(err);
  }
}

/**
 * Actualizar estado de una factura (ej. marcar como pagada).
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

    if (!["pendiente", "pagado", "vencido"].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ error: "Factura no encontrada" });

    // Solo admin puede marcar como vencida, cliente puede marcar como pagada
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

      // Reactivar plan si estaba suspendido
      const plan = await Plan.findById(invoice.planId);
      if (plan && !plan.activo) {
        plan.activo = true;
        await plan.save();
      }
    }

    await invoice.save();
    res.json(invoice);
  } catch (err) {
    next(err);
  }
}
