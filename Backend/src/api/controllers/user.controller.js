import User from '../models/user.model.js';
import regex from '../../utils/regex.js'; // importamos las expresiones regulares

// Crear usuario con validaciones
export async function createUser(req, res, next) {
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

// Si pasa las validaciones, crear usuario
    const user = await User.create({
      cedula,
      email,
      passwordHash: password, // aquí deberías aplicar bcrypt.hash()
      nombre,
      apellido,
      telefono
    });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

// Actualizar usuario con validaciones
export async function updateUser(req, res, next) {
  try {
    const { nombre, apellido, telefono } = req.body;

    if (nombre && !regex.text.test(nombre)) {
      return res.status(400).json({ error: 'Nombre inválido' });
    }

    if (apellido && !regex.text.test(apellido)) {
      return res.status(400).json({ error: 'Apellido inválido' });
    }

    if (telefono && !regex.phone.test(telefono)) {
      return res.status(400).json({ error: 'Teléfono inválido' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (err) {
    next(err);
  }
}







