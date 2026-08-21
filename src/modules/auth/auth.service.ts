import { adminAuth } from "@/lib/firebase-admin";
import { IAuthRepository } from "./auth.repository";
import { AUTH_ERRORS, AUTH_ROLES, AuthRole } from "./auth.constants";
import { SessionContext, SessionUser } from "./auth.types";

export class AuthService {
  constructor(private authRepo: IAuthRepository) {}

  /**
   * Verifies a Firebase ID token sent from the client.
   * Resolves or registers the database User matching the token.
   */
  async verifyFirebaseToken(idToken: string, ip?: string, userAgent?: string): Promise<SessionContext> {
    const isProduction = process.env.NODE_ENV === "production";

    // Enforce strict rejection of mock tokens in production
    if (isProduction && (idToken.startsWith("mock-") || idToken.includes("sandbox"))) {
      throw new Error(AUTH_ERRORS.UNAUTHORIZED);
    }

    try {
      // 1. Verify token with Firebase Admin SDK
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      const { uid, email, phone_number: phone } = decodedToken;

      if (!uid) {
        throw new Error(AUTH_ERRORS.INVALID_TOKEN);
      }

      if (isProduction && uid.startsWith("mock-")) {
        throw new Error(AUTH_ERRORS.UNAUTHORIZED);
      }

      // 2. Fetch user from PostgreSQL database
      let user: any = null;
      try {
        user = await this.authRepo.findByFirebaseUid(uid);
      } catch (dbError) {
        if (isProduction) {
          throw new Error("Database error: Authentication failed in production.");
        }
        console.warn("Database query offline, utilizing sandbox session fallback (Development Only).");
      }

      // 3. Auto-Register (Lazy Registration) if not found in database
      if (!user) {
        const userEmail = email || `uid-${uid}@keralammatch.com`;
        const userPhone = phone || `+919876543210`;

        try {
          user = await this.authRepo.createUser({
            firebaseUid: uid,
            email: userEmail,
            phone: userPhone,
          });
          await this.authRepo.logAuditAction(user.id, "REGISTER", ip, userAgent);
        } catch (createErr) {
          if (isProduction) {
            throw new Error("User registration failed in production database.");
          }
          // Robust fallback user object if database is unreachable locally in development
          user = {
            id: "usr-sandbox-101",
            firebaseUid: uid,
            email: userEmail,
            phone: userPhone,
            role: AUTH_ROLES.USER,
          };
        }
      } else {
        try {
          await this.authRepo.logAuditAction(user.id, "LOGIN", ip, userAgent);
        } catch {
          // Ignore audit log error in development
        }
      }

      const userProfile = (user as any).profile;
      const isVerified = userProfile ? userProfile.verificationStatus === "VERIFIED" : true;

      const sessionUser: SessionUser = {
        id: user.id || "usr-sandbox-101",
        firebaseUid: user.firebaseUid || uid,
        email: user.email || "demo@keralammatch.com",
        phone: user.phone || "+919876543210",
        role: (user.role as AuthRole) || AUTH_ROLES.USER,
        verified: isVerified,
      };

      return {
        user: sessionUser,
        isAuthenticated: true,
      };
    } catch (error: any) {
      console.error("Firebase authentication validation failed:", error);
      
      if (error.code === "auth/id-token-expired") {
        throw new Error(AUTH_ERRORS.TOKEN_EXPIRED);
      }
      
      throw new Error(`DEBUG_ERROR: ${error.message || error.toString()}`);
    }
  }

  /**
   * Retrieves active session details by direct Firebase UID.
   */
  async getSessionByUid(uid: string): Promise<SessionContext> {
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction && (uid.startsWith("mock-") || uid === "usr-sandbox-101")) {
      return { user: null, isAuthenticated: false };
    }

    try {
      const user = await this.authRepo.findByFirebaseUid(uid);
      if (!user) {
        if (!isProduction && (uid.startsWith("mock-") || uid === "mock-uid-123")) {
          return {
            user: {
              id: "usr-sandbox-101",
              firebaseUid: uid,
              email: "demo@keralammatch.com",
              phone: "+919876543210",
              role: AUTH_ROLES.USER,
              verified: true,
            },
            isAuthenticated: true,
          };
        }
        return { user: null, isAuthenticated: false };
      }

      const userProfile = (user as any).profile;
      const isVerified = userProfile ? userProfile.verificationStatus === "VERIFIED" : false;

      return {
        user: {
          id: user.id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          phone: user.phone,
          role: user.role as AuthRole,
          verified: isVerified,
        },
        isAuthenticated: true,
      };
    } catch (dbError) {
      if (isProduction) {
        return { user: null, isAuthenticated: false };
      }
      return {
        user: {
          id: "usr-sandbox-101",
          firebaseUid: uid,
          email: "demo@keralammatch.com",
          phone: "+919876543210",
          role: AUTH_ROLES.USER,
          verified: true,
        },
        isAuthenticated: true,
      };
    }
  }
}
