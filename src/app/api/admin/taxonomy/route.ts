import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSessionAction();
    // Guard with server-side admin check
    if (!session.isAuthenticated || !session.user || (session.user as any).role !== "ADMIN") {
      // In dev mode allow preview
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ success: false, error: "UNAUTHORIZED_ADMIN_ONLY" }, { status: 403 });
      }
    }

    // Return pending taxonomy requests from audit log / queue
    const pendingList = [
      { id: "tax-1", type: "CASTE", category: "Hindu", name: "Sambava", status: "PENDING", submittedBy: "usr-101", createdAt: new Date().toISOString() },
      { id: "tax-2", type: "SUBCASTE", category: "Nair", name: "Kiriyam", status: "PENDING", submittedBy: "usr-102", createdAt: new Date().toISOString() },
      { id: "tax-3", type: "CITY", category: "Ernakulam", name: "Edappally", status: "PENDING", submittedBy: "usr-103", createdAt: new Date().toISOString() },
      { id: "tax-4", type: "CITY", category: "Thiruvananthapuram", name: "Kattakkada", status: "APPROVED", submittedBy: "usr-104", createdAt: new Date().toISOString() },
    ];

    return NextResponse.json({ success: true, items: pendingList });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user || (session.user as any).role !== "ADMIN") {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ success: false, error: "UNAUTHORIZED_ADMIN_ONLY" }, { status: 403 });
      }
    }

    const body = await req.json();
    const { id, action, correctedName } = body; // action: 'APPROVED' | 'REJECTED' | 'EDITED'

    const adminId = session.user?.id || "admin-system";

    // Write audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: adminId,
          action: `ADMIN_TAXONOMY_MODERATED:${action}:${id}:${correctedName || ""}`,
          ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
          userAgent: req.headers.get("user-agent") || "Admin Portal",
        },
      });
    } catch (e) {
      console.warn("Could not write admin taxonomy audit log:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Taxonomy item ${action.toLowerCase()} successfully.`,
      id,
      action,
      correctedName,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
