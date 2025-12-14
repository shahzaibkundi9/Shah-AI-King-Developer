/**
 * Payments Controller — Manual Payments Only
 * Roman Urdu:
 * - User manual payment start karta hai
 * - AI payment instructions generate hoti hain
 * - User screenshot upload karta hai
 * - Admin verify karta hai
 */

import { Request, Response } from "express";
import prisma from "../../db";
import paymentService from "../../services/payment.service";

// =======================
// Create manual payment
// =======================
export async function createPayment(req: any, res: Response) {
  try {
    const { amount, method } = req.body;

    const { payment, instructions } =
      await paymentService.createManualPayment(
        req.user.id,
        Number(amount),
        method
      );

    res.json({
      ok: true,
      payment,
      instructions, // AI ko bhejne ke liye
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// =======================
// Upload payment screenshot
// =======================
export async function uploadScreenshot(req: any, res: Response) {
  const { paymentId, url } = req.body;

  const updated = await paymentService.savePaymentScreenshot(paymentId, url);
  res.json({ ok: true, payment: updated });
}

// =======================
// Admin verify payment
// =======================
export async function verify(req: any, res: Response) {
  const { paymentId, status } = req.body;

  const updated = await paymentService.verifyPayment(paymentId, status);
  res.json({ ok: true, payment: updated });
}

// =======================
// Webhook placeholder (required by route)
// =======================
export async function webhook(_req: Request, res: Response) {
  // Roman Urdu:
  // Manual payments me webhook use nahi hota
  // Lekin Express route ko handler chahiye hota hai
  res.json({
    ok: true,
    message: "Manual payment webhook placeholder",
  });
}

// =======================
// Get payment QR / instructions
// =======================
export async function getPaymentQR(req: Request, res: Response) {
  const { paymentId } = req.params;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    return res.status(404).json({ error: "Payment not found" });
  }

  res.json({
    ok: true,
    payment,
    instructions: payment.instructions ?? null,
  });
}
