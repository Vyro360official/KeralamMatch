import { prisma } from "@/lib/db";
import { Plan, Subscription } from "@prisma/client";

export interface ISubscriptionRepository {
  findActivePlans(): Promise<Plan[]>;
  findPlanById(id: string): Promise<Plan | null>;
  findUserActiveSubscription(userId: string): Promise<Subscription | null>;
  createSubscription(userId: string, planId: string, durationDays: number): Promise<Subscription>;
}

export const CANONICAL_PLANS: Plan[] = [
  {
    id: "plan-free",
    name: "Free",
    description: "Explore the platform with basic features.",
    price: 0,
    durationDays: 30,
    features: {
      contactRequestsPerDay: 1,
      aiMatching: false,
      secureChat: false,
      profileBoost: 0,
      maxPhotos: 2,
      videoUpload: false,
      verificationPriority: "STANDARD",
    },
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "plan-silver",
    name: "Silver",
    description: "Great for finding and connecting with matches in Kerala.",
    price: 1299,
    durationDays: 90,
    features: {
      contactRequestsPerDay: 10,
      aiMatching: true,
      secureChat: true,
      profileBoost: 2,
      maxPhotos: 6,
      videoUpload: false,
      verificationPriority: "FAST_TRACK",
    },
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "plan-gold",
    name: "Gold",
    description: "Our most popular package with unlimited reveals & priority AI matching.",
    price: 2499,
    durationDays: 180,
    features: {
      contactRequestsPerDay: 25,
      aiMatching: true,
      secureChat: true,
      profileBoost: 5,
      maxPhotos: 10,
      videoUpload: true,
      verificationPriority: "VIP",
    },
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "plan-platinum",
    name: "Platinum",
    description: "VIP matchmaking with verified badge & dedicated advisor support.",
    price: 4999,
    durationDays: 365,
    features: {
      contactRequestsPerDay: 100,
      aiMatching: true,
      secureChat: true,
      profileBoost: 10,
      maxPhotos: 20,
      videoUpload: true,
      verificationPriority: "VIP",
    },
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const sandboxSubscriptions = new Map<string, any>();

export class SubscriptionRepository implements ISubscriptionRepository {
  async findActivePlans(): Promise<Plan[]> {
    try {
      const plans = await prisma.plan.findMany({
        where: { active: true },
        orderBy: { price: "asc" },
      });
      return plans.length > 0 ? plans : CANONICAL_PLANS;
    } catch {
      return CANONICAL_PLANS;
    }
  }

  async findPlanById(id: string): Promise<Plan | null> {
    try {
      const plan = await prisma.plan.findUnique({
        where: { id },
      });
      if (plan) return plan;
    } catch {
      // Database unmigrated
    }

    // Fallback to canonical plans by ID or by Name (e.g. "Gold", "Silver", "plan-gold")
    const found = CANONICAL_PLANS.find(
      (p) => p.id === id || p.name.toLowerCase() === id.toLowerCase() || p.id.toLowerCase().includes(id.toLowerCase())
    );
    return found || CANONICAL_PLANS[2]; // Default to Gold if unspecified
  }

  async findUserActiveSubscription(userId: string): Promise<Subscription | null> {
    try {
      const now = new Date();
      return await prisma.subscription.findFirst({
        where: {
          userId,
          status: "ACTIVE",
          endDate: {
            gt: now,
          },
        },
        include: {
          plan: true,
        },
      });
    } catch {
      return sandboxSubscriptions.get(userId) || null;
    }
  }

  async createSubscription(userId: string, planId: string, durationDays: number): Promise<Subscription> {
    const now = new Date();
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    try {
      return await prisma.subscription.create({
        data: {
          userId,
          planId,
          status: "ACTIVE",
          startDate: now,
          endDate,
        },
      });
    } catch {
      const plan = await this.findPlanById(planId);
      const sub = {
        id: "sub-" + Date.now(),
        userId,
        planId,
        status: "ACTIVE",
        startDate: now,
        endDate,
        plan: plan || CANONICAL_PLANS[2],
        createdAt: now,
        updatedAt: now,
      };
      sandboxSubscriptions.set(userId, sub);
      return sub as any;
    }
  }
}
