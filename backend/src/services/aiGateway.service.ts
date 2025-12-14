// backend/src/services/aiGateway.service.ts
import axios from "axios";
import logger from '../logger';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL!;
const AI_CONTEXT_APPEND_URL = process.env.AI_CONTEXT_APPEND_URL!;
const AI_CONTEXT_CLEAR_URL = process.env.AI_CONTEXT_CLEAR_URL!;
const AI_SECRET = process.env.AI_SECRET!;

// Roman Urdu:
// - Yeh service backend ko AI microservice se connect karti hai.
// - ConversationId pass hota hai, userId pass hota hai, prompt AI ko jata hai.
// - AI ke response ko backend save karta hai.

export async function generateAIResponse({
  prompt,
  conversationId,
  userId,
  extra,
  requireSafe = false
}: {
  prompt: string;
  conversationId: string;
  userId?: string;
  extra?: any;
  requireSafe?: boolean;
}) {
  try {
    const payload = {
      prompt,
      conversationId,
      userId,
      requireSafe,
      extra
    };

    const res = await axios.post(
      AI_SERVICE_URL,
      payload,
      {
        headers: {
          "x-ai-secret": AI_SECRET,
        },
        timeout: 15000
      }
    );

    return res.data;
  } catch (err: any) {
    logger.error("AI Gateway Error → " + (err.response?.data?.error || err.message));
    throw new Error("AI microservice failed: " + (err.response?.data?.error || err.message));
  }
}

// Roman Urdu:
// - Backend context ko AI service me sync rakhta hai (append).
export async function appendToAIContext({
  conversationId,
  role,
  text
}: {
  conversationId: string;
  role: "user" | "assistant" | "system";
  text: string;
}) {
  try {
    await axios.post(
      AI_CONTEXT_APPEND_URL,
      { conversationId, role, text },
      { headers: { "x-ai-secret": AI_SECRET } }
    );
  } catch (err: any) {
    logger.warn("AI context append error: " + err.message);
  }
}

// Roman Urdu:
// - Kabhi kabhi conversation reset karni ho → tab yeh function.
export async function clearAIContext(conversationId: string) {
  try {
    await axios.post(
      AI_CONTEXT_CLEAR_URL,
      { conversationId },
      { headers: { "x-ai-secret": AI_SECRET } }
    );
  } catch (err: any) {
    logger.warn("AI context clear error: " + err.message);
  }
}
