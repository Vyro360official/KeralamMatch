import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let authInstance: any = null;

/**
 * Decode a JWT payload segment using base64url (correct JWT encoding).
 * Standard base64 differs from base64url: replaces - with + and _ with /
 */
function decodeJwtPayload(segment: string): any {
  try {
    // Convert base64url to standard base64
    const base64 = segment
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(segment.length + ((4 - (segment.length % 4)) % 4), "=");
    return JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

/**
 * Verification wrapper that validates Firebase ID tokens.
 * On preview / sandbox environments (dummy credentials), falls back to
 * JWT-payload extraction without signature verification.
 */
export const adminAuth = {
  verifyIdToken: async (token: string) => {
    const isProduction = process.env.NODE_ENV === "production";

    // Reject clearly fake tokens in production
    if (isProduction && (token.startsWith("mock-") || token === "sandbox")) {
      throw new Error("Unauthorized: Mock tokens are disabled in production.");
    }

    if (!authInstance) {
      const projectId  = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
      const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL ?? "").trim().replace(/^["']|["']$/g, "");
      let   privateKey  = (process.env.FIREBASE_PRIVATE_KEY  ?? "").trim().replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");

      const hasDummyKey =
        !privateKey ||
        privateKey.includes("dummy") ||
        privateKey.includes("mock") ||
        !privateKey.startsWith("-----BEGIN PRIVATE KEY-----");

      // On local development with dummy keys, use JWT-decode path
      const isLocalDev = process.env.NODE_ENV === "development" && !process.env.VERCEL;
      const useSandbox  = isLocalDev && hasDummyKey;

      if (useSandbox) {
        console.warn("[firebase-admin] Using JWT-decode path (preview/dummy credentials).");
        authInstance = {
          verifyIdToken: async (tok: string) => {
            // Try to decode the real Firebase JWT payload
            const parts = tok.split(".");
            if (parts.length === 3) {
              const payload = decodeJwtPayload(parts[1]);
              if (payload) {
                const uid = payload.user_id || payload.sub;
                if (uid && !uid.startsWith("mock-")) {
                  return {
                    uid,
                    email: payload.email ?? null,
                    phone_number: payload.phone_number ?? null,
                  };
                }
              }
            }
            // Fallback: use a stable sandbox UID that does NOT start with "mock-"
            return {
              uid: "sandbox-preview-uid-001",
              email: "sandbox@keralammatch.com",
              phone_number: "+919400983851",
            };
          },
        };
      } else {
        // Real production path with actual Firebase Admin credentials
        const apps     = getApps();
        const adminApp = apps.length > 0
          ? apps[0]
          : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
        authInstance = getAuth(adminApp);
      }
    }

    return authInstance.verifyIdToken(token);
  },
} as any;
