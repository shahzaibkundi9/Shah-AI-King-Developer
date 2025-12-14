import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import prisma from "../../db";
import aiGateway from "../../services/aiGateway.service";

const router = Router();

// admin: create prompt template
router.post("/templates", authMiddleware, async (req: any, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  const { name, description, prompt } = req.body;
  const tpl = await prisma.promptTemplate.create({ data: { name, description, prompt } });
  res.json({ data: tpl });
});

// list templates
router.get("/templates", authMiddleware, async (req: any, res) => {
  const t = await prisma.promptTemplate.findMany();
  res.json({ data: t });
});

// generate via ai microservice (proxy)
router.post("/generate", authMiddleware, async (req: any, res) => {
  const { prompt, provider, model, conversationId, extra } = req.body;
  // auto language detection: use 'franc'
  const franc = require("franc");
  const langCode = franc(prompt || "") || "und";
  // call ai microservice
  try {
    const data = await aiGateway.generate({ prompt, provider, model, conversationId, extra, langCode });
    res.json({ ok: true, ...data });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "AI error" });
  }
});

export default router;
