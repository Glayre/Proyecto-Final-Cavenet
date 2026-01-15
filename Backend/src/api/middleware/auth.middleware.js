import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/**
 * Middleware de autenticación para validar tokens JWT.
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
        if (!payload || !payload.sub || !payload.rol) {
          return res.status(401).json({ code: "INVALID_TOKEN", message: "Token inválido" });
        }
        // Usar "_id" para consistencia con Mongoose
        req.user = { _id: payload.sub, rol: payload.rol };
      }

      next(); 
    } catch (err) {
      console.error("❌ Error en authMiddleware:", err);
      return res.status(401).json({ code: "INVALID_TOKEN", message: "Token inválido" });
    }
  };
}

/**
 * Middleware para validar si el usuario autenticado es administrador.
 */
export async function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Usuario no autenticado" });
  }

  try {
    const userInfo = await User.findById(req.user._id).select("rol").lean();

    console.log("🔒 Verificando rol de usuario:", userInfo);

    // ✅ CAMBIO DE SEGURIDAD: Validamos si userInfo existe antes de leer .rol
    if (!userInfo) {
      return res.status(404).json({ code: "USER_NOT_FOUND", message: "El usuario ya no existe en la base de datos" });
    }

    if (userInfo.rol !== "admin") {
      return res.status(403).json({ code: "FORBIDDEN", message: "Acceso denegado: solo administradores" });
    }

    next(); 
  } catch (error) {
    console.error("❌ Error en isAdmin:", error);
    return res.status(500).json({ code: "SERVER_ERROR", message: "Error al verificar permisos" });
  }
}