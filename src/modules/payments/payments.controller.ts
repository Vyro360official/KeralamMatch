"use server";

import { getSessionAction } from "../auth/auth.controller";
import { AUTH_ERRORS } from "../auth/auth.constants";
import { PaymentsRepository } from "./payments.repository";
import { PaymentsService } from "./payments.service";

const paymentsRepo = new PaymentsRepository();
const paymentsService = new PaymentsService(paymentsRepo);

/**
 * Server Action to initialize a Razorpay order for a subscription upgrade
 */
export async function checkoutSubscriptionAction(planId: string) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: AUTH_ERRORS.UNAUTHORIZED };
    }

    const order = await paymentsService.createSubscriptionOrder(session.user.id, planId);

    return {
      success: true,
      order,
    };
  } catch (error: any) {
    console.error("Subscription checkout server action failed:", error);
    return {
      success: false,
      error: error.message || "FAILED_TO_INITIATE_CHECKOUT",
    };
  }
}

/**
 * Server Action to initialize a Razorpay order for wallet top-ups
 */
export async function checkoutWalletTopUpAction(amountPaise: number) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: AUTH_ERRORS.UNAUTHORIZED };
    }

    if (amountPaise <= 0) {
      return { success: false, error: "Top-up amount must be greater than zero." };
    }

    const order = await paymentsService.createWalletOrder(session.user.id, amountPaise);

    return {
      success: true,
      order,
    };
  } catch (error: any) {
    console.error("Wallet checkout server action failed:", error);
    return {
      success: false,
      error: error.message || "FAILED_TO_INITIATE_WALLET_TOPUP",
    };
  }
}
