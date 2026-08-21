import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  let dbStatus = "unknown";
  let dbError = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (err: any) {
    dbStatus = "error";
    dbError = err.message || err.toString();
  }

  const fbKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
  const fbAdminEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
  const fbAdminKey = process.env.FIREBASE_PRIVATE_KEY || "";

  return NextResponse.json({
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    service: "keralammatch-api",
    region: process.env.VERCEL_REGION || "local",
    database: {
      status: dbStatus,
      error: dbError,
    },
    env: {
      NEXT_PUBLIC_FIREBASE_API_KEY: fbKey ? `loaded (len: ${fbKey.length})` : "missing",
      FIREBASE_CLIENT_EMAIL: fbAdminEmail ? `loaded (len: ${fbAdminEmail.length}, starts: ${fbAdminEmail.slice(0, 10)}...)` : "missing",
      FIREBASE_PRIVATE_KEY: fbAdminKey ? `loaded (len: ${fbAdminKey.length}, starts: ${fbAdminKey.slice(0, 30)}...)` : "missing",
    }
  });
}
