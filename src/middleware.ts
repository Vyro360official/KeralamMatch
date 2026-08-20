import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function middleware(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1";
  const path = req.nextUrl.pathname;

  // ── Admin Route Protection ─────────────────────────────────────────
  if (path.startsWith("/admin")) {
    const sessionCookie = req.cookies.get("km_session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.redirect(new URL("/auth", req.url));
    }
  }

  // Define rate limits for specific path prefixes
  let limitConfig: { limit: number; window: number } | null = null;

  if (path.startsWith("/api/auth/")) {
    limitConfig = { limit: 10, window: 60 }; // 10 req/min
  } else if (path === "/api/requests" && req.method === "POST") {
    limitConfig = { limit: 5, window: 60 }; // 5 requests/min
  } else if (path.startsWith("/api/chat/") && req.method === "POST") {
    limitConfig = { limit: 30, window: 60 }; // 30 messages/min
  } else if (path.startsWith("/api/media/") && req.method === "POST") {
    limitConfig = { limit: 10, window: 60 }; // 10 uploads/min
  } else if (path.startsWith("/api/admin/")) {
    limitConfig = { limit: 20, window: 60 }; // 20 admin actions/min
  } else if (path.startsWith("/api/payments/")) {
    limitConfig = { limit: 10, window: 60 }; // 10 payment actions/min
  }

  if (limitConfig) {
    const rateCheck = await checkRateLimit(
      `${ip}:${path}`,
      limitConfig.limit,
      limitConfig.window
    );

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.resetSeconds),
            "X-RateLimit-Limit": String(rateCheck.limit),
            "X-RateLimit-Remaining": String(rateCheck.remaining),
          },
        }
      );
    }
  }

  const response = NextResponse.next();

  // Security Headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/auth/:path*",
    "/api/requests",
    "/api/chat/:path*",
    "/api/media/:path*",
    "/api/admin/:path*",
    "/api/payments/:path*",
  ],
};
