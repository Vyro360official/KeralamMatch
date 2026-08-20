import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { prisma } from "@/lib/db";

/**
 * REST endpoint for blocking users
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ success: false, error: "MISSING_TARGET_USER_ID" }, { status: 400 });
    }

    // Add BlockedUser record
    await prisma.blockedUser.create({
      data: {
        blockerId: session.user.id,
        blockedId: targetUserId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("API POST block user failed:", error);
    return NextResponse.json({ success: false, error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
