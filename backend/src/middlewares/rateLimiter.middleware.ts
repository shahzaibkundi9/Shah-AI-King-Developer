/**
 * Adaptive token-bucket rate limiter using Redis.
 * Yeh middleware general requests ko protect karega.
 * WhatsApp specific rate limiting logic backend->whatsapp gateway mein bhi apply hogi.
 */

import { Request, Response, NextFunction } from "express";
import redis from "../redis";

const WINDOW = 60; // seconds
const MAX_TOKENS = 200; // global per-key default

async function getKey(req: Request) {
  const auth = req.headers.authorization;
  if (auth) {
    const p = auth.split(" ");
    if (p.length === 2) {
      // token based key: user:<id>
      return `rl:user:${p[1].slice(0,8)}`;
    }
  }
  // fallback: ip
  return `rl:ip:${req.ip}`;
}

export async function adaptiveRateLimiter(req: Request, res: Response, next: NextFunction) {
  try {
    const key = await getKey(req);
    const now = Math.floor(Date.now() / 1000);
    const bucketKey = `${key}:bucket`;
    const data = await redis.hgetall(bucketKey);
    let tokens = MAX_TOKENS;
    let last = now;
    if (data && data.tokens) {
      tokens = Number(data.tokens);
      last = Number(data.last);
    }
    // refill
    const elapsed = now - last;
    const refill = Math.floor((elapsed) * (MAX_TOKENS / WINDOW));
    tokens = Math.min(MAX_TOKENS, tokens + refill);
    if (tokens <= 0) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }
    tokens -= 1;
    await redis.hmset(bucketKey, { tokens: String(tokens), last: String(now) });
    await redis.expire(bucketKey, WINDOW * 2);
    next();
  } catch (err) {
    // fail open
    next();
  }
}

