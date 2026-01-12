import mongoose from 'mongoose';

/**
 * Esquema de pagos (Payment).
 *
 * Representa los pagos reportados por los clientes en relación con las facturas emitidas.
 * Incluye información sobre el cliente, la factura asociada, el monto, la moneda,
 * la referencia bancaria y el estado de verificación del pago.
 *
 * @typedef {Object} Payment
 * @property {mongoose.ObjectId} clienteId - Referencia al usuario (cliente) que realizó el pago.
 * @property {mongoose.ObjectId} invoiceId - Referencia a la factura asociada al pago.
 * @property {string} montoMoneda - Moneda del pago, puede ser "USD" o "VED".
 * @property {number} monto - Monto del pago en la moneda especificada.
 * @property {number} [tasaVED] - Tasa de cambio aplicada en VED (si aplica).
 * @property {string} [bancoOrigen] - Banco desde el cual se realizó la transferencia.
 * @property {string} [cuentaDestino] - Cuenta destino donde se recibió el pago.
 * @property {string} referencia - Referencia del pago (últimos 6 dígitos).
 * @property {Date} fechaReporte - Fecha en la que se reportó el pago (por defecto la fecha actual).
 * @property {string} estado - Estado del pago: "reportado", "verificado" o "rechazado".
 * @property {Date} createdAt - Fecha de creación del documento (generada automáticamente por Mongoose).
 * @property {Date} updatedAt - Fecha de última actualización del documento (generada automáticamente por Mongoose).
 */
const PaymentSchema = new mongoose.Schema(
  {
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    montoMoneda: { type: String, enum: ['USD', 'VED'], required: true },
    monto: { type: Number, required: true },
    montoAbonado: { type: Number, default: 0 },
    tasaVED: { type: Number }, // Si aplica
    bancoOrigen: { type: String },
    cuentaDestino: { type: String },
    referencia: { type: String, required: true }, // Últimos 6 dígitos
    fechaReporte: { type: Date, default: Date.now },
    estado: { type: String, enum: ['reportado', 'verificado', 'rechazado'], default: 'reportado' },
  },
  { timestamps: true }
);

/**
 * Modelo de pagos.
 *
 * @constant
 * @type {mongoose.Model<Payment>}
 * @example
 * // Crear un nuevo pago
 * const pago = await Payment.create({
 *   clienteId: user._id,
 *   invoiceId: factura._id,
 *   montoMoneda: 'USD',
 *   monto: 50,
 *   referencia: '123456'
 * });
 */
export default mongoose.model('Payment', PaymentSchema);
