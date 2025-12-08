import rateLimit from 'express-rate-limit';

/**
 * Middleware de limitación de solicitudes (Rate Limiting).
 *
 * Este middleware protege la API contra abusos y ataques de fuerza bruta,
 * limitando el número de solicitudes que un cliente (IP) puede realizar
 * en un intervalo de tiempo determinado.
 *
 * Configuración:
 * - windowMs: Ventana de tiempo en milisegundos (15 minutos).
 * - max: Número máximo de solicitudes permitidas por IP en la ventana (100).
 * - message: Respuesta JSON enviada cuando se excede el límite.
 *
 * @constant
 * @type {Function}
 * @returns {Function} Middleware de Express que limita las solicitudes.
 *
 * @example
 * // Uso en app.js
 * import limiter from './middlewares/ratelimit.middleware.js';
 * app.use(limiter);
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo de requests por IP
  message: { error: 'Demasiadas solicitudes, intenta más tarde.' }
});

export default limiter;
