// src/providers/router.ts
import { Router } from "express";
import OpenAI from "./openai.provider";
import Cohere from "./cohere.provider";
import Claude from "./claude.provider";
import Gemini from "./gemini.provider";
import Groq from "./groq.provider";
import { AIPayload } from "./index";

const router = Router();

// simple provider test endpoints
router.post("/openai", async (req, res) => {
  const payload: AIPayload = req.body;
  try {
    const out = await OpenAI.call(payload);
    res.json(out);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "openai error" });
  }
});

router.post("/cohere", async (req, res) => {
  try {
    const out = await Cohere.call(req.body);
    res.json(out);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "cohere error" });
  }
});

router.post("/claude", async (req, res) => {
  try {
    const out = await Claude.call(req.body);
    res.json(out);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "claude error" });
  }
});

router.post("/gemini", async (req, res) => {
  try {
    const out = await Gemini.call(req.body);
    res.json(out);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "gemini error" });
  }
});

router.post("/groq", async (req, res) => {
  try {
    const out = await Groq.call(req.body);
    res.json(out);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "groq error" });
  }
});

export default router;
