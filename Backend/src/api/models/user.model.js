import mongoose from 'mongoose';

/**
 * Esquema de usuarios (User).
 *
 * Representa a los usuarios registrados en el sistema, incluyendo datos personales,
 * credenciales de acceso, rol, dirección y estado de eliminación lógica (soft delete).
 *
 * @typedef {Object} User
 * @property {string} cedula - Documento de identidad único del usuario (7-8 dígitos numéricos).
 * @property {string} email - Correo electrónico único del usuario.
 * @property {string} passwordHash - Contraseña encriptada del usuario.
 * @property {string} nombre - Nombre del usuario.
 * @property {string} apellido - Apellido del usuario.
 * @property {string} [telefono] - Teléfono opcional del usuario.
 * @property {mongoose.ObjectId} direccion - Referencia al documento de dirección asociado.
 * @property {string} rol - Rol del usuario, puede ser "cliente" o "admin" (por defecto "cliente").
 * @property {string} modoAcceso - Modo de acceso, puede ser "email" o "codigo" (por defecto "email").
 * @property {number} saldoFavorVED - Saldo a favor en VED (por defecto 0).
 * @property {boolean} isDeleted - Indica si el usuario fue eliminado mediante soft delete (por defecto false).
 * @property {Date} createdAt - Fecha de creación del documento (generada automáticamente por Mongoose).
 * @property {Date} updatedAt - Fecha de última actualización del documento (generada automáticamente por Mongoose).
 */
const userSchema = new mongoose.Schema(
  {
    cedula: { type: String, unique: true, index: true, required: true },
    email: { type: String, unique: true, index: true, required: true },
    passwordHash: { type: String, required: true },
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    telefono: { type: String },

    // Relación con dirección (referencia a Address)
    direccion: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },

    rol: { type: String, enum: ['cliente', 'admin'], default: 'cliente' },
    modoAcceso: { type: String, enum: ['email', 'codigo'], default: 'email' },
    saldoFavorVED: { type: Number, default: 0 },

    // Campo para soft delete
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

/**
 * Esquema de direcciones (Address).
 *
 * Representa la dirección física asociada a un usuario.
 *
 * @typedef {Object} Address
 * @property {string} sede - Sede principal (ejemplo: "Caracas").
 * @property {string} ciudad - Ciudad de residencia.
 * @property {string} urbanizacion - Urbanización o sector.
 * @property {string} calle - Calle de la dirección.
 * @property {string} [apartamento] - Apartamento opcional.
 * @property {Date} createdAt - Fecha de creación del documento (generada automáticamente por Mongoose).
 * @property {Date} updatedAt - Fecha de última actualización del documento (generada automáticamente por Mongoose).
 */
const addressSchema = new mongoose.Schema(
  {
    sede: { type: String, required: true },          
    ciudad: { type: String, required: true },        
    urbanizacion: { type: String, required: true },  
    calle: { type: String, required: true },         
    apartamento: { type: String, required: false }   
  },
  { timestamps: true }
);

/**
 * Modelos de Mongoose para usuarios y direcciones.
 *
 * @constant
 * @type {mongoose.Model<User>}
 * @type {mongoose.Model<Address>}
 *
 * @example
 * // Crear un nuevo usuario con dirección
 * const direccion = await Address.create({
 *   sede: 'Caracas',
 *   ciudad: 'Caracas',
 *   urbanizacion: 'La Castellana',
 *   calle: 'Av. Principal',
 *   apartamento: 'Apto 12-B'
 * });
 *
 * const usuario = await User.create({
 *   cedula: '12345678',
 *   email: 'usuario@test.com',
 *   passwordHash: 'hashSeguro',
 *   nombre: 'Juan',
 *   apellido: 'Pérez',
 *   telefono: '04121234567',
 *   direccion: direccion._id
 * });
 */
const User = mongoose.model('User', userSchema);
const Address = mongoose.model('Address', addressSchema);

export { User, Address };
