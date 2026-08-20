import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // 1. KM-01: Server-Side Authorization Guard
  const auth = await requireAdminRole(req);
  if (auth.error) {
    return auth.response!;
  }

  try {
    // 2. KM-02: Live Database Aggregations
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      verifiedUsers,
      activeSubscriptions,
      paymentAggregate,
      newUsersToday,
      contactRequestsToday,
      messagesToday,
      pendingVerifications,
    ] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.profile.count({ where: { verificationStatus: "VERIFIED" } }).catch(() => 0),
      prisma.subscription.count({ where: { status: "ACTIVE" } }).catch(() => 0),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }).catch(() => ({ _sum: { amount: 0 } })),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),
      prisma.contactRequest.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),
      prisma.message.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),
      prisma.profile.count({ where: { verificationStatus: "PENDING" } }).catch(() => 0),
    ]);

    const totalRevenue = paymentAggregate._sum.amount || 0;

    return NextResponse.json({
      success: true,
      totalUsers,
      verifiedUsers,
      activeSubscriptions,
      totalRevenue,
      newUsersToday,
      contactRequestsToday,
      messagesToday,
      pendingVerifications,
    });
  } catch (error) {
    console.error("Admin stats aggregation error:", error);
    return NextResponse.json(
      { success: false, error: "DATABASE_ERROR", message: "Failed to load live admin metrics" },
      { status: 500 }
    );
  }
}
