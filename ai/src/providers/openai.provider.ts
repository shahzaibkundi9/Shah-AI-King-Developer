// src/providers/openai.provider.ts
/**
 * OpenAI provider adapter (HTTP)
 * Roman Urdu: simple wrapper jo OpenAI chat completions ko call kare ga.
 * - Uses axios POST to /v1/chat/completions
 * - Configurable model via env
 */

import axios from "axios";
import { OPENAI_API_KEY, OPENAI_API_BASE, OPENAI_MODEL, AI_REQUEST_TIMEOUT_MS } from "../config/env";
import logger from "../logger";
import { AIPayload, AIResponse } from "./index";
import { retry } from "../utils/retry";

async function callOpenAI(payload: AIPayload): Promise<AIResponse> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
  const body = {
    model: payload?.extra?.model || OPENAI_MODEL,
    messages: [
      { role: "system", content: payload.extra?.system || "You are a helpful assistant." },
      { role: "user", content: payload.prompt }
    ],
    max_tokens: payload.maxTokens || 512,
    temperature: payload.temperature ?? 0.2
  };

  const fn = async () => {
    const res = await axios.post(`${OPENAI_API_BASE}/v1/chat/completions`, body, {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      timeout: AI_REQUEST_TIMEOUT_MS
    });
    const msg = res.data.choices?.[0]?.message?.content ?? "";
    const tokens = res.data.usage?.total_tokens ?? null;
    return { provider: "openai", model: body.model, text: String(msg), tokensUsed: tokens, meta: res.data };
  };

  try {
    return await retry(fn, 1, 300);
  } catch (e: any) {
    logger.error("OpenAI provider error: " + (e.message || e.toString()));
    throw e;
  }
}

export default { call: callOpenAI };
