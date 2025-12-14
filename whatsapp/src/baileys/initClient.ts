/**
 * initClient.ts
 * Baileys client initializer — creates and returns a single WA connection instance per session id.
 *
 * Roman Urdu comments explain kar rahe hain:
 * - Yeh function ek sessionId leta hai jis ko session.manager create karta hai.
 * - Session files are stored under SESSIONS_DIR/<sessionId>.json
 * - We use Baileys' makeWASocket and use single auth state.
 */

import { boom } from "@hapi/boom";
import {
  makeWALegacySocket,
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidNormalizedUser
} from "@adiwajshing/baileys";
import fs from "fs";
import path from "path";
import logger from "../logger";
import { SESSIONS_DIR } from "../config/env";
import { emit } from "../sockets";

type WAClient = any;

export async function initBaileysClient(sessionId: string): Promise<WAClient> {
  // ensure sessions dir
  if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  const folder = path.join(SESSIONS_DIR, sessionId);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

  // multi file auth state
  const { state, saveCreds } = await useMultiFileAuthState(folder);

  // get baileys version
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [4, 0, 0] }));

  const sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
    logger: { level: "silent" }
  });

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", (update: any) => {
    const { connection, lastDisconnect } = update;
    logger.info(`[${sessionId}] connection update: ${connection}`);
    emit("wa:session:update", { sessionId, update });
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
      logger.info(`[${sessionId}] disconnected: ${JSON.stringify(lastDisconnect)}`);
      // try reconnect logic is handled by session.manager
    } else if (connection === "open") {
      logger.info(`[${sessionId}] connected/open`);
      emit("wa:session:open", { sessionId });
    }
  });

  // incoming messages listener
  sock.ev.on("messages.upsert", async (m: any) => {
    try {
      const messages = m.messages || [];
      for (const msg of messages) {
        // forward to backend webhook
        try {
          await forwardIncomingMessage(sessionId, msg);
        } catch (e) {
          logger.error("forwardIncomingMessage error: " + (e as any).message);
        }
      }
    } catch (e) {
      logger.error("messages.upsert handler error: " + (e as any).message);
    }
  });

  // optional: handle outgoing message acknowledgements etc.

  return sock;
}

// forward incoming to backend webhook (simple)
import axios from "axios";
async function forwardIncomingMessage(sessionId: string, msg: any) {
  const payload = { sessionId, msg };
  try {
    await axios.post(BACKEND_WEBHOOK, payload, { timeout: 5000 });
    logger.info(`forwarded incoming msg (session ${sessionId})`);
  } catch (err: any) {
    logger.error("forwarding to backend failed: " + (err.message || err.toString()));
  }
}
