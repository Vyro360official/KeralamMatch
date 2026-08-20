/**
 * Chat Safety Engine for KeralamMatch
 * - Prohibits sending phone numbers / direct contact credentials in chat (must use 24h Contact Reveal)
 * - Prohibits obscene, vulgar, or sexually explicit text, triggering account flags
 */

const NUMBER_WORDS: Record<string, string> = {
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  poojyam: "0",
  onnu: "1",
  randu: "2",
  moonu: "3",
  naalu: "4",
  anju: "5",
  aaru: "6",
  ezhu: "7",
  ettu: "8",
  onpathu: "9",
  pathu: "10",
};

// Explicit / Obscene / Sexual Keywords in English and Malayalam transliterations
const EXPLICIT_KEYWORDS = [
  "sex",
  "sexy",
  "nude",
  "nudes",
  "porn",
  "porno",
  "boobs",
  "vagina",
  "penis",
  "dick",
  "pussy",
  "fuck",
  "fucking",
  "horny",
  "kiss me",
  "sleep with me",
  "hookup",
  "call girl",
  "escort",
  "kundhi",
  "vedi",
  "koothi",
  "poor",
  "myre",
  "thendi",
  "thayoli",
  "pulayadi",
  "kamam",
  "kambi",
  "vedichi",
];

/**
 * Checks if the text contains a raw or obfuscated phone number
 */
export function containsPhoneNumber(text: string): boolean {
  if (!text) return false;

  // 1. Direct standard phone regex (handles +91, 0091, spaces, hyphens, parentheses)
  const directPhoneRegex = /(?:\+?91[\s-]?)?(?:[6-9]\d{9}|[6-9][\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{3}|[6-9][\s.-]?\d{4}[\s.-]?\d{5})/;
  if (directPhoneRegex.test(text)) return true;

  // 2. Strip all non-digit characters and check if a 10-digit Indian phone sequence exists
  const digitsOnly = text.replace(/\D/g, "");
  if (digitsOnly.length >= 10) {
    // Check if it contains a 10-digit number starting with 6, 7, 8, or 9
    const indianMobileRegex = /(?:91)?[6-9]\d{9}/;
    if (indianMobileRegex.test(digitsOnly)) {
      return true;
    }
  }

  // 3. Normalized word digits replacement (e.g. "call me at nine eight four seven...")
  let normalizedText = text.toLowerCase();
  for (const [word, digit] of Object.entries(NUMBER_WORDS)) {
    const wordRegex = new RegExp(`\\b${word}\\b`, "g");
    normalizedText = normalizedText.replace(wordRegex, digit);
  }

  const normalizedDigitsOnly = normalizedText.replace(/\D/g, "");
  if (normalizedDigitsOnly.length >= 10) {
    const indianMobileRegex = /(?:91)?[6-9]\d{9}/;
    if (indianMobileRegex.test(normalizedDigitsOnly)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if the text contains explicit or sexually inappropriate terms
 */
export function containsSexualOrExplicitContent(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();

  for (const keyword of EXPLICIT_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(lower)) {
      return true;
    }
  }

  return false;
}

export interface ChatSafetyValidation {
  isValid: boolean;
  violationType?: "PHONE_NUMBER" | "EXPLICIT_CONTENT";
  errorMessage?: string;
}

/**
 * Main validator for all chat message dispatches
 */
export function validateChatMessageSafety(content: string): ChatSafetyValidation {
  // 1. Phone number check
  if (containsPhoneNumber(content)) {
    return {
      isValid: false,
      violationType: "PHONE_NUMBER",
      errorMessage: "Sharing mobile numbers directly in chat is prohibited. Please use the secure 24-Hour Contact Reveal request upon mutual consent.",
    };
  }

  // 2. Explicit / Sexual content check
  if (containsSexualOrExplicitContent(content)) {
    return {
      isValid: false,
      violationType: "EXPLICIT_CONTENT",
      errorMessage: "Your message was blocked because it violates community safety guidelines (obscene or sexually explicit content). Your account has been flagged for admin moderation.",
    };
  }

  return { isValid: true };
}
