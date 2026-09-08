import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { astrologyService } from "@/modules/astrology/astrology.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/astrology/history
 * Secure, authenticated endpoint to retrieve user's private horoscope match history.
 * Optional query parameter: ?checkId=<id> for individual report details with strict IDOR verification.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionAction();

    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        {
          status: 401,
          headers: {
            "Cache-Control": "private, no-store, max-age=0",
          },
        }
      );
    }

    const { searchParams } = new URL(req.url);
    const checkId = searchParams.get("checkId");

    if (checkId) {
      try {
        const detail = await astrologyService.getMatchHistoryDetail(session.user.id, checkId);
        return NextResponse.json(detail, {
          status: 200,
          headers: { "Cache-Control": "private, no-store, max-age=0" },
        });
      } catch (err: any) {
        if (err.message === "RECORD_NOT_FOUND" || err.message === "UNAUTHORIZED") {
          return NextResponse.json(
            { success: false, error: "Match report not found or access unauthorized." },
            { status: 404, headers: { "Cache-Control": "private, no-store, max-age=0" } }
          );
        }
        throw err;
      }
    }

    const history = await astrologyService.getMatchHistory(session.user.id);

    return NextResponse.json(
      {
        success: true,
        history,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch (err: any) {
    console.error("[API /api/astrology/history] Error:", err.message);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve horoscope history." },
      {
        status: 500,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      }
    );
  }
}
