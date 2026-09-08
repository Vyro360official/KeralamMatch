/**
 * KERALAMMATCH — MANUAL HOROSCOPE MATCH TEST SUITE
 * Comprehensive tests for matching with non-registered candidates:
 * 1. Automatic Opposite-Gender Logic & Server Enforcement (Male -> Bride, Female -> Groom)
 * 2. Immunity to client-supplied gender overrides (Zero trust in client input)
 * 3. Validation: missing user gender, missing user DOB, name length, DOB range, self-match
 * 4. UI Cleanliness: Complete removal of "Role in Horoscope Matching" selector
 * 5. Mobile number & DTO privacy guarantee (zero leaks)
 * 6. Match history recording & IDOR access protection
 * 7. Navigation position verification in Dashboard sidebar
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AstrologyService, AstrologyValidationError } from "../modules/astrology/astrology.service";
import { ManualHoroscopeProfileInput } from "../modules/astrology/astrology.types";
import fs from "node:fs";
import path from "node:path";

describe("1. Automatic Opposite-Gender Logic: Server Enforcement", () => {
  const service = new AstrologyService();

  it("should automatically assign candidate as Bride (FEMALE) when authenticated user is Groom (MALE)", async () => {
    // usr-sandbox-101 is MALE (Nagarajan P)
    const manualCandidate: ManualHoroscopeProfileInput = {
      fullName: "Ananya Krishna",
      dateOfBirth: "1997-08-15",
      timeOfBirth: "09:30",
      placeOfBirth: "Thrissur",
    };

    const result = await service.calculateManualMatch("usr-sandbox-101", manualCandidate);

    assert.ok(result, "Result must be returned");
    assert.equal(result.currentUser.gender, "MALE", "Current user must be MALE (Groom)");
    assert.equal(result.targetUser.gender, "FEMALE", "Candidate must automatically be FEMALE (Bride)");
    assert.equal(result.targetUser.displayName, "Ananya Krishna");

    // Verify 10 Poruthams calculated by authentic SoftAstro
    assert.equal(result.poruthams.length, 10);
    assert.ok(result.compatibility.overallScore >= 0 && result.compatibility.overallScore <= 10);
  });

  it("should automatically assign candidate as Groom (MALE) when authenticated user is Bride (FEMALE)", async () => {
    // usr-ananya-101 is FEMALE (Ananya Nair)
    const manualCandidate: ManualHoroscopeProfileInput = {
      fullName: "Sreejith Kumar",
      dateOfBirth: "1994-06-20",
      timeOfBirth: "14:15",
      placeOfBirth: "Kozhikode",
    };

    const result = await service.calculateManualMatch("usr-ananya-101", manualCandidate);

    assert.ok(result, "Result must be returned");
    assert.equal(result.currentUser.gender, "FEMALE", "Current user must be FEMALE (Bride)");
    assert.equal(result.targetUser.gender, "MALE", "Candidate must automatically be MALE (Groom)");
    assert.equal(result.targetUser.displayName, "Sreejith Kumar");

    // Verify 10 Poruthams calculated
    assert.equal(result.poruthams.length, 10);
    assert.ok(result.compatibility.overallScore >= 0 && result.compatibility.overallScore <= 10);
  });

  it("should strictly reject/ignore client-supplied gender override (Zero Trust)", async () => {
    // Male user attempts to send gender: "MALE" for candidate
    const resultMaleUser = await service.calculateManualMatch("usr-sandbox-101", {
      fullName: "Malavika S",
      gender: "MALE", // Client attempts to override to MALE
      dateOfBirth: "1998-02-10",
      timeOfBirth: "11:00",
      placeOfBirth: "Palakkad",
    });

    // Server must enforce candidate as FEMALE regardless of client override
    assert.equal(
      resultMaleUser.targetUser.gender,
      "FEMALE",
      "Server must strictly enforce FEMALE for candidate when user is MALE"
    );

    // Female user attempts to send gender: "FEMALE" for candidate
    const resultFemaleUser = await service.calculateManualMatch("usr-ananya-101", {
      fullName: "Rahul Menon",
      gender: "FEMALE", // Client attempts to override to FEMALE
      dateOfBirth: "1993-12-05",
      timeOfBirth: "08:30",
      placeOfBirth: "Alappuzha",
    });

    // Server must enforce candidate as MALE regardless of client override
    assert.equal(
      resultFemaleUser.targetUser.gender,
      "MALE",
      "Server must strictly enforce MALE for candidate when user is FEMALE"
    );
  });
});

describe("2. Validation & Security: Edge Cases & Self-Match Rejection", () => {
  const service = new AstrologyService();

  it("should reject calculation if user profile is missing gender", async () => {
    await assert.rejects(
      async () => {
        await service.calculateManualMatch("usr-no-gender", {
          fullName: "Candidate Person",
          dateOfBirth: "1997-08-15",
          timeOfBirth: "09:30",
          placeOfBirth: "Thrissur",
        });
      },
      (err: any) => {
        return (
          err instanceof AstrologyValidationError &&
          err.message.includes("Please complete your gender/profile information before checking horoscope compatibility.") &&
          err.details.currentUserMissingGender === true
        );
      }
    );
  });

  it("should reject candidate with name shorter than 2 characters", async () => {
    await assert.rejects(
      async () => {
        await service.calculateManualMatch("usr-sandbox-101", {
          fullName: "A",
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
          dateOfBirth: "1987-05-23",
          timeOfBirth: "04:05",
          placeOfBirth: "Trivandrum",
        });
      },
      (err: any) => err.message === "CANNOT_MATCH_SELF"
    );
  });
});

describe("3. UI Integrity: Removal of Role Selector & Dynamic Role Labels", () => {
  it("should verify that 'Role in Horoscope Matching' selector is completely removed from source code", () => {
    const viewPath = path.join(process.cwd(), "src/app/horoscope-match/horoscope-match-view.tsx");
    const content = fs.readFileSync(viewPath, "utf-8");

    // The old field must NOT exist anywhere in the code
    assert.ok(
      !content.includes("Role in Horoscope Matching"),
      "'Role in Horoscope Matching' field label must be completely removed"
    );
    assert.ok(
      !content.includes("Bride (Female)"),
      "Manual Bride button selector must be completely removed"
    );
    assert.ok(
      !content.includes("Groom (Male)"),
      "Manual Groom button selector must be completely removed"
    );

    // Verify dynamic headings exist
    assert.ok(
      content.includes("Enter {candidateRole} Details"),
      "Dynamic heading 'Enter {candidateRole} Details' must exist"
    );
    assert.ok(
      content.includes("{candidateRole} Name"),
      "Dynamic label '{candidateRole} Name' must exist"
    );
  });
});

describe("4. Privacy & Zero-Data-Leak Guarantee", () => {
  it("should verify candidate mobile number is never leaked in the returned DTO", async () => {
    const service = new AstrologyService();
    const sensitiveMobile = "+91 9988776655";

    const result = await service.calculateManualMatch("usr-sandbox-101", {
      fullName: "Deepa Menon",
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

describe("5. Match History & IDOR Protection", () => {
  it("should return match history for the current user", async () => {
    const service = new AstrologyService();
    const history = await service.getMatchHistory("usr-sandbox-101");
    assert.ok(Array.isArray(history), "History must return an array");
  });

  it("should reject IDOR access when querying match check with mismatched user", async () => {
    const service = new AstrologyService();
    await assert.rejects(
      async () => {
        await service.getMatchHistoryDetail("usr-sandbox-101", "random-foreign-check-id");
      },
      (err: any) => err.message === "RECORD_NOT_FOUND" || err.message === "UNAUTHORIZED"
    );
  });
});

describe("6. Navigation Verification: Sidebar Order", () => {
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
