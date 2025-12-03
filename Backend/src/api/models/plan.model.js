import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true }, // Básico 100 Mbps, etc.
    velocidadMbps: { type: Number, required: true },
    precioUSD: { type: Number, required: true },
    tipo: { type: String, enum: ['hogar', 'pyme'], required: true },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Plan', PlanSchema);
