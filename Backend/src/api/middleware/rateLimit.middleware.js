import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo de requests por IP
  message: { error: 'Demasiadas solicitudes, intenta más tarde.' }
});

export default limiter;
