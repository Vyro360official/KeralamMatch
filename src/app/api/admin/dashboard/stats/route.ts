import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

/**
 * Calculates start and end dates for the selected range and its preceding comparison period.
 */
function getRangeDateWindows(range: string) {
  const now = new Date();
  let currentStart: Date;
  let priorStart: Date;
  let priorEnd: Date;

  switch (range) {
    case "today": {
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      priorEnd = new Date(currentStart);
      priorStart = new Date(currentStart);
      priorStart.setDate(priorStart.getDate() - 1);
      break;
    }
    case "7d": {
      currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      priorEnd = new Date(currentStart);
      priorStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      break;
    }
    case "this_month": {
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      priorEnd = new Date(currentStart);
      priorStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    }
    case "all": {
      currentStart = new Date(0);
      priorEnd = new Date(0);
      priorStart = new Date(0);
      break;
    }
    case "30d":
    default: {
      currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      priorEnd = new Date(currentStart);
      priorStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      break;
    }
  }

  return { currentStart, priorStart, priorEnd, now };
}

interface GrowthResult {
  value: number | null;
  formatted: string;
  isPositive: boolean;
  hasComparison: boolean;
}

/**
 * Safe, accurate growth percentage calculation between current and prior windows.
 * Critical: Never displays a misleading +100% or +0.0% when prior is zero.
 */
function calculateGrowth(current: number, prior: number): GrowthResult {
  if (prior <= 0) {
    if (current > 0) {
      return { value: null, formatted: "New", isPositive: true, hasComparison: false };
    }
    return { value: null, formatted: "No previous data", isPositive: false, hasComparison: false };
  }
  const diff = ((current - prior) / prior) * 100;
  const rounded = Number(diff.toFixed(1));
  const isPositive = rounded >= 0;
  const formatted = `${isPositive ? "+" : ""}${rounded.toFixed(1)}%`;
  return { value: rounded, formatted, isPositive, hasComparison: true };
}

export async function GET(req: NextRequest) {
  // 1. Authorization Guard
  const auth = await requireAdminRole(req);
  if (auth.error) {
    return auth.response!;
  }

  const isSuperAdmin = auth.user?.role === "SUPER_ADMIN";

  try {
    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range") || "30d";
    const { currentStart, priorStart, priorEnd, now } = getRangeDateWindows(rangeParam);

    const isAllTime = rangeParam === "all";

    // 2. Parallel Database Aggregations
    const [
      totalUsersLifetime,
      verifiedUsersLifetime,
      activeSubscriptionsLifetime,
      allTimeRevenueAgg,
      periodRevenueAgg,
      priorRevenueAgg,
      newSignupsPeriod,
      newSignupsPrior,
      activeUsersPeriod,
      activeUsersPrior,
      verifiedUsersPeriod,
      verifiedUsersPrior,
      plansList,
      activeSubscriptionsGrouped,
      horoscopeChecksPeriodRaw,
      usersCreatedCumulativeRaw,
      verifiedProfilesCumulativeRaw,
      recentUsersRaw,
    ] = await Promise.all([
      // 1. Total Registered Users (Lifetime)
      prisma.user.count(),

      // 2. Verified Profiles (Lifetime)
      prisma.profile.count({ where: { verificationStatus: "VERIFIED" } }),

      // 3. Active Paid Subscriptions (Lifetime active)
      prisma.subscription.count({ where: { status: "ACTIVE" } }),

      // 4. All-time Revenue
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }),

      // 5. Period Revenue
      isAllTime
        ? prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: "SUCCESS" },
          })
        : prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: "SUCCESS", createdAt: { gte: currentStart } },
          }),

      // 6. Prior Period Revenue (for growth comparison)
      isAllTime
        ? Promise.resolve({ _sum: { amount: 0 } })
        : prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: "SUCCESS", createdAt: { gte: priorStart, lt: priorEnd } },
          }),

      // 7. New Signups in selected period
      isAllTime
        ? prisma.user.count()
        : prisma.user.count({ where: { createdAt: { gte: currentStart } } }),

      // 8. New Signups in prior period
      isAllTime
        ? Promise.resolve(0)
        : prisma.user.count({ where: { createdAt: { gte: priorStart, lt: priorEnd } } }),

      // 9. Active Users in selected period (logged in or updated)
      isAllTime
        ? prisma.user.count({
            where: {
              OR: [{ lastLogin: { not: null } }, { updatedAt: { gte: new Date(now.getTime() - 30 * 86400000) } }],
            },
          })
        : prisma.user.count({
            where: {
              OR: [{ lastLogin: { gte: currentStart } }, { updatedAt: { gte: currentStart } }],
            },
          }),

      // 10. Active Users in prior period
      isAllTime
        ? Promise.resolve(0)
        : prisma.user.count({
            where: {
              OR: [
                { lastLogin: { gte: priorStart, lt: priorEnd } },
                { updatedAt: { gte: priorStart, lt: priorEnd } },
              ],
            },
          }),

      // 11. Verified Profiles created in selected period
      isAllTime
        ? prisma.profile.count({ where: { verificationStatus: "VERIFIED" } })
        : prisma.profile.count({
            where: { verificationStatus: "VERIFIED", createdAt: { gte: currentStart } },
          }),

      // 12. Verified Profiles created in prior period
      isAllTime
        ? Promise.resolve(0)
        : prisma.profile.count({
            where: { verificationStatus: "VERIFIED", createdAt: { gte: priorStart, lt: priorEnd } },
          }),

      // 13. All Plans (for name lookup)
      prisma.plan.findMany({ select: { id: true, name: true } }).catch(() => []),

      // 14. Active Subscriptions grouped by plan
      prisma.subscription.groupBy({
        by: ["planId"],
        _count: { id: true },
        where: { status: "ACTIVE" },
      }),

      // 15. Horoscope Compatibility Checks in selected range
      prisma.horoscopeMatchCheck.findMany({
        where: isAllTime ? {} : { createdAt: { gte: currentStart } },
        select: {
          id: true,
          score: true,
          verdict: true,
          verdictMalayalam: true,
        },
      }),

      // 16. Timestamps of all users for trajectory
      prisma.user.findMany({
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),

      // 17. Timestamps of all verified profiles for trajectory
      prisma.profile.findMany({
        where: { verificationStatus: "VERIFIED" },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),

      // 18. Recent 5 Signups
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          phone: true,
          createdAt: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              verificationStatus: true,
            },
          },
        },
      }),
    ]);

    // 3. Format Currency & Growth Metrics
    const periodRevenue = Math.round((periodRevenueAgg._sum?.amount || 0) / 100);
    const priorRevenue = Math.round((priorRevenueAgg._sum?.amount || 0) / 100);
    const revenueGrowth = isAllTime ? { value: null, formatted: "All Time", isPositive: true, hasComparison: false } : calculateGrowth(periodRevenue, priorRevenue);
    const userGrowth = isAllTime ? { value: null, formatted: "All Time", isPositive: true, hasComparison: false } : calculateGrowth(totalUsersLifetime, Math.max(0, totalUsersLifetime - newSignupsPeriod));
    const verifiedGrowth = isAllTime ? { value: null, formatted: "All Time", isPositive: true, hasComparison: false } : calculateGrowth(verifiedUsersPeriod, verifiedUsersPrior);
    const activeUsersGrowth = isAllTime ? { value: null, formatted: "All Time", isPositive: true, hasComparison: false } : calculateGrowth(activeUsersPeriod, activeUsersPrior);
    const newSignupsGrowth = isAllTime ? { value: null, formatted: "All Time", isPositive: true, hasComparison: false } : calculateGrowth(newSignupsPeriod, newSignupsPrior);
    const premiumGrowth = { value: null, formatted: "Active", isPositive: true, hasComparison: false }; // Active subscriptions snapshot

    // 4. Subscription Distribution Donut
    const planNameMap = new Map(plansList.map((p) => [p.id, p.name]));
    const planColors = ["#FF1475", "#3A7DFF", "#F59E0B", "#10B981", "#8B5CF6", "#06B6D4"];

    let totalPaidMembers = 0;
    const paidSegments = activeSubscriptionsGrouped.map((item, idx) => {
      const planName = planNameMap.get(item.planId) || "Premium";
      totalPaidMembers += item._count.id;
      return {
        name: planName,
        count: item._count.id,
        color: planColors[(idx + 1) % planColors.length],
      };
    });

    const freeMembersCount = Math.max(0, totalUsersLifetime - totalPaidMembers);
    const totalMembersForDonut = totalUsersLifetime;

    const subscriptionSegments: Array<{ name: string; count: number; percentage: number; color: string }> = [];

    if (totalMembersForDonut > 0) {
      if (freeMembersCount > 0) {
        subscriptionSegments.push({
          name: "Free",
          count: freeMembersCount,
          percentage: Number(((freeMembersCount / totalMembersForDonut) * 100).toFixed(1)),
          color: "#FF1475",
        });
      }
      paidSegments.forEach((seg, idx) => {
        subscriptionSegments.push({
          name: seg.name,
          count: seg.count,
          percentage: Number(((seg.count / totalMembersForDonut) * 100).toFixed(1)),
          color: seg.color || planColors[(idx + 1) % planColors.length],
        });
      });
    }

    // 5. Horoscope Compatibility Checks Donut
    const totalHoroscopeChecks = horoscopeChecksPeriodRaw.length;
    let excellentCount = 0;
    let goodCount = 0;
    let averageCount = 0;
    let lowCount = 0;

    horoscopeChecksPeriodRaw.forEach((chk) => {
      const score = chk.score || 0;
      const verdict = (chk.verdict || "").toUpperCase();
      const verdictMal = chk.verdictMalayalam || "";

      if (score >= 6.5 || verdict.includes("EXCELLENT") || verdictMal.includes("ഉത്തമം")) {
        excellentCount++;
      } else if (score >= 4.0 || verdict.includes("MODERATE") || verdictMal.includes("മദ്ധ്യമം")) {
        goodCount++;
      } else if (score >= 2.0 || verdict.includes("AVERAGE")) {
        averageCount++;
      } else {
        lowCount++;
      }
    });

    const horoscopeSegments = [
      {
        name: "Excellent (30-36)",
        shortName: "Excellent",
        count: excellentCount,
        percentage: totalHoroscopeChecks > 0 ? Number(((excellentCount / totalHoroscopeChecks) * 100).toFixed(1)) : 0,
        color: "#10B981", // Emerald
      },
      {
        name: "Good (18-29)",
        shortName: "Good",
        count: goodCount,
        percentage: totalHoroscopeChecks > 0 ? Number(((goodCount / totalHoroscopeChecks) * 100).toFixed(1)) : 0,
        color: "#3A7DFF", // Royal Blue
      },
      {
        name: "Average (7-17)",
        shortName: "Average",
        count: averageCount,
        percentage: totalHoroscopeChecks > 0 ? Number(((averageCount / totalHoroscopeChecks) * 100).toFixed(1)) : 0,
        color: "#F59E0B", // Gold / Amber
      },
      {
        name: "Low (0-6)",
        shortName: "Low",
        count: lowCount,
        percentage: totalHoroscopeChecks > 0 ? Number(((lowCount / totalHoroscopeChecks) * 100).toFixed(1)) : 0,
        color: "#FF1475", // Crimson / Red
      },
    ];

    // 6. Users vs Horoscope Checks (Last 6 Months Stacked Bar)
    const monthBuckets: Array<{
      monthKey: string;
      label: string;
      start: Date;
      end: Date;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const label = d.toLocaleDateString("en-IN", { month: "short" });
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthBuckets.push({ monthKey, label, start, end });
    }

    const stackedBarData = await Promise.all(
      monthBuckets.map(async (b) => {
        const [totalInMonth, uniqueHoroscopeUsersInMonth, checksInMonth] = await Promise.all([
          prisma.user.count({
            where: { createdAt: { gte: b.start, lte: b.end } },
          }),
          prisma.horoscopeMatchCheck
            .findMany({
              where: {
                createdAt: { gte: b.start, lte: b.end },
              },
              select: { userId: true },
              distinct: ["userId"],
            })
            .then((r) => r.length),
          prisma.horoscopeMatchCheck.count({
            where: { createdAt: { gte: b.start, lte: b.end } },
          }),
        ]);

        return {
          month: b.label,
          monthKey: b.monthKey,
          totalUsers: totalInMonth,
          usedHoroscope: uniqueHoroscopeUsersInMonth,
          totalChecks: checksInMonth,
          combinedTotal: totalInMonth + uniqueHoroscopeUsersInMonth,
        };
      })
    );

    const uniqueHoroscopeUsersAllTime = await prisma.horoscopeMatchCheck
      .findMany({
        select: { userId: true },
        distinct: ["userId"],
      })
      .then((r) => r.length);

    const horoscopeAdoptionRate =
      totalUsersLifetime > 0
        ? Number(((uniqueHoroscopeUsersAllTime / totalUsersLifetime) * 100).toFixed(1))
        : 0;

    // 7. User Growth Overview (Line / Area Chart across selected range)
    const chartWindowStart = isAllTime
      ? usersCreatedCumulativeRaw.length > 0
        ? usersCreatedCumulativeRaw[0].createdAt
        : new Date(now.getTime() - 30 * 86400000)
      : currentStart;

    const intervalCount = 9;
    const chartTimeSpan = Math.max(1, now.getTime() - chartWindowStart.getTime());
    const stepMs = chartTimeSpan / (intervalCount - 1);

    const userGrowthTimeline: Array<{
      date: string;
      label: string;
      totalUsers: number;
      verifiedUsers: number;
    }> = [];

    for (let step = 0; step < intervalCount; step++) {
      const stepDate = new Date(chartWindowStart.getTime() + step * stepMs);
      const dateLabel = stepDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

      let cumulativeTotal = 0;
      for (const u of usersCreatedCumulativeRaw) {
        if (u.createdAt <= stepDate) cumulativeTotal++;
        else break;
      }

      let cumulativeVerified = 0;
      for (const v of verifiedProfilesCumulativeRaw) {
        if (v.createdAt <= stepDate) cumulativeVerified++;
        else break;
      }

      userGrowthTimeline.push({
        date: stepDate.toISOString(),
        label: dateLabel,
        totalUsers: cumulativeTotal,
        verifiedUsers: cumulativeVerified,
      });
    }

    // 8. Recent Signups Table (Masked for RBAC)
    const recentSignups = recentUsersRaw.map((u, idx) => {
      const firstName = u.profile?.firstName || "Member";
      const lastName = u.profile?.lastName ? ` ${u.profile.lastName.charAt(0)}.` : "";
      const rawEmail = u.email || "";

      let displayEmail = rawEmail;
      if (!isSuperAdmin && rawEmail.includes("@")) {
        const [userPart, domain] = rawEmail.split("@");
        const maskedUser = userPart.length > 2 ? `${userPart.substring(0, 2)}***` : `${userPart}***`;
        displayEmail = `${maskedUser}@${domain}`;
      }

      const isVerified = u.profile?.verificationStatus === "VERIFIED";

      return {
        index: idx + 1,
        id: u.id,
        name: `${firstName}${lastName}`.trim(),
        email: displayEmail,
        registeredOn: u.createdAt.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: isVerified ? "Verified" : "Pending",
      };
    });

    return NextResponse.json({
      success: true,
      range: rangeParam,
      kpis: {
        totalUsers: {
          value: totalUsersLifetime,
          growth: userGrowth.formatted,
          isPositive: userGrowth.isPositive,
        },
        verifiedUsers: {
          value: verifiedUsersLifetime,
          growth: verifiedGrowth.formatted,
          isPositive: verifiedGrowth.isPositive,
        },
        activeUsers: {
          value: activeUsersPeriod,
          growth: activeUsersGrowth.formatted,
          isPositive: activeUsersGrowth.isPositive,
        },
        newSignups: {
          value: newSignupsPeriod,
          growth: newSignupsGrowth.formatted,
          isPositive: newSignupsGrowth.isPositive,
        },
        premiumMembers: {
          value: activeSubscriptionsLifetime,
          growth: premiumGrowth.formatted,
          isPositive: premiumGrowth.isPositive,
        },
        totalRevenue: {
          value: periodRevenue,
          growth: revenueGrowth.formatted,
          isPositive: revenueGrowth.isPositive,
          allTimeValue: Math.round((allTimeRevenueAgg._sum?.amount || 0) / 100),
        },
      },
      subscriptionDonut: {
        totalMembers: totalMembersForDonut,
        segments: subscriptionSegments,
      },
      horoscopeDonut: {
        totalChecks: totalHoroscopeChecks,
        segments: horoscopeSegments,
      },
      usersVsHoroscope: {
        months: stackedBarData,
        adoptionRate: horoscopeAdoptionRate,
        uniqueHoroscopeUsers: uniqueHoroscopeUsersAllTime,
        totalRegisteredUsers: totalUsersLifetime,
      },
      userGrowthChart: userGrowthTimeline,
      recentSignups,
    });
  } catch (error: any) {
    console.error("[AdminDashboardAPI] Aggregation Error:", error);
    return NextResponse.json(
      { success: false, error: "DATABASE_ERROR", message: "Failed to load live admin statistics" },
      { status: 500 }
    );
  }
}
