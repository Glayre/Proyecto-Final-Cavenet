import mongoose from "mongoose";

const TASA_URL = "https://bcv-api.rafnixg.dev/rates/";

/**
 * Consulta la tasa del BCV desde la API externa.
 *
 * @async
 * @function consultarTasa
 * @returns {Promise<number|null>} Devuelve la tasa en VED o null si ocurre un error.
 */
const consultarTasa = async () => {
  try {
    const response = await fetch(TASA_URL);
    const data = await response.json();
    return data.dollar;
  } catch (error) {
    console.error("Error al consultar la tasa de cambio:", error);
    return null;
  }
};

/**
 * Esquema de facturas (Invoice).
 *
 * Representa las facturas generadas para los clientes en relación con los planes contratados.
 * Incluye información sobre el cliente, el plan, el monto, la tasa de cambio,
 * el estado de pago, fechas de emisión, vencimiento y pago, así como recordatorios.
 *
 * @typedef {Object} Invoice
 * @property {mongoose.ObjectId} clienteId - Referencia al usuario (cliente) asociado a la factura.
 * @property {mongoose.ObjectId} planId - Referencia al plan contratado.
 * @property {string} mes - Mes de facturación (ejemplo: "NOVIEMBRE 2025").
 * @property {number} monto - Monto de la factura en dólares estadounidenses.
 * @property {number} montoAbonado - Monto abonado en VED (calculado al momento del pago).
 * @property {number} tasaVED - Tasa de cambio aplicada en VED (ejemplo: 233.56).
 * @property {string} estado - Estado de la factura, puede ser "pendiente", "pagado" o "vencido".
 * @property {Date} fechaEmision - Fecha de emisión de la factura (por defecto la fecha actual).
 * @property {Date} fechaVencimiento - Fecha límite para el pago de la factura.
 * @property {Date} [fechaPago] - Fecha en la que se registró el pago (opcional).
 * @property {string} [referenciaPago] - Referencia del pago (últimos 6 dígitos, opcional).
 * @property {boolean} recordatorioEnviado - Indica si ya se envió un recordatorio de vencimiento.
 * @property {string} [detalle] - Texto descriptivo del plan y mes (ejemplo: "PLAN BÁSICO 150 MBPS NOVIEMBRE 2025").
 * @property {string} [moneda] - Monto formateado con la moneda (ejemplo: "USD $ 35,00").
 * @property {Date} createdAt - Fecha de creación del documento (generada automáticamente por Mongoose).
 * @property {Date} updatedAt - Fecha de última actualización del documento (generada automáticamente por Mongoose).
 */
const InvoiceSchema = new mongoose.Schema(
  {
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    mes: { type: String, required: true }, // Ejemplo: 'NOVIEMBRE 2025'
    monto: { type: Number, required: true },
    montoAbonado: { type: Number, default: 0 }, // Se actualiza al pagar
    tasaVED: { type: Number, required: true, default: 200 }, // Se actualiza con el hook
    estado: { type: String, enum: ["pendiente", "pagado", "vencido", "reportado"], default: "pendiente" },
    fechaEmision: { type: Date, default: Date.now },
    fechaVencimiento: { type: Date, required: true },
    fechaPago: { type: Date },
    referenciaPago: { type: String },
    recordatorioEnviado: { type: Boolean, default: false },

    // 🔹 NUEVOS CAMPOS para mostrar detalle en el frontend
    detalle: { type: String }, // Texto descriptivo del plan/mes
    moneda: { type: String }   // Ejemplo: "USD $ 35,00"
  },
  { timestamps: true }
);

/**
 * Hook: antes de guardar, consulta la tasa si no está definida.
 *
 * @async
 * @function preSave
 * @param {Function} next - Función para continuar con el flujo de guardado.
 */
InvoiceSchema.pre("save", async function () {
  if (!this.tasaVED || this.tasaVED === 200) {
    const tasa = await consultarTasa();
    if (tasa) this.tasaVED = tasa;
  }
});

export default mongoose.model("Invoice", InvoiceSchema);