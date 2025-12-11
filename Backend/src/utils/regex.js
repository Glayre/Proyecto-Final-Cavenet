/**
 * Conjunto de expresiones regulares para validación de datos de entrada.
 *
 * Este objeto centraliza las reglas de validación utilizadas en la aplicación
 * para asegurar la integridad de los datos antes de ser procesados o almacenados.
 *
 * @constant
 * @type {Object}
 *
 * @property {RegExp} email - Valida direcciones de correo electrónico con formato estándar.
 * @property {RegExp} password - Valida contraseñas con mínimo 8 caracteres, al menos una letra y un número.
 * @property {RegExp} text - Valida nombres y apellidos (solo letras y espacios, entre 2 y 200 caracteres).
 * @property {RegExp} phone - Valida números de teléfono de 11 dígitos, con prefijo opcional "+".
 * @property {RegExp} ci - Valida cédulas venezolanas de 7 u 8 dígitos.
 * @property {RegExp} address - Valida direcciones (letras, números, espacios, puntos, guiones y "#", entre 2 y 200 caracteres).
 *
 * @example
 * import regex from './utils/regex.js';
 *
 * if (!regex.email.test(user.email)) {
 *   throw new Error('Correo electrónico inválido');
 * }
 */
const regex = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Correo electrónico válido
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, // Contraseña segura
  text: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{2,200}$/,   // Nombres y apellidos
  phone: /^\+?[0-9]{11}$/,                // Teléfonos de 11 dígitos
  ci: /^[0-9]{7,8}$/,                     // Cédula venezolana
  address: /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s\.\-#]{2,200}$/ // Direcciones completas
};

export default regex;

