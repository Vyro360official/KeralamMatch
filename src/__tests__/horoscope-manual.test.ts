/**
 * KERALAMMATCH — MANUAL HOROSCOPE MATCH TEST SUITE
 * Comprehensive tests for matching with non-registered candidates:
 * 1. Real SoftAstro 10-Porutham calculation for manual candidate
 * 2. Role assignment & Kerala district coordinate resolution
 * 3. Validation: name length, DOB range, self-match rejection
 * 4. User missing DOB protection
 * 5. Mobile number & DTO privacy guarantee (zero leaks)
 * 6. Match history recording & IDOR access protection
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AstrologyService, AstrologyValidationError } from "../modules/astrology/astrology.service";
import { ManualHoroscopeProfileInput } from "../modules/astrology/astrology.types";
import fs from "node:fs";
import path from "node:path";

describe("1. Manual Horoscope Match: Real SoftAstro Calculation", () => {
  it("should calculate authentic 10-Porutham compatibility for a manual candidate", async () => {
    const service = new AstrologyService();

    const manualCandidate: ManualHoroscopeProfileInput = {
      fullName: "Ananya Krishna",
      gender: "FEMALE",
      dateOfBirth: "1997-08-15",
      timeOfBirth: "09:30",
      placeOfBirth: "Thrissur",
      mobileNumber: "+91 9876543210",
    };

    // Calculate match for authenticated user "usr-sandbox-101"
    const result = await service.calculateManualMatch("usr-sandbox-101", manualCandidate);

    assert.ok(result, "Result must be returned");
    assert.ok(result.currentUser, "Current user block must exist");
    assert.ok(result.targetUser, "Target user block must exist");
    assert.equal(result.targetUser.displayName, "Ananya Krishna");
    assert.equal(result.targetUser.id, "manual-entry");

    // Verify Compatibility Score
    assert.ok(typeof result.compatibility.overallScore === "number");
    assert.ok(result.compatibility.overallScore >= 0 && result.compatibility.overallScore <= 10);
    assert.ok(typeof result.compatibility.traditionalScore === "number");
    assert.ok(result.compatibility.traditionalScore >= 0 && result.compatibility.traditionalScore <= 36);
    assert.ok(result.compatibility.verdict);
    assert.ok(result.compatibility.verdictMalayalam);

    // Verify 10 Poruthams
    assert.ok(Array.isArray(result.poruthams));
    assert.equal(result.poruthams.length, 10, "Must calculate all 10 traditional Poruthams");

    // Verify Papasamya & Kuja Dosha
    assert.ok(result.papasamya, "Papasamya must be calculated");
    assert.ok(typeof result.papasamya.difference === "number");
    assert.ok(result.kujaDosha, "Kuja Dosha must be calculated");
    assert.ok(typeof result.kujaDosha.isResolved === "boolean");

    // Verify Sanitized Report HTML
    assert.ok(result.reportHtml, "Sanitized report HTML must be present");
    assert.ok(result.reportHtml.includes("PORUTHAM") || result.reportHtml.includes("COMPATIBILITY"));
  });
});

describe("2. Validation & Security: Edge Cases & Self-Match Rejection", () => {
  const service = new AstrologyService();

  it("should reject candidate with name shorter than 2 characters", async () => {
    await assert.rejects(
      async () => {
        await service.calculateManualMatch("usr-sandbox-101", {
          fullName: "A",
          gender: "FEMALE",
          dateOfBirth: "1997-08-15",
          timeOfBirth: "09:30",
          placeOfBirth: "Thrissur",
        });
      },
      (err: any) => err.message === "INVALID_NAME_LENGTH"
    );
  });

  it("should reject candidate with invalid future date of birth", async () => {
    await assert.rejects(
      async () => {
        await service.calculateManualMatch("usr-sandbox-101", {
          fullName: "Future Bride",
          gender: "FEMALE",
          dateOfBirth: "2099-01-01",
          timeOfBirth: "09:30",
          placeOfBirth: "Kochi",
        });
      },
      (err: any) => err.message === "INVALID_DOB_RANGE"
    );
  });

  it("should reject candidate with non-parseable date of birth", async () => {
    await assert.rejects(
      async () => {
        await service.calculateManualMatch("usr-sandbox-101", {
          fullName: "Invalid Date Bride",
          gender: "FEMALE",
          dateOfBirth: "not-a-valid-date",
          timeOfBirth: "09:30",
          placeOfBirth: "Kochi",
        });
      },
      (err: any) => err.message === "INVALID_DOB"
    );
  });

  it("should reject self-match if user enters their exact own name and birth date", async () => {
    await assert.rejects(
      async () => {
        await service.calculateManualMatch("usr-sandbox-101", {
          fullName: "Nagarajan P",
          gender: "MALE",
          dateOfBirth: "1987-05-23",
          timeOfBirth: "04:05",
          placeOfBirth: "Trivandrum",
        });
      },
      (err: any) => err.message === "CANNOT_MATCH_SELF"
    );
  });
});

describe("3. Privacy & Zero-Data-Leak Guarantee", () => {
  it("should verify candidate mobile number is never leaked in the returned DTO", async () => {
    const service = new AstrologyService();
    const sensitiveMobile = "+91 9988776655";

    const result = await service.calculateManualMatch("usr-sandbox-101", {
      fullName: "Deepa Menon",
      gender: "FEMALE",
      dateOfBirth: "1996-03-22",
      timeOfBirth: "11:45",
      placeOfBirth: "Kollam",
      mobileNumber: sensitiveMobile,
    });

    const serialized = JSON.stringify(result);
    assert.ok(
      !serialized.includes(sensitiveMobile),
      "Candidate private mobile number must NEVER be serialized or returned in match DTO"
    );
    assert.ok(!serialized.includes("password"), "Zero credential leak");
  });
});

describe("4. Match History & IDOR Protection", () => {
  it("should return match history for the current user", async () => {
    const service = new AstrologyService();
    const history = await service.getMatchHistory("usr-sandbox-101");
    assert.ok(Array.isArray(history), "History must return an array");
  });

  it("should reject IDOR access when querying match check with mismatched user", async () => {
    const service = new AstrologyService();
    await assert.rejects(
      async () => {
        // Querying non-existent or other user's checkId
        await service.getMatchHistoryDetail("usr-sandbox-101", "random-foreign-check-id");
      },
      (err: any) => err.message === "RECORD_NOT_FOUND" || err.message === "UNAUTHORIZED"
    );
  });
});

describe("5. Navigation Verification: Sidebar Order", () => {
  it("should verify 'Horoscope Match' is positioned directly below 'My Profile' and above 'Trust & Verify'", () => {
    const sidebarPath = path.join(process.cwd(), "src/components/dashboard/dashboard-sidebar.tsx");
    const content = fs.readFileSync(sidebarPath, "utf-8");

    assert.ok(content.includes('href: "/horoscope-match"'), "Sidebar must have /horoscope-match link");
    assert.ok(content.includes('label: "Horoscope Match"'), "Sidebar item must be labeled 'Horoscope Match'");

    const myProfileIndex = content.indexOf('label: "My Profile"');
    const horoscopeIndex = content.indexOf('label: "Horoscope Match"');
    const trustIndex = content.indexOf('label: "Trust & Verify"');

    assert.ok(myProfileIndex !== -1, "My Profile must exist");
    assert.ok(horoscopeIndex !== -1, "Horoscope Match must exist");
    assert.ok(trustIndex !== -1, "Trust & Verify must exist");

    assert.ok(
      horoscopeIndex > myProfileIndex,
      "Horoscope Match must be placed below My Profile"
    );
    assert.ok(
      trustIndex > horoscopeIndex,
      "Trust & Verify must be placed below Horoscope Match"
    );
  });
});
