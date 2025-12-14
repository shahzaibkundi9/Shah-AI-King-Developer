// ai/src/services/cache.ts
/**
 * Cache wrapper: Redis (ioredis) if REDIS_URL provided, otherwise in-memory Map fallback.
 * Roman Urdu comments:
 * - Yeh service short-term context aur token accounting ke liye use hogi.
 * - Methods promise-based hain taake future me Redis swap easy ho.
 */

import { REDIS_URL } from "../config/env";
import logger from "../logger";

let Redis: any;
let redisClient: any = null;
try {
  // runtime require to avoid dev-time errors if dependency not installed
  // (install ioredis in production if you want redis)
  // npm i ioredis
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Redis = require("ioredis");
} catch (e) {
  // ioredis not installed — fallback will be used
}

if (REDIS_URL && Redis) {
  try {
    redisClient = new Redis(REDIS_URL);
    redisClient.on("error", (err: any) => logger.error("AI cache redis error: " + err.message));
    logger.info("AI cache: using Redis");
  } catch (e) {
    logger.error("AI cache: redis init failed, falling back to memory");
    redisClient = null;
  }
} else {
  logger.info("AI cache: using in-memory fallback");
}

// in-memory store fallback
const memStore = new Map<string, string>();

export default {
  async get(key: string): Promise<string | null> {
    if (redisClient) {
      try {
        const v = await redisClient.get(key);
        return v;
      } catch (e) {
        logger.error("cache.get redis error: " + (e as any).message);
        return null;
      }
    } else {
      return memStore.has(key) ? (memStore.get(key) as string) : null;
    }
  },

  async set(key: string, value: string, ttlSec?: number): Promise<void> {
    if (redisClient) {
      if (ttlSec) {
        await redisClient.set(key, value, "EX", ttlSec);
      } else {
        await redisClient.set(key, value);
      }
    } else {
      memStore.set(key, value);
      if (ttlSec) {
        setTimeout(() => memStore.delete(key), ttlSec * 1000);
      }
    }
  },

  async del(key: string): Promise<void> {
    if (redisClient) {
      await redisClient.del(key);
    } else {
      memStore.delete(key);
    }
  },

  async incr(key: string): Promise<number> {
    if (redisClient) {
      return redisClient.incr(key);
    } else {
      const v = Number(memStore.get(key) || "0") + 1;
      memStore.set(key, String(v));
      return v;
    }
  },

  async ttl(key: string): Promise<number> {
    if (redisClient) {
      return redisClient.ttl(key);
    } else {
      return -1;
    }
  }
};
