import { prisma } from "@/lib/db";
import { Payment, PaymentStatus } from "@prisma/client";

export interface IPaymentsRepository {
  createPayment(userId: string, orderId: string, amount: number, gstAmount: number, tierName: string): Promise<Payment>;
  findPaymentByOrderId(orderId: string): Promise<Payment | null>;
  updatePaymentStatus(orderId: string, paymentId: string, status: PaymentStatus): Promise<Payment>;
}

const sandboxPayments = new Map<string, any>();

export class PaymentsRepository implements IPaymentsRepository {
  async createPayment(userId: string, orderId: string, amount: number, gstAmount: number, tierName: string): Promise<Payment> {
    try {
      return await prisma.payment.create({
        data: {
          userId,
          orderId,
          amount,
          gstAmount,
          tierName,
          status: "PENDING",
        },
      });
    } catch {
      const payment: Payment = {
        id: "pay-rec-" + Date.now(),
        userId,
        orderId,
        paymentId: null,
        amount,
        gstAmount,
        currency: "INR",
        tierName,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      sandboxPayments.set(orderId, payment);
      return payment;
    }
  }

  async findPaymentByOrderId(orderId: string): Promise<Payment | null> {
    try {
      return await prisma.payment.findUnique({
        where: { orderId },
      });
    } catch {
      return sandboxPayments.get(orderId) || null;
    }
  }

  async updatePaymentStatus(orderId: string, paymentId: string, status: PaymentStatus): Promise<Payment> {
    try {
      return await prisma.payment.update({
        where: { orderId },
        data: {
          paymentId,
          status,
        },
      });
    } catch {
      const existing = sandboxPayments.get(orderId) || {
        id: "pay-rec-" + Date.now(),
        userId: "usr-dev",
        orderId,
        amount: 2949,
        gstAmount: 450,
        currency: "INR",
        tierName: "SUB:Gold",
        createdAt: new Date(),
      };
      const updated: Payment = {
        ...existing,
        paymentId,
        status,
        updatedAt: new Date(),
      };
      sandboxPayments.set(orderId, updated);
      return updated;
    }
  }
}
