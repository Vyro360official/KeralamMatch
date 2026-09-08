import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { astrologyService } from "@/modules/astrology/astrology.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/astrology/single?profileId=...
 * Authenticated endpoint to retrieve single candidate's authentic 3-page horoscope & uploaded document.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionAction();

    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId") || session.user.id;

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: "Profile ID is required." },
        { status: 400 }
      );
    }

    const data = await astrologyService.getSingleHoroscope(profileId);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("[SingleHoroscopeAPI] Error:", err.message);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load horoscope details." },
      { status: 500 }
    );
  }
}
