import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

function maskPhone(phone?: string | null): string {
  if (!phone) return "N/A";
  const cleaned = phone.trim();
  if (cleaned.length < 8) return "******";
  return cleaned.slice(0, 5) + "****" + cleaned.slice(-2);
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminRole(req);
  if (auth.error) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "consented"; // consented | restricted | all
    const status = searchParams.get("status"); // NEW | CONTACTED | etc.
    const search = (searchParams.get("search") || "").trim();

    const isSuperAdmin =
      auth.user?.role === "SUPER_ADMIN" ||
      auth.user?.permissions?.includes("EXPORT_LEADS") ||
      auth.user?.permissions?.includes("ACCESS_ALL");

    // Strict Marketing Privacy Filter:
    // Consented Leads view MUST require marketingConsent: true
    const where: any = {
      matchType: "NEW_PERSON",
      targetMobile: { not: null },
    };

    if (view === "consented") {
      where.marketingConsent = true;
    } else if (view === "restricted") {
      where.marketingConsent = false;
    }

    if (status && status !== "ALL") {
      where.leadStatus = status;
    }

    if (search) {
      where.OR = [
        { targetName: { contains: search, mode: "insensitive" } },
        { targetMobile: { contains: search } },
        { targetPlace: { contains: search, mode: "insensitive" } },
      ];
    }

    const [leads, consentedCount, restrictedCount] = await Promise.all([
      prisma.horoscopeMatchCheck.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          userId: true,
          userName: true,
          targetName: true,
          targetGender: true,
          targetDob: true,
          targetTob: true,
          targetPlace: true,
          targetMobile: true,
          marketingConsent: true,
          consentTimestamp: true,
          consentSource: true,
          consentRecordedBy: true,
          leadStatus: true,
          leadNotes: true,
          leadAssignedTo: true,
          leadLastContactedAt: true,
          score: true,
          verdict: true,
          createdAt: true,
        },
      }),
      prisma.horoscopeMatchCheck.count({
        where: { matchType: "NEW_PERSON", targetMobile: { not: null }, marketingConsent: true },
      }),
      prisma.horoscopeMatchCheck.count({
        where: { matchType: "NEW_PERSON", targetMobile: { not: null }, marketingConsent: false },
      }),
    ]);

    const formattedLeads = leads.map((lead) => ({
      ...lead,
      // Phone number privacy masking based on RBAC permissions
      displayPhone: isSuperAdmin ? lead.targetMobile : maskPhone(lead.targetMobile),
      isMasked: !isSuperAdmin,
      privacyBadge: lead.marketingConsent ? "CONSENT_VERIFIED" : "NO_CONSENT_RESTRICTED",
    }));

    return NextResponse.json({
      success: true,
      leads: formattedLeads,
      counts: {
        consented: consentedCount,
        restricted: restrictedCount,
        totalNewPerson: consentedCount + restrictedCount,
      },
      canViewRawPhone: isSuperAdmin,
    });
  } catch (err: any) {
    console.error("[HoroscopeLeadsAPI] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminRole(req);
  if (auth.error) return auth.response!;

  try {
    const body = await req.json();
    const { id, leadStatus, leadNotes, leadAssignedTo } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing lead check ID" }, { status: 400 });
    }

    const updated = await prisma.horoscopeMatchCheck.update({
      where: { id },
      data: {
        ...(leadStatus ? { leadStatus } : {}),
        ...(leadNotes !== undefined ? { leadNotes } : {}),
        ...(leadAssignedTo !== undefined ? { leadAssignedTo } : {}),
        leadLastContactedAt: new Date(),
      },
    });

    // Record in AuditLog
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_HOROSCOPE_LEAD",
        userId: auth.user.id,
        details: `Updated lead ${id} status to '${leadStatus || "UNCHANGED"}' with notes.`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, lead: updated });
  } catch (err: any) {
    console.error("[HoroscopeLeadsAPI PATCH] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
