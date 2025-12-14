// src/providers/groq.provider.ts
/**
 * Groq provider adapter — placeholder
 * Replace base URL and body shape with actual Groq API details if using Groq.
 */

import axios from "axios";
import { GROQ_API_KEY, GROQ_API_BASE, AI_REQUEST_TIMEOUT_MS } from "../config/env";
import logger from "../logger";
import { AIPayload, AIResponse } from "./index";
import { retry } from "../utils/retry";

async function callGroq(payload: AIPayload): Promise<AIResponse> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not set");

  const body = {
    model: payload.extra?.model || "groq-model-1",
    input: payload.prompt,
    max_output_tokens: payload.maxTokens || 512
  };

  const fn = async () => {
    const res = await axios.post(`${GROQ_API_BASE}/v1/generate`, body, {
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      timeout: AI_REQUEST_TIMEOUT_MS
    });
    const text = res.data?.outputs?.[0]?.text ?? res.data?.output ?? "";
    return { provider: "groq", model: body.model, text: String(text), tokensUsed: null, meta: res.data };
  };

  try {
    return await retry(fn, 1, 300);
  } catch (e: any) {
    logger.error("Groq provider error: " + (e.message || e.toString()));
    throw e;
  }
}

export default { call: callGroq };
