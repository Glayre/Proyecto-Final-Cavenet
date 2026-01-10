/**
 * @file contrato.model.js
 * @description Definición del modelo de Contrato en MongoDB usando Mongoose.
 */

import mongoose from "mongoose";

/**
 * Esquema de contrato con validaciones.
 *
 * - clienteId: referencia a User
 * - planId: referencia a Plan
 * - plan: obligatorio
 * - nombres: obligatorio, mínimo 2 caracteres
 * - apellidos: obligatorio
 * - cedula: obligatorio, solo números (7 a 9 dígitos)
 * - correo: obligatorio, formato válido
 * - telefono: opcional, 11 dígitos
 * - activo: por defecto true
 * - correoAlternativo: opcional, formato válido
 */
const contratoSchema = new mongoose.Schema(
  {
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan",required: [true, "El plan es obligatorio"] },
    plan: { type: String, required: [true, "El plan es obligatorio"] },
    nombres: {type: String, required: [true, "El nombre es obligatorio"], minlength: 2,},
    apellidos: { type: String, required: [true, "El apellido es obligatorio"],},
    cedula: { type: String, required: [true, "La cédula es obligatoria"], match: [/^[0-9]{7,9}$/, "Formato de cédula inválido"] },
    correo: { type: String, required: [true, "El correo es obligatorio"], match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Formato de correo inválido"], },
    telefono: { type: String, match: [/^\d{11}$/, "Formato de teléfono inválido (11 dígitos)"], },
    activo: { type: Boolean, default: true },
    correoAlternativo: { type: String, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Formato de correo inválido"], },
  },
  { timestamps: true }
);

/**
 * Modelo de Contrato.
 *
 * @constant
 * @type {mongoose.Model}
 */
const Contrato = mongoose.model("Contrato", contratoSchema);

export default Contrato;
