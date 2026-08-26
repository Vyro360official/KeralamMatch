import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdminRole(req);
  if (auth.error) return auth.response!;

  try {
    const body = await req.json();
    const { id, profile } = body;

    if (!id || !profile) {
      return NextResponse.json({ success: false, error: "MISSING_REQUIRED_FIELDS" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "USER_NOT_FOUND" }, { status: 404 });
    }

    const first = profile.name ? profile.name.split(" ")[0] : (user.profile?.firstName || "Member");
    const last = profile.name ? profile.name.split(" ").slice(1).join(" ") : (user.profile?.lastName || "");

    const updatedProfile = await prisma.profile.update({
      where: { userId: id },
      data: {
        firstName: first,
        lastName: last,
        gender: profile.gender === "Bride" ? "FEMALE" : profile.gender === "Groom" ? "MALE" : undefined,
        maritalStatus: profile.maritalStatus,
        religion: profile.religion,
        caste: profile.caste,
        subCaste: profile.subCaste,
        education: profile.education,
        profession: profile.profession,
        company: profile.company,
        incomeBracket: profile.incomeBracket,
        district: profile.district,
        city: profile.city || profile.district,
        bio: profile.bio,
        lastModifiedBy: auth.user?.email || auth.user?.id || "Admin Staff"
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "EDIT_USER_PROFILE",
        userId: auth.user?.id || "admin-system",
        targetUserId: id,
        details: `Edited profile details for user ID ${id}. Modified by ${auth.user?.email || "staff"}.`
      }
    }).catch(() => {});

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error("Failed to edit user profile:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
