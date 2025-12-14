// env.ts — Roman Urdu comments
import dotenv from "dotenv";
dotenv.config();

export const PORT = Number(process.env.PORT || 3001);
export const NODE_ENV = process.env.NODE_ENV || "development";
export const SESSIONS_DIR = process.env.SESSIONS_DIR || "./sessions";
export const BACKEND_WEBHOOK = process.env.BACKEND_WEBHOOK || "http://localhost:4000/api/whatsapp/incoming";
export const REDIS_URL = process.env.REDIS_URL || "";
export const CLOUDINARY = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || ""
};
export const WA_MAX_MSG_PER_MIN = Number(process.env.WA_MAX_MSG_PER_MIN || 60);
export const WA_TYPING_MIN_MS = Number(process.env.WA_TYPING_MIN_MS || 800);
export const WA_TYPING_MAX_MS = Number(process.env.WA_TYPING_MAX_MS || 2200);
