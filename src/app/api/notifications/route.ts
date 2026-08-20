import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { NotificationRepository } from "@/modules/notification/notification.repository";

const repo = new NotificationRepository();

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    const notifications = await repo.findNotificationsByUser(session.user.id, 50);
    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "FETCH_FAILED" }, { status: 500 });
  }
}
