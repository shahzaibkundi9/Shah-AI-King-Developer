// src/app.ts
import express from "express";
import bodyParser from "body-parser";
import logger from "./logger";

// Chunk-1 provider test router
import providersRouter from "./providers/router";

// Chunk-3 unified AI routes (generate, context mgmt)
import aiRouter from "./routes/ai.routes";

// Roman Urdu:
// - Yeh AI microservice ki main Express app file hai.
// - Providers debug routes + AI generate routes yahan mount hotay hain.
// - Backend iss service ko internally call karta hai.

const app = express();

// JSON body limit set
app.use(bodyParser.json({ limit: "1mb" }));

// Health check route
app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Provider debug/test endpoints (OpenAI, Cohere, Claude, Gemini, Groq)
app.use("/providers", providersRouter);

// Unified AI API (public gateway for backend microservice)
app.use("/api", aiRouter);

export default app;
