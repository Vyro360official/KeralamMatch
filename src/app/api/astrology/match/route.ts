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

    const { targetProfileId, manualProfile, includeReportHtml = true } = body;

    let result;
    if (manualProfile) {
      if (
        typeof manualProfile !== "object" ||
        !manualProfile.fullName ||
        typeof manualProfile.fullName !== "string" ||
        !manualProfile.dateOfBirth ||
        typeof manualProfile.dateOfBirth !== "string"
      ) {
        return NextResponse.json(
          { success: false, error: "Candidate full name and date of birth are required." },
          { status: 400 }
        );
      }
      result = await astrologyService.calculateManualMatch(
        session.user.id,
        manualProfile,
        Boolean(includeReportHtml)
      );
    } else if (targetProfileId && typeof targetProfileId === "string") {
      result = await astrologyService.calculateMatch(
        session.user.id,
        targetProfileId,
        Boolean(includeReportHtml)
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Either targetProfileId or manualProfile details must be provided.",
        },
        { status: 400 }
      );
    }

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
          error: err.message || "Complete birth details are required for horoscope matching.",
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
          error: "You cannot calculate horoscope compatibility with yourself.",
        },
        {
          status: 403,
          headers: { "Cache-Control": "private, no-store, max-age=0" },
        }
      );
    }

    if (err.message === "INVALID_NAME_LENGTH") {
      return NextResponse.json(
        { success: false, error: "Candidate full name must be between 2 and 100 characters." },
        { status: 400, headers: { "Cache-Control": "private, no-store, max-age=0" } }
      );
    }

    if (err.message === "INVALID_DOB" || err.message === "INVALID_DOB_RANGE") {
      return NextResponse.json(
        { success: false, error: "Please provide a valid date of birth (e.g. 1970–2006)." },
        { status: 400, headers: { "Cache-Control": "private, no-store, max-age=0" } }
      );
    }

    if (err.message === "INVALID_MANUAL_PROFILE") {
      return NextResponse.json(
        { success: false, error: "Please provide complete candidate information." },
        { status: 400, headers: { "Cache-Control": "private, no-store, max-age=0" } }
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
