/**
 * qr.handler.ts
 * - Handles emission of QR codes through socket.io for frontend to scan
 * - Saves last QR image as data URL in sessions folder for debugging
 */

import fs from "fs";
import path from "path";
import { emit } from "../sockets";
import logger from "../logger";
import { SESSIONS_DIR } from "../config/env";

export function handleQR(sessionId: string, qrData: string) {
  try {
    // emit to frontend room session:<id>
    emit("wa:qr", { sessionId, qr: qrData }, `session:${sessionId}`);
    // save QR to file (small)
    const file = path.join(SESSIONS_DIR, sessionId, "last_qr.txt");
    fs.writeFileSync(file, qrData, "utf-8");
    logger.info(`saved qr for session ${sessionId}`);
  } catch (e) {
    logger.error("handleQR error: " + (e as any).message);
  }
}
