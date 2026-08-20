import { AuthRole } from "./auth.constants";

export interface FirebaseUserClaims {
  uid: string;
  email?: string;
  phone?: string;
}

export interface SessionUser {
  id: string;
  firebaseUid: string;
  email: string;
  phone: string;
  role: AuthRole;
  verified: boolean;
}

export interface SessionContext {
  user: SessionUser | null;
  isAuthenticated: boolean;
}

export interface UserRegistrationInput {
  firebaseUid: string;
  email: string;
  phone: string;
}
