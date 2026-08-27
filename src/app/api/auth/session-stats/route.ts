import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { getProfileDetailsAction } from "@/modules/profile/profile.controller";
import { getWalletBalanceAction } from "@/modules/wallet/wallet.controller";
import { getActiveSubscriptionAction } from "@/modules/subscription/subscription.controller";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

    const userId = session.user.id;

    const [profileRes, walletRes, subRes, messageCount, requestCount, notificationsCount] = await Promise.all([
      getProfileDetailsAction(),
      getWalletBalanceAction(),
      getActiveSubscriptionAction(),
      prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false
        }
      }).catch(() => 0),
      prisma.contactRequest.count({
        where: {
          receiverId: userId,
          status: "PENDING"
        }
      }).catch(() => 0),
      prisma.notification.count({
        where: {
          userId: userId,
          isRead: false
        }
      }).catch(() => 0),
    ]);

    return NextResponse.json({
      isAuthenticated: true,
      user: session.user,
      profile: profileRes.success ? profileRes.profile : null,
      walletBalance: walletRes.success ? walletRes.balance : 0,
      subscription: subRes.success ? subRes.subscription : null,
      unreadMessagesCount: messageCount,
      pendingRequestsCount: requestCount,
      unreadNotificationsCount: notificationsCount,
    });
  } catch (error) {
    console.error("Session stats retrieval failed:", error);
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  }
}
