import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Sandbox test credentials — always accepted for this known test account
const SANDBOX_PHONE = "+919400983851";
const SANDBOX_OTP = "123456";
const SESSION_COOKIE_NAME = "km_session";

export async function POST(req: NextRequest) {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    const body = await req.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: "Phone and OTP are required." },
        { status: 400 }
      );
    }

    // Normalise phone to E.164
    const normalizedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

    // Only accept the registered sandbox test credentials
    if (normalizedPhone !== SANDBOX_PHONE || otp !== SANDBOX_OTP) {
      return NextResponse.json(
        { success: false, error: "Invalid test credentials. Use phone 9400983851 and OTP 123456." },
        { status: 401 }
      );
    }

    // Fetch or create the sandbox user in the database
    let user: any = null;

    try {
      user = await prisma.user.findFirst({
        where: { OR: [{ phone: SANDBOX_PHONE }, { firebaseUid: "sandbox-uid-9400983851" }] },
      });
    } catch (dbErr) {
      console.warn("[sandbox-login] DB lookup failed:", dbErr);
    }

    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            firebaseUid: "sandbox-uid-9400983851",
            email: "sandbox@keralammatch.com",
            phone: SANDBOX_PHONE,
            role: "USER",
          },
        });
      } catch (createErr) {
        console.warn("[sandbox-login] DB create failed, using in-memory fallback:", createErr);
        // In-memory fallback so login still succeeds even if DB is unreachable
        user = {
          id: "sandbox-user-001",
          firebaseUid: "sandbox-uid-9400983851",
          email: "sandbox@keralammatch.com",
          phone: SANDBOX_PHONE,
          role: "USER",
        };
      }
    }

    // Issue session cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: user.firebaseUid || "sandbox-uid-9400983851",
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ success: true, userId: user.id, sandbox: true });
  } catch (error: any) {
    console.error("[sandbox-login] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Sandbox login failed." },
      { status: 500 }
    );
  }
}
