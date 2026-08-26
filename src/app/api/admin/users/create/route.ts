import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdminRole(req);
  if (auth.error) return auth.response!;

  try {
    const body = await req.json();
    const {
      name, email, phone, gender, plan, district, tempPassword,
      religion, caste, subCaste, age, height, maritalStatus, education, profession, incomeBracket
    } = body;

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: "MISSING_REQUIRED_FIELDS" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: email || undefined }, { phone }] }
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "USER_ALREADY_EXISTS" }, { status: 400 });
    }

    const first = name.split(" ")[0] || "Member";
    const last = name.split(" ").slice(1).join(" ") || "";
    
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - (parseInt(age) || 28);
    const dob = new Date(`${birthYear}-01-01`);

    const newUser = await prisma.user.create({
      data: {
        firebaseUid: `admin-created-${Math.random().toString(36).substring(2, 15)}`,
        email: email || `${first.toLowerCase().replace(/\s+/g, "")}@keralammatch.com`,
        phone,
        role: "USER",
        tempPassword: tempPassword || "Temp1234!",
        mustChangePassword: true,
        profile: {
          create: {
            firstName: first,
            lastName: last,
            gender: gender === "Bride" ? "FEMALE" : "MALE",
            dateOfBirth: dob,
            height: parseFloat(height) || 165,
            maritalStatus: maritalStatus || "Never Married",
            religion: religion || "Hindu",
            caste: caste || "Nair",
            subCaste: subCaste || "",
            district: district || "Thiruvananthapuram",
            city: `${district || "Thiruvananthapuram"}, Kerala`,
            education: education || "Graduate",
            profession: profession || "Software Professional",
            incomeBracket: incomeBracket || "₹6 - 10 Lakhs / year",
            bio: `Created by Staff/Admin. Warm, career-oriented individual.`,
            createdBy: "STAFF",
            createdById: auth.user?.id || "admin-system",
            verificationStatus: "VERIFIED"
          }
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_USER_PROFILE",
        userId: auth.user?.id || "admin-system",
        targetUserId: newUser.id,
        details: `Created user account ${phone} (${name}) with temp password.`
      }
    }).catch(() => {});

    return NextResponse.json({ success: true, userId: newUser.id });
  } catch (error: any) {
    console.error("Failed to create profile:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
