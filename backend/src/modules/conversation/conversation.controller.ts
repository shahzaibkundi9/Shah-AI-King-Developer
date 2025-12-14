import { Request, Response } from "express";
import prisma from "../../db";
import waGateway from "../../services/waGateway.service";
import aiGateway from "../../services/aiGateway.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

/**
 * Conversation controller:
 * - list convs
 * - send message (manual)
 * - assign template
 */

export async function listConversations(req: AuthRequest, res: Response) {
  const userId = req.user.id;
  const convs = await prisma.conversation.findMany({
    where: { customer: { ownerId: userId } },
    include: { customer: true, messages: { take: 1, orderBy: { createdAt: "desc" } } },
    orderBy: { updatedAt: "desc" }
  });
  res.json({ data: convs });
}

export async function getMessages(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const msgs = await prisma.message.findMany({ where: { conversationId: id }, orderBy: { createdAt: "asc" } });
  res.json({ data: msgs });
}

export async function sendMessage(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { text } = req.body;
  const conv = await prisma.conversation.findUnique({ where: { id }, include: { customer: true } });
  if (!conv) return res.status(404).json({ error: "Conv not found" });

  // store outbound message
  const msg = await prisma.message.create({
    data: { conversationId: id, direction: "OUT", body: text }
  });

  // call whatsapp microservice via gateway
  waGateway.sendText(conv.customer.phone, text, { conversationId: id }).catch(console.error);

  res.json({ ok: true, message: msg });
}

export async function assignTemplate(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { templateName } = req.body;
  const tpl = await prisma.promptTemplate.findUnique({ where: { name: templateName } });
  if (!tpl) return res.status(404).json({ error: "Template not found" });

  await prisma.conversation.update({ where: { id }, data: { tags: { push: templateName } } });
  res.json({ ok: true, template: tpl });
}
