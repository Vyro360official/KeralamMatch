import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch messages involving the user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // Collate threads mapping
    const threadMap = new Map<string, { lastMessage: string; timestamp: Date; unreadCount: number }>();

    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      
      let text = "[Encrypted Message]";
      try {
        text = decrypt(msg.content);
      } catch (e) {}

      if (!threadMap.has(partnerId)) {
        threadMap.set(partnerId, {
          lastMessage: text,
          timestamp: msg.createdAt,
          unreadCount: !msg.isRead && msg.receiverId === userId ? 1 : 0,
        });
      } else {
        // Increment unread count
        if (!msg.isRead && msg.receiverId === userId) {
          const current = threadMap.get(partnerId)!;
          threadMap.set(partnerId, {
            ...current,
            unreadCount: current.unreadCount + 1,
          });
        }
      }
    }

    const threads: any[] = [];
    for (const [partnerId, data] of threadMap.entries()) {
      const partnerProfile = await prisma.profile.findUnique({
        where: { userId: partnerId },
      });

      if (partnerProfile) {
        threads.push({
          partnerId,
          firstName: partnerProfile.firstName,
          lastName: partnerProfile.lastName,
          lastMessage: data.lastMessage,
          timestamp: data.timestamp,
          unreadCount: data.unreadCount,
        });
      }
    }

    return NextResponse.json({
      success: true,
      threads,
    });
  } catch (error: any) {
    console.error("API GET chat threads failed:", error);
    return NextResponse.json({ success: false, error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
