import { NextRequest, NextResponse } from "next/server";
import { getSessionAction } from "@/modules/auth/auth.controller";

/**
 * REST Endpoint for client components to read active session states
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionAction();
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ isAuthenticated: false, user: null }, { status: 200 });
  }
}
