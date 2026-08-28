import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET route handler to retrieve active session statistics and telemetry data.
 * Directly queries the database to prevent Server Action execution failures
 * inside route handler context.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

    const userId = session.user.id;

    // Direct database lookup for safety and reliability (prevents server action promise rejections)
    const [
      profile,
      wallet,
      subscription,
      messageCount,
      requestCount,
      notificationsCount
    ] = await Promise.all([
      // Profile
      prisma.profile.findFirst({
        where: { userId },
      }).catch(() => null),

      // Wallet
      prisma.wallet.findUnique({
        where: { userId },
      }).catch(() => null),

      // Active Subscription
      prisma.subscription.findFirst({
        where: { userId },
        include: { plan: true },
      }).catch(() => null),

      // Unread Messages Count
      prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false
        }
      }).catch(() => 0),

      // Pending Contact Requests Count
      prisma.contactRequest.count({
        where: {
          receiverId: userId,
          status: "PENDING"
        }
      }).catch(() => 0),

      // Unread Notifications Count
      prisma.notification.count({
        where: {
          userId: userId,
          isRead: false
        }
      }).catch(() => 0),
    ]);

    // Format DTOs for view
    const formattedProfile = profile
      ? {
          id: profile.id,
          userId: profile.userId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          gender: profile.gender,
          avatarUrl: (profile as any).avatarUrl || null,
          verificationStatus: profile.verificationStatus,
        }
      : null;

    const formattedSubscription = subscription
      ? {
          tier: subscription.plan?.name || "PREMIUM",
          validUntil: subscription.endDate instanceof Date ? subscription.endDate.toISOString() : new Date(subscription.endDate).toISOString(),
          plan: subscription.plan
            ? {
                id: subscription.plan.id,
                name: subscription.plan.name,
                price: subscription.plan.price,
              }
            : null,
        }
      : {
          tier: "FREE",
          plan: { name: "Free Plan", price: 0 },
          validUntil: new Date(Date.now() + 365 * 86400000).toISOString(),
        };

    return NextResponse.json({
      isAuthenticated: true,
      user: session.user,
      profile: formattedProfile,
      walletBalance: wallet ? wallet.balance : 0,
      subscription: formattedSubscription,
      unreadMessagesCount: messageCount,
      pendingRequestsCount: requestCount,
      unreadNotificationsCount: notificationsCount,
    });
  } catch (error) {
    console.error("Session stats retrieval failed:", error);
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  }
}
