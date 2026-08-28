import crypto from "crypto";

const isLocalDev = process.env.NODE_ENV === "development" && !process.env.VERCEL;
const isTestEnv = process.env.NODE_ENV === "test";
const ENCRYPTION_KEY = process.env.DATABASE_ENCRYPTION_KEY || "";

if (!ENCRYPTION_KEY) {
  if (!isLocalDev && !isTestEnv) {
    throw new Error("CRITICAL_CONFIGURATION_ERROR: DATABASE_ENCRYPTION_KEY is required and missing in this environment.");
  }
}

const keyToUse = ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
if (!/^[0-9a-fA-F]{64}$/.test(keyToUse)) {
  throw new Error("CRITICAL_CONFIGURATION_ERROR: DATABASE_ENCRYPTION_KEY must be a 64-character hexadecimal string representing a 32-byte key.");
}

const IV_LENGTH = 12; // Standard for AES-GCM

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      "aes-256-gcm", 
      Buffer.from(keyToUse, "hex"), 
      iv
    );
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const authTag = cipher.getAuthTag().toString("hex");
    
    // Format: iv:encryptedData:authTag
    return `${iv.toString("hex")}:${encrypted}:${authTag}`;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("ENCRYPTION_FAILURE");
  }
}

export function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted text format.");
    }
    
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = Buffer.from(parts[1], "hex");
    const authTag = Buffer.from(parts[2], "hex");
    
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm", 
      Buffer.from(keyToUse, "hex"), 
      iv
    );
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, undefined, "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("DECRYPTION_FAILURE");
  }
}
