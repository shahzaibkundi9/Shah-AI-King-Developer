// backend/src/modules/whatsapp/whatsapp.routes.ts
import { Router } from "express";
import * as ctrl from "./whatsapp.controller";

// Roman Urdu:
// - Yeh route WhatsApp microservice se incoming messages receive karta hai.
// - No auth required because WhatsApp microservice uses secret header.

const router = Router();

router.post("/incoming", ctrl.receiveIncomingMessage);

export default router;
