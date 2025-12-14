import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import prisma from "../../db";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: any, res) => {
  const customers = await prisma.customer.findMany({ where: { ownerId: req.user.id } });
  res.json({ data: customers });
});

router.post("/", async (req: any, res) => {
  const { phone, name, metadata } = req.body;
  const userId = req.user.id;
  const customer = await prisma.customer.upsert({
    where: { phone },
    update: { name, metadata, ownerId: userId },
    create: { phone, name, metadata, ownerId: userId }
  });
  res.json({ data: customer });
});

export default router;
