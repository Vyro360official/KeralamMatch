"use server";

import { cookies, headers } from "next/headers";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { loginWithTokenSchema } from "./auth.validators";
import { SessionContext } from "./auth.types";
import { AUTH_ERRORS } from "./auth.constants";
import { encrypt, decrypt } from "@/lib/crypto";

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

const SESSION_COOKIE_NAME = "km_session";

/**
 * Server-side session maximum age.
 * Must match the value in auth-guard.ts.
 * Cookie maxAge is also set to this value, but we MUST enforce it
 * server-side as well — cookie maxAge is a client-side hint only.
 */
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Maximum tolerated clock skew for createdAt validation.
 * Rejects cookies that appear to have been issued in the future.
 */
const MAX_CLOCK_SKEW_MS = 60_000; // 60 seconds

/**
 * Server Action to authenticate a user via their Firebase ID Token.
 * Sets a secure httpOnly cookie containing the AES-256-GCM encrypted session payload.
 */
export async function loginAction(idToken: string): Promise<{ success: boolean; session?: SessionContext; error?: string }> {
  try {
    // 1. Zod input validation
    const validation = loginWithTokenSchema.safeParse({ idToken });
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    // 2. Fetch IP and User-Agent headers for Audit Logging
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // 3. Verify Firebase token server-side (cryptographic verification)
    const session = await authService.verifyFirebaseToken(idToken, ip, userAgent);

    if (!session.user) {
      return { success: false, error: AUTH_ERRORS.USER_NOT_FOUND };
    }

    // 4. Set secure HttpOnly cookie with AES-256-GCM encrypted session payload.
    //    createdAt is stored as a Unix ms timestamp for server-side expiry validation.
    const sessionData = {
      firebaseUid: session.user.firebaseUid,
      userId: session.user.id,
      createdAt: Date.now(),
    };
    const encryptedValue = encrypt(JSON.stringify(sessionData));

    const cookieStore = await cookies();
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: encryptedValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || !!process.env.VERCEL,
      sameSite: "lax",
      maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000), // 7 days — client-side hint only
      path: "/",
    });

    return {
      success: true,
      session,
    };
  } catch (error: any) {
    console.error("Login Server Action encountered an error:", error);
    return {
      success: false,
      error: error.message || AUTH_ERRORS.UNAUTHORIZED,
    };
  }
}

/**
 * Server Action to retrieve the current session using the secure cookie.
 *
 * SECURITY:
 *  - Decrypts cookie with AES-256-GCM (any tampering causes decrypt failure → 401)
 *  - Validates createdAt server-side — stolen cookies older than SESSION_MAX_AGE_MS are rejected
 *  - Rejects future-dated createdAt beyond clock skew tolerance (tampered clocks)
 *  - Only verified firebaseUid (from inside the encrypted payload) reaches the DB
 *  - Checks user.status === ACTIVE before returning isAuthenticated=true
 *
 * LIMITATION (stateless cookies):
 *  Since sessions are stateless encrypted cookies, immediate revocation on logout
 *  is limited to cookie deletion from the browser. A stolen but unexpired cookie
 *  cannot be invalidated server-side without a server-side session store (e.g. Redis).
 *  The 7-day server-side max-age limits the window of stolen-cookie replay.
 */
export async function getSessionAction(): Promise<SessionContext> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return { user: null, isAuthenticated: false };
    }

    try {
      const decrypted = decrypt(sessionCookie.value);
      const sessionData = JSON.parse(decrypted);

      // --- BLOCKER 3 FIX: Server-side session expiry ---

      // 1. Structural validation
      if (
        !sessionData ||
        typeof sessionData.firebaseUid !== "string" ||
        !sessionData.firebaseUid ||
        typeof sessionData.createdAt !== "number"
      ) {
        return { user: null, isAuthenticated: false };
      }

      const now = Date.now();

      // 2. Reject future-dated createdAt (indicates clock tampering or forged payload)
      if (sessionData.createdAt > now + MAX_CLOCK_SKEW_MS) {
        return { user: null, isAuthenticated: false };
      }

      // 3. Enforce server-side session max age — cannot be bypassed by cookie manipulation
      if (now - sessionData.createdAt > SESSION_MAX_AGE_MS) {
        return { user: null, isAuthenticated: false };
      }

      // Only verified firebaseUid (from inside the encrypted payload) reaches the DB
      return await authService.getSessionByUid(sessionData.firebaseUid);
    } catch {
      // Swallow decryption/parse errors — fail closed, no detail to caller
      return { user: null, isAuthenticated: false };
    }
  } catch {
    return { user: null, isAuthenticated: false };
  }
}

/**
 * Server Action to logout the user.
 *
 * Removes the km_session cookie from the browser.
 *
 * NOTE: Because sessions are stateless encrypted cookies (no server-side store),
 * logout cannot invalidate a stolen cookie that is still within SESSION_MAX_AGE_MS.
 * Protection is provided by:
 *   - 7-day server-side max age enforcement
 *   - AES-256-GCM tamper detection
 *   - ACTIVE user status check on every request
 *   - HttpOnly + Secure cookie flags preventing JS access
 */
export async function logoutAction(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return { success: true };
}
