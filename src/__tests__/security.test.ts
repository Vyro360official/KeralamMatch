import { NextRequest } from "next/server";
import { requireAdminRole } from "../lib/auth-guard";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS — ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL — ${testName}`);
    failed++;
  }
}

async function runSecurityTests() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  KeralamMatch — Security & Role Guard Suite");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Test 1: Unauthenticated request to admin endpoint
  console.log("🛡️ Admin API Authorization Guards");
  const reqUnauth = new NextRequest("http://localhost:3000/api/admin/stats");
  const resUnauth = await requireAdminRole(reqUnauth);
  assert(resUnauth.error === true, "Unauthenticated request returns error");
  assert(resUnauth.response?.status === 401, "Unauthenticated request returns HTTP 401");

  // Test 2: Production sandbox token rejection
  console.log("\n🔐 Sandbox Auth Production Isolation");
  const prevEnv = process.env.NODE_ENV;
  (process.env as any).NODE_ENV = "production";

  const { adminAuth } = await import("../lib/firebase-admin");
  let mockRejected = false;
  try {
    await adminAuth.verifyIdToken("mock-uid-123");
  } catch (err: any) {
    mockRejected = true;
  }
  assert(mockRejected === true, "Mock token strictly rejected when NODE_ENV === 'production'");

  (process.env as any).NODE_ENV = prevEnv;

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (failed > 0) process.exit(1);
}

runSecurityTests();
