import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAction();
    const body = await req.json();
    const { type, category, name } = body;

    if (!type || !name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Type and name are required." },
        { status: 400 }
      );
    }

    const normalized = name.trim().toLowerCase();
    const userId = session.isAuthenticated && session.user ? session.user.id : null;

    // Log the taxonomy addition request into AuditLog / System for admin review
    try {
      if (userId) {
        await prisma.auditLog.create({
          data: {
            userId,
            action: `CUSTOM_TAXONOMY_SUBMITTED:${type}:${category || "GENERAL"}:${name.trim()}`,
            ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
            userAgent: req.headers.get("user-agent") || "Web Browser",
          },
        });
      }
    } catch (e) {
      console.warn("Could not write audit log for custom taxonomy:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Custom submission received and queued for admin moderation.",
      item: {
        type,
        category,
        name: name.trim(),
        status: "PENDING_APPROVAL",
      },
    });
  } catch (error: any) {
    console.error("Custom taxonomy submission error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "SUBMISSION_FAILED" },
      { status: 500 }
    );
  }
}
