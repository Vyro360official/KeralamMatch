import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { prisma } from "@/lib/db";

/**
 * REST Endpoint for fetching user-centric contact unlock requests
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionAction();
    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch requests involving the user
    const dbRequests = await prisma.contactRequest.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map rows to tag incoming vs outgoing explicitly
    const formatted = dbRequests.map((r) => {
      const isIncoming = r.receiverId === userId;
      return {
        ...r,
        isIncoming,
      };
    });

    return NextResponse.json({
      success: true,
      requests: formatted,
    });
  } catch (error: any) {
    console.error("API GET requests failed:", error);
    return NextResponse.json({ success: false, error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
