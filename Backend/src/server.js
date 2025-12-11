import { createServer } from "http";
import app from "./app.js";
import { loadEnv } from "./config/env.js";
import createDefaultAdminUser from "./utils/CreateDefaultAdminUser.js";
import { startInvoiceCron } from "./jobs/invoices.cron.js";

/**
 * Carga las variables de entorno desde el archivo `.env` o desde el sistema.
 *
 * @function loadEnv
 * @returns {void} No retorna valor, pero inicializa `process.env`.
 */
loadEnv();

/**
 * Puerto en el que se ejecutará el servidor.
 *
 * Se obtiene de la variable de entorno `PORT`.  
 * Si no está definida, se usa el valor por defecto `4000`.
 *
 * @constant
 * @type {number}
 * @default 4000
 */
const PORT = process.env.PORT || 4000;

/**
 * Servidor HTTP principal.
 *
 * Se crea a partir de la aplicación Express definida en `app.js`.
 *
 * @constant
 * @type {import("http").Server}
 *
 * @param {import("express").Express} app - Instancia de la aplicación Express que maneja las rutas y middlewares.
 */
const server = createServer(app);

/**
 * Inicializa el servidor y comienza a escuchar en el puerto definido.
 *
 * @function listen
 * @param {number} PORT - Puerto en el que se ejecutará el servidor.
 * @param {Function} callback - Función que se ejecuta cuando el servidor inicia correctamente.
 * @returns {void}
 *
 * @example
 * // Ejemplo de salida en consola:
 * // API corriendo en puerto 4000
 */
server.listen(PORT, () => {
  console.log(`🚀 API corriendo en puerto ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}/`);
});

/**
 * Inicialización de procesos adicionales:
 * - Creación de usuario administrador por defecto.
 * - Inicio del cron job de facturas para recordatorios y suspensión automática.
 */
createDefaultAdminUser();
startInvoiceCron();
