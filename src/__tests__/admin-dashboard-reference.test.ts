import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Admin Dashboard Reference Architecture & Business Metrics", () => {
  // 1. Period-over-Period Growth Calculations
  describe("Period-over-Period Growth Calculations", () => {
    interface GrowthResult {
      value: number | null;
      formatted: string;
      isPositive: boolean;
      hasComparison: boolean;
    }

    function calculateGrowth(current: number, prior: number): GrowthResult {
      if (prior <= 0) {
        if (current > 0) {
          return { value: null, formatted: "New", isPositive: true, hasComparison: false };
        }
        return { value: null, formatted: "No previous data", isPositive: false, hasComparison: false };
      }
      const diff = ((current - prior) / prior) * 100;
      const rounded = Number(diff.toFixed(1));
      const isPositive = rounded >= 0;
      const formatted = `${isPositive ? "+" : ""}${rounded.toFixed(1)}%`;
      return { value: rounded, formatted, isPositive, hasComparison: true };
    }

    test("should compute positive percentage when current exceeds prior", () => {
      const growth = calculateGrowth(120, 100);
      assert.equal(growth.value, 20.0);
      assert.equal(growth.formatted, "+20.0%");
      assert.equal(growth.isPositive, true);
      assert.equal(growth.hasComparison, true);
    });

    test("should compute negative percentage when current is below prior", () => {
      const growth = calculateGrowth(80, 100);
      assert.equal(growth.value, -20.0);
      assert.equal(growth.formatted, "-20.0%");
      assert.equal(growth.isPositive, false);
      assert.equal(growth.hasComparison, true);
    });

    test("should return 'New' when prior is zero and current is positive (avoiding misleading +100%)", () => {
      const growth = calculateGrowth(15, 0);
      assert.equal(growth.value, null);
      assert.equal(growth.formatted, "New");
      assert.equal(growth.isPositive, true);
      assert.equal(growth.hasComparison, false);
    });

    test("should return 'No previous data' when both prior and current are zero", () => {
      const growth = calculateGrowth(0, 0);
      assert.equal(growth.value, null);
      assert.equal(growth.formatted, "No previous data");
      assert.equal(growth.isPositive, false);
      assert.equal(growth.hasComparison, false);
    });
  });

  // 2. Horoscope Compatibility Categorization (36 Gunas)
  describe("Horoscope Compatibility Milan Categorization", () => {
    function categorizeGunMilan(score: number): "Excellent" | "Good" | "Average" | "Low" {
      if (score >= 30) return "Excellent"; // 30-36
      if (score >= 18) return "Good";      // 18-29
      if (score >= 7) return "Average";    // 7-17
      return "Low";                        // 0-6
    }

    test("should classify scores 30 to 36 as Excellent", () => {
      assert.equal(categorizeGunMilan(36), "Excellent");
      assert.equal(categorizeGunMilan(30), "Excellent");
      assert.equal(categorizeGunMilan(32.5), "Excellent");
    });

    test("should classify scores 18 to 29 as Good", () => {
      assert.equal(categorizeGunMilan(29), "Good");
      assert.equal(categorizeGunMilan(18), "Good");
      assert.equal(categorizeGunMilan(24), "Good");
    });

    test("should classify scores 7 to 17 as Average", () => {
      assert.equal(categorizeGunMilan(17), "Average");
      assert.equal(categorizeGunMilan(7), "Average");
      assert.equal(categorizeGunMilan(12), "Average");
    });

    test("should classify scores 0 to 6 as Low", () => {
      assert.equal(categorizeGunMilan(6), "Low");
      assert.equal(categorizeGunMilan(0), "Low");
      assert.equal(categorizeGunMilan(3.5), "Low");
    });
  });

  // 3. Unique Registered Users vs Total Horoscope Volume
  describe("Unique Horoscope Users vs Total Transaction Volume", () => {
    test("should distinguish unique user adoption from total check transactions", () => {
      // User 1 performs 4 checks, User 2 performs 3 checks, User 3 performs 0 checks
      const checks = [
        { id: "c1", userId: "u1", score: 28 },
        { id: "c2", userId: "u1", score: 32 },
        { id: "c3", userId: "u1", score: 21 },
        { id: "c4", userId: "u1", score: 15 },
        { id: "c5", userId: "u2", score: 30 },
        { id: "c6", userId: "u2", score: 19 },
        { id: "c7", userId: "u2", score: 25 },
      ];
      const totalRegisteredUsers = 5;

      const totalChecksVolume = checks.length;
      const uniqueUsersSet = new Set(checks.map((c) => c.userId));
      const uniqueHoroscopeUsers = uniqueUsersSet.size;

      assert.equal(totalChecksVolume, 7, "Total volume should count all transactions");
      assert.equal(uniqueHoroscopeUsers, 2, "Unique users must count distinct user IDs");

      const adoptionRate = Number(((uniqueHoroscopeUsers / totalRegisteredUsers) * 100).toFixed(1));
      assert.equal(adoptionRate, 40.0, "Adoption rate = 2 / 5 = 40.0%");
    });
  });

  // 4. RBAC Data Masking for PII
  describe("RBAC Email Data Masking for Dashboard", () => {
    function maskEmail(email: string, isSuperAdmin: boolean): string {
      if (isSuperAdmin) return email;
      const atIdx = email.indexOf("@");
      if (atIdx > 2) {
        return email.slice(0, 2) + "***" + email.slice(atIdx);
      }
      return email.slice(0, 1) + "***" + email.slice(atIdx);
    }

    test("should mask email for non-superadmin users", () => {
      const masked = maskEmail("akshay.kumar@gmail.com", false);
      assert.equal(masked, "ak***@gmail.com");
    });

    test("should preserve unmasked email for superadmins", () => {
      const unmasked = maskEmail("akshay.kumar@gmail.com", true);
      assert.equal(unmasked, "akshay.kumar@gmail.com");
    });
  });

  // 5. Currency & Compact Number Formatting
  describe("Number and Currency Formatting", () => {
    function formatCompactNumber(num: number): string {
      if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
      if (num >= 10_000) return (num / 1_000).toFixed(1) + "K";
      if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
      return num.toLocaleString("en-IN");
    }

    test("should format numbers with proper metric suffixes", () => {
      assert.equal(formatCompactNumber(18452), "18.5K");
      assert.equal(formatCompactNumber(2500000), "2.5M");
      assert.equal(formatCompactNumber(540), "540");
      assert.equal(formatCompactNumber(0), "0");
    });
  });
});
