import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/auth/delete-account
 * Securely deletes the current authenticated user's account and profile,
 * cascading through the database, and clears their session.
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Delete user from database (cascades to Profile, Wallet, Subscription, etc.)
    await prisma.user.delete({
      where: { id: userId },
    });

    // 2. Clear the session cookie
    const cookieStore = await cookies();
    cookieStore.delete("km_session");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[delete-account] Account deletion failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}
