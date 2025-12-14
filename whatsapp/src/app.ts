import express from "express";
import apiRoutes from "./routes/api.routes";
import { PORT } from "./config/env";
import logger from "./logger";
import http from "http";
import { initSockets } from "./sockets";

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRoutes);

// health root
app.get("/", (_req, res) => res.send("WhatsApp microservice OK"));

export default app;
