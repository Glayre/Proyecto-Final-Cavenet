import jwt from 'jsonwebtoken';

export default function authMiddleware(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token && required) {
      return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token requerido' });
    }

    try {
      if (token) {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // 🔹 Usa "rol" porque así lo generas en el login
        req.user = { id: payload.sub, rol: payload.rol };
      }
      next();
    } catch (err) {
      return res.status(401).json({ code: 'INVALID_TOKEN', message: 'Token inválido' });
    }
  };
}

// 🔹 Función extra para validar administradores
export function isAdmin(req, res, next) {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ code: 'FORBIDDEN', message: 'Acceso denegado: solo administradores' });
  }
  next();
}

