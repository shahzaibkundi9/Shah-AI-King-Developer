/**
 * session.manager.ts
 * - Manage multiple sessions (create, list, close)
 * - Keep clients in-memory map and persist auth state on disk via useMultiFileAuthState in initClient
 * - Expose helper to sendText/sendMedia via a session
 */

import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import logger from "../logger";
import { initBaileysClient } from "./initClient";
import { SESSIONS_DIR } from "../config/env";
import { Emit } from "../sockets";

type ClientEntry = {
  id: string;
  name?: string;
  client: any | null;
  status: "created" | "qr" | "open" | "closed" | "error";
  createdAt: string;
  updatedAt: string;
};

const sessions: Map<string, ClientEntry> = new Map();

export async function createSession(name?: string) {
  const id = uuidv4();
  const folder = path.join(SESSIONS_DIR, id);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  const entry: ClientEntry = {
    id,
    name,
    client: null,
    status: "created",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  sessions.set(id, entry);

  // init client in background
  initBaileysClient(id)
    .then((client) => {
      entry.client = client;
      entry.status = "open";
      entry.updatedAt = new Date().toISOString();
      sessions.set(id, entry);
      logger.info(`session ${id} opened`);
    })
    .catch((err) => {
      logger.error(`session ${id} init error: ${err.message || err.toString()}`);
      entry.status = "error";
      entry.updatedAt = new Date().toISOString();
      sessions.set(id, entry);
    });

  return entry;
}

export async function getSessions() {
  return Array.from(sessions.values());
}

export async function getSession(id: string) {
  return sessions.get(id) || null;
}

export async function closeSession(id: string) {
  const entry = sessions.get(id);
  if (!entry) return false;
  try {
    if (entry.client && entry.client.ws) {
      await entry.client.ws.close();
    }
  } catch (e) {
    logger.error("closeSession error: " + (e as any).message);
  }
  sessions.delete(id);
  // remove session folder? we keep auth files for re-use
  return true;
}

export async function sendText(sessionId: string, to: string, text: string, opts?: any) {
  const entry = sessions.get(sessionId);
  if (!entry || !entry.client) throw new Error("Session not available");
  const sock = entry.client;
  // normalize jid
  const jid = to.includes("@") ? to : `${to}@s.whatsapp.net`;
  // send message
  return sock.sendMessage(jid, { text }, { quoted: opts?.quoted });
}

export async function sendMedia(sessionId: string, to: string, mediaBuffer: Buffer, filename: string, mimetype: string, opts?: any) {
  const entry = sessions.get(sessionId);
  if (!entry || !entry.client) throw new Error("Session not available");
  const sock = entry.client;
  const jid = to.includes("@") ? to : `${to}@s.whatsapp.net`;
  return sock.sendMessage(jid, { file: mediaBuffer, filename, mimetype }, {});
}
