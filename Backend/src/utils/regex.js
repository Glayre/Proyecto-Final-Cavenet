const regex = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
  text: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{2,200}$/,   // nombres/apellidos
  phone: /^\+?[0-9]{11}$/,                // teléfonos de 11 dígitos
  ci: /^[0-9]{7,8}$/,                     // cédula
  address: /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s\.\-#]{2,200}$/ // direcciones
};

export default regex;
