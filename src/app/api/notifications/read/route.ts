import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { NotificationRepository } from "@/modules/notification/notification.repository";

const repo = new NotificationRepository();

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    const { notificationId } = await req.json();
    if (!notificationId) {
      return NextResponse.json({ success: false, error: "MISSING_ID" }, { status: 400 });
    }
    await repo.markRead(notificationId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "MARK_READ_FAILED" }, { status: 500 });
  }
}
