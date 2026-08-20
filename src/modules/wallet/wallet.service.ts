import { IWalletRepository } from "./wallet.repository";
import { ReferralSummary } from "./wallet.types";
import { prisma } from "@/lib/db";

export class WalletService {
  constructor(private walletRepo: IWalletRepository) {}

  async getWallet(userId: string) {
    let wallet = await this.walletRepo.findWalletByUserId(userId);
    
    // Lazy creation of wallet if missing
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          currency: "INR",
        },
      });
    }

    return wallet;
  }

  async getTransactions(userId: string) {
    const wallet = await this.getWallet(userId);
    return this.walletRepo.findTransactions(wallet.id);
  }

  async addCredits(userId: string, amount: number, description: string): Promise<void> {
    const wallet = await this.getWallet(userId);
    await this.walletRepo.updateBalance(wallet.id, amount, "CREDIT", description);
  }

  async deductCredits(userId: string, amount: number, description: string): Promise<void> {
    const wallet = await this.getWallet(userId);
    await this.walletRepo.updateBalance(wallet.id, amount, "DEBIT", description);
  }

  /**
   * Tracks a new referred user sign up.
   * Maps the referral code to the referrer user.
   */
  async trackReferralSignup(referrerCode: string, refereeId: string): Promise<void> {
    // Standard referral code logic: e.g. RAHUL9283 -> find user whose firstName is RAHUL
    const cleanCode = referrerCode.trim().toUpperCase();
    const nameMatch = cleanCode.replace(/\d+/g, ""); // Extract letters e.g. RAHUL

    const referrerProfile = await prisma.profile.findFirst({
      where: {
        firstName: {
          equals: nameMatch,
          mode: "insensitive",
        },
      },
    });

    if (!referrerProfile) {
      console.warn(`No referrer profile found matching code: ${referrerCode}`);
      return;
    }

    if (referrerProfile.userId === refereeId) {
      console.warn("Self-referrals are blocked.");
      return;
    }

    // Ensure they aren't already referred
    const existing = await this.walletRepo.findReferralByReferee(refereeId);
    if (existing) return;

    // Create pending referral log (Reward: ₹100 = 10000 Paise)
    await this.walletRepo.createReferral(referrerProfile.userId, refereeId, 10000);
  }

  /**
   * Resolves and payouts the referral credits once the referee passes Selfie Verification.
   */
  async completeReferralReward(refereeId: string): Promise<void> {
    const referral = await this.walletRepo.findReferralByReferee(refereeId);
    if (!referral || referral.status !== "PENDING") return;

    // Verify if the referee has completed core requirements (Mobile + Selfie Verified)
    const refereeProfile = await prisma.profile.findUnique({
      where: { userId: refereeId },
    });

    if (!refereeProfile || !refereeProfile.verifiedMobile || !refereeProfile.verifiedSelfie) {
      // Requirements not met yet
      return;
    }

    // Execute credit payouts in transaction block
    await prisma.$transaction(async (tx) => {
      // 1. Credit Referrer
      const referrerWallet = await tx.wallet.findUnique({ where: { userId: referral.referrerId } });
      if (referrerWallet) {
        await tx.wallet.update({
          where: { id: referrerWallet.id },
          data: { balance: referrerWallet.balance + referral.rewardValue },
        });
        await tx.walletTransaction.create({
          data: {
            walletId: referrerWallet.id,
            amount: referral.rewardValue,
            type: "CREDIT",
            description: `Referral Reward: User verified.`,
          },
        });
      }

      // 2. Credit Referee
      const refereeWallet = await tx.wallet.findUnique({ where: { userId: referral.refereeId } });
      if (refereeWallet) {
        await tx.wallet.update({
          where: { id: refereeWallet.id },
          data: { balance: refereeWallet.balance + referral.rewardValue },
        });
        await tx.walletTransaction.create({
          data: {
            walletId: refereeWallet.id,
            amount: referral.rewardValue,
            type: "CREDIT",
            description: `Referral Signup Bonus.`,
          },
        });
      }

      // 3. Mark referral completed
      await tx.referral.update({
        where: { id: referral.id },
        data: { status: "COMPLETED" },
      });
    });
  }

  /**
   * Fetches the referral metrics dashboard for the user.
   */
  async getReferralSummary(userId: string): Promise<ReferralSummary> {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    const code = profile ? `${profile.firstName.toUpperCase()}${profile.id.substring(0, 4).toUpperCase()}` : "GUEST";

    const referrals = await this.walletRepo.findReferralsByReferrer(userId);

    const totalReferred = referrals.length;
    const completedReferred = referrals.filter((r) => r.status === "COMPLETED").length;
    const earnedCredits = completedReferred * 10000; // In Paise (₹100 per completed)

    return {
      referralCode: code,
      totalReferred,
      completedReferred,
      earnedCredits,
    };
  }
}
