import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // 1. KM-01: Server-Side Authorization Guard
  const auth = await requireAdminRole(req);
  if (auth.error) {
    return auth.response!;
  }

  try {
    // 2. KM-02: Live Prisma User Query with Safe Projections
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);
    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        take: limit,
        skip: skip,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          profile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gender: true,
              verificationStatus: true,
              district: true,
              state: true,
            },
          },
          subscriptions: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              status: true,
              plan: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.user.count(),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      firstName: u.profile?.firstName || "Member",
      lastName: u.profile?.lastName || "",
      email: u.email,
      phone: u.phone,
      role: u.role,
      plan: u.subscriptions[0]?.plan?.name || "FREE",
      isVerified: u.profile?.verificationStatus === "VERIFIED",
      verificationStatus: u.profile?.verificationStatus || "UNVERIFIED",
      district: u.profile?.district || "",
      createdAt: u.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Admin users list retrieval failed:", error);
    return NextResponse.json(
      { success: false, error: "DATABASE_ERROR", message: "Failed to fetch live user list" },
      { status: 500 }
    );
  }
}
