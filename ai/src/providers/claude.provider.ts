// src/providers/claude.provider.ts
/**
 * Claude provider adapter (Anthropic style) — placeholder
 * Roman Urdu: Anthropic Claude requires special headers and endpoints.
 * Replace with real endpoints/SDK as needed.
 */

import axios from "axios";
import { CLAUDE_API_KEY, CLAUDE_API_BASE, AI_REQUEST_TIMEOUT_MS } from "../config/env";
import logger from "../logger";
import { AIPayload, AIResponse } from "./index";
import { retry } from "../utils/retry";

async function callClaude(payload: AIPayload): Promise<AIResponse> {
  if (!CLAUDE_API_KEY) throw new Error("CLAUDE_API_KEY not set");

  const body = {
    model: payload.extra?.model || "claude-2.1",
    prompt: payload.prompt,
    max_tokens_to_sample: payload.maxTokens || 512
  };

  const fn = async () => {
    const res = await axios.post(`${CLAUDE_API_BASE}/v1/complete`, body, {
      headers: { Authorization: `Bearer ${CLAUDE_API_KEY}`, "Content-Type": "application/json" },
      timeout: AI_REQUEST_TIMEOUT_MS
    });
    const text = res.data?.completion ?? res.data?.output ?? "";
    return { provider: "claude", model: body.model, text: String(text), tokensUsed: null, meta: res.data };
  };

  try {
    return await retry(fn, 1, 300);
  } catch (e: any) {
    logger.error("Claude provider error: " + (e.message || e.toString()));
    throw e;
  }
}

export default { call: callClaude };
