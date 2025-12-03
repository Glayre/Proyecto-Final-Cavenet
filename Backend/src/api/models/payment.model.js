import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    montoMoneda: { type: String, enum: ['USD', 'VED'], required: true },
    monto: { type: Number, required: true },
    tasaVED: { type: Number }, // si aplica
    bancoOrigen: { type: String },
    cuentaDestino: { type: String },
    referencia: { type: String, required: true }, // últimos 6 dígitos
    fechaReporte: { type: Date, default: Date.now },
    estado: { type: String, enum: ['reportado', 'verificado', 'rechazado'], default: 'reportado' },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', PaymentSchema);
