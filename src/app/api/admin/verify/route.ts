import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // 1. KM-01: Server-Side Authorization Guard
  const auth = await requireAdminRole(req);
  if (auth.error) {
    return auth.response!;
  }

  try {
    const { userId, action } = await req.json();
    if (!userId || !["APPROVED", "REJECTED"].includes(action)) {
      return NextResponse.json({ success: false, error: "INVALID_PARAMS" }, { status: 400 });
    }

    const targetVerificationStatus = action === "APPROVED" ? "VERIFIED" : "REJECTED";

    // 2. KM-02 & Phase 4: Live Verification Status Update
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        verificationStatus: targetVerificationStatus,
      },
    });

    // 3. Log Administrative Audit Trail
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        action: `ADMIN_VERIFICATION_${action}_USER_${userId}`,
        ipAddress: ip,
        userAgent: userAgent,
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      userId,
      action,
      verificationStatus: updatedProfile.verificationStatus,
    });
  } catch (error: any) {
    console.error("Admin verification update failed:", error);
    return NextResponse.json(
      { success: false, error: "UPDATE_FAILED", message: "Failed to update profile verification status" },
      { status: 500 }
    );
  }
}
