/**
 * rateLimit.ts
 * - Simple Redis token bucket for per-session or global caps.
 * - Use ioredis if REDIS_URL provided, otherwise in-memory fallback.
 */

import Redis from "ioredis";
import { REDIS_URL, WA_MAX_MSG_PER_MIN } from "../config/env";
import logger from "../logger";

let redis: Redis | null = null;
if (REDIS_URL) {
  redis = new Redis(REDIS_URL);
  redis.on("error", (e) => logger.error("Redis error: " + e.message));
}

const localBuckets = new Map<string, { tokens: number; last: number }>();

export async function allowSend(key = "global") {
  const now = Math.floor(Date.now() / 1000);
  const capacity = WA_MAX_MSG_PER_MIN;
  if (redis) {
    const lua = `
      local k = KEYS[1]
      local cap = tonumber(ARGV[1])
      local now = tonumber(ARGV[2])
      local tok = tonumber(redis.call("get", k) or cap)
      if tok <= 0 then
        return 0
      else
        redis.call("decr", k)
        redis.call("expire", k, 60)
        return 1
      end
    `;
    try {
      const res = await redis.eval(lua, 1, `wa_rl:${key}`, capacity, now);
      return res === 1;
    } catch (e) {
      logger.error("redis rate lua error: " + (e as any).message);
      return true; // fail open
    }
  } else {
    // local fallback (not perfect)
    const b = localBuckets.get(key) || { tokens: capacity, last: now };
    if (b.tokens <= 0) return false;
    b.tokens -= 1;
    b.last = now;
    localBuckets.set(key, b);
    return true;
  }
}
