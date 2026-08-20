import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { ContactRepository } from "@/modules/contact/contact.repository";
import { ContactService } from "@/modules/contact/contact.service";

const repo = new ContactRepository();
const service = new ContactService(repo);

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    const { requestId, status } = await req.json();
    if (!requestId || !["ACCEPTED", "DECLINED"].includes(status)) {
      return NextResponse.json({ success: false, error: "INVALID_PARAMS" }, { status: 400 });
    }
    const updated = await service.respondToRequest(requestId, status, session.user.id);
    return NextResponse.json({ success: true, request: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "RESPOND_FAILED" }, { status: 500 });
  }
}
