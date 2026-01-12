import Invoice from "../models/invoice.model.js";
import Contrato from "../models/contrato.model.js";
import Plan from "../models/plan.model.js";
import User, { Address } from "../models/user.model.js"; // ✅ correcto
import obtenerTasaDolar from "../../utils/tasaDolar.js";

// 
/**
 * Crear una nueva factura (solo administrador).
 */
export async function createInvoice(req, res, next) {
  try {
    console.log("➡️ Body recibido en createInvoice:", req.body);
    console.log("➡️ Usuario autenticado:", req.user);
    const {contratoId} = req.body;

    // 🔹 Buscar el contrato para obtener clienteId y planI
    const contrato = await Contrato.findById(contratoId); // ✅ correcto
    if (!contrato) {
      return res.status(404).json({ error: "Contrato no encontrado" });
    }

    const clienteId = contrato.clienteId;
    const planId = contrato.planId;

    // 🔹 Buscar el plan para obtener el montoUS
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: "Plan no encontrado" });
    }

    const monto = plan.precioUSD;

    // 🔹 Generar mes de la factura (formato "MM-YYYY")
    const fechaActual = new Date();
    const mes = `${String(fechaActual.getMonth() + 1).padStart(2, '0')}-${fechaActual.getFullYear()}`;

    // 🔹 Generar referencia de pago única
    const referenciaPago = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;



    const detalle = `${plan.nombre.toUpperCase()} ${mes}`;
    const moneda = `USD`;

    const fechaEmision = new Date();
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaEmision.getDate() + 30);

    // 🔹 Obtener la tasa de cambio actual (simulada aquí como fija)
    const tasaVED = await obtenerTasaDolar();

    // 🔹 Crear la factur
    const invoice = new Invoice({
      clienteId,
      planId,
      fechaEmision,
      fechaVencimiento,
      mes,
      monto,
      tasaVED,
      moneda,
      detalle,
      referenciaPago,
      estado: "pendiente"
    });

    await invoice.save();

    // 🔹 Se carga el monto al usuario asociado al cliente ID 
    const user = await User.findById(clienteId);
    if (user) {
      user.saldoFavorUSD = (user.saldoFavorUSD) - monto;
      await user.save();
      console.log("✅ Balance del usuario actualizado:", user._id, "Nuevo balance USD:", user.saldoFavorUSD);
    } else {
      console.log("⚠️ Usuario no encontrado para clienteId:", clienteId);
    }
    console.log("✅ Factura creada:", invoice._id);

    // 🔹 Respuesta formateada para el frontend
    res.status(201).json({
      id: invoice._id,
      fecha: fechaEmision.toLocaleDateString("es-VE"),
      monto: invoice.monto,
      montoAbonado: invoice.montoAbonado || 0,              // 🔹 nuevo
      estado: invoice.estado,
      detalle: invoice.detalle,
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
      monto: inv.monto,
      montoAbonado: inv.montoAbonado || 0, // 🔹 nuevo
      montoPendiente: (inv.monto - (inv.montoAbonado || 0)), // 🔹 nuevo
      tasaVED: inv.tasaVED,
      montoBs: (inv.monto * inv.tasaVED).toFixed(2),
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
      monto: inv.monto,
      montoAbonado: inv.montoAbonado || 0, // 🔹 nuevo
      montoPendiente: (inv.monto - (inv.montoAbonado || 0)), // 🔹 nuevo
      tasaVED: inv.tasaVED,
      montoBs: (inv.monto * inv.tasaVED).toFixed(2),
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

    // 🔹 Actualizar balance del usuario
    const user = await User.findById(invoice.clienteId);
    if (user) {
      user.saldoFavorUSD = (user.saldoFavorUSD) + invoice.monto;   // ✅ usar monto
      await user.save();
      console.log("✅ Balance del usuario actualizado tras pago:", user._id, "Nuevo balance USD:", user.saldoFavorUSD); // ✅ usar saldoFavorUSD
    }
  }
}


    await invoice.save();
    console.log("✅ Factura actualizada:", invoice._id);

    res.json({
      id: invoice._id,
      fecha: invoice.fechaEmision ? invoice.fechaEmision.toLocaleDateString("es-VE") : "",
      monto: invoice.monto,
      tasaVED: invoice.tasaVED,
      montoBs: (invoice.monto * invoice.tasaVED).toFixed(2),
      estado: invoice.estado === "pagado" ? "Pagada" : invoice.estado === "pendiente" ? "Pendiente" : "Vencida",
      montoAbonado: invoice.montoAbonado || 0,
      montoPendiente: (invoice.monto - (invoice.montoAbonado || 0)),
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
      monto: invoice.monto,
      tasaVED: invoice.tasaVED,
      montoBs: (invoice.monto * invoice.tasaVED).toFixed(2),
      montoAbonado: invoice.montoAbonado || 0,
      montoPendiente: (invoice.monto - (invoice.montoAbonado || 0)),
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