/**
 * KeralamMatch — Unit Tests
 * Tests core utility functions, schema validation, and business logic helpers.
 */

// ─── Profile Completion Score ────────────────────────────────────────────────

interface ProfileData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  bio?: string;
  education?: string;
  profession?: string;
  photos?: string[];
  religion?: string;
  caste?: string;
  motherTongue?: string;
  height?: number;
  partnerPreferences?: object;
  voiceIntroUrl?: string;
}

function calculateProfileScore(profile: ProfileData): number {
  const weights: [keyof ProfileData, number][] = [
    ["firstName", 5],
    ["lastName", 5],
    ["dateOfBirth", 10],
    ["bio", 10],
    ["education", 10],
    ["profession", 10],
    ["photos", 15],
    ["religion", 5],
    ["caste", 5],
    ["motherTongue", 5],
    ["height", 5],
    ["partnerPreferences", 10],
    ["voiceIntroUrl", 5],
  ];

  let score = 0;
  for (const [key, weight] of weights) {
    const val = profile[key];
    if (val !== undefined && val !== null && val !== "") {
      if (Array.isArray(val) && val.length === 0) continue;
      score += weight;
    }
  }
  return Math.min(score, 100);
}

// ─── Phone Number Validation ──────────────────────────────────────────────────

function isValidIndianPhone(phone: string): boolean {
  return /^(\+91)?[6-9]\d{9}$/.test(phone.trim());
}

// ─── OTP Generation ──────────────────────────────────────────────────────────

function generateOTP(length = 6): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

function isValidOTP(otp: string, length = 6): boolean {
  return /^\d+$/.test(otp) && otp.length === length;
}

// ─── Contact Request Expiry ───────────────────────────────────────────────────

function isContactWindowActive(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) > new Date();
}

function getContactWindowHoursRemaining(expiresAt: Date): number {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, diffMs / (1000 * 60 * 60));
}

// ─── Membership Plan Sorting ──────────────────────────────────────────────────

type Plan = { name: string; price: number; priority: number };

function sortPlansByValue(plans: Plan[]): Plan[] {
  return [...plans].sort((a, b) => b.priority - a.priority);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS — ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL — ${testName}`);
    failed++;
  }
}

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  KeralamMatch — Unit Test Suite");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// Profile Score Tests
console.log("📋 Profile Completion Score");
assert(calculateProfileScore({}) === 0, "Empty profile scores 0");
assert(
  calculateProfileScore({ firstName: "Anjali", lastName: "Nair", dateOfBirth: "1995-05-20" }) === 20,
  "3 basic fields score 20"
);
assert(
  calculateProfileScore({
    firstName: "Anjali", lastName: "Nair", dateOfBirth: "1995-05-20",
    bio: "A software engineer", education: "B.Tech", profession: "Engineer",
    photos: ["photo1.jpg"], religion: "Hindu", caste: "Nair",
    motherTongue: "Malayalam", height: 160, partnerPreferences: {}, voiceIntroUrl: "voice.mp3",
  }) === 100,
  "Full profile scores 100"
);
assert(
  calculateProfileScore({ photos: [] }) === 0,
  "Empty photos array scores 0"
);

// Phone Validation Tests
console.log("\n📱 Phone Number Validation");
assert(isValidIndianPhone("+919876543210"), "+91 prefix valid");
assert(isValidIndianPhone("9876543210"), "10-digit valid");
assert(isValidIndianPhone("6789012345"), "6xxx valid");
assert(!isValidIndianPhone("1234567890"), "1xxx invalid");
assert(!isValidIndianPhone("98765"), "Short number invalid");
assert(!isValidIndianPhone(""), "Empty string invalid");
assert(!isValidIndianPhone("abcdefghij"), "Letters invalid");

// OTP Tests
console.log("\n🔐 OTP Generation & Validation");
const otp = generateOTP(6);
assert(otp.length === 6, "OTP is 6 digits");
assert(isValidOTP(otp), "Generated OTP is valid");
assert(!isValidOTP("12345"), "5-digit OTP invalid");
assert(!isValidOTP("12345a"), "Alphanumeric OTP invalid");
assert(!isValidOTP(""), "Empty OTP invalid");
assert(isValidOTP(generateOTP(4), 4), "Custom length OTP valid");

// Contact Window Tests
console.log("\n⏰ Contact Window Expiry");
const future = new Date(Date.now() + 3600_000); // 1h from now
const past = new Date(Date.now() - 3600_000);   // 1h ago
assert(isContactWindowActive(future), "Future expiry is active");
assert(!isContactWindowActive(past), "Past expiry is inactive");
assert(!isContactWindowActive(null), "Null expiry is inactive");
assert(getContactWindowHoursRemaining(future) > 0, "Future window has hours remaining");
assert(getContactWindowHoursRemaining(past) === 0, "Past window returns 0");

// Plan Sorting Tests
console.log("\n💎 Membership Plan Sorting");
const plans: Plan[] = [
  { name: "Free", price: 0, priority: 0 },
  { name: "Gold", price: 2999, priority: 2 },
  { name: "Platinum", price: 5999, priority: 3 },
  { name: "Silver", price: 999, priority: 1 },
];
const sorted = sortPlansByValue(plans);
assert(sorted[0].name === "Platinum", "Platinum is first");
assert(sorted[3].name === "Free", "Free is last");

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

if (failed > 0) process.exit(1);
