import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    cedula: { type: String, unique: true, index: true, required: true },
    email: { type: String, unique: true, index: true, required: true },
    passwordHash: { type: String, required: true },
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    telefono: { type: String },
    direccion: {
      ciudad: String,
      urbanismo: String,
      calle: String,
      casaApartamento: String,
    },
    rol: { type: String, enum: ['cliente', 'admin'], default: 'cliente' },
    modoAcceso: { type: String, enum: ['email', 'codigo'], default: 'email' },
    saldoFavorVED: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
