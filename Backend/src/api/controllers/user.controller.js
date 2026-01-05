import { User, Address } from '../models/user.model.js';
import regex from '../../utils/regex.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();



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
    console.log(req.body);
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
      { expiresIn: process.env.JWT_EXPIRES || '1d' }
    );

    // 🔹 Ocultar passwordHash en la respuesta
    const userSafe = await User.findById(user._id)
      .populate('direccion');

    const userinfo = {
      _id: userSafe._id,
      cedula: userSafe.cedula,
      email: userSafe.email,
      nombre: userSafe.nombre,
      apellido: userSafe.apellido,
      telefono: userSafe.telefono,
      rol: userSafe.rol,
      direccion: {
        sede: userSafe.direccion.sede,
        ciudad: userSafe.direccion.ciudad,
        urbanizacion: userSafe.direccion.urbanizacion,
        calle: userSafe.direccion.calle,
      },
    };

    res.json({ message: 'Login exitoso', token, user: userinfo });
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

    const user_id = req.user.id;
    const search_id = req.params.id;

    // Permitir acceso solo si el usuario es admin o está accediendo a su propio perfil
    if (req.user.rol !== 'admin' && user_id !== search_id) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Acceso denegado' });
    }
    

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
    const user_id = req.user.id;
    const search_id = req.params.id;

    // Permitir acceso solo si el usuario es admin o está accediendo a su propio perfil
    if (req.user.rol !== 'admin' && user_id !== search_id) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Acceso denegado' });
    }

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





/**
 * Recuperar contraseña de usuario.
 *
 * Genera un token temporal y envía un correo con enlace de recuperación.
 *
 * @async
 * @function recoverPassword
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.body - Datos de recuperación.
 * @param {string} req.body.email - Correo electrónico del usuario.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para manejar errores.
 * @returns {Object} JSON con confirmación de envío de correo o error.
 */
export async function recoverPassword(req, res, next) {
  try {
    const { email } = req.body;

    // Validar correo
    if (!email || !regex.email.test(email)) {
      return res.status(400).json({ error: 'Correo electrónico inválido' });
    }

    // Buscar usuario activo
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
        console.log(`Solicitud de recuperación recibida para correo inexistente: ${email}`); 
        return res.json({ message: 'Si el correo existe, se enviará un enlace de recuperación' }); }


    // Generar token temporal (15 minutos)
    const recoveryToken = jwt.sign(
      { sub: user._id, type: 'password_recovery' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${recoveryToken}`;

    // Logs en servidor

     console.log("📩 Solicitud de recuperación de contraseña");
     console.log("Usuario:", user.email); 
     console.log("Token generado:", recoveryToken); 
     console.log("🔗 Enlace de recuperación:", resetLink); 
     
     // 🔹 Enviar también al frontend 
     return res.json({ 
      message: 'Si el correo existe, se enviará un enlace de recuperación', 
      email: user.email, 
      token: recoveryToken, 
      resetLink 
    }); 
  } catch (err) { 
    next(err); } }

/**
 * Restablecer contraseña con token de recuperación.
 *
 * @async
 * @function resetPassword
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.body - Datos de restablecimiento.
 * @param {string} req.body.token - Token JWT de recuperación.
 * @param {string} req.body.newPassword - Nueva contraseña en texto plano.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para manejar errores.
 * @returns {Object} JSON con confirmación de restablecimiento o error.
 */
export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    if (!token) return res.status(400).json({ error: 'Token requerido' });
    if (!regex.password.test(newPassword)) {
      return res.status(400).json({ error: 'Contraseña inválida (mínimo 8 caracteres, letras y números)' });
    }

    // Verificar token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // Validar que sea un token de recuperación
    if (payload.type !== 'password_recovery') {
      return res.status(400).json({ error: 'Token no válido para recuperación' });
    }

    // Actualizar contraseña
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const user = await User.findByIdAndUpdate(
      payload.sub,
      { passwordHash },
      { new: true }
    ).select('_id email');

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    return res.json({ message: 'Contraseña restablecida correctamente' });
  } catch (err) {
    next(err);
  }
};


/**
 * Reportar pago de usuario.
 *
 * @async
 * @function reportarPago
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.body - Datos del reporte de pago.
 * @param {string} req.body.nombre - Nombre completo del usuario.
 * @param {string} req.body.email - Correo electrónico del usuario.
 * @param {string} req.body.referencia - Referencia bancaria del pago.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para manejar errores.
 * @returns {Object} JSON con confirmación del reporte.
 */
export async function reportarPago(req, res, next) {
  try {
    const { nombre, email, referencia } = req.body;

    // Validaciones básicas
    if (!nombre || !regex.text.test(nombre)) {
      return res.status(400).json({ error: "Nombre inválido" });
    }
    if (!email || !regex.email.test(email)) {
      return res.status(400).json({ error: "Correo electrónico inválido" });
    }
    if (!referencia || referencia.length < 6) {
      return res.status(400).json({ error: "Referencia bancaria inválida" });
    }

    // 🔹 Aquí podrías guardar el reporte en la base de datos si lo deseas
    console.log("📩 Reporte de pago recibido:", { nombre, email, referencia });

    // 🔹 Respuesta al frontend
    return res.json({
      message: "Reporte de pago recibido correctamente",
      nombre,
      email,
      referencia,
    });
  } catch (err) {
    next(err);
  }
}




















































































































































