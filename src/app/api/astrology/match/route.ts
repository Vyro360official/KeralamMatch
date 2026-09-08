import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { astrologyService, AstrologyValidationError } from "@/modules/astrology/astrology.service";
import { AstrologyServiceUnavailableError } from "@/modules/astrology/astrology.adapter";

export const dynamic = "force-dynamic";

/**
 * POST /api/astrology/match
 * Secure, authenticated endpoint for real-time horoscope compatibility calculation.
 */
export async function POST(req: NextRequest) {
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

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { targetProfileId, includeReportHtml = true } = body;

    if (!targetProfileId || typeof targetProfileId !== "string") {
      return NextResponse.json(
        { success: false, error: "Target profile ID is required." },
        { status: 400 }
      );
    }

    const result = await astrologyService.calculateMatch(
      session.user.id,
      targetProfileId,
      Boolean(includeReportHtml)
    );

    return NextResponse.json(
      {
        success: true,
        result,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch (err: any) {
    if (err instanceof AstrologyValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: "Complete birth details are required for horoscope matching.",
          details: err.details,
        },
        {
          status: 400,
          headers: { "Cache-Control": "private, no-store, max-age=0" },
        }
      );
    }

    if (err.message === "CANNOT_MATCH_SELF") {
      return NextResponse.json(
        {
          success: false,
          error: "You are not allowed to perform this action on your own profile.",
        },
        {
          status: 403,
          headers: { "Cache-Control": "private, no-store, max-age=0" },
        }
      );
    }

    if (err.message === "TARGET_PROFILE_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "Profile not found." },
        {
          status: 404,
          headers: { "Cache-Control": "private, no-store, max-age=0" },
        }
      );
    }

    if (err instanceof AstrologyServiceUnavailableError) {
      return NextResponse.json(
        {
          success: false,
          error: "Horoscope matching is temporarily unavailable in this environment.",
        },
        {
          status: 503,
          headers: { "Cache-Control": "private, no-store, max-age=0" },
        }
      );
    }

    console.error("[API /api/astrology/match] Error:", err.message);
    return NextResponse.json(
      { success: false, error: "Horoscope matching is temporarily unavailable." },
      {
        status: 500,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      }
    );
  }
}
