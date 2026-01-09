import mongoose from 'mongoose';

/**
 * Esquema de planes (Plan).
 *
 * Representa los planes de servicio ofrecidos a los clientes.
 * Incluye información sobre nombre, velocidad, precio, tipo y estado de disponibilidad.
 *
 * @typedef {Object} Plan
 * @property {mongoose.ObjectId} usuarioId - Referencia al usuario (cliente) asociado al plan.
 * @property {string} nombre - Nombre del plan (ejemplo: "Básico 100 Mbps").
 * @property {number} velocidadMbps - Velocidad del plan en Mbps.
 * @property {number} precioUSD - Precio del plan en dólares estadounidenses.
 * @property {string} tipo - Tipo de plan, puede ser "hogar" o "pyme".
 * @property {boolean} activo - Estado del plan, indica si está disponible (true por defecto).
 * @property {Date} createdAt - Fecha de creación del documento (generada automáticamente por Mongoose).
 * @property {Date} updatedAt - Fecha de última actualización del documento (generada automáticamente por Mongoose).
 */
const PlanSchema = new mongoose.Schema(
  {
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    nombre: { type: String, required: true }, // Ejemplo: "Básico 100 Mbps"
    velocidadMbps: { type: Number, required: true },
    precioUSD: { type: Number, required: true },
    tipo: { type: String, enum: ['hogar', 'pyme'], required: true },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * Modelo de planes.
 *
 * @constant
 * @type {mongoose.Model<Plan>}
 * @example
 * // Crear un nuevo plan
 * const plan = await Plan.create({
 *   nombre: 'Básico 100 Mbps',
 *   velocidadMbps: 100,
 *   precioUSD: 25,
 *   tipo: 'hogar'
 * });
 */
export default mongoose.model('Plan', PlanSchema);
