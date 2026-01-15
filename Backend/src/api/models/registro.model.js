/**
 * @file registro.model.js
 * @description Modelo de registros para prospectos sincronizado con el frontend.
 */

import mongoose from "mongoose";

const registroSchema = new mongoose.Schema(
  {
    // Relación opcional con usuario
    clienteId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: false 
    },
    // Campo único para el plan (Texto como en Insomnia)
    plan: { 
      type: String, 
      required: [true, "El nombre del plan es obligatorio"] 
    },
    // Datos Personales
    nombres: { 
      type: String, 
      required: [true, "Los nombres son obligatorios"] 
    },
    apellidos: { 
      type: String, 
      required: [true, "Los apellidos son obligatorios"] 
    },
    cedula: { 
      type: String, 
      required: [true, "La cédula es obligatoria"], 
      unique: true 
    },
    correo: { 
      type: String, 
      required: [true, "El correo es obligatorio"],
      lowercase: true,
      trim: true
    },
    fechaNacimiento: { type: String },
    // Dirección
    ciudad: { type: String },
    callePrincipal: { type: String },
    calleSecundaria: { type: String },
    numeroCasa: { type: String },
    // Contacto
    telefono: { 
      type: String, 
      required: [true, "El teléfono es obligatorio"] 
    },
    otroContacto: { type: String },
    correoAlternativo: { type: String },
    // Gestión
    estado: { 
      type: String, 
      enum: ["pendiente", "contactado", "aprobado", "rechazado"], 
      default: "pendiente" 
    },
    observaciones: { type: String }
  },
  { timestamps: true }
);

// Middleware corregido (Sin 'next' para evitar el crash)
registroSchema.pre("save", function () {
  if (this.cedula) this.cedula = this.cedula.trim();
  if (this.nombres) this.nombres = this.nombres.trim();
  if (this.apellidos) this.apellidos = this.apellidos.trim();
});

const Registro = mongoose.model("Registro", registroSchema);
export default Registro;