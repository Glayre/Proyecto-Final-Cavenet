import User, { Address } from '../models/user.model.js'; // Ajusta la ruta si tu archivo tiene otro nombre o ubicación
import regex from '../../utils/regex.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Payment from '../models/payment.model.js';
import Invoice from '../models/invoice.model.js';
import Plan from '../models/plan.model.js';

import obtenerTasaDolar from '../../utils/tasaDolar.js';


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
    res.status(500).json({ error: err.message });
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

    res.json({ message: 'Login exitoso', token, id: userSafe._id});
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
    const { nombre, apellido, telefono, sede, ciudad, urbanizacion, calle, apartamento, saldoFavorUSD } = req.body;
    console.log("➡️ Actualización de usuario recibida:", req.body);
    const user_id = req.user._id;
    const search_id = req.params.id;

    console.log(user_id, search_id);
    
    // Permitir acceso solo si el usuario es admin o está accediendo a su propio perfil
    if (req.user.rol !== 'admin' && user_id !== search_id) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Acceso denegado' });
    }
    
    if(req.user.rol != 'admin'){
      if (nombre && !regex.text.test(nombre)) return res.status(400).json({ error: 'Nombre inválido' });
      if (apellido && !regex.text.test(apellido)) return res.status(400).json({ error: 'Apellido inválido' });
      if (telefono && !regex.phone.test(telefono)) return res.status(400).json({ error: 'Teléfono inválido' });
      
      if (saldoFavorUSD !== undefined) {
        if (typeof saldoFavorUSD !== 'number') {
          return res.status(400).json({ error: 'Saldo a favor USD inválido' });
        }
      }
    }
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
    const user_id = req.params.id ?? req.user._id;
    const search_id = req.params.id;

    // Permitir acceso solo si el usuario es admin o está accediendo a su propio perfil
    if (req.user.rol !== 'admin' && user_id !== search_id) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Acceso denegado' });
    }
    
    const userSafe = await User.findOne({ _id: req.params.id, isDeleted: false })
      .populate('direccion')
      .select('-passwordHash');
    const plan = await Plan.findById(userSafe.planId);
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
      saldoFavorUSD: userSafe.saldoFavorUSD,
      plan: plan ? {
        _id: plan._id,
        nombre: plan.nombre,
        velocidadMbps: plan.velocidadMbps,
        precioUSD: plan.precioUSD,
        tipo: plan.tipo,
        activo: plan.activo
      } : null
    };

    if (!userSafe) return res.status(404).json({ error: 'Usuario no encontrado o eliminado' });
    res.json(userinfo);
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
 * Genera un token temporal y envía un correo con enlace de recuperación.
 * * @async
 * @function recoverPassword
 * @returns {Object} JSON con status 200 (éxito), 404 (no encontrado) o 500 (error servidor).
 */
export async function recoverPassword(req, res, next) {
  try {
    const { email } = req.body;

    // 1. Validaciones básicas de entrada
    if (!email || !regex.email.test(email)) {
      return res.status(400).json({ error: 'Correo electrónico inválido' });
    }

    // 2. Buscar usuario en la base de datos (Solo activos)
    const user = await User.findOne({ email, isDeleted: false });

    // ❌ Si NO existe en base de datos -> Retornar 404 para el frontend
    if (!user) {
      console.log(`❌ Intento de recuperación: correo no registrado -> ${email}`);
      return res.status(404).json({ error: 'Correo no encontrado o asociado' });
    }

    // 3. Si EXISTE -> Generar el token de recuperación (JWT)
    const recoveryToken = jwt.sign(
      { sub: user._id, type: 'password_recovery' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // Expira en 15 minutos
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${recoveryToken}`;

    // 4. Intentar enviar el correo físico
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Soporte Técnico" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Recuperación de Contraseña',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #2041E3; border-radius: 10px; max-width: 500px;">
            <h2 style="color: #2041E3; text-align: center;">Restablecer Contraseña</h2>
            <p>Hola <strong>${user.nombre}</strong>,</p>
            <p>Has solicitado recuperar tu acceso a la plataforma de Internet Fibra Óptica.</p>
            <p>Haz clic en el botón de abajo para cambiar tu contraseña. Este enlace es válido por 15 minutos:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${resetLink}" style="background:#2041E3; color:white; padding:12px 25px; text-decoration:none; border-radius:5px; font-weight: bold;">
                Restablecer Contraseña
              </a>
            </div>
            <p style="font-size: 12px; color: #777;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
          </div>
        `
      });
      console.log(`✅ Correo enviado exitosamente a: ${user.email}`);
    } catch (mailError) {
      // 🚩 AJUSTE: Si falla el envío físico, no enviamos 500. 
      // Imprimimos el error para depurar y permitimos que el flujo continúe.
      console.error("⚠️ Error Nodemailer (Revisa credenciales en .env):", mailError.message);
      console.log("🔗 Link generado para pruebas manuales:", resetLink);
    }

    // ✅ ÉXITO -> Retornar 200
    // Enviamos el resetLink en el JSON para que puedas probarlo aunque el correo falle.
    return res.status(200).json({ 
      message: 'Se ha enviado un enlace con un código de recuperación a tu correo.',
      resetLink 
    });

  } catch (err) {
    // 💥 ERROR CRÍTICO -> Retornar 500
    console.error("🔥 Error 500 en recoverPassword:", err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Restablecer contraseña con token de recuperación.
 * * @async
 * @function resetPassword
 * @param {string} req.body.token - Token JWT recibido por correo.
 * @param {string} req.body.newPassword - La nueva clave del usuario.
 */
export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    // Validaciones
    if (!token) return res.status(400).json({ error: 'Token requerido' });
    if (!regex.password.test(newPassword)) {
      return res.status(400).json({ error: 'Contraseña inválida (mínimo 8 caracteres, letras y números)' });
    }

    // Verificar validez del token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'El enlace ha expirado o es inválido' });
    }

    // Validar tipo de token
    if (payload.type !== 'password_recovery') {
      return res.status(400).json({ error: 'Acción no permitida' });
    }

    // Encriptar la nueva contraseña
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Actualizar en la base de datos
    const user = await User.findByIdAndUpdate(
      payload.sub,
      { passwordHash },
      { new: true }
    ).select('_id email');

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    console.log(`🔐 Contraseña actualizada para: ${user.email}`);
    return res.status(200).json({ message: 'Contraseña restablecida correctamente' });

  } catch (err) {
    console.error("🔥 Error en resetPassword:", err);
    next(err);
  }
}

/**
 * Reportar pago de usuario.
 *
 * @async
 * @function reportarPago
 * @returns {Object} JSON con confirmación del reporte y factura actualizada.
 */
export async function reportarPago(req, res, next) {
  try {
    const { clienteId, invoiceId, bancoOrigen, cuentaDestino, referencia, monto } = req.body;
    console.log("➡️ Reporte de pago recibido:", req.body);

    // 🔹 Validaciones básica
    
    if (!clienteId || !invoiceId || !bancoOrigen || !cuentaDestino || !referencia || !monto) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (monto <= 0) {
      return res.status(400).json({ error: 'Monto debe ser mayor que 0' });
    }

    const tasaVED = await obtenerTasaDolar();

    const montoMoneda = 'VED';



    const pago = await Payment.create({
      clienteId,
      invoiceId,
      montoMoneda,
      monto,
      tasaVED: montoMoneda === 'VED' ? tasaVED : undefined,
      bancoOrigen,
      cuentaDestino,
      referencia
    });

    const user = await User.findById(clienteId);

    if (!user) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

   // Actualizar monto abonado y pendiente de la persona

    user.saldoFavorUSD += monto/(tasaVED);

    await user.save();

    // Actualizar factura asociada
    const factura = await Invoice.findById(invoiceId);
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    


    let montoAbonado = monto / tasaVED;

    factura.montoAbonado += montoAbonado;

    if(factura.montoAbonado >= factura.monto) {
      factura.estado = 'pagado';
    }

    await factura.save();
    console.log("✅ Pago reportado y factura actualizada:", { pago, factura });

    res.json({ message: 'Pago reportado correctamente', pago, factura });

  } catch (err) {
    console.error("❌ Error en reportarPago:", err);
    next(err);
  }
}












































































































































