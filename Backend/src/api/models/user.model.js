import mongoose from 'mongoose';

// 🔹 Esquema de usuario
const userSchema = new mongoose.Schema(
  {
    cedula: { type: String, unique: true, index: true, required: true },
    email: { type: String, unique: true, index: true, required: true },
    passwordHash: { type: String, required: true },
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    telefono: { type: String },

    // Relación con dirección (referencia a Address)
    direccion: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },

    rol: { type: String, enum: ['cliente', 'admin'], default: 'cliente' },
    modoAcceso: { type: String, enum: ['email', 'codigo'], default: 'email' },
    saldoFavorVED: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 🔹 Esquema de direcciones
const addressSchema = new mongoose.Schema(
  {
    sede: { type: String, required: true },          // Ej: "Caracas"
    ciudad: { type: String, required: true },        // Ej: "Caracas"
    urbanizacion: { type: String, required: true },  // Ej: "La Castellana"
    calle: { type: String, required: true },         // Ej: "Av. Principal"
    apartamento: { type: String, required: false }   // Ej: "Apto 12-B"
  },
  { timestamps: true }
);

// 🔹 Modelos
const User = mongoose.model('User', userSchema);
const Address = mongoose.model('Address', addressSchema);

export { User, Address };
