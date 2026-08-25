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
              dateOfBirth: true,
              height: true,
              maritalStatus: true,
              religion: true,
              caste: true,
              subCaste: true,
              horoscopeRequired: true,
              education: true,
              profession: true,
              company: true,
              incomeBracket: true,
              district: true,
              state: true,
              city: true,
              bio: true,
              verificationStatus: true,
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

    const formattedUsers = users.map((u) => {
      const p = u.profile;
      let age = 28;
      if (p?.dateOfBirth) {
        const birthDate = new Date(p.dateOfBirth);
        const ageDiffMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiffMs);
        age = Math.abs(ageDate.getUTCFullYear() - 1970);
      }

      return {
        id: u.id,
        name: p ? `${p.firstName} ${p.lastName}`.trim() : "Member",
        gender: p?.gender === "FEMALE" ? ("Bride" as const) : ("Groom" as const),
        age,
        height: p?.height ? `${p.height} cm` : "175 cm",
        maritalStatus: p?.maritalStatus || "Never Married",
        email: u.email,
        contact: u.phone,
        district: p?.district || "",
        city: p?.city || "",
        status: u.role === "USER" ? ("Active" as const) : u.role === "ADMIN" ? ("Active" as const) : ("Blocked" as const),
        verification: p?.verificationStatus === "VERIFIED" 
          ? ("Verified" as const) 
          : p?.verificationStatus === "PENDING" 
          ? ("Pending" as const) 
          : ("Rejected" as const),
        plan: (u.subscriptions[0]?.plan?.name || "Free") as any,
        joined: u.createdAt.toLocaleDateString("en-GB"),
        photoUrl: p?.gender === "FEMALE" 
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" 
          : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        bio: p?.bio || "No biography provided.",
        religion: p?.religion || "Hindu",
        caste: p?.caste || "Nair",
        subCaste: p?.subCaste || "",
        horoscopeRequired: p?.horoscopeRequired || false,
        education: p?.education || "Graduate",
        profession: p?.profession || "Software Professional",
        company: p?.company || "",
        incomeBracket: p?.incomeBracket || "₹6 - 10 Lakhs / year",
        workLocation: p?.city || "",
        fatherName: "Family Details",
        motherName: "Family Details",
        siblings: "Not Specified",
        familyType: "Nuclear Family",
        createdFor: "Self" as const,
        partnerPreferences: {
          ageRange: "24 - 28 yrs",
          heightRange: "158 cm - 172 cm",
          maritalStatus: "Never Married",
          religion: "Hindu",
          caste: "Any",
          education: "Graduate",
          district: p?.district || "Any",
        },
        telemetry: {
          interestsReceivedCount: 0,
          interestsReceivedFrom: [],
          interestsSentCount: 0,
          shortlistedCount: 0,
          shortlistedFrom: [],
          contactRevealsCount: 0,
          hasUsedChat: false,
          chatThreadsCount: 0,
          totalMessagesCount: 0,
          lastChatActive: "Never",
        },
      };
    });

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
