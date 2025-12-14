// ai/src/engine/context.ts
/**
 * Conversation Context Memory
 *
 * Responsibilities:
 * - Provide append/get/trim functions for conversation contexts
 * - Persist short-term context in cache (Redis) or in-memory
 * - Support max tokens/messages trimming policy
 *
 * Roman Urdu:
 * - ConversationId ke mutabiq messages store hote hain.
 * - Methods async hain taake Redis use ho sake.
 */

import cache from "../services/cache";
import logger from "../logger";

const CONTEXT_PREFIX = "ai:context:"; // key prefix
const DEFAULT_TTL = 60 * 60 * 24; // 24 hours

// simple in-memory representation shape:
// { messages: [{ role: 'user'|'assistant'|'system', text, ts }] }

export async function getContext(conversationId: string) {
  const key = `${CONTEXT_PREFIX}${conversationId}`;
  const raw = await cache.get(key);
  if (!raw) return { messages: [] as any[] };
  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    logger.error("context.get parse error: " + (e as any).message);
    return { messages: [] };
  }
}

export async function appendMessage(conversationId: string, role: "user" | "assistant" | "system", text: string) {
  const key = `${CONTEXT_PREFIX}${conversationId}`;
  const ctx = await getContext(conversationId);
  ctx.messages.push({ role, text, ts: Date.now() });
  // trimming policy: keep last 20 messages
  if (ctx.messages.length > 20) {
    ctx.messages = ctx.messages.slice(ctx.messages.length - 20);
  }
  await cache.set(key, JSON.stringify(ctx), DEFAULT_TTL);
  return ctx;
}

export async function clearContext(conversationId: string) {
  const key = `${CONTEXT_PREFIX}${conversationId}`;
  await cache.del(key);
  return true;
}

/**
 * buildPrompt
 * - Helper that composes a prompt string or provider-specific message array
 * - We return generic string; providers may wrap into their own message formats
 */
export async function buildPrompt(conversationId: string, extraSystemPrompt?: string) {
  const ctx = await getContext(conversationId);
  // Compose: system prompt + last messages
  const parts: string[] = [];
  if (extraSystemPrompt) parts.push(`System: ${extraSystemPrompt}`);
  for (const m of ctx.messages) {
    const role = m.role === "assistant" ? "Assistant" : m.role === "user" ? "User" : "System";
    parts.push(`${role}: ${m.text}`);
  }
  return parts.join("\n\n");
}
