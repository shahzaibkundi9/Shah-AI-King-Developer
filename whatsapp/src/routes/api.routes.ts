/**
 * api.routes.ts
 * REST endpoints for:
 * - create session
 * - list sessions
 * - get session status
 * - close session
 * - send text
 * - send media (multipart)
 * - health
 */

import express from "express";
import multer from "multer";
import { createSession, getSessions, getSession, closeSession, sendText as sendTextSession } from "../baileys/session.manager";
import * as msgService from "../services/message.service";
import { uploadLocalFileToCloudinary } from "../services/media.service";
import logger from "../logger";
import { emit } from "../sockets";

const router = express.Router();
const upload = multer({ dest: "./tmp/uploads" });

// health
router.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// create session
router.post("/session/create", async (req, res) => {
  try {
    const { name } = req.body;
    const s = await createSession(name);
    res.json({ ok: true, session: s });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// list sessions
router.get("/session/list", async (_req, res) => {
  const list = await getSessions();
  res.json({ data: list });
});

// get session
router.get("/session/:id", async (req, res) => {
  const s = await getSession(req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  res.json({ data: s });
});

// close session
router.post("/session/:id/close", async (req, res) => {
  const ok = await closeSession(req.params.id);
  res.json({ ok });
});

// send text (simple wrapper)
router.post("/send-text", async (req, res) => {
  try {
    const { sessionId, phone, text } = req.body;
    // high-level send with anti-ban/rate-limit
    const r = await msgService.sendText(sessionId, phone, text, {});
    res.json({ ok: true, res: r });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// send media (multipart)
router.post("/send-media", upload.single("file"), async (req, res) => {
  try {
    const { sessionId, phone } = req.body;
    if (!req.file) return res.status(400).json({ error: "file missing" });
    const filePath = req.file.path;
    // upload to cloudinary then fetch buffer (or stream)
    const up = await uploadLocalFileToCloudinary(filePath);
    // fetch remote file as buffer
    const axios = require("axios");
    const resp = await axios.get(up.url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(resp.data);
    const filename = req.file.originalname;
    const mimetype = req.file.mimetype;
    const r = await msgService.sendMedia(sessionId, phone, buffer, filename, mimetype, {});
    res.json({ ok: true, res: r, cloud: up.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
