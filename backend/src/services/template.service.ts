/**
 * template.service.ts
 * Simple engine: choose template by conversation tags or by package name.
 */

import prisma from "../db";

export async function selectTemplateForConversation(conversationId: string) {
  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conv) return null;
  // prioritize tags
  if (conv.tags && conv.tags.length > 0) {
    const name = conv.tags[conv.tags.length - 1];
    const tpl = await prisma.promptTemplate.findUnique({ where: { name } });
    if (tpl) return tpl;
  }
  // fallback: choose default template
  const defaultTpl = await prisma.promptTemplate.findFirst({});
  return defaultTpl;
}
