/**
 * @file server.js
 * @description Punto de entrada principal del servidor HTTP. 
 * Configura la aplicación Express, carga variables de entorno, 
 * inicializa procesos críticos (usuario administrador y cron de facturas) 
 * y arranca el servidor en el puerto definido.
 */

import { createServer } from "http";
import app from "./app.js";
import { loadEnv } from "./config/env.js";
import createDefaultAdminUser from "./utils/CreateDefaultAdminUser.js";
import { startInvoiceCron } from "./jobs/invoices.cron.js";

/**
 * Carga las variables de entorno desde el archivo `.env` o desde el sistema.
 * 
 * @function loadEnv
 * @returns {void} Inicializa `process.env` con las variables de entorno.
 */
loadEnv();

/**
 * Puerto en el que se ejecutará el servidor.
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
 * // 🚀 API corriendo en puerto 4000
 * // 🌐 http://localhost:4000/
 */
server.listen(PORT, () => {
  console.log(`🚀 API corriendo en puerto ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}/`);
});

/**
 * Inicialización de procesos adicionales:
 * - Creación/verificación de usuario administrador por defecto.
 * - Inicio del cron job de facturas para recordatorios y suspensión automática.
 * 
 * Se ejecuta en un bloque asincrónico independiente para no bloquear el arranque del servidor.
 */
(async () => {
  try {
    // 🔹 Crear/verificar admin por defecto
    await createDefaultAdminUser();
    console.log("✅ Usuario administrador por defecto verificado/creado");

    // 🔹 Iniciar cron job de facturas
    startInvoiceCron();
    console.log("⏰ Cron job de facturas iniciado correctamente");
  } catch (err) {
    console.error("❌ Error en inicialización de procesos adicionales:", err.message);

    // Opcional: detener el servidor si falla la inicialización crítica
    // process.exit(1);
  }
})();
