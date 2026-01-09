import bcrypt from "bcrypt"; 
import User, { Address } from "../api/models/user.model.js"; // ✅ corregido: User es default, Address nombrado import "dotenv/config";
import "dotenv/config";

const createDefaultAdminUser = async () => {
  try {
    console.log("[INFO]: Creating default admin user...");
    // Ensure the admin role exists
    const adminRole = "admin";
    const cedula = process.env.ADMIN_CEDULA || "00000000";
    const email = process.env.ADMIN_EMAIL || "admin@example.com";
    const passwordHash = process.env.ADMIN_PASSWORD || "adminPassword.1";
    const nombre = process.env.ADMIN_NOMBRE || "Admin";
    const apellido = process.env.ADMIN_APELLIDO || "User";
    const telefono = process.env.ADMIN_TELEFONO || "00000000";
    const direccion = {
    sede: 'Caracas',
    ciudad: 'Caracas',
    urbanizacion: 'La Castellana',
    calle: 'Av. Principal',
    apartamento: 'Apto 12-B'
    };

    // Check if the admin user already exists
    const adminUser = await User.findOne({ email: email });
    console.log(adminUser);
    if (!adminUser) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(passwordHash, 10);

      const direccionPorDefecto = await Address.create(direccion);

    // 🔹 Crear usuario con referencia a dirección
    const newAdminUser = await User.create({
      cedula,
      email,
      passwordHash: hashedPassword,
      nombre,
      apellido,
      telefono,
      direccion: direccionPorDefecto._id,
      rol: adminRole
    });

      await newAdminUser.save();
      console.log("[DONE]: Default admin user created.");
    } else {
      console.log("[INFO]: Admin user already exists.");
    }
  } catch (error) {
    console.error("[ERROR]: Error creating default admin user:", error);
  }
};

export default createDefaultAdminUser;