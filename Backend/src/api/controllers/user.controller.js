import { User, Address } from '../models/user.model.js';
import regex from '../../utils/regex.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Crear usuario con validaciones
export async function createUser(req, res, next) {
  try {
    const { cedula, email, password, nombre, apellido, telefono, sede, ciudad, urbanizacion, calle, apartamento } = req.body;

    // 🔹 Validaciones básicas
    if (!regex.ci.test(cedula)) return res.status(400).json({ error: 'Cédula inválida (7-8 dígitos numéricos)' });
    if (!regex.email.test(email)) return res.status(400).json({ error: 'Correo electrónico inválido' });
    if (!regex.password.test(password)) return res.status(400).json({ error: 'Contraseña inválida (mínimo 8 caracteres, letras y números)' });
    if (telefono && !regex.phone.test(telefono)) return res.status(400).json({ error: 'Teléfono inválido (10 dígitos)' });
    if (!regex.text.test(nombre) || !regex.text.test(apellido)) return res.status(400).json({ error: 'Nombre/Apellido inválido' });

    // 🔹 Validaciones de dirección
    if (!sede || !ciudad || !urbanizacion || !calle) {
      return res.status(400).json({ error: 'Debe especificar sede, ciudad, urbanización y calle' });
    }
    if (!regex.text.test(ciudad)) return res.status(400).json({ error: 'Ciudad inválida' });
    if (!regex.text.test(urbanizacion)) return res.status(400).json({ error: 'Urbanización inválida' });
    if (!regex.text.test(calle)) return res.status(400).json({ error: 'Calle inválida' });

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

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

// Login de usuario con validaciones
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!regex.email.test(email)) return res.status(400).json({ error: 'Correo inválido' });
    if (!regex.password.test(password)) return res.status(400).json({ error: 'Contraseña inválida' });

    const user = await User.findOne({ email }).populate('direccion');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Generar token JWT
    const token = jwt.sign(
      { sub: user._id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login exitoso', token, user });
  } catch (err) {
    next(err);
  }
}

// Actualizar usuario con validaciones
export async function updateUser(req, res, next) {
  try {
    const { nombre, apellido, telefono, sede, ciudad, urbanizacion, calle, apartamento } = req.body;

    if (nombre && !regex.text.test(nombre)) return res.status(400).json({ error: 'Nombre inválido' });
    if (apellido && !regex.text.test(apellido)) return res.status(400).json({ error: 'Apellido inválido' });
    if (telefono && !regex.phone.test(telefono)) return res.status(400).json({ error: 'Teléfono inválido' });

    let direccion;
    if (sede && ciudad && urbanizacion && calle) {
      direccion = await Address.findOne({ sede, ciudad, urbanizacion, calle, apartamento });
      if (!direccion) {
        direccion = await Address.create({ sede, ciudad, urbanizacion, calle, apartamento });
      }
      req.body.direccion = direccion._id;
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('direccion');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

// Obtener todos los usuarios
export async function getUsers(req, res, next) {
  try {
    const users = await User.find().populate('direccion');
    res.json(users);
  } catch (err) {
    next(err);
  }
}

// Obtener usuario por ID
export async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id).populate('direccion');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// Eliminar usuario
export async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
