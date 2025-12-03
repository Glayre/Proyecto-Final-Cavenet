import { createServer } from 'http';
import app from './app.js';
import { loadEnv } from './config/env.js';

loadEnv();
const PORT = process.env.PORT || 4000;

const server = createServer(app);
server.listen(PORT, () => {
  console.log(`API corriendo en puerto ${PORT}`);
});