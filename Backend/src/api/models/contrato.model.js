/**
 * @file contrato.model.js
 * @description Definición del modelo de Contrato en MongoDB usando Mongoose.
 */

import mongoose from "mongoose";

/**
 * Esquema de contrato con validaciones.
 *
 * - nombres: obligatorio, mínimo 2 caracteres
 * - apellidos: obligatorio
 * - cedula: obligatorio, solo números (7 a 9 dígitos)
 * - correo: obligatorio, formato válido
 * - fechaNacimiento: obligatorio, formato dd/mm/aaaa
 * - plan: obligatorio, solo valores permitidos
 * - telefono: opcional, 11 dígitos
 * - correoAlternativo: opcional, formato válido
 */
const contratoSchema = new mongoose.Schema(
  {
    nombres: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      minlength: 2,
    },
    apellidos: {
      type: String,
      required: [true, "El apellido es obligatorio"],
    },
    cedula: {
      type: String,
      required: [true, "La cédula es obligatoria"],
      match: [/^[0-9]{7,9}$/, "Formato de cédula inválido"],
    },
    correo: {
      type: String,
      required: [true, "El correo es obligatorio"],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Formato de correo inválido"],
    },
    fechaNacimiento: {
      type: String,
      required: [true, "La fecha de nacimiento es obligatoria"],
      match: [/^\d{2}\/\d{2}\/\d{4}$/, "Formato de fecha inválido (dd/mm/aaaa)"],
    },
    ciudad: { type: String },
    callePrincipal: { type: String },
    calleSecundaria: { type: String },
    numeroCasa: { type: String },
    plan: {
      type: String,
      enum: ["Redes Sociales", "Multimedia", "FullHD"],
      required: [true, "El plan es obligatorio"],
    },
    telefono: {
      type: String,
      match: [/^\d{11}$/, "Formato de teléfono inválido (11 dígitos)"],
    },
    otroContacto: { type: String },
    correoAlternativo: {
      type: String,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Formato de correo inválido"],
    },
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
