import dotenv from 'dotenv';

export function loadEnv() {
  const result = dotenv.config();
  if (result.error) {
    console.warn('Cargando variables desde entorno del sistema...');
  }
}
