import { ISubscriptionRepository } from "./subscription.repository";
import { Plan, Subscription } from "@prisma/client";
import { prisma } from "@/lib/db";

export class SubscriptionService {
  constructor(private subscriptionRepo: ISubscriptionRepository) {}

  /**
   * Fetches active plans, automatically seeding them if empty.
   */
  async getPlans(): Promise<Plan[]> {
    try {
      let plans = await this.subscriptionRepo.findActivePlans();

      if (plans.length === 0) {
        // Seed default enterprise membership plans
        await this.seedDefaultPlans();
        plans = await this.subscriptionRepo.findActivePlans();
      }

      return plans;
    } catch {
      return this.subscriptionRepo.findActivePlans();
    }
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepo.findUserActiveSubscription(userId);
  }

  /**
   * Activates a subscription package for a user.
   */
  async subscribeUser(userId: string, planId: string): Promise<Subscription> {
    const plan = await this.subscriptionRepo.findPlanById(planId);
    if (!plan) throw new Error("PLAN_NOT_FOUND");

    try {
      // Deactivate previous active plans (simple swap)
      const active = await this.subscriptionRepo.findUserActiveSubscription(userId);
      if (active && active.id) {
        await prisma.subscription.update({
          where: { id: active.id },
          data: { status: "UPGRADED" },
        }).catch(() => {});
      }
    } catch {
      // Database unmigrated fallback
    }

    return this.subscriptionRepo.createSubscription(userId, planId, plan.durationDays);
  }

  private async seedDefaultPlans(): Promise<void> {
    const defaultPlans = [
      {
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
          featuredBadge: false,
          support: "EMAIL",
        },
      },
      {
        name: "Premium Silver",
        description: "Enhanced matching and standard communications.",
        price: 99900, // ₹999.00
        durationDays: 30,
        features: {
          contactRequestsPerDay: 5,
          aiMatching: true,
          secureChat: true,
          profileBoost: 1,
          maxPhotos: 5,
          videoUpload: false,
          verificationPriority: "MEDIUM",
          featuredBadge: false,
          support: "EMAIL",
        },
      },
      {
        name: "Premium Gold",
        description: "Perfect tier for active matches and faster verification.",
        price: 199900, // ₹1999.00
        durationDays: 30,
        features: {
          contactRequestsPerDay: 10,
          aiMatching: true,
          secureChat: true,
          profileBoost: 3,
          maxPhotos: 10,
          videoUpload: false,
          verificationPriority: "HIGH",
          featuredBadge: true,
          support: "24/7_CHAT",
        },
      },
      {
        name: "Premium Platinum",
        description: "Maximum compatibility analytics and unlimited photo assets.",
        price: 349900, // ₹3499.00
        durationDays: 30,
        features: {
          contactRequestsPerDay: 25,
          aiMatching: true,
          secureChat: true,
          profileBoost: 4,
          maxPhotos: 999,
          videoUpload: true,
          verificationPriority: "INSTANT",
          featuredBadge: true,
          support: "DEDICATED_MANAGER",
        },
      },
    ];

    try {
      for (const planData of defaultPlans) {
        await prisma.plan.create({
          data: {
            name: planData.name,
            description: planData.description,
            price: planData.price,
            durationDays: planData.durationDays,
            features: planData.features as any,
            active: true,
          },
        });
      }
    } catch {
      // Unmigrated local DB
    }
  }
}
