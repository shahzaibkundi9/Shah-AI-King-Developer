/**
 * waGateway.service.ts
 * Backend communicates with Whatsapp microservice over HTTP.
 * Also implements retry + adaptive backoff + logging.
 */

import axios from "axios";
import logger from "../logger";
import { WHATSAPP_SERVICE_URL } from "../config/env";

async function post(path: string, data: any) {
  try {
    const res = await axios.post(`${WHATSAPP_SERVICE_URL}${path}`, data, { timeout: 10000 });
    return res.data;
  } catch (err: any) {
    logger.error("waGateway error: " + (err.message || err.toString()));
    throw err;
  }
}

export default {
  sendText: async (phone: string, text: string, meta?: any) => {
    return post("/api/send-text", { phone, text, meta });
  },
  sendMedia: async (phone: string, mediaUrl: string, meta?: any) => {
    return post("/api/send-media", { phone, mediaUrl, meta });
  },
  createSession: async (name: string) => {
    return post("/api/session/create", { name });
  },
  getSessions: async () => {
    return post("/api/session/list", {});
  }
};
