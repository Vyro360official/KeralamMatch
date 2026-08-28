import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  let dbStatus = "healthy";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = "unhealthy";
  }

  return NextResponse.json({
    status: dbStatus === "healthy" ? "ok" : "degraded",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    service: "keralammatch-api",
    database: dbStatus,
  });
}
