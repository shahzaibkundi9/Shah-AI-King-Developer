/**
 * message.service.ts
 * - Exposes higher-level sendText/sendMedia which:
 *   * apply anti-ban typing simulation
 *   * check rate limit
 *   * retries on transient errors
 *   * record basic logs via logger
 *   * emits socket events for UI
 */

import logger from "../logger";
import { simulateTyping } from "../baileys/antiBan";
import { allowSend } from "../baileys/rateLimit";
import { retry } from "../utils/retry";
import { sendText as sendTextViaSession, sendMedia as sendMediaViaSession } from "../baileys/session.manager";
import { emit } from "../sockets";

export async function sendText(sessionId: string, to: string, text: string, meta?: any) {
  // rate-limit check
  const ok = await allowSend(sessionId);
  if (!ok) throw new Error("Rate limit exceeded");

  // sim typing
  await simulateTyping();

  // send with retries
  const res = await retry(() => sendTextViaSession(sessionId, to, text, meta), 3, 400);
  logger.info(`sent text to ${to} via session ${sessionId}`);
  emit("wa:message:sent", { sessionId, to, text });
  return res;
}

export async function sendMedia(sessionId: string, to: string, buffer: Buffer, filename: string, mimetype: string, meta?: any) {
  const ok = await allowSend(sessionId);
  if (!ok) throw new Error("Rate limit exceeded");
  await simulateTyping();
  const res = await retry(() => sendMediaViaSession(sessionId, to, buffer, filename, mimetype, meta), 3, 400);
  logger.info(`sent media to ${to} via session ${sessionId}`);
  emit("wa:media:sent", { sessionId, to, filename });
  return res;
}
