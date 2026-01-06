import Invoice from "../models/invoice.model.js";
import Plan from "../models/plan.model.js";

/**
 * Crear una nueva factura (solo administrador).
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

    // 🔹 Buscar el plan para construir detalle y moneda
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: "Plan no encontrado" });
    }

    const detalle = `${plan.nombre.toUpperCase()} ${mes}`;
    const moneda = `USD $ ${montoUSD.toFixed(2)}`;

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
      detalle,
      moneda
    });

    console.log("✅ Factura creada:", invoice._id);

    // 🔹 Respuesta formateada para el frontend
    res.status(201).json({
      id: invoice._id,
      fecha: fechaEmision.toLocaleDateString("es-VE"),
      montoUSD: invoice.montoUSD,
      tasaVED: invoice.tasaVED,
      montoBs: (invoice.montoUSD * invoice.tasaVED).toFixed(2),
      estado: invoice.estado === "pagado" ? "Pagada" : invoice.estado === "pendiente" ? "Pendiente" : "Vencida",
      detalle: invoice.detalle,
      moneda: invoice.moneda
    });
  } catch (err) {
    console.error("❌ Error al crear factura:", err);
    next(err);
  }
}

/**
 * Obtener todas las facturas (solo administrador).
 */
export async function getAllInvoices(req, res, next) {
  try {

    const invoices = await Invoice.find().populate("planId clienteId");
    console.log("✅ Facturas encontradas:", invoices.length);

    // 🔹 Transformar facturas para frontend
    const formatted = invoices.map(inv => ({
      id: inv._id,
      fecha: inv.fechaEmision ? inv.fechaEmision.toLocaleDateString("es-VE") : "",
      montoUSD: inv.montoUSD,
      tasaVED: inv.tasaVED,
      montoBs: (inv.montoUSD * inv.tasaVED).toFixed(2),
      estado: inv.estado,
      detalle: inv.detalle,
      moneda: inv.moneda
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error en getAllInvoices:", err);
    next(err);
  }
}

/**
 * Obtener facturas de un cliente (el propio cliente o admin).
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

    // 🔹 Transformar facturas para frontend
    const formatted = invoices.map(inv => ({
      id: inv._id,
      fecha: inv.fechaEmision ? inv.fechaEmision.toLocaleDateString("es-VE") : "",
      montoUSD: inv.montoUSD,
      tasaVED: inv.tasaVED,
      montoBs: (inv.montoUSD * inv.tasaVED).toFixed(2),
      estado: inv.estado,
      detalle: inv.detalle,
      moneda: inv.moneda
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error en getInvoicesByClient:", err);
    next(err);
  }
}

/**
 * Actualizar estado de una factura (ej. marcar como pagada o vencida).
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

    res.json({
      id: invoice._id,
      fecha: invoice.fechaEmision ? invoice.fechaEmision.toLocaleDateString("es-VE") : "",
      montoUSD: invoice.montoUSD,
      tasaVED: invoice.tasaVED,
      montoBs: (invoice.montoUSD * invoice.tasaVED).toFixed(2),
      estado: invoice.estado === "pagado" ? "Pagada" : invoice.estado === "pendiente" ? "Pendiente" : "Vencida",
      detalle: invoice.detalle,
      moneda: invoice.moneda
    });
  } catch (err) {
    console.error("❌ Error en updateInvoice:", err);
    next(err);
  }
}

/** 
 * 
 * Consultar factura por ID (el propio cliente o admin).
 * 
*/

export async function getInvoiceById(req, res, next) {
  try {
    const { id } = req.params;
    console.log("datos usuario")
    console.log("➡️ Consultando factura ID:", id);
    const invoice = await Invoice.findById(id).populate("planId clienteId");

    if (!invoice) {
      return res.status(404).json({ error: "Factura no encontrada" });
    }

    const formatted = {
      id: invoice._id,
      fecha: invoice.fechaEmision ? invoice.fechaEmision.toLocaleDateString("es-VE") : "",
      montoUSD: invoice.montoUSD,
      tasaVED: invoice.tasaVED,
      montoBs: (invoice.montoUSD * invoice.tasaVED).toFixed(2),
      estado: invoice.estado === "pagado" ? "Pagada" : invoice.estado === "pendiente" ? "Pendiente" : "Vencida",
      detalle: invoice.detalle,
      moneda: invoice.moneda
    };

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error en getInvoiceById:", err);
    next(err);
  } 
    }