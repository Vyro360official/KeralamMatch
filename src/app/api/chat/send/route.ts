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
    const { receiverId, content } = await req.json();
    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ success: false, error: "MISSING_FIELDS" }, { status: 400 });
    }
    const message = await service.sendMessage(session.user.id, receiverId, content);
    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    const errorMessage = error.message || "SEND_FAILED";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    );
  }
}
