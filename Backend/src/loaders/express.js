import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import express from 'express';

/**
 * Configuración base de la aplicación Express.
 *
 * Esta función aplica una serie de middlewares globales para mejorar la seguridad,
 * el rendimiento y la capacidad de análisis de solicitudes en la API.
 *
 * Middlewares aplicados:
 * - helmet: Añade cabeceras de seguridad HTTP.
 * - cors: Habilita CORS para permitir peticiones desde el frontend en http://localhost:3000.
 * - morgan: Registra las solicitudes HTTP en consola (modo "dev").
 * - compression: Comprime las respuestas para optimizar el rendimiento.
 * - express.json: Permite recibir cuerpos de petición en formato JSON (límite de 1 MB).
 * - express.urlencoded: Permite recibir datos codificados en URL (formularios).
 *
 * @function loadExpress
 * @param {import('express').Express} app - Instancia de la aplicación Express.
 * @returns {void} No retorna ningún valor, pero configura la aplicación con los middlewares.
 *
 * @example
 * // Uso en app.js
 * import express from 'express';
 * import loadExpress from './loaders/express.js';
 *
 * const app = express();
 * loadExpress(app);
 */
export default function loadExpress(app) {
  // 🔹 Seguridad básica: cabeceras HTTP seguras
  app.use(helmet());

  // 🔹 CORS: habilita peticiones desde el frontend en http://localhost:3000
  // "credentials: true" permite enviar cookies o headers de autenticación
  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
  }));

  // 🔹 Logs de peticiones HTTP (modo desarrollo)
  app.use(morgan('dev'));

  // 🔹 Compresión de respuestas para mejorar rendimiento
  app.use(compression());

  // 🔹 Parseo de JSON en el body de las peticiones
  app.use(express.json({ limit: '1mb' }));

  // 🔹 Parseo de datos de formularios (application/x-www-form-urlencoded)
  app.use(express.urlencoded({ extended: true }));
}
