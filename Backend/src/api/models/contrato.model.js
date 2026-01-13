/**
 * @file contrato.model.js
 * @description Modelo de contratos para formalizar la relación comercial entre usuarios y planes.
 */

import mongoose from "mongoose";

const contratoSchema = new mongoose.Schema(
  {
    // 🔹 Relación obligatoria con el usuario
    clienteId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    // 🔹 Relación obligatoria con el plan contratado
    planId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Plan", 
      required: true 
    },

    // 🔹 Correo para notificaciones administrativas (campo específico que pediste)
    correoAlternativo: { 
      type: String, 
      required: true,
      trim: true,
      lowercase: true
    },

    // 🔹 Estado del contrato (útil para gestión administrativa)
    estado: { 
      type: String, 
      enum: ["activo", "suspendido", "finalizado"], 
      default: "activo" 
    },

    // 🔹 Fecha de firma o inicio (opcional, ya que timestamps trae createdAt)
    fechaInicio: { 
      type: Date, 
      default: Date.now 
    }
  },
  {
    timestamps: true, // Agrega automáticamente createdAt (Fecha de contrato) y updatedAt
  }
);

const Contrato = mongoose.model("Contrato", contratoSchema);

export default Contrato;