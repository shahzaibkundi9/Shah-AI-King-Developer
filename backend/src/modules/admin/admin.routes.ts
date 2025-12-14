import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import prisma from "../../db";

const router = Router();
router.use(authMiddleware);

router.get("/stats", async (req: any, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  const users = await prisma.user.count();
  const convs = await prisma.conversation.count();
  const messages = await prisma.message.count();
  const aiLogs = await prisma.aIProviderLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  res.json({ users, convs, messages, aiLogs });
});

export default router;
