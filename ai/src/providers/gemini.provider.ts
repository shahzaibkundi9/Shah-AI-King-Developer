// src/providers/gemini.provider.ts
/**
 * Gemini provider adapter — placeholder for Google Gemini (REST or SDK).
 * You may need to use Google APIs client lib; here we show a generic HTTP example.
 */

import axios from "axios";
import { GEMINI_API_KEY, GEMINI_API_BASE, AI_REQUEST_TIMEOUT_MS } from "../config/env";
import logger from "../logger";
import { AIPayload, AIResponse } from "./index";
import { retry } from "../utils/retry";

async function callGemini(payload: AIPayload): Promise<AIResponse> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

  const body = {
    model: payload.extra?.model || "gemini-1.1",
    prompt: payload.prompt,
    maxOutputTokens: payload.maxTokens || 512
  };

  const fn = async () => {
    const res = await axios.post(`${GEMINI_API_BASE}/v1/generateText`, body, {
      headers: { Authorization: `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" },
      timeout: AI_REQUEST_TIMEOUT_MS
    });
    const text = res.data?.candidates?.[0]?.output ?? res.data?.output ?? "";
    return { provider: "gemini", model: body.model, text: String(text), tokensUsed: null, meta: res.data };
  };

  try {
    return await retry(fn, 1, 300);
  } catch (e: any) {
    logger.error("Gemini provider error: " + (e.message || e.toString()));
    throw e;
  }
}

export default { call: callGemini };
