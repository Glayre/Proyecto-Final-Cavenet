import express from "express";
import { enviarMensajeContacto, listarMensajesContacto } from "../controllers/contacto.controller.js";

const router = express.Router();

// Ruta pública: Cualquiera puede enviar un mensaje
router.post("/", enviarMensajeContacto);

// Ruta privada: Solo el admin puede ver los mensajes (puedes añadir tus middlewares aquí)
router.get("/", listarMensajesContacto);

export default router;