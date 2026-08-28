import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/modules/auth/auth.service";
import { AuthRepository } from "@/modules/auth/auth.repository";
import { ADMIN_ROLES } from "@/modules/auth/auth.constants";
import { decrypt } from "@/lib/crypto";

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const SESSION_COOKIE_NAME = "km_session";

/**
 * Server-side session expiry constant (must match auth.controller.ts).
 * Stolen cookies cannot be used beyond this window.
 */
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Maximum tolerated clock skew for createdAt validation.
 * Rejects cookies that appear to have been issued in the future.
 */
const MAX_CLOCK_SKEW_MS = 60_000; // 60 seconds

export interface AuthGuardResult {
  error: boolean;
  user?: any;
  response?: NextResponse;
}

/**
 * Decrypts and validates the km_session cookie.
 *
 * Returns the decoded { firebaseUid, userId, createdAt } payload,
 * or null if the cookie is missing, tampered, malformed, or expired.
 *
 * SECURITY: All crypto errors are swallowed here. The caller only
 * sees null — no internal details are surfaced to the client.
 */
function decryptSessionCookie(encryptedValue: string): {
  firebaseUid: string;
  userId: string;
  createdAt: number;
} | null {
  try {
    const decrypted = decrypt(encryptedValue);
    const payload = JSON.parse(decrypted);

    // Structural integrity check
    if (
      !payload ||
      typeof payload.firebaseUid !== "string" ||
      !payload.firebaseUid ||
      typeof payload.userId !== "string" ||
      !payload.userId ||
      typeof payload.createdAt !== "number"
    ) {
      return null;
    }

    const now = Date.now();

    // Reject future-dated sessions (clock skew beyond tolerance = tampered)
    if (payload.createdAt > now + MAX_CLOCK_SKEW_MS) {
      return null;
    }

    // Enforce server-side session max age
    if (now - payload.createdAt > SESSION_MAX_AGE_MS) {
      return null;
    }

    return {
      firebaseUid: payload.firebaseUid,
      userId: payload.userId,
      createdAt: payload.createdAt,
    };
  } catch {
    // Swallow all crypto/parse errors — fail closed, no detail to caller
    return null;
  }
}

/**
 * Server-side authorization guard for Admin REST API endpoints.
 *
 * SECURITY FLOW:
 *   km_session cookie (ciphertext)
 *     → AES-256-GCM decrypt
 *     → JSON.parse + structural validation
 *     → server-side age check (>7 days → reject)
 *     → future-date check (clock skew >60s → reject)
 *     → authService.getSessionByUid(firebaseUid)   ← only real UID ever reaches DB
 *     → user.status === ACTIVE check
 *     → role must be ADMIN or SUPER_ADMIN
 *     → authorized
 *
 * Returns:
 *   401 — missing cookie, tampered/malformed ciphertext, expired session, unknown user
 *   403 — authenticated user whose role is not in ADMIN_ROLES (USER, MODERATOR, VENDOR)
 *   { error: false, user } — authorized
 */
export async function requireAdminRole(req: NextRequest): Promise<AuthGuardResult> {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie || !sessionCookie.value) {
    return {
      error: true,
      response: NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  // --- BLOCKER 1 FIX ---
  // Decrypt the ciphertext FIRST. Never pass the raw cookie value as a UID.
  const sessionPayload = decryptSessionCookie(sessionCookie.value);

  if (!sessionPayload) {
    // Covers: invalid ciphertext, tampered cookie, expired session, malformed JSON,
    // missing firebaseUid, missing userId, future-dated createdAt
    return {
      error: true,
      response: NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Invalid or expired session" },
        { status: 401 }
      ),
    };
  }

  try {
    // Only the verified firebaseUid (from inside the encrypted payload) reaches the DB
    const session = await authService.getSessionByUid(sessionPayload.firebaseUid);

    if (!session.isAuthenticated || !session.user) {
      return {
        error: true,
        response: NextResponse.json(
          { success: false, error: "UNAUTHORIZED", message: "Invalid or expired session" },
          { status: 401 }
        ),
      };
    }

    // --- BLOCKER 2 FIX ---
    // Allow ADMIN and SUPER_ADMIN. Explicitly deny USER, MODERATOR, VENDOR.
    if (!ADMIN_ROLES.includes(session.user.role as any)) {
      return {
        error: true,
        response: NextResponse.json(
          { success: false, error: "FORBIDDEN", message: "Admin privileges required" },
          { status: 403 }
        ),
      };
    }

    return {
      error: false,
      user: session.user,
    };
  } catch {
    // DB error or unexpected failure — fail closed, no internal detail to client
    return {
      error: true,
      response: NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Session verification failed" },
        { status: 401 }
      ),
    };
  }
}
