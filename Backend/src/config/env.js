import dotenv from 'dotenv';

/**
 * Carga las variables de entorno desde un archivo `.env` o desde el sistema.
 *
 * Esta función utiliza la librería `dotenv` para inyectar las variables definidas
 * en el archivo `.env` dentro de `process.env`. Si el archivo `.env` no existe
 * o ocurre un error durante la carga, se muestra una advertencia indicando que
 * se usarán las variables de entorno del sistema.
 *
 * @function loadEnv
 * @returns {void} No retorna ningún valor, pero modifica `process.env` con las variables cargadas.
 *
 * @example
 * // Uso en app.js o server.js
 * import { loadEnv } from './config/env.js';
 * loadEnv();
 *
 * console.log(process.env.PORT); // Accede a la variable de entorno PORT
 */
export function loadEnv() {
  const result = dotenv.config();
  if (result.error) {
    console.warn('Cargando variables desde entorno del sistema...');
  }
}
