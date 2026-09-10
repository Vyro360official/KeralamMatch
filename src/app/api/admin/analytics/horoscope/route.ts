import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

function getRangeStartDate(range: string): Date {
  const now = new Date();
  switch (range) {
    case "today": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
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
  const auth = await requireAdminRole(req);
  if (auth.error) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";
    const startDate = getRangeStartDate(range);

    // Live queries
    const [
      allChecks,
      totalAllTime,
      totalRegisteredAllTime,
      totalNewPersonAllTime,
      uniqueUsersRaw,
      topProfilesRaw,
      topUsersRaw,
    ] = await Promise.all([
      // Checks within period for charts and detailed aggregates
      prisma.horoscopeMatchCheck.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          id: true,
          userId: true,
          matchType: true,
          score: true,
          verdict: true,
          marketingConsent: true,
          reportSummary: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),

      // All-time total checks
      prisma.horoscopeMatchCheck.count(),

      // All-time registered checks
      prisma.horoscopeMatchCheck.count({ where: { matchType: "REGISTERED_PROFILE" } }),

      // All-time new person checks
      prisma.horoscopeMatchCheck.count({ where: { matchType: "NEW_PERSON" } }),

      // Unique users who initiated checks in period
      prisma.horoscopeMatchCheck.groupBy({
        by: ["userId"],
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
      }),

      // Top 10 most checked registered target profiles
      prisma.horoscopeMatchCheck.groupBy({
        by: ["targetProfileId"],
        where: {
          targetProfileId: { not: null },
          matchType: "REGISTERED_PROFILE",
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),

      // Top 10 most active users running checks
      prisma.horoscopeMatchCheck.groupBy({
        by: ["userId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
    ]);

    const periodTotal = allChecks.length;
    const registeredInPeriod = allChecks.filter((c) => c.matchType === "REGISTERED_PROFILE").length;
    const newPersonInPeriod = allChecks.filter((c) => c.matchType === "NEW_PERSON").length;
    const consentedInPeriod = allChecks.filter(
      (c) => c.matchType === "NEW_PERSON" && c.marketingConsent === true
    ).length;

    // 1. Summary KPIs
    const avgScore =
      periodTotal > 0
        ? Math.round((allChecks.reduce((acc, c) => acc + (c.score || 0), 0) / periodTotal) * 10) / 10
        : 0;

    const highMatchChecks = allChecks.filter(
      (c) =>
        (c.score && c.score >= 20) ||
        (c.verdict && (c.verdict.toLowerCase().includes("uthamam") || c.verdict.toLowerCase().includes("excellent")))
    ).length;

    const highMatchRate = periodTotal > 0 ? Math.round((highMatchChecks / periodTotal) * 100) : 0;
    const consentRate =
      newPersonInPeriod > 0 ? Math.round((consentedInPeriod / newPersonInPeriod) * 100) : 0;

    // 2. Verdict Distribution
    const verdictCounts: Record<string, number> = {
      Uthamam: 0,
      Madhyamam: 0,
      Adhamam: 0,
    };

    allChecks.forEach((c) => {
      const v = (c.verdict || "").toLowerCase();
      if (v.includes("uthamam") || v.includes("excellent") || (c.score && c.score >= 21)) {
        verdictCounts.Uthamam += 1;
      } else if (v.includes("madhyamam") || v.includes("moderate") || (c.score && c.score >= 13)) {
        verdictCounts.Madhyamam += 1;
      } else {
        verdictCounts.Adhamam += 1;
      }
    });

    // 3. 10-Porutham Pass/Fail Breakdown
    const poruthamsList = [
      "Dina",
      "Gana",
      "Mahendra",
      "Sthree Deergha",
      "Yoni",
      "Rasi",
      "Rashyadhipa",
      "Vasya",
      "Rajju",
      "Vedha",
    ];

    const poruthamStats: Record<string, { pass: number; fail: number }> = {};
    poruthamsList.forEach((p) => {
      poruthamStats[p] = { pass: 0, fail: 0 };
    });

    allChecks.forEach((c) => {
      if (c.reportSummary && typeof c.reportSummary === "object") {
        const items = (c.reportSummary as any).poruthamItems || (c.reportSummary as any).items || [];
        if (Array.isArray(items)) {
          items.forEach((item: any) => {
            const name = item.nameEnglish || item.name || item.nameMalayalam || "";
            for (const key of poruthamsList) {
              if (name.toLowerCase().includes(key.toLowerCase())) {
                if (item.status === "PASSED" || item.isCompatible === true || item.score > 0) {
                  poruthamStats[key].pass += 1;
                } else {
                  poruthamStats[key].fail += 1;
                }
                break;
              }
            }
          });
        }
      }
    });

    // 4. Hourly Usage Distribution (0 to 23 hours)
    const hourlyCounts = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      count: 0,
    }));

    allChecks.forEach((c) => {
      const hour = new Date(c.createdAt).getHours();
      if (hourlyCounts[hour]) {
        hourlyCounts[hour].count += 1;
      }
    });

    // 5. Volume Trend Series
    const trendMap: Record<string, { date: string; registered: number; newPerson: number; total: number }> = {};
    allChecks.forEach((c) => {
      const key = new Date(c.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      if (!trendMap[key]) {
        trendMap[key] = { date: key, registered: 0, newPerson: 0, total: 0 };
      }
      if (c.matchType === "NEW_PERSON") {
        trendMap[key].newPerson += 1;
      } else {
        trendMap[key].registered += 1;
      }
      trendMap[key].total += 1;
    });
    const volumeTrend = Object.values(trendMap);

    // 6. Populate Top Profiles & Users details
    const topProfileIds = topProfilesRaw
      .map((p) => p.targetProfileId)
      .filter(Boolean) as string[];

    const profilesMeta = await prisma.profile.findMany({
      where: { id: { in: topProfileIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        gender: true,
        district: true,
        starNakshatram: true,
      },
    });
    const profileMetaMap = new Map(profilesMeta.map((p) => [p.id, p]));

    const topUserIds = topUsersRaw.map((u) => u.userId);
    const usersMeta = await prisma.user.findMany({
      where: { id: { in: topUserIds } },
      select: {
        id: true,
        phone: true,
        email: true,
        profile: { select: { firstName: true, lastName: true, district: true } },
      },
    });
    const userMetaMap = new Map(usersMeta.map((u) => [u.id, u]));

    const topProfiles = topProfilesRaw
      .filter((p) => p.targetProfileId)
      .map((p) => {
        const meta = profileMetaMap.get(p.targetProfileId!);
        return {
          profileId: p.targetProfileId,
          checkCount: p._count.id,
          name: meta ? `${meta.firstName} ${meta.lastName}`.trim() : "Profile Member",
          gender: meta?.gender || "N/A",
          district: meta?.district || "Kerala",
          star: meta?.starNakshatram || "N/A",
        };
      });

    const topUsers = topUsersRaw.map((u) => {
      const meta = userMetaMap.get(u.userId);
      return {
        userId: u.userId,
        checkCount: u._count.id,
        name: meta?.profile ? `${meta.profile.firstName} ${meta.profile.lastName}`.trim() : meta?.email || "Member",
        phone: meta?.phone || "N/A",
        district: meta?.profile?.district || "Kerala",
      };
    });

    return NextResponse.json({
      success: true,
      range,
      kpis: {
        totalChecksPeriod: periodTotal,
        totalChecksAllTime: totalAllTime,
        registeredChecks: registeredInPeriod,
        newPersonChecks: newPersonInPeriod,
        uniqueUsers: uniqueUsersRaw.length,
        avgCompatibilityScore: avgScore,
        highMatchRate,
        consentConversionRate: consentRate,
      },
      distribution: {
        allTime: {
          registered: totalRegisteredAllTime,
          newPerson: totalNewPersonAllTime,
        },
        verdicts: verdictCounts,
        poruthamStats: Object.entries(poruthamStats).map(([name, stat]) => ({
          name,
          pass: stat.pass,
          fail: stat.fail,
          rate: stat.pass + stat.fail > 0 ? Math.round((stat.pass / (stat.pass + stat.fail)) * 100) : 0,
        })),
      },
      hourlyDistribution: hourlyCounts,
      volumeTrend,
      topProfiles,
      topUsers,
    });
  } catch (err: any) {
    console.error("[HoroscopeAnalyticsAPI] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
