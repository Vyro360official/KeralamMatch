import { TransactionType } from "@prisma/client";

export interface WalletTransactionDetails {
  id: string;
  amount: number; // in Paise
  type: TransactionType;
  description: string;
  createdAt: Date;
}

export interface ReferralSummary {
  referralCode: string;
  totalReferred: number;
  completedReferred: number;
  earnedCredits: number;
}
