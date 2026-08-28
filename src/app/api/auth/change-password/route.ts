import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/change-password
 * Handles password modification requests by gracefully informing users that
 * passwordless (OTP/Google) authentication is used.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: "Password modification is not available. KeralamMatch uses passwordless mobile SMS OTP and Google accounts for secure verification.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
