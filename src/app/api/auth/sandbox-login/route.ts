import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Sandbox test credentials (for preview / staging environments only)
const SANDBOX_PHONE = "+919400983851";
const SANDBOX_OTP = "123456";
const SESSION_COOKIE_NAME = "km_session";

export async function POST(req: NextRequest) {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || "";
    const firebaseKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";

    // Only allow sandbox login in non-production OR on Vercel preview deployments
    // OR when Firebase API key is clearly a dummy key
    const isPreview = vercelEnv === "preview";
    const hasDummyKey = firebaseKey.includes("dummy") || firebaseKey.includes("AIzaSyA-dummy");
    const sandboxAllowed = !isProduction || isPreview || hasDummyKey;

    if (!sandboxAllowed) {
      return NextResponse.json({ success: false, error: "Sandbox login disabled in production." }, { status: 403 });
    }

    const body = await req.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json({ success: false, error: "Phone and OTP required." }, { status: 400 });
    }

    // Validate sandbox credentials
    const normalizedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    if (normalizedPhone !== SANDBOX_PHONE || otp !== SANDBOX_OTP) {
      return NextResponse.json({ success: false, error: "Invalid sandbox credentials." }, { status: 401 });
    }

    // Find or create the sandbox user in the database
    let user: any = null;
    try {
      user = await prisma.user.findFirst({
        where: { phone: SANDBOX_PHONE }
      });
    } catch (e) {
      console.warn("Sandbox login: DB lookup failed:", e);
    }

    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            firebaseUid: "sandbox-uid-9400983851",
            email: "sandbox@keralammatch.com",
            phone: SANDBOX_PHONE,
            role: "USER",
          }
        });
      } catch (createErr) {
        console.warn("Sandbox login: DB create failed, using in-memory user:", createErr);
        // Fallback in-memory user for when DB is unavailable
        user = {
          id: "sandbox-user-001",
          firebaseUid: "sandbox-uid-9400983851",
          email: "sandbox@keralammatch.com",
          phone: SANDBOX_PHONE,
          role: "USER",
        };
      }
    }

    // Set session cookie using Firebase UID as the session token
    const cookieStore = await cookies();
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: user.firebaseUid || "sandbox-uid-9400983851",
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      sandbox: true,
    });
  } catch (error: any) {
    console.error("Sandbox login error:", error);
    return NextResponse.json({ success: false, error: error.message || "Sandbox login failed." }, { status: 500 });
  }
}
