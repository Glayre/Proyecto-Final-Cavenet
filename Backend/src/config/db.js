import dotenv from 'dotenv';
dotenv.config();

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
export const PORT = process.env.PORT || 4000;

/**
 * URI de conexión a la base de datos MongoDB.
 *
 * Se obtiene de la variable de entorno `MONGO_URI`.  
 * Es obligatorio definirla en el archivo `.env`.
 *
 * @constant
 * @type {string}
 */
export const MONGO_URI = process.env.MONGO_URI;

/**
 * Clave secreta para la firma de tokens JWT.
 *
 * Se obtiene de la variable de entorno `JWT_SECRET`.  
 * Es obligatoria para garantizar la seguridad en la autenticación.
 *
 * @constant
 * @type {string}
 */
export const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Tiempo de expiración de los tokens JWT.
 *
 * Se obtiene de la variable de entorno `JWT_EXPIRES`.  
 * Si no está definida, se usa el valor por defecto `1d` (1 día).
 *
 * @constant
 * @type {string}
 * @default "1d"
 */
export const JWT_EXPIRES = process.env.JWT_EXPIRES || '1d';

/**
 * Origen permitido para solicitudes CORS.
 *
 * Se obtiene de la variable de entorno `CORS_ORIGIN`.  
 * Si no está definida, se permite cualquier origen (`*`).
 *
 * @constant
 * @type {string}
 * @default "*"
 */
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
