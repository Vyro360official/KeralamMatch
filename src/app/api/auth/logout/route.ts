import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/logout
 * Route handler to securely clear the session cookie from the client.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("km_session");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to logout session" },
      { status: 500 }
    );
  }
}
