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
 * - cors: Habilita CORS con soporte para credenciales y origen dinámico.
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
 * import loadExpress from './config/express.js';
 *
 * const app = express();
 * loadExpress(app);
 */
export default function loadExpress(app) {
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(morgan('dev'));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
}
