// app.ts — FINAL STABLE VERSION (NO CORS, NO RATE-LIMIT ERRORS)

import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./modules/auth/auth.routes";
import customerRoutes from "./modules/customer/customer.routes";
import convRoutes from "./modules/conversation/conversation.routes";
import paymentRoutes from "./modules/payments/payments.routes";
import aiRoutes from "./modules/ai/ai.routes";
import adminRoutes from "./modules/admin/admin.routes";
import exportRoutes from "./modules/export/export.routes";
import whatsappRoutes from "./modules/whatsapp/whatsapp.routes";

const app = express();

app.set("trust proxy", 1);

/**
 * 🔥 MANUAL CORS — THIS IS THE KEY
 */
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === "OPTIONS",
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/conversations", convRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/exports", exportRoutes);
app.use("/api/webhooks/whatsapp", whatsappRoutes);

export default app;
