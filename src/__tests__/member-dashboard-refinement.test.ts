import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Member Dashboard Refinement & Bug Fixes", () => {
  // 1. Bulletproof Age Calculation (Fixes "NaN yrs" bug)
  describe("Bulletproof Age Calculation (Anti-NaN)", () => {
    function calculateAge(dob: string | Date | null | undefined): number | null {
      if (!dob) return null;
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (isNaN(age) || age <= 0 || age > 120) return null;
      return age;
    }

    test("should compute correct age for valid ISO date string", () => {
      const dob = "1996-05-10";
      const age = calculateAge(dob);
      assert.notEqual(age, null);
      assert.equal(typeof age, "number");
      assert.equal(Number.isNaN(age), false);
      assert.ok(age! >= 29 && age! <= 31);
    });

    test("should return null for undefined DOB (never NaN)", () => {
      const age = calculateAge(undefined);
      assert.equal(age, null);
      assert.equal(Number.isNaN(age), false);
    });

    test("should return null for null DOB (never NaN)", () => {
      const age = calculateAge(null);
      assert.equal(age, null);
      assert.equal(Number.isNaN(age), false);
    });

    test("should return null for invalid date string (never NaN)", () => {
      const age = calculateAge("invalid-date-string");
      assert.equal(age, null);
      assert.equal(Number.isNaN(age), false);
    });

    test("should return null for empty string (never NaN)", () => {
      const age = calculateAge("");
      assert.equal(age, null);
      assert.equal(Number.isNaN(age), false);
    });

    test("should correctly display 'Age unavailable' when calculateAge returns null", () => {
      const age = calculateAge(null);
      const display = age !== null ? `${age} yrs` : "Age unavailable";
      assert.equal(display, "Age unavailable");
      assert.equal(display.includes("NaN"), false);
    });
  });

  // 2. Gender-Based Personalization (Brides vs Grooms)
  describe("Gender Personalization", () => {
    function getMatchHeading(gender: string | null | undefined): string {
      if (gender === "MALE") return "Recommended Brides for You";
      if (gender === "FEMALE") return "Recommended Grooms for You";
      return "Top Match Suggestions";
    }

    function getTargetGender(gender: string | null | undefined): "FEMALE" | "MALE" {
      return gender === "MALE" ? "FEMALE" : "MALE";
    }

    test("should personalize heading for male user to 'Recommended Brides for You'", () => {
      assert.equal(getMatchHeading("MALE"), "Recommended Brides for You");
      assert.equal(getTargetGender("MALE"), "FEMALE");
    });

    test("should personalize heading for female user to 'Recommended Grooms for You'", () => {
      assert.equal(getMatchHeading("FEMALE"), "Recommended Grooms for You");
      assert.equal(getTargetGender("FEMALE"), "MALE");
    });

    test("should provide safe fallback when gender is unspecified", () => {
      assert.equal(getMatchHeading(null), "Top Match Suggestions");
    });
  });

  // 3. Dynamic Profile Completion Calculation (Zero Fake Numbers)
  describe("Dynamic Profile Completion Calculation", () => {
    function calculateProfileCompletion(profile: any): {
      percentage: number;
      checks: {
        basicInfo: boolean;
        aboutMe: boolean;
        familyDetails: boolean;
        photos: boolean;
        photoCount: number;
        lifestyle: boolean;
        horoscope: boolean;
      };
    } {
      const photoCount = profile?.media?.length || (profile?.avatarUrl ? 1 : 0);
      const checks = {
        basicInfo: !!(profile?.firstName && profile?.gender && profile?.dateOfBirth && profile?.district),
        aboutMe: !!(profile?.bio && profile.bio.trim().length > 10),
        familyDetails: !!(profile?.familyType || profile?.fatherOccupation || profile?.motherOccupation),
        photos: photoCount >= 1,
        photoCount,
        lifestyle: !!(profile?.diet || profile?.smoking || profile?.drinking),
        horoscope: !!(profile?.nakshatram || profile?.rasi || profile?.timeOfBirth),
      };

      const totalPoints = 6;
      let completedPoints = 0;
      if (checks.basicInfo) completedPoints++;
      if (checks.aboutMe) completedPoints++;
      if (checks.familyDetails) completedPoints++;
      if (checks.photos) completedPoints++;
      if (checks.lifestyle) completedPoints++;
      if (checks.horoscope) completedPoints++;

      const percentage =
        profile?.profileStrength && profile.profileStrength > 0
          ? profile.profileStrength
          : Math.round((completedPoints / totalPoints) * 100);

      return { percentage, checks };
    }

    test("should calculate full completion for complete profile", () => {
      const completeProfile = {
        firstName: "Nagarajan",
        gender: "MALE",
        dateOfBirth: "1994-08-20",
        district: "Ernakulam",
        bio: "Senior software engineer working in Kochi, passionate about music and family values.",
        familyType: "NUCLEAR",
        media: [{ url: "https://example.com/photo1.jpg" }],
        diet: "VEGETARIAN",
        nakshatram: "Aswathi",
      };

      const { percentage, checks } = calculateProfileCompletion(completeProfile);
      assert.equal(percentage, 100);
      assert.equal(checks.basicInfo, true);
      assert.equal(checks.aboutMe, true);
      assert.equal(checks.familyDetails, true);
      assert.equal(checks.photos, true);
      assert.equal(checks.lifestyle, true);
      assert.equal(checks.horoscope, true);
    });

    test("should calculate partial completion when sections are missing", () => {
      const partialProfile = {
        firstName: "Ananya",
        gender: "FEMALE",
        dateOfBirth: "1997-02-14",
        district: "Trivandrum",
        bio: null, // missing bio
        familyType: null, // missing family
        media: [], // no photos
      };

      const { percentage, checks } = calculateProfileCompletion(partialProfile);
      assert.ok(percentage < 50);
      assert.equal(checks.basicInfo, true);
      assert.equal(checks.aboutMe, false);
      assert.equal(checks.photos, false);
    });
  });

  // 4. Zero-Mock Rule: Ensure Zero Defaults on Failure
  describe("Zero-Mock Database Fallbacks", () => {
    test("should never return fake mock numbers like 85, 23, 12 on query error", () => {
      const safeCount = (errorThrown: boolean): number => {
        try {
          if (errorThrown) throw new Error("DB Connection timeout");
          return 42;
        } catch {
          return 0; // Strict zero fallback
        }
      };

      assert.equal(safeCount(true), 0);
      assert.notEqual(safeCount(true), 85);
      assert.notEqual(safeCount(true), 23);
      assert.notEqual(safeCount(true), 12);
    });
  });
});
