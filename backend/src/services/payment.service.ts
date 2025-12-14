/**
 * payment.service.ts (UPDATED VERSION)
 *
 * Yeh version manual payment processing support karta hai:
 * - Admin panel se EasyPaisa/JazzCash/Bank accounts manage hote hain
 * - Jab customer payment initiate kare => system active account fetch karta hai
 * - AI ko instructions bhejne ke liye dynamic message generate hota hai
 * - User ko screenshot upload karna hota hai => record DB me store hota hai
 * - Admin verify kar ke payment ko APPROVED/REJECTED kar sakta hai
 *
 * Roman Urdu comments:
 * Yeh pura system manual payments handle karta hai without payment link.
 */

import prisma from "../db";
import logger from "../logger";

class PaymentService {
  // ⭐ Step 1: Get active payment account for method
  async getActiveAccount(method: string) {
    const acc = await prisma.paymentAccount.findFirst({
      where: { type: method, active: true }
    });
    if (!acc) throw new Error(`No active payment account found for ${method}`);
    return acc;
  }

  // ⭐ Step 2: Create Payment Request (manual)
  async createManualPayment(userId: string, amount: number, method: string) {
    const account = await this.getActiveAccount(method);

    // DB record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        method,
        status: "PENDING",
        metadata: {
          accountType: account.type,
          number: account.number,
          title: account.title,
          iban: account.iban
        }
      }
    });

    // Roman Urdu: User ko jo instructions bhejni hain wo yahan generate hoti hain
    const instructions = this.buildPaymentInstructions(payment, account);

    return {
      payment,
      instructions
    };
  }

  // ⭐ Step 3: Payment instructions builder — AI ko bhejne layak format
  buildPaymentInstructions(payment: any, account: any) {
    if (account.type === "easypaisa") {
      return `
Aap ka EasyPaisa payment initiate hogaya hai.

Amount: ${payment.amount} PKR
Account Number: ${account.number}
Account Title: ${account.title || "N/A"}

Please payment karne ke baad receipt ka screenshot bhej dein.
      `;
    }

    if (account.type === "jazzcash") {
      return `
JazzCash payment instructions:

Amount: ${payment.amount} PKR
JazzCash Number: ${account.number}
Account Title: ${account.title || "N/A"}

Payment ke baad screenshot zaroor bhejein.
      `;
    }

    if (account.type === "bank") {
      return `
Bank Transfer Details:

Amount: ${payment.amount} PKR
Account Title: ${account.title}
IBAN: ${account.iban}

Payment complete hone ke baad screenshot bhejein.
      `;
    }

    return "Invalid payment method.";
  }

  // ⭐ Step 4: Save screenshot info (WhatsApp microservice upload karega)
  async savePaymentScreenshot(paymentId: string, screenshotUrl: string) {
    const p = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        metadata: {
          screenshotUrl
        }
      }
    });

    return p;
  }

  // ⭐ Step 5: Admin approves/rejects
  async verifyPayment(paymentId: string, status: "APPROVED" | "REJECTED") {
    const p = await prisma.payment.update({
      where: { id: paymentId },
      data: { status }
    });

    logger.info(`Payment ${paymentId} marked as ${status}`);
    return p;
  }
}

export default new PaymentService();
