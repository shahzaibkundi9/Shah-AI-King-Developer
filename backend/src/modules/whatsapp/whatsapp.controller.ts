// backend/src/modules/whatsapp/whatsapp.controller.ts
import { Request, Response } from "express";
import prisma from "../../db";
import aiGateway from "../../services/aiGateway.service";
import waGateway from "../../services/waGateway.service";

/**
 * Roman Urdu:
 * - Yeh function WhatsApp microservice se incoming message receive karta hai.
 * - Customer ko find/create karta hai.
 * - Conversation ko find/create karta hai.
 * - Message DB me save karta hai.
 * - AI ko send karta hai.
 * - AI reply wapas WhatsApp ko send karta hai.
 */

export async function receiveIncomingMessage(req: Request, res: Response) {
  try {
    const { from, text, waMessageId, timestamp, media } = req.body;

    if (!from) return res.status(400).json({ error: "Missing phone number" });

    // ------------------------------
    // 1) FIND OR CREATE CUSTOMER
    // ------------------------------
    let customer = await prisma.customer.findUnique({
      where: { phone: from }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone: from,
          name: from, // default
          ownerId: null // assign later from admin panel if needed
        }
      });
    }

    // ------------------------------
    // 2) FIND OR CREATE CONVERSATION
    // ------------------------------
    let conv = await prisma.conversation.findFirst({
      where: { customerId: customer.id }
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          customerId: customer.id
        }
      });
    }

    // ------------------------------
    // 3) SAVE INCOMING MESSAGE TO DB
    // ------------------------------
    const savedMsg = await prisma.message.create({
      data: {
        conversationId: conv.id,
        direction: "IN",
        body: text || "",
        waMessageId,
        mediaType: media?.type || null,
        mediaUrl: media?.url || null,
        timestamp: timestamp ? new Date(timestamp * 1000) : new Date()
      }
    });

    // ------------------------------
    // 4) APPEND USER MESSAGE TO AI CONTEXT
    // ------------------------------
    await aiGateway.appendToAIContext({
      conversationId: conv.id,
      role: "user",
      text: text || ""
    });

    // ------------------------------
    // 5) GENERATE AI REPLY
    // ------------------------------
    const ai = await aiGateway.generateAIResponse({
      prompt: text,
      conversationId: conv.id
    });

    // ------------------------------
    // 6) SAVE AI REPLY IN DB
    // ------------------------------
    const botMsg = await prisma.message.create({
      data: {
        conversationId: conv.id,
        direction: "OUT",
        body: ai.text
      }
    });

    // ------------------------------
    // 7) SEND AI REPLY TO WHATSAPP
    // ------------------------------
    await waGateway.sendText(from, ai.text, { conversationId: conv.id });

    return res.json({
      ok: true,
      received: savedMsg,
      reply: botMsg
    });

  } catch (err: any) {
    console.error("WhatsApp incoming error:", err);
    return res.status(500).json({ error: err.message });
  }
}
