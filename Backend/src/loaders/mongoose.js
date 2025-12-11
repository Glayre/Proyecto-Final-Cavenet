import mongoose from 'mongoose';
import { loadEnv } from '../config/env.js';
import { seedPlans } from '../loaders/seedplans.js'; 

loadEnv();

/**
 * URI de conexión a MongoDB.
 *
 * Se obtiene de la variable de entorno `MONGO_URI`.  
 * Si no está definida, se usa el valor por defecto `mongodb://127.0.0.1:27017/cavenet`.
 *
 * @constant
 * @type {string}
 */
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cavenet';

/**
 * Configuración de Mongoose.
 *
 * Se establece el modo `strictQuery` para garantizar que las consultas
 * solo acepten campos definidos en los esquemas, evitando resultados inesperados.
 */
mongoose.set('strictQuery', true);

/**
 * Conexión a la base de datos MongoDB.
 *
 * Utiliza la librería `mongoose` para establecer la conexión con la base de datos.
 * - `autoIndex: true` asegura que los índices definidos en los esquemas se creen automáticamente.
 * - En caso de éxito, se ejecutan los seeds de Admin y Planes.
 * - En caso de error, se imprime el error y se detiene el proceso con `process.exit(1)`.
 *
 * @function connectMongoDB
 * @returns {Promise<void>} Promesa que se resuelve cuando la conexión es exitosa.
 *
 * @example
 * // Uso en app.js o server.js
 * import './loaders/mongoose.js';
 */
mongoose
  .connect(uri, { autoIndex: true })
  .then(async () => {
    console.log('MongoDB conectado');

    // 🔹 Ejecutar seeds
    await seedPlans();
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB', err);
    process.exit(1);
  });
