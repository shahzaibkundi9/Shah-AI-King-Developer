// src/config/env.ts
// Roman Urdu: environment configuration sab single file me
import dotenv from "dotenv";
dotenv.config();

export const PORT = Number(process.env.PORT || 3002);
export const NODE_ENV = process.env.NODE_ENV || "development";

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
export const OPENAI_API_BASE = process.env.OPENAI_API_BASE || "https://api.openai.com";
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export const COHERE_API_KEY = process.env.COHERE_API_KEY || "";
export const COHERE_API_BASE = process.env.COHERE_API_BASE || "https://api.cohere.com";

export const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || "";
export const CLAUDE_API_BASE = process.env.CLAUDE_API_BASE || "https://api.anthropic.com";

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const GEMINI_API_BASE = process.env.GEMINI_API_BASE || "https://gemini.googleapis.com";

export const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
export const GROQ_API_BASE = process.env.GROQ_API_BASE || "https://api.groq.ai";

export const AI_REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 60000);
export const AI_REQUEST_RETRIES = Number(process.env.AI_REQUEST_RETRIES || 2);
