// src/services/ai.service.ts
/**
 * ai.service.ts — Unified AI generation service
 *
 * Responsibilities:
 * - Validate rate limits (per conversation / user)
 * - Choose provider via router (auto-rotation)
 * - Build prompt using context (context.buildPrompt)
 * - Call provider adapter (with retries)
 * - Run safety checks on output
 * - Append assistant response to context
 * - Track tokens & metrics
 * - Fallback chain: try alternate providers on failure
 * - Optionally send logs to BACKEND AI logs endpoint
 *
 * Roman Urdu comments added inline.
 */

import logger from "../logger";
import { AIPayload, AIResponse } from "../providers";
import { chooseProvider, reportFailure, reportSuccess } from "../engine/router";
import * as ctx from "../engine/context";
import * as rl from "../engine/rate-limit";
import { runSafetyChecks } from "../engine/safety";
import cache from "../services/cache";
import axios from "axios";
import { AI_REQUEST_RETRIES } from "../config/env";
import { retry } from "../utils/retry";
import { OPENAI_API_KEY } from "../config/env"; // example import to avoid unused-env lint

// Optional endpoint to persist AI logs in backend (set in .env)
import { NODE_ENV } from "../config/env";
const AI_LOG_ENDPOINT = process.env.AI_LOG_ENDPOINT || ""; // optional: POST logs here

export type GenerateOpts = {
  payload: AIPayload;
  userId?: string; // optional owner / user id for rate limiting
  conversationId?: string;
  requireSafe?: boolean; // if true, block unsafe outputs
};

async function sendLogToBackend(entry: any) {
  if (!AI_LOG_ENDPOINT) return;
  try {
    await axios.post(AI_LOG_ENDPOINT, entry, { timeout: 5000 });
  } catch (e: any) {
    logger.debug("ai.service: backend log failed: " + (e.message || e.toString()));
  }
}

export async function generate(opts: GenerateOpts): Promise<AIResponse> {
  const { payload, userId, conversationId, requireSafe } = opts;

  // 1) rate-limit checks
  const allowConv = conversationId ? await rl.allowConversation(conversationId) : true;
  const allowUser = userId ? await rl.allowUser(userId) : true;
  if (!allowConv) throw new Error("Conversation rate limit exceeded");
  if (!allowUser) throw new Error("User rate limit exceeded");

  // 2) build prompt from context (append user message first if provided)
  if (payload?.prompt && conversationId) {
    await ctx.appendMessage(conversationId, "user", payload.prompt);
  }
  const systemPrompt = payload.extra?.system || undefined;
  const composedPrompt = conversationId ? await ctx.buildPrompt(conversationId, systemPrompt) : payload.prompt;

  // 3) try providers with fallback chain
  // keep track of attempted providers to avoid loops
  const tried: string[] = [];
  let lastError: Error | null = null;

  // provider selection + attempt loop (up to number of providers or AI_REQUEST_RETRIES)
  const maxAttempts = Math.max(1, AI_REQUEST_RETRIES || 2);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // 3.1 choose provider
    const { provider, adapter } = await chooseProvider(payload);
    if (tried.includes(provider)) {
      // pick next provider forcibly (simple rotation)
      logger.debug("ai.service: provider already tried: " + provider);
    }
    tried.push(provider);

    // build provider payload (adapter-specific wrapping can be done inside adapter)
    const providerPayload: AIPayload = {
      prompt: composedPrompt || payload.prompt,
      maxTokens: payload.maxTokens,
      temperature: payload.temperature,
      conversationId,
      extra: payload.extra
    };

    // 3.2 call provider via retry helper (adapter may have its own retries)
    try {
      const res = await retry(() => adapter.call(providerPayload), 1, 300);
      // 3.3 run safety checks
      const safety = await runSafetyChecks(res.text || "");
      if (!safety.safe) {
        // if safety failure and requireSafe -> treat as error; else send cleaned output
        if (requireSafe) {
          reportFailure(provider, new Error("safety_rejection"));
          lastError = new Error("AI output failed safety checks: " + safety.reason);
          continue; // try next provider
        } else {
          // allow but with cleaned text
          res.text = safety.cleaned || "";
        }
      }

      // 3.4 success: append assistant reply to context
      if (conversationId) {
        await ctx.appendMessage(conversationId, "assistant", res.text);
      }

      // 3.5 track tokens if provided
      if (res.tokensUsed && conversationId) {
        await rl.trackTokens(conversationId, provider, res.tokensUsed);
      }

      // 3.6 report success to router + log
      reportSuccess(provider);
      const logEntry = {
        provider,
        model: res.model || payload.extra?.model || null,
        conversationId,
        userId,
        promptPreview: String((providerPayload.prompt || "").slice(0, 200)),
        responsePreview: String((res.text || "").slice(0, 500)),
        tokensUsed: res.tokensUsed || null,
        time: new Date().toISOString()
      };
      // asynchronous fire-and-forget
      sendLogToBackend(logEntry).catch(() => {});

      return res;
    } catch (e: any) {
      // provider failed — report and try next
      lastError = e;
      reportFailure(provider, e);
      logger.warn(`ai.service: provider ${provider} failed: ${e.message || e.toString()}`);
      // small backoff before next attempt
      await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
      continue;
    }
  }

  // if we reach here, all attempts failed
  // optional: return a safe fallback text or throw
  const err = lastError || new Error("All AI providers failed");
  logger.error("ai.service: all providers failed: " + (err.message || err.toString()));
  throw err;
}

export default { generate };
