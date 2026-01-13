/**
 * @file registro.model.js
 * @description Modelo de registros para almacenar la relación entre usuarios y planes.
 */

import mongoose from "mongoose";

const registroSchema = new mongoose.Schema(
  {
    // 🔹 Relación con el usuario
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // 🔹 Relación con el plan
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    plan: { type: String, required: true },

    // 🔹 Datos redundantes para consulta rápida
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    cedula: { type: String, required: true, unique: true },
    correo: { type: String, required: true },
    telefono: { type: String, required: true },
    otroContacto: { type: String },
    correoAlternativo: { type: String },
    fechaNacimiento: { type: String },

    // 🔹 Dirección (también guardada en Direccion, pero aquí se replica para consulta rápida)
    ciudad: { type: String },
    callePrincipal: { type: String },
    calleSecundaria: { type: String },
    numeroCasa: { type: String },
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automáticamente
  }
);

const Registro = mongoose.model("Registro", registroSchema);

export default Registro;
