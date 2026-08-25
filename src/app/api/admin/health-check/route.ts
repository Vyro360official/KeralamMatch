import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth-guard";
import { AdminHealthService, HealthCheckResult } from "@/modules/admin/admin-health.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // 1. Guard check - Admin session auth
  const auth = await requireAdminRole(req);
  if (auth.error) {
    return auth.response!;
  }

  try {
    const url = new URL(req.url);
    const scope = url.searchParams.get("scope") || "all";
    const singleId = url.searchParams.get("id");

    const results: HealthCheckResult[] = [];

    // Execute single check
    if (scope === "single" && singleId) {
      let result: HealthCheckResult | null = null;

      switch (singleId) {
        case "db_conn":
          result = await AdminHealthService.checkDatabase();
          break;
        case "db_write":
          result = await AdminHealthService.checkDatabaseWrite();
          break;
        case "fb_client":
          result = await AdminHealthService.checkFirebaseClient();
          break;
        case "fb_admin":
          result = await AdminHealthService.checkFirebaseAdmin();
          break;
        case "razorpay_config":
          result = await AdminHealthService.checkRazorpay();
          break;
        case "resend_email":
          result = await AdminHealthService.checkResendEmail();
          break;
        case "cloudinary_storage":
          result = await AdminHealthService.checkCloudinary();
          break;
        case "redis_cache":
          result = await AdminHealthService.checkRedis();
          break;
        case "db_encryption":
          result = await AdminHealthService.checkEncryption();
          break;
        case "pusher_socket":
          result = await AdminHealthService.checkPusher();
          break;
        default:
          // Check if it matches any dynamic route IDs
          if (singleId.startsWith("route_")) {
            const routes = await AdminHealthService.checkRoutes();
            result = routes.find((r) => r.id === singleId) || null;
          }
      }

      if (!result) {
        return NextResponse.json(
          { success: false, error: "NOT_FOUND", message: "Health check item not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, result });
    }

    // Execute all diagnostics
    const [
      db,
      dbWrite,
      fbClient,
      fbAdmin,
      razorpayRes,
      resendRes,
      cloudinaryRes,
      redis,
      encryption,
      pusher,
      routes,
    ] = await Promise.all([
      AdminHealthService.checkDatabase(),
      AdminHealthService.checkDatabaseWrite(),
      AdminHealthService.checkFirebaseClient(),
      AdminHealthService.checkFirebaseAdmin(),
      AdminHealthService.checkRazorpay(),
      AdminHealthService.checkResendEmail(),
      AdminHealthService.checkCloudinary(),
      AdminHealthService.checkRedis(),
      AdminHealthService.checkEncryption(),
      AdminHealthService.checkPusher(),
      AdminHealthService.checkRoutes(),
    ]);

    results.push(
      db,
      dbWrite,
      fbClient,
      fbAdmin,
      razorpayRes,
      resendRes,
      cloudinaryRes,
      redis,
      encryption,
      pusher,
      ...routes
    );

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Health Check diagnostics error:", error);
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", message: error.message || "Failed to run diagnostics server-side" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // 1. Guard check - Admin session auth
  const auth = await requireAdminRole(req);
  if (auth.error) {
    return auth.response!;
  }

  try {
    const body = await req.json();
    const { action, email } = body;

    if (action === "send-test-email") {
      if (!email || !email.includes("@")) {
        return NextResponse.json(
          { success: false, error: "INVALID_EMAIL", message: "A valid email address is required." },
          { status: 400 }
        );
      }

      const res = await AdminHealthService.sendTestEmail(email);
      if (!res.success) {
        return NextResponse.json(
          { success: false, error: "EMAIL_DISPATCH_FAILED", message: res.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: res.message,
      });
    }

    return NextResponse.json(
      { success: false, error: "INVALID_ACTION", message: "Requested action not recognized." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Health Check post action error:", error);
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", message: error.message || "Failed to execute diagnostic action" },
      { status: 500 }
    );
  }
}
