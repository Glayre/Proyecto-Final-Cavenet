import jwt from "jsonwebtoken";

/**
 * Middleware de autenticación para validar tokens JWT.
 *
 * @function authMiddleware
 * @param {boolean} [required=true] - Indica si el token es obligatorio para la ruta.
 * @returns {Function} Middleware de Express que valida el token JWT y añade req.user.
 *
 * @property {string} req.user._id - ID del usuario autenticado.
 * @property {string} req.user.rol - Rol del usuario ("admin" o "cliente").
 *
 * @example
 * // Proteger una ruta (token obligatorio)
 * router.get('/usuarios', authMiddleware(true), getUsers);
 *
 * // Permitir acceso opcional (token no obligatorio)
 * router.get('/public', authMiddleware(false), getPublicData);
 */
export default function authMiddleware(required = true) {
  return (req, res, next) => {
    try {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : null;

      if (!token && required) {
        return res.status(401).json({ code: "UNAUTHORIZED", message: "Token requerido" });
      }

      if (token) {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // Usar "_id" para consistencia con Mongoose
        req.user = { _id: payload.sub, rol: payload.rol };
      }

      next(); // ✅ continuar siempre la cadena si no hay error
    } catch (err) {
      console.error("❌ Error en authMiddleware:", err);
      return res.status(401).json({ code: "INVALID_TOKEN", message: "Token inválido" });
    }
  };
}

/**
 * Middleware para validar si el usuario autenticado es administrador.
 *
 * @function isAdmin
 * @param {import("express").Request} req - Objeto de solicitud de Express.
 * @param {import("express").Response} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar al siguiente middleware.
 * @returns {Object|void} Devuelve error 401 si no está autenticado, 403 si no es admin, o continúa la ejecución si lo es.
 *
 * @example
 * // Proteger una ruta solo para administradores
 * router.post('/plans', authMiddleware(true), isAdmin, createPlan);
 */
export function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Usuario no autenticado" });
  }

  if (req.user.rol !== "admin") {
    return res.status(403).json({ code: "FORBIDDEN", message: "Acceso denegado: solo administradores" });
  }

  next(); // ✅ continuar si es admin
}
