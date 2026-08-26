import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "STAFF", "PROFILE_MANAGER", "SUPPORT_STAFF"];

export async function GET(req: NextRequest) {
  const auth = await requireAdminRole(req);
  if (auth.error) return auth.response!;

  try {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          in: ["SUPER_ADMIN", "ADMIN", "STAFF", "PROFILE_MANAGER", "SUPPORT_STAFF"] as any
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminRole(req);
  if (auth.error) return auth.response!;

  try {
    const { email, phone, role, designation, permissions } = await req.json();

    if (!email || !phone || !role) {
      return NextResponse.json({ success: false, error: "MISSING_REQUIRED_FIELDS" }, { status: 400 });
    }

    if (!STAFF_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: "INVALID_ROLE" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "USER_ALREADY_EXISTS" }, { status: 400 });
    }

    const newStaff = await prisma.user.create({
      data: {
        firebaseUid: `staff-${Math.random().toString(36).substring(2, 15)}`,
        email,
        phone,
        role: role as any,
        designation,
        permissions,
        status: "ACTIVE"
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_STAFF",
        userId: auth.user?.id || "admin-system",
        targetUserId: newStaff.id,
        details: `Created staff account ${email} with role ${role}`
      }
    }).catch(() => {});

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdminRole(req);
  if (auth.error) return auth.response!;

  try {
    const { id, role, designation, permissions, status } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "MISSING_ID" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        role: role as any,
        designation,
        permissions,
        status
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_STAFF",
        userId: auth.user?.id || "admin-system",
        targetUserId: id,
        details: `Updated staff ID ${id} - Role: ${role}, Designation: ${designation}, Status: ${status}`
      }
    }).catch(() => {});

    return NextResponse.json({ success: true, staff: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminRole(req);
  if (auth.error) return auth.response!;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "MISSING_ID" }, { status: 400 });
    }

    const disabled = await prisma.user.update({
      where: { id },
      data: { status: "INACTIVE" }
    });

    await prisma.auditLog.create({
      data: {
        action: "DISABLE_STAFF",
        userId: auth.user?.id || "admin-system",
        targetUserId: id,
        details: `Set staff ID ${id} status to INACTIVE`
      }
    }).catch(() => {});

    return NextResponse.json({ success: true, staff: disabled });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
