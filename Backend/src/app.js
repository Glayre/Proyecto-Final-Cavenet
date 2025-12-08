import express from 'express';
import loadExpress from './loaders/express.js';
import routes from './api/routes/index.js';
import errorMiddleware from './api/middleware/error.middleware.js';
import './loaders/mongoose.js';

/**
 * Inicializa la aplicación Express.
 *
 * Configura los middlewares globales, monta las rutas principales bajo el
 * prefijo `/api` y aplica el manejo centralizado de errores.
 *
 * @constant
 * @type {import('express').Express}
 *
 * @example
 * import { createServer } from 'http';
 * import app from './app.js';
 *
 * const server = createServer(app);
 * server.listen(4000, () => {
 *   console.log('API corriendo en puerto 4000');
 * });
 */
const app = express();

/**
 * Carga de middlewares globales.
 *
 * @function loadExpress
 * @param {import('express').Express} app - Instancia de la aplicación Express sobre la que se aplican los middlewares.
 * @returns {void} No retorna valor, pero configura la aplicación.
 */
loadExpress(app); // middlewares globales

/**
 * Montaje de rutas principales.
 *
 * @function use
 * @param {string} path - Prefijo de las rutas de la API.
 * @param {import('express').Router} routes - Enrutador principal con las rutas de usuarios y planes.
 */
app.use('/api', routes);

/**
 * Middleware centralizado de manejo de errores.
 *
 * @function use
 * @param {Function} errorMiddleware - Middleware que captura errores y devuelve una respuesta JSON estandarizada.
 */
app.use(errorMiddleware); // manejo centralizado de errores

export default app;
