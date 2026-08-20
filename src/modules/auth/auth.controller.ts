"use server";

import { cookies, headers } from "next/headers";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { loginWithTokenSchema } from "./auth.validators";
import { SessionContext } from "./auth.types";
import { AUTH_ERRORS } from "./auth.constants";

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

const SESSION_COOKIE_NAME = "km_session";

/**
 * Server Action to authenticate a user via their Firebase ID Token.
 * Sets a secure httpOnly cookie containing the verified Firebase UID.
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

    // 3. Verify Firebase token
    const session = await authService.verifyFirebaseToken(idToken, ip, userAgent);

    if (!session.user) {
      return { success: false, error: AUTH_ERRORS.USER_NOT_FOUND };
    }

    // 4. Set httpOnly cookie with Firebase UID
    const cookieStore = await cookies();
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: session.user.firebaseUid,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days session duration
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
 */
export async function getSessionAction(): Promise<SessionContext> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return { user: null, isAuthenticated: false };
    }

    return await authService.getSessionByUid(sessionCookie.value);
  } catch (error) {
    console.error("GetSession Server Action failed:", error);
    return { user: null, isAuthenticated: false };
  }
}

/**
 * Server Action to logout the user and clear cookies.
 */
export async function logoutAction(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return { success: true };
}
