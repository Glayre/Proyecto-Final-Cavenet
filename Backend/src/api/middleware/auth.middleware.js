import jwt from "jsonwebtoken";

/**
 * Middleware de autenticación para validar tokens JWT.
 *
 * @function authMiddleware
 * @param {boolean} [required=true] - Indica si el token es obligatorio para la ruta.
 * @returns {Function} Middleware de Express que valida el token JWT y añade req.user.
 *
 * @property {string} req.user._id - ID del usuario autenticado (extraído del payload).
 * @property {string} req.user.rol - Rol del usuario ("admin" o "cliente").
 */
export default function authMiddleware(required = true) {
  return (req, res, next) => {
    // 🔹 Obtener el header Authorization
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token && required) {
      return res
        .status(401)
        .json({ code: "UNAUTHORIZED", message: "Token requerido" });
    }

    if (token) {
      try {
        // 🔹 Verificar el token con la clave secreta
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ Asignar el payload al objeto req.user
        req.user = {
          _id: payload.sub || payload._id,
          rol: payload.rol,
        };

        console.log("✅ Usuario autenticado:", req.user);
      } catch (err) {
        // 🔹 Loguear el error exacto de JWT
        console.error("❌ JWT error:", err.message);
        return res
          .status(401)
          .json({ code: "INVALID_TOKEN", message: "Token inválido" });
      }
    }

    next();
  };
}

/**
 * Middleware para validar si el usuario autenticado es administrador.
 *
 * @function isAdmin
 * @returns {Object|void} Devuelve error 401 si no está autenticado, 403 si no es admin, o continúa la ejecución si lo es.
 */
export function isAdmin(req, res, next) {
  if (!req.user) {
    return res
      .status(401)
      .json({ code: "UNAUTHORIZED", message: "Usuario no autenticado" });
  }

  if (req.user.rol !== "admin") {
    return res
      .status(403)
      .json({ code: "FORBIDDEN", message: "Acceso denegado: solo administradores" });
  }

  next(); // ✅ continuar si es admin
}
