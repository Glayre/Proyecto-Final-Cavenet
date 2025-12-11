// test-bcrypt.mjs
import bcrypt from "bcrypt";

// Copia aquí el hash que viste en MongoDB
const hash = "$2b$10$8wy/e0kOo8RogTImHCxSKO.d7ti0UyGkry3BoFMydWgZsdkrAQzIS";

async function test() {
  // Prueba con la clave que definiste en tu .env
  console.log("¿Coincide con Admin1234?:", await bcrypt.compare("Admin1234", hash));

  // Puedes probar otra clave si sospechas que se creó con otra
  console.log("¿Coincide con OtraClave?:", await bcrypt.compare("OtraClave", hash));
}

test();
