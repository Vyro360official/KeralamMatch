import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

/**
 * Calculates start date based on requested dynamic range
 */
function getRangeStartDate(range: string): Date {
  const now = new Date();
  switch (range) {
    case "today": {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      return today;
    }
    case "7d": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case "this_month": {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    case "all": {
      return new Date(0);
    }
    case "30d":
    default: {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return d;
    }
  }
}

export async function GET(req: NextRequest) {
  // 1. Authorization Guard
  const auth = await requireAdminRole(req);
  if (auth.error) {
    return auth.response!;
  }

  try {
    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range") || "30d";
    const startDate = getRangeStartDate(rangeParam);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // 2. Strict Real Database Parallel Aggregations (Zero Mock Rule)
    const [
      totalUsers,
      verifiedUsers,
      activeSubscriptions,
      allTimeRevenueAgg,
      periodRevenueAgg,
      todayRevenueAgg,
      newUsersPeriod,
      newUsersToday,
      activeUsersPeriod,
      contactRequestsPeriod,
      contactRequestsToday,
      horoscopeChecksPeriod,
      nonRegChecksPeriod,
      messagesPeriod,
      messagesToday,
      pendingVerifications,
      staleVerificationsCount,
      unresolvedReportsCount,
      failedPayments24hCount,
      planDistributionRaw,
      recentUsersRaw,
      pendingVerificationsRaw,
      usersCreatedInPeriodRaw,
    ] = await Promise.all([
      // Total Users
      prisma.user.count(),

      // Verified Profiles
      prisma.profile.count({ where: { verificationStatus: "VERIFIED" } }),

      // Active Subscriptions
      prisma.subscription.count({ where: { status: "ACTIVE" } }),

      // All-time successful revenue (in INR)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }),

      // Revenue in selected period
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS", createdAt: { gte: startDate } },
      }),

      // Revenue Today
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS", createdAt: { gte: startOfToday } },
      }),

      // New Users in period
      prisma.user.count({ where: { createdAt: { gte: startDate } } }),

      // New Users Today
      prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),

      // Active Users (logged in or updated in period)
      prisma.user.count({
        where: {
          OR: [
            { lastLogin: { gte: startDate } },
            { updatedAt: { gte: startDate } },
          ],
        },
      }),

      // Contact Requests in period
      prisma.contactRequest.count({ where: { createdAt: { gte: startDate } } }),

      // Contact Requests Today
      prisma.contactRequest.count({ where: { createdAt: { gte: startOfToday } } }),

      // Horoscope Checks in period
      prisma.horoscopeMatchCheck.count({ where: { createdAt: { gte: startDate } } }),

      // Non-registered candidate checks in period
      prisma.horoscopeMatchCheck.count({
        where: { matchType: "NEW_PERSON", createdAt: { gte: startDate } },
      }),

      // Messages in period
      prisma.message.count({ where: { createdAt: { gte: startDate } } }),

      // Messages Today
      prisma.message.count({ where: { createdAt: { gte: startOfToday } } }),

      // Pending Verifications Total
      prisma.profile.count({ where: { verificationStatus: "PENDING" } }),

      // Smart Alert: Verifications waiting > 24 hours
      prisma.profile.count({
        where: { verificationStatus: "PENDING", createdAt: { lte: twentyFourHoursAgo } },
      }),

      // Smart Alert: Unresolved safety reports
      prisma.report.count({ where: { status: "PENDING" } }),

      // Smart Alert: Failed payments in last 24h
      prisma.payment.count({
        where: { status: "FAILED", createdAt: { gte: twentyFourHoursAgo } },
      }),

      // Subscription Plan distribution
      prisma.subscription.groupBy({
        by: ["planId"],
        _count: { id: true },
        where: { status: "ACTIVE" },
      }),

      // Recent Registrations (top 5)
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          phone: true,
          email: true,
          role: true,
          createdAt: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              gender: true,
              district: true,
              verificationStatus: true,
              profileSource: true,
            },
          },
          subscriptions: {
            where: { status: "ACTIVE" },
            take: 1,
            select: { plan: { select: { name: true } } },
          },
        },
      }),

      // Recent Pending Verifications (top 5)
      prisma.profile.findMany({
        where: { verificationStatus: "PENDING" },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          gender: true,
          district: true,
          verificationStatus: true,
          verifiedSelfie: true,
          verifiedAadhaar: true,
          createdAt: true,
          user: {
            select: {
              phone: true,
              email: true,
            },
          },
        },
      }),

      // Real User Signups for Trajectory Chart (grouped by date)
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Format amounts (Paise to INR)
    const allTimeRevenue = Math.round((allTimeRevenueAgg._sum.amount || 0) / 100);
    const periodRevenue = Math.round((periodRevenueAgg._sum.amount || 0) / 100);
    const todayRevenue = Math.round((todayRevenueAgg._sum.amount || 0) / 100);

    // Build real trajectory time series buckets
    const bucketMap: Record<string, { total: number; label: string }> = {};
    const daysCount = rangeParam === "today" ? 1 : rangeParam === "7d" ? 7 : rangeParam === "30d" ? 14 : 10;
    const intervalMs = (now.getTime() - startDate.getTime()) / daysCount;

    for (let i = 0; i < daysCount; i++) {
      const bucketDate = new Date(startDate.getTime() + i * intervalMs);
      const key = bucketDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      bucketMap[key] = { total: 0, label: key };
    }

    usersCreatedInPeriodRaw.forEach((u) => {
      const key = u.createdAt.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      if (bucketMap[key]) {
        bucketMap[key].total += 1;
      }
    });

    const trajectoryChart = Object.values(bucketMap);

    // Build real plan distribution
    const plans = await prisma.plan.findMany({ select: { id: true, name: true } });
    const planNameMap = new Map(plans.map((p) => [p.id, p.name]));
    const planDistribution = planDistributionRaw.map((p) => ({
      planId: p.planId,
      name: planNameMap.get(p.planId) || "Standard",
      count: p._count.id,
    }));

    // If no paid plans active yet, reflect actual free vs paid count
    if (planDistribution.length === 0 && totalUsers > 0) {
      planDistribution.push({
        planId: "free",
        name: "Standard Free",
        count: totalUsers,
      });
    }

    return NextResponse.json({
      success: true,
      range: rangeParam,
      kpis: {
        // Row 1: Business & Members
        totalUsers,
        verifiedUsers,
        activeUsers: activeUsersPeriod,
        newUsers: newUsersPeriod,
        newUsersToday,
        premiumMembers: activeSubscriptions,
        allTimeRevenue,
        periodRevenue,
        todayRevenue,

        // Row 2: Operations & Match Activity
        contactRequests: contactRequestsPeriod,
        contactRequestsToday,
        horoscopeChecks: horoscopeChecksPeriod,
        nonRegChecks: nonRegChecksPeriod,
        messagesCount: messagesPeriod,
        messagesToday,
        pendingVerifications,
      },
      smartAlerts: {
        staleVerificationsCount,
        unresolvedReportsCount,
        failedPayments24hCount,
      },
      trajectoryChart,
      planDistribution,
      recentUsers: recentUsersRaw.map((u) => ({
        id: u.id,
        name: u.profile ? `${u.profile.firstName} ${u.profile.lastName}`.trim() : "Member",
        phone: u.phone,
        email: u.email,
        gender: u.profile?.gender || "N/A",
        district: u.profile?.district || "Kerala",
        plan: u.subscriptions[0]?.plan?.name || "Free",
        verificationStatus: u.profile?.verificationStatus || "UNVERIFIED",
        profileSource: u.profile?.profileSource || "SELF_REGISTERED",
        createdAt: u.createdAt.toISOString(),
      })),
      pendingVerificationsList: pendingVerificationsRaw.map((v) => ({
        profileId: v.id,
        userId: v.userId,
        name: `${v.firstName} ${v.lastName}`.trim(),
        gender: v.gender,
        district: v.district,
        phone: v.user?.phone || "N/A",
        email: v.user?.email || "N/A",
        hasSelfie: v.verifiedSelfie,
        hasAadhaar: v.verifiedAadhaar,
        createdAt: v.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("[AdminDashboardAPI] Aggregation Error:", error);
    return NextResponse.json(
      { success: false, error: "DATABASE_ERROR", message: "Failed to load live admin statistics" },
      { status: 500 }
    );
  }
}
