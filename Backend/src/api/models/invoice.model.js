import mongoose from 'mongoose';

/**
 * Esquema de facturas (Invoice).
 *
 * Representa las facturas generadas para los clientes en relación con los planes contratados.
 * Incluye información sobre el cliente, el plan, el monto, la tasa de cambio y el estado de pago.
 *
 * @typedef {Object} Invoice
 * @property {mongoose.ObjectId} clienteId - Referencia al usuario (cliente) asociado a la factura.
 * @property {mongoose.ObjectId} planId - Referencia al plan contratado.
 * @property {string} mes - Mes de facturación (ejemplo: "NOVIEMBRE 2025").
 * @property {number} montoUSD - Monto de la factura en dólares estadounidenses.
 * @property {number} tasaVED - Tasa de cambio aplicada en VED (ejemplo: 233.56).
 * @property {string} estado - Estado de la factura, puede ser "pendiente" o "pagado".
 * @property {Date} fechaEmision - Fecha de emisión de la factura (por defecto la fecha actual).
 * @property {Date} [fechaPago] - Fecha en la que se registró el pago (opcional).
 * @property {string} [referenciaPago] - Referencia del pago (últimos 6 dígitos, opcional).
 * @property {Date} createdAt - Fecha de creación del documento (generada automáticamente por Mongoose).
 * @property {Date} updatedAt - Fecha de última actualización del documento (generada automáticamente por Mongoose).
 */
const InvoiceSchema = new mongoose.Schema(
  {
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    mes: { type: String, required: true }, // Ejemplo: 'NOVIEMBRE 2025'
    montoUSD: { type: Number, required: true },
    tasaVED: { type: Number, required: true }, // Ejemplo: 233.56
    estado: { type: String, enum: ['pendiente', 'pagado'], default: 'pendiente' },
    fechaEmision: { type: Date, default: Date.now },
    fechaPago: { type: Date },
    referenciaPago: { type: String }, // Últimos 6 dígitos de la referencia de pago
  },
  { timestamps: true }
);

/**
 * Modelo de facturas.
 *
 * @constant
 * @type {mongoose.Model<Invoice>}
 * @example
 * // Crear una nueva factura
 * const factura = await Invoice.create({
 *   clienteId: user._id,
 *   planId: plan._id,
 *   mes: 'NOVIEMBRE 2025',
 *   montoUSD: 50,
 *   tasaVED: 233.56
 * });
 */
export default mongoose.model('Invoice', InvoiceSchema);
