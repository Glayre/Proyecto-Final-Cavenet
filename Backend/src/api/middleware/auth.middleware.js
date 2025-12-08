import jwt from 'jsonwebtoken';

/**
 * Middleware de autenticación para validar tokens JWT.
 *
 * @function authMiddleware
 * @param {boolean} [required=true] - Indica si el token es obligatorio para la ruta.
 * @returns {Function} Middleware de Express que valida el token JWT.
 *
 * @example
 * // Proteger una ruta
 * router.get('/usuarios', authMiddleware(true), getUsers);
 */
export default function authMiddleware(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    // Si el token es obligatorio y no está presente
    if (!token && required) {
      return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token requerido' });
    }

    try {
      if (token) {
        // Verificar token y extraer payload
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // Se usa "rol" porque así se genera en el login
        req.user = { id: payload.sub, rol: payload.rol };
      }
      next();
    } catch (err) {
      return res.status(401).json({ code: 'INVALID_TOKEN', message: 'Token inválido' });
    }
  };
}

/**
 * Middleware para validar si el usuario autenticado es administrador.
 *
 * @function isAdmin
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar al siguiente middleware.
 * @returns {Object|void} Devuelve error 403 si el usuario no es administrador, o continúa la ejecución si lo es.
 *
 * @example
 * // Proteger una ruta solo para administradores
 * router.delete('/usuarios/:id', authMiddleware(true), isAdmin, deleteUser);
 */
export function isAdmin(req, res, next) {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ code: 'FORBIDDEN', message: 'Acceso denegado: solo administradores' });
  }
  next();
}
