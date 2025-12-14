import { Router } from "express";
import prisma from "../../db";
import { authMiddleware } from "../auth/auth.middleware";

const router = Router();
router.use(authMiddleware);

// 🔐 Only Admin can manage payment accounts
router.use(async (req: any, res, next) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  next();
});

// Get all payment accounts
router.get("/", async (_req, res) => {
  const accounts = await prisma.paymentAccount.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ data: accounts });
});

// Create account
router.post("/", async (req, res) => {
  const { type, title, number, iban, active } = req.body;
  const acc = await prisma.paymentAccount.create({
    data: { type, title, number, iban, active }
  });
  res.json({ ok: true, data: acc });
});

// Update account
router.put("/:id", async (req, res) => {
  const acc = await prisma.paymentAccount.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json({ ok: true, data: acc });
});

// Delete account
router.delete("/:id", async (req, res) => {
  await prisma.paymentAccount.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
