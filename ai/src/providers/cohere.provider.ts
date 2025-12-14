// src/providers/cohere.provider.ts
/**
 * Cohere provider adapter (HTTP)
 * Roman Urdu: example call to Cohere generate endpoint
 */

import axios from "axios";
import { COHERE_API_KEY, COHERE_API_BASE, AI_REQUEST_TIMEOUT_MS } from "../config/env";
import logger from "../logger";
import { AIPayload, AIResponse } from "./index";
import { retry } from "../utils/retry";

async function callCohere(payload: AIPayload): Promise<AIResponse> {
  if (!COHERE_API_KEY) throw new Error("COHERE_API_KEY not set");

  const body = {
    model: payload.extra?.model || "command-xlarge-nightly",
    prompt: payload.prompt,
    max_tokens: payload.maxTokens || 512,
    temperature: payload.temperature ?? 0.2
  };

  const fn = async () => {
    const res = await axios.post(`${COHERE_API_BASE}/v1/generate`, body, {
      headers: { Authorization: `Bearer ${COHERE_API_KEY}`, "Content-Type": "application/json" },
      timeout: AI_REQUEST_TIMEOUT_MS
    });
    const text = res.data?.generations?.[0]?.text ?? "";
    return { provider: "cohere", model: body.model, text: String(text), tokensUsed: null, meta: res.data };
  };

  try {
    return await retry(fn, 1, 300);
  } catch (e: any) {
    logger.error("Cohere provider error: " + (e.message || e.toString()));
    throw e;
  }
}

export default { call: callCohere };
