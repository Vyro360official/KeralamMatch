import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let authInstance: any = null;

/**
 * Verification wrapper that validates Firebase ID tokens.
 * Enforces strict authentication in production while supporting sandbox stubs strictly in non-production.
 */
export const adminAuth = {
  verifyIdToken: async (token: string) => {
    const isProduction = process.env.NODE_ENV === "production";

    // 1. Strict rejection of mock tokens in production
    if (isProduction && (token.startsWith("mock-") || token.includes("sandbox"))) {
      throw new Error("Unauthorized: Mock tokens are strictly disabled in production environments.");
    }

    if (!authInstance) {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (!projectId || !clientEmail || !privateKey) {
        if (isProduction) {
          throw new Error("Missing critical Firebase Admin SDK configuration in production environment.");
        }
      }

      // Check if private key or token is a mock/dummy placeholder
      const isMock =
        token.startsWith("mock-") ||
        !privateKey ||
        privateKey.includes("dummy") ||
        privateKey.includes("mock") ||
        !privateKey.startsWith("-----BEGIN PRIVATE KEY-----");

      if (isMock) {
        if (isProduction) {
          throw new Error("Production execution rejected: Firebase credentials are invalid or set to stub.");
        }

        console.warn("Firebase Admin SDK: Bypassing active token checks via sandbox stub (Development Only).");
        authInstance = {
          verifyIdToken: async (tok: string) => {
            if (process.env.NODE_ENV === "production") {
              throw new Error("Production error: Sandbox authentication token rejected.");
            }
            return {
              uid: tok.startsWith("mock-") ? tok : "mock-uid-123",
              email: "mock@keralammatch.com",
              phone_number: "+919876543210",
            };
          },
        };
      } else {
        const apps = getApps();
        const adminApp = apps.length > 0 
          ? apps[0] 
          : initializeApp({
              credential: cert({
                projectId: projectId!,
                clientEmail: clientEmail!,
                privateKey: privateKey.replace(/\\n/g, "\n"),
              }),
            });
        authInstance = getAuth(adminApp);
      }
    }
    
    return authInstance.verifyIdToken(token);
  }
} as any;
