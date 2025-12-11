import Plan from '../api/models/plan.model.js';

export async function seedPlans() {
  try {
    const count = await Plan.countDocuments();
    if (count === 0) {
      await Plan.create([
        { nombre: 'Plan Hogar Básico', velocidadMbps: 100, precioUSD: 25, tipo: 'hogar' },
        { nombre: 'Plan Hogar Básico', velocidadMbps: 150, precioUSD: 35, tipo: 'hogar' },
        { nombre: 'Plan Pyme Bronce', velocidadMbps: 400, precioUSD: 50, tipo: 'pyme' },
        { nombre: 'Plan Pyme Plata', velocidadMbps: 600, precioUSD: 70, tipo: 'pyme' },
        { nombre: 'Plan Pyme Oro', velocidadMbps: 800, precioUSD: 100, tipo: 'pyme' },
        { nombre: 'Plan Pyme Diamante', velocidadMbps: 1000, precioUSD: 150, tipo: 'pyme' },
      ]);
      console.log('[INFO]: Planes iniciales creados');
    } else {
      console.log('[INFO]: Ya existen planes en la base de datos');
    }
  } catch (err) {
    console.error('[ERROR]: No se pudieron crear los planes iniciales', err);
  }
}
