/**
 * @file contrato.model.js
 * @description Modelo de contratos para formalizar la relación comercial entre usuarios y planes.
 */

import mongoose from "mongoose";

const contratoSchema = new mongoose.Schema(
  {
    // 🔹 Relación obligatoria con el usuario - UNICO por cliente
    clienteId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      unique: true // 👈 Evita que un mismo cliente tenga múltiples contratos
    },

    // 🔹 Relación obligatoria con el plan contratado
    planId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Plan", 
      required: true 
    },

    // 🔹 Correo para notificaciones administrativas
    correoAlternativo: { 
      type: String, 
      required: true,
      trim: true,
      lowercase: true
    },

    // 🔹 Estado del contrato
    estado: { 
      type: String, 
      enum: ["activo", "suspendido", "finalizado"], 
      default: "activo" 
    },

    // 🔹 Fecha de firma o inicio
    fechaInicio: { 
      type: Date, 
      default: Date.now 
    }
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

const Contrato = mongoose.model("Contrato", contratoSchema);

export default Contrato;