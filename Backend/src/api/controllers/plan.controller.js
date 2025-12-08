import Plan from '../models/plan.model.js';
import regex from '../../utils/regex.js';

/**
 * Crear un nuevo plan con validaciones.
 *
 * @async
 * @function createPlan
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.body - Datos del plan a crear.
 * @param {string} req.body.nombre - Nombre del plan (solo letras, entre 2 y 200 caracteres).
 * @param {number} req.body.velocidadMbps - Velocidad en Mbps (número positivo).
 * @param {number} req.body.precioUSD - Precio en USD (número positivo).
 * @param {string} req.body.tipo - Tipo de plan ("hogar" o "pyme").
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para manejar errores.
 * @returns {Object} JSON con el plan creado o error de validación.
 */
export async function createPlan(req, res, next) {
  try {
    const { nombre, velocidadMbps, precioUSD, tipo } = req.body;

    // 🔹 Validaciones
    if (!regex.text.test(nombre)) {
      return res.status(400).json({ error: 'Nombre inválido (solo letras, entre 2 y 200 caracteres)' });
    }
    if (typeof velocidadMbps !== 'number' || velocidadMbps <= 0) {
      return res.status(400).json({ error: 'Velocidad inválida (debe ser un número positivo)' });
    }
    if (typeof precioUSD !== 'number' || precioUSD <= 0) {
      return res.status(400).json({ error: 'Precio inválido (debe ser un número positivo)' });
    }
    if (!['hogar', 'pyme'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido (solo se acepta "hogar" o "pyme")' });
    }

    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
}

/**
 * Actualizar un plan existente con validaciones.
 *
 * @async
 * @function updatePlan
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {string} req.params.id - ID del plan a actualizar.
 * @param {Object} req.body - Datos a actualizar.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para manejar errores.
 * @returns {Object} JSON con el plan actualizado o error de validación.
 */
export async function updatePlan(req, res, next) {
  try {
    const { nombre, velocidadMbps, precioUSD, tipo } = req.body;

    // 🔹 Validaciones condicionales
    if (nombre && !regex.text.test(nombre)) {
      return res.status(400).json({ error: 'Nombre inválido' });
    }
    if (velocidadMbps && (typeof velocidadMbps !== 'number' || velocidadMbps <= 0)) {
      return res.status(400).json({ error: 'Velocidad inválida' });
    }
    if (precioUSD && (typeof precioUSD !== 'number' || precioUSD <= 0)) {
      return res.status(400).json({ error: 'Precio inválido' });
    }
    if (tipo && !['hogar', 'pyme'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(plan);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener todos los planes disponibles.
 *
 * @async
 * @function getPlans
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para manejar errores.
 * @returns {Array<Object>} Lista de planes.
 */
export async function getPlans(req, res, next) {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener un plan por su ID.
 *
 * @async
 * @function getPlanById
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {string} req.params.id - ID del plan.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para manejar errores.
 * @returns {Object} JSON con el plan encontrado o error si no existe.
 */
export async function getPlanById(req, res, next) {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });
    res.json(plan);
  } catch (err) {
    next(err);
  }
}

/**
 * Eliminar un plan por su ID.
 *
 * @async
 * @function deletePlan
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {string} req.params.id - ID del plan a eliminar.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para manejar errores.
 * @returns {Object} JSON con confirmación de eliminación.
 */
export async function deletePlan(req, res, next) {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
