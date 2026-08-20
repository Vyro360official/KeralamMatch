import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { MessagingRepository } from "@/modules/messaging/messaging.repository";
import { MessagingService } from "@/modules/messaging/messaging.service";

const repo = new MessagingRepository();
const service = new MessagingService(repo);

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    const { partnerId } = await req.json();
    if (!partnerId) {
      return NextResponse.json({ success: false, error: "MISSING_PARTNER_ID" }, { status: 400 });
    }
    // partnerId is the sender whose messages we mark as read
    await service.markAsRead(partnerId, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "MARK_READ_FAILED" }, { status: 500 });
  }
}
