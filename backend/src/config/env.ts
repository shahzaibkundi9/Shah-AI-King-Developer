// env config
import dotenv from "dotenv";
dotenv.config();

export const PORT = Number(process.env.PORT || 4000);
export const NODE_ENV = process.env.NODE_ENV || "development";
export const DATABASE_URL = process.env.DATABASE_URL || "";
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
export const JWT_SECRET = process.env.JWT_SECRET || "change_me";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const CLOUDINARY = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || ""
};

export const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:3002";
export const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || "http://localhost:3001";
export const PAYMENT_QR_SECRET = process.env.PAYMENT_QR_SECRET || "change_me";
