import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/modules/auth/auth.service";
import { AuthRepository } from "@/modules/auth/auth.repository";

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const SESSION_COOKIE_NAME = "km_session";

export interface AuthGuardResult {
  error: boolean;
  user?: any;
  response?: NextResponse;
}

/**
 * Server-side authorization guard for Admin REST API endpoints.
 * Validates the authenticated user identity via the session cookie and verifies role === 'ADMIN'.
 *
 * Returns:
 * - 401 Unauthorized if unauthenticated
 * - 403 Forbidden if authenticated user is not an ADMIN
 * - { error: false, user } if authorized as ADMIN
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

  try {
    const session = await authService.getSessionByUid(sessionCookie.value);
    
    if (!session.isAuthenticated || !session.user) {
      return {
        error: true,
        response: NextResponse.json(
          { success: false, error: "UNAUTHORIZED", message: "Invalid or expired session" },
          { status: 401 }
        ),
      };
    }

    if (session.user.role !== "ADMIN") {
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
  } catch (err) {
    console.error("Admin Auth Guard Error:", err);
    return {
      error: true,
      response: NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Session verification failed" },
        { status: 401 }
      ),
    };
  }
}
