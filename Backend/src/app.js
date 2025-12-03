import express from 'express';
import loadExpress from './loaders/express.js';
import routes from './api/routes/index.js';
import errorMiddleware from './api/middleware/error.middleware.js';
import './loaders/mongoose.js';

const app = express();
loadExpress(app); // middlewares globales
app.use('/api', routes);
app.use(errorMiddleware); // manejo centralizado de errores

export default app;
