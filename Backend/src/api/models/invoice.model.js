import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema(
  {
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    mes: { type: String, required: true }, // 'NOVIEMBRE 2025'
    montoUSD: { type: Number, required: true },
    tasaVED: { type: Number, required: true }, // p.ej. 233.56
    estado: { type: String, enum: ['pendiente', 'pagado'], default: 'pendiente' },
    fechaEmision: { type: Date, default: Date.now },
    fechaPago: { type: Date },
    referenciaPago: { type: String }, // últimos 6 dígitos
  },
  { timestamps: true }
);

export default mongoose.model('Invoice', InvoiceSchema);
