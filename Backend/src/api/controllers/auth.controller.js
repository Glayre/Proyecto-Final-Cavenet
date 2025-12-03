import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import regex from '../../utils/regex.js';

// Registro de usuario con validaciones
export async function register(req, res, next) {
  try {
    const { cedula, email, password, nombre, apellido, telefono } = req.body;

    // Validaciones con regex
    if (!regex.ci.test(cedula)) {
      return res.status(400).json({ error: 'Cédula inválida (7-8 dígitos numéricos)' });
    }

    if (!regex.email.test(email)) {
      return res.status(400).json({ error: 'Correo electrónico inválido' });
    }

    if (!regex.password.test(password)) {
      return res.status(400).json({ error: 'Contraseña inválida (mínimo 8 caracteres, letras y números)' });
    }

    if (telefono && !regex.phone.test(telefono)) {
      return res.status(400).json({ error: 'Teléfono inválido (10 dígitos)' });
    }

    if (!regex.text.test(nombre) || !regex.text.test(apellido)) {
      return res.status(400).json({ error: 'Nombre/Apellido inválido (solo letras, entre 2 y 200 caracteres)' });
    }

// Verificar si ya existe el usuario
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

// Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      cedula,
      email,
      passwordHash,
      nombre,
      apellido,
      telefono
    });

    res.status(201).json({ message: 'Usuario registrado exitosamente', user });
  } catch (err) {
    next(err);
  }
}

// Login de usuario con validaciones
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validaciones con regex
    if (!regex.email.test(email)) {
      return res.status(400).json({ error: 'Correo inválido' });
    }

    if (!regex.password.test(password)) {
      return res.status(400).json({ error: 'Contraseña inválida' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

// Generar token JWT
    const token = jwt.sign(
      { sub: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login exitoso', token });
  } catch (err) {
    next(err);
  }
}
