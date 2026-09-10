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
  if (auth.error) {
    return auth.response!;
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ success: true, results: [] });
  }

  const isSuperAdmin = auth.user?.role === "SUPER_ADMIN" || auth.user?.permissions?.includes("ACCESS_ALL");

  try {
    const [users, horoscopeChecks, payments] = await Promise.all([
      // Search Users by name, phone, email, id
      prisma.user.findMany({
        where: {
          OR: [
            { id: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
            { profile: { firstName: { contains: q, mode: "insensitive" } } },
            { profile: { lastName: { contains: q, mode: "insensitive" } } },
          ],
        },
        take: 6,
        select: {
          id: true,
          phone: true,
          email: true,
          role: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              district: true,
              gender: true,
              verificationStatus: true,
            },
          },
        },
      }),

      // Search Horoscope Checks by candidate name or target mobile
      prisma.horoscopeMatchCheck.findMany({
        where: {
          OR: [
            { targetName: { contains: q, mode: "insensitive" } },
            { targetMobile: { contains: q } },
            { userName: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          targetName: true,
          targetMobile: true,
          matchType: true,
          verdict: true,
          score: true,
          marketingConsent: true,
          createdAt: true,
        },
      }),

      // Search Payments by orderId or paymentId
      prisma.payment.findMany({
        where: {
          OR: [
            { orderId: { contains: q, mode: "insensitive" } },
            { paymentId: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 4,
        select: {
          id: true,
          orderId: true,
          amount: true,
          tierName: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              email: true,
              phone: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
    ]);

    const results = [
      ...users.map((u) => ({
        type: "USER",
        id: u.id,
        title: u.profile ? `${u.profile.firstName} ${u.profile.lastName}`.trim() : "Registered Member",
        subtitle: `${u.profile?.gender || "Member"} • ${u.profile?.district || "Kerala"} • ${isSuperAdmin ? u.phone : maskPhone(u.phone)}`,
        status: u.profile?.verificationStatus || "UNVERIFIED",
        link: `/admin/users?id=${u.id}`,
      })),
      ...horoscopeChecks.map((h) => ({
        type: "HOROSCOPE",
        id: h.id,
        title: `Horoscope: ${h.targetName}`,
        subtitle: `${h.matchType === "NEW_PERSON" ? "New Person" : "Registered"} • Score: ${h.score}/36 (${h.verdict}) • ${isSuperAdmin ? (h.targetMobile || "No Phone") : maskPhone(h.targetMobile)}`,
        status: h.marketingConsent ? "CONSENT_GRANTED" : "NO_CONSENT",
        link: h.marketingConsent ? `/admin/horoscope-leads?id=${h.id}` : `/admin/analytics/horoscope`,
      })),
      ...payments.map((p) => ({
        type: "PAYMENT",
        id: p.id,
        title: `Payment: ${p.orderId}`,
        subtitle: `₹${Math.round(p.amount / 100)} • ${p.tierName} • ${p.user?.profile ? `${p.user.profile.firstName} ${p.user.profile.lastName}` : p.user?.email || "User"}`,
        status: p.status,
        link: `/admin/payments?orderId=${p.orderId}`,
      })),
    ];

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("[AdminSearchAPI] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
