import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth-guard";
import { astrologyService } from "@/modules/astrology/astrology.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/horoscope-matches
 * Secure, authenticated administrative endpoint to view horoscope matches and usage statistics.
 * Strictly requires admin/superadmin privileges.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdminRole(req);
  if (auth.error) {
    return auth.response!;
  }

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const userId = url.searchParams.get("userId") || undefined;
    const matchType = url.searchParams.get("matchType") || undefined;
    const hasMobile = url.searchParams.get("hasMobile") || undefined;
    const consentFilter = url.searchParams.get("consentFilter") || undefined;
    const dateFilter = url.searchParams.get("dateFilter") || undefined;
    const startDate = url.searchParams.get("startDate") || undefined;
    const endDate = url.searchParams.get("endDate") || undefined;
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);

    // If usageOnly is requested for a specific user (Admin User Profile view)
    const usageOnly = url.searchParams.get("usageOnly") === "true";
    if (usageOnly && userId) {
      const usage = await astrologyService.getUserHoroscopeUsage(userId);
      return NextResponse.json(
        { success: true, usage },
        {
          status: 200,
          headers: { "Cache-Control": "private, no-store, max-age=0" },
        }
      );
    }

    // If statsOnly is requested
    const statsOnly = url.searchParams.get("statsOnly") === "true";
    if (statsOnly) {
      const stats = await astrologyService.getAdminHoroscopeStats();
      return NextResponse.json(
        { success: true, stats },
        {
          status: 200,
          headers: { "Cache-Control": "private, no-store, max-age=0" },
        }
      );
    }

    const [stats, result] = await Promise.all([
      astrologyService.getAdminHoroscopeStats(),
      astrologyService.getAdminHoroscopeMatches({
        search,
        userId,
        matchType,
        hasMobile,
        consentFilter,
        dateFilter,
        startDate,
        endDate,
        page,
        limit,
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        stats,
        matches: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      {
        status: 200,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      }
    );
  } catch (err: any) {
    console.error("[API /api/admin/horoscope-matches] Error:", err.message);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve horoscope matches." },
      {
        status: 500,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      }
    );
  }
}
