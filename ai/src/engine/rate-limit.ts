// ai/src/engine/rate-limit.ts
/**
 * AI Rate-limiter & Token accounting
 *
 * Responsibilities:
 * - Prevent abusive prompt flooding per conversation and per-user
 * - Optionally track token usage per provider (if provider returns tokens)
 * - Use cache (Redis) for counters, fallback to in-memory
 *
 * Policy used:
 * - per-conversation: max X requests per minute (configurable)
 * - per-user (if provided): max Y requests per minute
 *
 * Roman Urdu:
 * - Yeh basic protection hai. Advanced quota billing later add karo.
 */

import cache from "../services/cache";
import logger from "../logger";

const CONV_PREFIX = "ai:rl:conv:";
const USER_PREFIX = "ai:rl:user:";

const CONV_RATE_PER_MIN = 30; // default: 30 requests per minute per conversation
const USER_RATE_PER_MIN = 60; // per user

async function incrWithTTL(key: string, windowSec = 60) {
  // naive incr via cache.incr + expire
  const val = await cache.incr(key);
  // try to set TTL if first time
  const ttl = await cache.ttl(key);
  if (ttl === -1 || ttl === null) {
    // set a ttl by re-setting key value (works for mem fallback)
    await cache.set(key, String(val), windowSec);
  }
  return Number(val);
}

export async function allowConversation(conversationId: string) {
  try {
    const key = `${CONV_PREFIX}${conversationId}`;
    const v = await incrWithTTL(key, 60);
    if (v > CONV_RATE_PER_MIN) {
      logger.warn(`ai.rate-limit: conversation ${conversationId} rate-limited (${v})`);
      return false;
    }
    return true;
  } catch (e) {
    logger.error("ai.rate-limit conv error: " + (e as any).message);
    return true; // fail open
  }
}

export async function allowUser(userId?: string) {
  try {
    if (!userId) return true;
    const key = `${USER_PREFIX}${userId}`;
    const v = await incrWithTTL(key, 60);
    if (v > USER_RATE_PER_MIN) {
      logger.warn(`ai.rate-limit: user ${userId} rate-limited (${v})`);
      return false;
    }
    return true;
  } catch (e) {
    logger.error("ai.rate-limit user error: " + (e as any).message);
    return true;
  }
}

/**
 * trackTokens
 * - Optional: provider returns tokensUsed, call this to store aggregated counters per conversation/provider
 */
export async function trackTokens(conversationId: string, provider: string, tokens: number) {
  try {
    const key = `ai:tokens:${conversationId}:${provider}`;
    const v = await cache.incr(key);
    // set short TTL if first time
    const ttl = await cache.ttl(key);
    if (ttl === -1 || ttl === null) {
      await cache.set(key, String(v), 60 * 60 * 24);
    }
  } catch (e) {
    // not critical
    logger.debug("ai.trackTokens error: " + (e as any).message);
  }
}
