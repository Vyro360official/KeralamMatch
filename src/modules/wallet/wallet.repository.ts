import { prisma } from "@/lib/db";
import { Wallet, WalletTransaction, Referral, TransactionType } from "@prisma/client";

export interface IWalletRepository {
  findWalletByUserId(userId: string): Promise<Wallet | null>;
  findTransactions(walletId: string): Promise<WalletTransaction[]>;
  updateBalance(walletId: string, amount: number, type: TransactionType, description: string): Promise<Wallet>;
  findReferralsByReferrer(referrerId: string): Promise<Referral[]>;
  createReferral(referrerId: string, refereeId: string, rewardValue: number): Promise<Referral>;
  findReferralByReferee(refereeId: string): Promise<Referral | null>;
  updateReferralStatus(id: string, status: string): Promise<Referral>;
}

export class WalletRepository implements IWalletRepository {
  async findWalletByUserId(userId: string): Promise<Wallet | null> {
    return prisma.wallet.findUnique({
      where: { userId },
    });
  }

  async findTransactions(walletId: string): Promise<WalletTransaction[]> {
    return prisma.walletTransaction.findMany({
      where: { walletId },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateBalance(walletId: string, amount: number, type: TransactionType, description: string): Promise<Wallet> {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
      });
      if (!wallet) throw new Error("WALLET_NOT_FOUND");

      const newBalance = type === "CREDIT" 
        ? wallet.balance + amount 
        : wallet.balance - amount;

      if (newBalance < 0) {
        throw new Error("INSUFFICIENT_WALLET_BALANCE");
      }

      const updated = await tx.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance },
      });

      await tx.walletTransaction.create({
        data: {
          walletId,
          amount,
          type,
          description,
        },
      });

      return updated;
    });
  }

  async findReferralsByReferrer(referrerId: string): Promise<Referral[]> {
    return prisma.referral.findMany({
      where: { referrerId },
      include: {
        referee: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async createReferral(referrerId: string, refereeId: string, rewardValue: number): Promise<Referral> {
    return prisma.referral.create({
      data: {
        referrerId,
        refereeId,
        status: "PENDING",
        rewardValue,
      },
    });
  }

  async findReferralByReferee(refereeId: string): Promise<Referral | null> {
    return prisma.referral.findUnique({
      where: { refereeId },
    });
  }

  async updateReferralStatus(id: string, status: string): Promise<Referral> {
    return prisma.referral.update({
      where: { id },
      data: { status },
    });
  }
}
