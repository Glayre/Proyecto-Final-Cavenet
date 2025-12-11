import cron from "node-cron";
import Invoice from "../api/models/invoice.model.js";
import Plan from "../api/models/plan.model.js";

/**
 * Calcula días restantes desde hoy hasta la fecha de vencimiento.
 *
 * @param {Date} fechaVencimiento - Fecha límite de la factura.
 * @returns {number} Días restantes (puede ser negativo si está vencida).
 */
function diasRestantes(fechaVencimiento) {
  const hoy = new Date();
  const diffMs = new Date(fechaVencimiento).getTime() - hoy.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Tarea programada diaria:
 * - Enviar recordatorio un día antes del vencimiento (marca recordatorioEnviado).
 * - Marcar factura como vencida cuando supere la fecha de vencimiento.
 * - Suspender el plan (activo=false) si la factura vence.
 */
export function startInvoiceCron() {
  // Ejecuta cada día a las 02:00 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("[CRON]: Revisando facturas pendientes...");

    const facturas = await Invoice.find({ estado: "pendiente" })
      .populate("planId clienteId");

    for (const factura of facturas) {
      const dias = diasRestantes(factura.fechaVencimiento);

      // Recordatorio un día antes del vencimiento
      if (dias === 1 && !factura.recordatorioEnviado) {
        console.log(`[REMINDER]: Factura ${factura._id} (${factura.mes}) vence mañana. Cliente: ${factura.clienteId?.email}`);
        factura.recordatorioEnviado = true;
        await factura.save();
        // Aquí podrías enviar correo real con Nodemailer
      }

      // Si ya venció hoy o días negativos
      if (dias <= 0) {
        if (factura.estado !== "vencido") {
          factura.estado = "vencido";
          await factura.save();
          console.log(`[VENCIDO]: Factura ${factura._id} marcada como vencida.`);
        }

        // Suspender plan automáticamente
        const plan = await Plan.findById(factura.planId);
        if (plan && plan.activo) {
          plan.activo = false;
          await plan.save();
          console.log(`[SUSPENDIDO]: Plan ${plan._id} suspendido por factura vencida.`);
        }
      }
    }

    console.log("[CRON]: Revisión completada.");
  });
}
