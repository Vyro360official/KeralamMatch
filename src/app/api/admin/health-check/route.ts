import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth-guard";
import { AdminHealthService } from "@/modules/admin/admin-health.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // 1. Strict Server-Side Admin Role Guard
  const auth = await requireAdminRole(req);
  if (auth.error) {
    return auth.response!;
  }

  try {
    const { searchParams } = new URL(req.url);
    const scopeParam = (searchParams.get("scope") || "all") as "all" | "admin" | "member";

    const response = await AdminHealthService.runAllDiagnostics(scopeParam);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[AdminHealthAPI] Diagnostics Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "DIAGNOSTICS_ERROR",
        message: "Failed to run health check diagnostics. Safe fallback response.",
      },
      { status: 500 }
    );
  }
}
