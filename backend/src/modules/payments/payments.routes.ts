import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import * as ctrl from "./payments.controller";

const router = Router();
router.post("/create", authMiddleware, ctrl.createPayment);
router.post("/webhook/:provider", ctrl.webhook);
router.get("/qr/:paymentId", authMiddleware, ctrl.getPaymentQR);

export default router;
