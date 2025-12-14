// src/providers/index.ts
// Roman Urdu: centralized provider exports + type definitions
import OpenAIProvider from "./openai.provider";
import CohereProvider from "./cohere.provider";
import ClaudeProvider from "./claude.provider";
import GeminiProvider from "./gemini.provider";
import GroqProvider from "./groq.provider";

export type AIResponse = {
  provider: string;
  model?: string;
  text: string;
  tokensUsed?: number | null;
  meta?: any;
};

export type AIPayload = {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  conversationId?: string;
  extra?: any;
  providerHint?: string;
};

export { OpenAIProvider, CohereProvider, ClaudeProvider, GeminiProvider, GroqProvider };
