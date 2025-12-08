/**
 * Middleware centralizado para el manejo de errores en la aplicación.
 *
 * Este middleware captura cualquier error lanzado en las rutas o controladores
 * y devuelve una respuesta JSON estandarizada con el código de estado HTTP y
 * un mensaje descriptivo.
 *
 * @function errorMiddleware
 * @param {Object} err - Objeto de error capturado.
 * @param {number} [err.status=500] - Código de estado HTTP asociado al error.
 * @param {string} [err.message='Error interno del servidor'] - Mensaje descriptivo del error.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar al siguiente middleware (no utilizada aquí).
 * @returns {Object} JSON con la estructura `{ error: <mensaje> }`.
 *
 * @example
 * // Uso en app.js
 * import errorMiddleware from './middlewares/error.middleware.js';
 * app.use(errorMiddleware);
 */
export default function errorMiddleware(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ error: message });
}
