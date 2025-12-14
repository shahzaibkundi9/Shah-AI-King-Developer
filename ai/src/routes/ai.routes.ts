// src/routes/ai.routes.ts
/**
 * ai.routes.ts — public endpoint used by backend gateway
 *
 * Endpoints:
 * - POST /generate           -> unified generate (protected by secret token ideally)
 * - POST /context/append     -> append message to conversation context
 * - POST /context/clear      -> clear conversation context
 * - GET  /health             -> health check
 *
 * Notes:
 * - For security: in production you should add mutual auth / API key (we assume internal network).
 * - We accept body: { prompt, maxTokens, temperature, providerHint, conversationId, userId, requireSafe }
 */

import { Router } from "express";
import aiService from "../services/ai.service";
import { authMiddlewareOptional } from "../utils/miniAuth"; // small internal helper below
import * as ctx from "../engine/context";
import logger from "../logger";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

router.post("/generate", authMiddlewareOptional, async (req: any, res) => {
  try {
    const { prompt, maxTokens, temperature, providerHint, conversationId, userId, requireSafe, extra } = req.body;
    const payload = { prompt, maxTokens, temperature, extra, providerHint };
    const out = await aiService.generate({ payload, userId, conversationId, requireSafe });
    res.json({ ok: true, ...out });
  } catch (e: any) {
    logger.error("ai.routes.generate error: " + (e.message || e.toString()));
    res.status(500).json({ error: e.message || "AI generation failed" });
  }
});

// context append (used by backend to append user/assistant messages)
router.post("/context/append", authMiddlewareOptional, async (req: any, res) => {
  try {
    const { conversationId, role, text } = req.body;
    if (!conversationId || !role || !text) return res.status(400).json({ error: "missing params" });
    const ctxObj = await ctx.appendMessage(conversationId, role, text);
    res.json({ ok: true, data: ctxObj });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/context/clear", authMiddlewareOptional, async (req: any, res) => {
  try {
    const { conversationId } = req.body;
    if (!conversationId) return res.status(400).json({ error: "missing conversationId" });
    await ctx.clearContext(conversationId);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

/**
 * miniAuth — small optional middleware
 * - If AI_SECRET env set, require header x-ai-secret
 * - This keeps internal endpoint somewhat protected
 */
import { AI_SECRET } from "../config/env";
export function authMiddlewareOptional(req: any, res: any, next: any) {
  if (!AI_SECRET) return next();
  const header = req.headers["x-ai-secret"] || req.query.ai_secret;
  if (!header || header !== AI_SECRET) return res.status(403).json({ error: "forbidden" });
  next();
}
