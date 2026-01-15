/**
 * @file contacto.model.js
 * @description Modelo para almacenar mensajes del formulario de contacto (Prospectos/Clientes).
 */

import mongoose from "mongoose";

const contactoSchema = new mongoose.Schema(
  {
    // 🔹 Nombre de la persona que contacta
    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔹 Correo electrónico de respuesta
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // 🔹 Contenido del mensaje
    mensaje: {
      type: String,
      required: true,
    },

    // 🔹 Estado de gestión (Para control administrativo)
    estado: {
      type: String,
      enum: ["pendiente", "leido", "respondido"],
      default: "pendiente",
    },
  },
  {
    // Crea automáticamente campos de fecha: createdAt y updatedAt
    timestamps: true, 
  }
);

const Contacto = mongoose.model("Contacto", contactoSchema);

export default Contacto;