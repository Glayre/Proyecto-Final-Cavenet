import { User, Address } from '../models/user.model.js';
import regex from '../../utils/regex.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Crear un nuevo usuario con validaciones.
 *
 * @async
 * @function createUser
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.body - Datos del usuario a crear.
 * @param {string} req.body.cedula - Cédula del usuario (7-8 dígitos numéricos).
 * @param {string} req.body.email - Correo electrónico único.
 * @param {string} req.body.password - Contraseña en texto plano (mínimo 8 caracteres, letras y números).
 * @param {string} req.body.nombre - Nombre del usuario.
 * @param {string} req.body.apellido - Apellido del usuario.
 * @param {string} [req.body.telefono] - Teléfono opcional (11 dígitos).
 * @param {string} req.body.sede - Sede de la dirección.
 * @param {string} req.body.ciudad - Ciudad de la dirección.
 * @param {string} req.body.urbanizacion - Urbanización de la dirección.
 * @param {string} req.body.calle - Calle de la dirección.
 * @param {string} [req.body.apartamento] - Apartamento opcional.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para manejar errores.
 * @returns {Object} JSON con el usuario creado (sin passwordHash).
 */
export async function createUser(req, res, next) {
  try {
    const { cedula, email, password, nombre, apellido, telefono, sede, ciudad, urbanizacion, calle, apartamento } = req.body;

    // 🔹 Validaciones básicas
    if (!regex.ci.test(cedula)) return res.status(400).json({ error: 'Cédula inválida (7-8 dígitos numéricos)' });
    if (!regex.email.test(email)) return res.status(400).json({ error: 'Correo electrónico inválido' });
    if (!regex.password.test(password)) return res.status(400).json({ error: 'Contraseña inválida (mínimo 8 caracteres, letras y números)' });
    if (telefono && !regex.phone.test(telefono)) return res.status(400).json({ error: 'Teléfono inválido (11 dígitos)' });
    if (!regex.text.test(nombre) || !regex.text.test(apellido)) return res.status(400).json({ error: 'Nombre/Apellido inválido' });

    // 🔹 Validaciones de dirección
    if (!sede || !ciudad || !urbanizacion || !calle) {
      return res.status(400).json({ error: 'Debe especificar sede, ciudad, urbanización y calle' });
    }
    if (!regex.address.test(sede)) return res.status(400).json({ error: 'Sede inválida' });
    if (!regex.address.test(ciudad)) return res.status(400).json({ error: 'Ciudad inválida' });
    if (!regex.address.test(urbanizacion)) return res.status(400).json({ error: 'Urbanización inválida' });
    if (!regex.address.test(calle)) return res.status(400).json({ error: 'Calle inválida' });
    if (apartamento && !regex.address.test(apartamento)) return res.status(400).json({ error: 'Apartamento inválido' });

    // 🔹 Buscar o crear dirección
    let direccion = await Address.findOne({ sede, ciudad, urbanizacion, calle, apartamento });
    if (!direccion) {
      direccion = await Address.create({ sede, ciudad, urbanizacion, calle, apartamento });
    }

    // 🔹 Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // 🔹 Crear usuario con referencia a dirección
    const user = await User.create({
      cedula,
      email,
      passwordHash,
      nombre,
      apellido,
      telefono,
      direccion: direccion._id
    });

    // 🔹 Popular la dirección antes de responder y ocultar passwordHash
    const userWithAddress = await User.findById(user._id)
      .populate('direccion')
      .select('-passwordHash');

    res.status(201).json(userWithAddress);
  } catch (err) {
    next(err);
  }
}

/**
 * Iniciar sesión de usuario con validaciones.
 *
 * @async
 * @function login
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.body - Credenciales de login.
 * @param {string} req.body.email - Correo electrónico del usuario.
 * @param {string} req.body.password - Contraseña en texto plano.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para manejar errores.
 * @returns {Object} JSON con mensaje de éxito, token JWT y datos del usuario.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!regex.email.test(email)) return res.status(400).json({ error: 'Correo inválido' });
    if (!regex.password.test(password)) return res.status(400).json({ error: 'Contraseña inválida' });

    const user = await User.findOne({ email, isDeleted: false }).populate('direccion');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Generar token JWT
    const token = jwt.sign(
      { sub: user._id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 🔹 Ocultar passwordHash en la respuesta
    const userSafe = await User.findById(user._id)
      .populate('direccion')
      .select('-passwordHash');

    res.json({ message: 'Login exitoso', token, user: userSafe });
  } catch (err) {
    next(err);
  }
}

/**
 * Actualizar un usuario existente con validaciones.
 *
 * @async
 * @function updateUser
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {string} req.params.id - ID del usuario a actualizar.
 * @param {Object} req.body - Datos a actualizar.
 * @param {string} [req.body.nombre] - Nombre del usuario.
 * @param {string} [req.body.apellido] - Apellido del usuario.
 * @param {string} [req.body.telefono] - Teléfono del usuario (11 dígitos).
 * @param {string} [req.body.sede] - Sede de la dirección.
 * @param {string} [req.body.ciudad] - Ciudad de la dirección.
 * @param {string} [req.body.urbanizacion] - Urbanización de la dirección.
 * @param {string} [req.body.calle] - Calle de la dirección.
 * @param {string} [req.body.apartamento] - Apartamento opcional.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para manejar errores.
 * @returns {Object} JSON con el usuario actualizado o error si está eliminado.
 */
export async function updateUser(req, res, next) {
  try {
    const { nombre, apellido, telefono, sede, ciudad, urbanizacion, calle, apartamento } = req.body;

    if (nombre && !regex.text.test(nombre)) return res.status(400).json({ error: 'Nombre inválido' });
    if (apellido && !regex.text.test(apellido)) return res.status(400).json({ error: 'Apellido inválido' });
    if (telefono && !regex.phone.test(telefono)) return res.status(400).json({ error: 'Teléfono inválido' });

    let direccion;
    if (sede && ciudad && urbanizacion && calle) {
      if (!regex.address.test(sede)) return res.status(400).json({ error: 'Sede inválida' });
      if (!regex.address.test(ciudad)) return res.status(400).json({ error: 'Ciudad inválida' });
      if (!regex.address.test(urbanizacion)) return res.status(400).json({ error: 'Urbanización inválida' });
      if (!regex.address.test(calle)) return res.status(400).json({ error: 'Calle inválida' });
      if (apartamento && !regex.address.test(apartamento)) return res.status(400).json({ error: 'Apartamento inválido' });

      direccion = await Address.findOne({ sede, ciudad, urbanizacion, calle, apartamento });
      if (!direccion) {
        direccion = await Address.create({ sede, ciudad, urbanizacion, calle, apartamento });
      }
      req.body.direccion = direccion._id;
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('direccion')
      .select('-passwordHash');
    if (!user || user.isDeleted) return res.status(404).json({ error: 'Usuario no encontrado o eliminado' });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener todos los usuarios activos (no eliminados).
 *
 * @async
 * @function getUsers
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para manejar errores.
 * @returns {Array<Object>} Lista de usuarios activos con sus direcciones.
 */
export async function getUsers(req, res, next) {
  try {
    const users = await User.find({ isDeleted: false })
      .populate('direccion')
      .select('-passwordHash');
    res.json(users);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener un usuario por su ID (solo si está activo).
 *
 * @async
 * @function getUserById
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {string} req.params.id - ID del usuario.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para manejar errores.
 * @returns {Object} JSON con el usuario encontrado o error si está eliminado.
 */
export async function getUserById(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id, isDeleted: false })
      .populate('direccion')
      .select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado o eliminado' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

/**
 * Eliminar un usuario mediante soft delete.
 *
 * @async
 * @function deleteUser
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {string} req.params.id - ID del usuario a eliminar.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para manejar errores.
 * @returns {Object} JSON con confirmación de eliminación y usuario marcado como eliminado.
 */
export async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    ).select('-passwordHash');

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ success: true, message: 'Usuario marcado como eliminado', user });
  } catch (err) {
    next(err);
  }
}





























































































































































