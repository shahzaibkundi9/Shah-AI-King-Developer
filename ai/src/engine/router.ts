// ai/src/engine/router.ts
/**
 * Provider Router / Selector
 *
 * Responsibilities:
 * - Accept an AIPayload and choose the best provider based on:
 *   * explicit providerHint
 *   * round-robin rotation
 *   * provider health (simple blacklisting if failures)
 *   * per-provider weight config (env or defaults)
 * - Return provider adapter and metadata
 *
 * Roman Urdu comments explain kar rahe:
 * - Yeh module lightweight but robust selection logic deta hai.
 * - Complex policies (cost, tokens, latency) later add kiye ja sakte hain.
 */

import logger from "../logger";
import { AIPayload } from "../providers";
import OpenAI from "../providers/openai.provider";
import Cohere from "../providers/cohere.provider";
import Claude from "../providers/claude.provider";
import Gemini from "../providers/gemini.provider";
import Groq from "../providers/groq.provider";
import cache from "../services/cache";

// internal provider registry type
type ProviderEntry = {
  key: string;
  adapter: { call: (p: AIPayload) => Promise<any> };
  weight: number;
  failureCount: number;
  lastFailureAt?: number | null;
};

const PROVIDERS: ProviderEntry[] = [
  { key: "openai", adapter: OpenAI, weight: 40, failureCount: 0, lastFailureAt: null },
  { key: "cohere", adapter: Cohere, weight: 15, failureCount: 0, lastFailureAt: null },
  { key: "claude", adapter: Claude, weight: 20, failureCount: 0, lastFailureAt: null },
  { key: "gemini", adapter: Gemini, weight: 15, failureCount: 0, lastFailureAt: null },
  { key: "groq", adapter: Groq, weight: 10, failureCount: 0, lastFailureAt: null }
];

// simple round-robin pointer persisted in cache to be shared across instances
const ROTATION_KEY = "ai:provider:rotation_index";

async function getRotationIndex(): Promise<number> {
  const raw = await cache.get(ROTATION_KEY);
  const idx = raw ? Number(raw) : 0;
  return isNaN(idx) ? 0 : idx;
}
async function setRotationIndex(idx: number) {
  await cache.set(ROTATION_KEY, String(idx), 60 * 60); // 1h TTL
}

/**
 * chooseProvider
 * - If payload.providerHint provided, try that provider first (if healthy)
 * - Otherwise use weighted round-robin skipping blacklisted providers
 */
export async function chooseProvider(payload: AIPayload) {
  // helper: is provider healthy?
  const healthy = (p: ProviderEntry) => {
    // blacklist if too many recent failures (>=3 in 10 minutes)
    if (p.failureCount >= 3) {
      const now = Date.now();
      if (p.lastFailureAt && now - (p.lastFailureAt || 0) < 10 * 60 * 1000) {
        return false;
      }
      // reset older failure
      p.failureCount = 0;
      p.lastFailureAt = null;
    }
    return true;
  };

  // 1) provider hint
  if (payload.providerHint) {
    const found = PROVIDERS.find((p) => p.key === payload.providerHint);
    if (found && healthy(found)) {
      logger.info(`ai.router: using hinted provider ${found.key}`);
      return { provider: found.key, adapter: found.adapter };
    }
  }

  // 2) weighted round-robin via rotation index
  const idx = await getRotationIndex();
  // build weighted list (small array)
  const weighted: ProviderEntry[] = [];
  for (const p of PROVIDERS) {
    if (!healthy(p)) continue;
    const w = Math.max(1, Math.floor(p.weight));
    for (let i = 0; i < w; i++) weighted.push(p);
  }
  if (weighted.length === 0) {
    // fallback: pick any provider even if unhealthy (last resort)
    const any = PROVIDERS[0];
    logger.warn("ai.router: no healthy providers, falling back to first");
    return { provider: any.key, adapter: any.adapter };
  }
  const pick = weighted[(idx || 0) % weighted.length];
  // update rotation index
  await setRotationIndex(((idx || 0) + 1) % weighted.length);
  logger.info(`ai.router: selected provider ${pick.key}`);
  return { provider: pick.key, adapter: pick.adapter };
}

/**
 * reportFailure
 * - Called by ai.service when provider call fails
 * - Increments failureCount and sets lastFailureAt
 */
export function reportFailure(providerKey: string, err: Error) {
  const p = PROVIDERS.find((x) => x.key === providerKey);
  if (!p) return;
  p.failureCount = (p.failureCount || 0) + 1;
  p.lastFailureAt = Date.now();
  logger.error(`ai.router: provider ${providerKey} failure reported: ${err.message}`);
}

/**
 * reportSuccess
 * - Reset failure counters on success
 */
export function reportSuccess(providerKey: string) {
  const p = PROVIDERS.find((x) => x.key === providerKey);
  if (!p) return;
  p.failureCount = 0;
  p.lastFailureAt = null;
}
