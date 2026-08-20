import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { MessagingRepository } from "@/modules/messaging/messaging.repository";
import { MessagingService } from "@/modules/messaging/messaging.service";

const repo = new MessagingRepository();
const service = new MessagingService(repo);

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    const partnerId = req.nextUrl.searchParams.get("partnerId");
    if (!partnerId) {
      return NextResponse.json({ success: false, error: "MISSING_PARTNER_ID" }, { status: 400 });
    }
    const messages = await service.getMessages(session.user.id, partnerId, 50);
    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "FETCH_FAILED" }, { status: 500 });
  }
}
