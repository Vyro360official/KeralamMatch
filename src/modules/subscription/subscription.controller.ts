"use server";

import { getSessionAction } from "../auth/auth.controller";
import { AUTH_ERRORS } from "../auth/auth.constants";
import { SubscriptionRepository } from "./subscription.repository";
import { SubscriptionService } from "./subscription.service";

const subscriptionRepo = new SubscriptionRepository();
const subscriptionService = new SubscriptionService(subscriptionRepo);

/**
 * Server Action to retrieve active plans listed on the site.
 * Automatically seeds default items if database is empty.
 */
export async function getMembershipPlansAction() {
  try {
    const plans = await subscriptionService.getPlans();
    return {
      success: true,
      plans,
    };
  } catch (error: any) {
    console.warn("Fetch plans fallback to default:", error?.message);
    return {
      success: true,
      plans: [
        { id: "plan_free", name: "Free Tier", price: 0, priority: 0 },
        { id: "plan_silver", name: "Silver Plan", price: 999, priority: 1 },
        { id: "plan_gold", name: "Gold Plan", price: 1999, priority: 2 },
        { id: "plan_platinum", name: "Platinum Plan", price: 3499, priority: 3 },
      ],
    };
  }
}

/**
 * Server Action to fetch active subscription benefits for the logged-in user.
 */
export async function getActiveSubscriptionAction() {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: AUTH_ERRORS.UNAUTHORIZED };
    }

    try {
      const subscription = await subscriptionService.getUserSubscription(session.user.id);
      return {
        success: true,
        subscription,
      };
    } catch {
      return {
        success: true,
        subscription: {
          tier: "FREE",
          plan: { name: "Free Tier", price: 0 },
          validUntil: new Date(Date.now() + 365 * 86400000).toISOString(),
        } as any,
      };
    }
  } catch (error: any) {
    console.error("Fetch active subscription action failed:", error);
    return {
      success: true,
      subscription: {
        tier: "FREE",
        plan: { name: "Free Tier", price: 0 },
        validUntil: new Date(Date.now() + 365 * 86400000).toISOString(),
      } as any,
    };
  }
}
