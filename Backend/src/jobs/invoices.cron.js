import cron from "node-cron";
import Invoice from "../api/models/invoice.model.js";
import Contrato from "../api/models/contrato.model.js";

/**
 * Calcula días restantes desde hoy hasta la fecha de vencimiento.
 *
 * @param {Date} fechaVencimiento - Fecha límite de la factura.
 * @returns {number} Días restantes (puede ser negativo si ya está vencida).
 */
function diasRestantes(fechaVencimiento) {
  const hoy = new Date();
  const diffMs = new Date(fechaVencimiento).getTime() - hoy.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Lógica de revisión de facturas:
 * - Enviar recordatorio un día antes del vencimiento (marca `recordatorioEnviado`).
 * - Marcar factura como vencida cuando supere la fecha de vencimiento.
 * - Suspender el Contrato (`activo=false`) si la factura vence.
 *
 * @async
 * @function revisarFacturas
 * @returns {Promise<void>} No retorna valor, pero actualiza facturas y Contratoes en BD.
 */
async function revisarFacturas() {
  console.log("[CRON]: Revisando facturas pendientes...");

  const facturas = await Invoice.find({ estado: "pendiente" })
    .populate("planId clienteId");

  for (const factura of facturas) {
    const dias = diasRestantes(factura.fechaVencimiento);

    // 🔹 Recordatorio un día antes del vencimiento
    if (dias === 1 && !factura.recordatorioEnviado) {
      console.log(`[REMINDER]: Factura ${factura._id} (${factura.mes}) vence mañana. Cliente: ${factura.clienteId?.email}`);
      // factura.recordatorioEnviado = true;
      // await factura.save();
      // Aquí podrías enviar correo real con Nodemailer
    }

    // 🔹 Si ya venció hoy o días negativos
    if (dias <= 0) {
      if (factura.estado !== "vencido") {
        factura.estado = "vencido";
        await factura.save();
        console.log(`[VENCIDO]: Factura ${factura._id} marcada como vencida.`);
      }

      // Suspender Contrato automáticamente
      const contrato = await Contrato.findById(factura.ContratoId);
      if (contrato && contrato.activo) {
        contrato.activo = false;
        await contrato.save();
        console.log(`[SUSPENDIDO]: Contrato ${contrato._id} suspendido por factura vencida.`);
      }
    }
  }

  console.log("[CRON]: Revisión completada.");
}

/**
 * Inicia las tareas programadas de facturas.
 *
 * Se ejecuta dos veces al día:
 * - A las 08:00 AM
 * - A las 02:00 PM
 *
 * @function startInvoiceCron
 * @returns {void}
 */
export function startInvoiceCron() {
  // Ejecutar a las 08:00 AM todos los días
  cron.schedule("0 8 * * *", revisarFacturas);

  // Ejecutar a las 02:00 PM todos los días
  cron.schedule("0 14 * * *", revisarFacturas);

  console.log("⏰ Cron jobs de facturas programados (08:00 AM y 02:00 PM).");
}
