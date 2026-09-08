/**
 * KERALAMMATCH — ASTROLOGY INTEGRATION TEST SUITE
 * Rigorous automated tests for SoftAstro Kerala Horoscope Compatibility Engine.
 * Tests security sanitization, validation rules, self-match immunity,
 * DTO privacy enforcement, and end-to-end Python engine calculation.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sanitizeAstrologyReportHtml } from "../modules/astrology/astrology.sanitizer";
import { AstrologyValidationError, AstrologyService } from "../modules/astrology/astrology.service";
import { executeSoftAstroMatch, formatPoruthamItems } from "../modules/astrology/astrology.adapter";
import { BirthProfileInput } from "../modules/astrology/astrology.types";

describe("1. Security: Astrology Report HTML Sanitizer", () => {
  it("should handle null or undefined input safely", () => {
    assert.equal(sanitizeAstrologyReportHtml(null), null);
    assert.equal(sanitizeAstrologyReportHtml(undefined), null);
    assert.equal(sanitizeAstrologyReportHtml(""), null);
  });

  it("should strip dangerous <script> tags and nested malicious code", () => {
    const malicious = '<div class="report"><h1>Horoscope</h1><script>alert("XSS")</script><p>Analysis</p></div>';
    const sanitized = sanitizeAstrologyReportHtml(malicious);
    assert.ok(sanitized);
    assert.ok(!sanitized.includes("<script>"));
    assert.ok(!sanitized.includes('alert("XSS")'));
    assert.ok(sanitized.includes("Horoscope"));
    assert.ok(sanitized.includes("Analysis"));
  });

  it("should strip <iframe>, <object>, and <embed> tags", () => {
    const attack = '<p>Match</p><iframe src="https://attacker.com/cookie-stealer"></iframe><object data="bad.swf"></object>';
    const sanitized = sanitizeAstrologyReportHtml(attack);
    assert.ok(sanitized);
    assert.ok(!sanitized.includes("<iframe"));
    assert.ok(!sanitized.includes("<object"));
    assert.ok(sanitized.includes("<p>Match</p>"));
  });

  it("should strip all inline on* event handlers (onclick, onerror, onload)", () => {
    const vector = '<img src="valid.jpg" onerror="fetch(\'/api/steal\')" /><button onclick="pwn()">Click</button>';
    const sanitized = sanitizeAstrologyReportHtml(vector);
    assert.ok(sanitized);
    assert.ok(!sanitized.includes("onerror"));
    assert.ok(!sanitized.includes("onclick"));
    assert.ok(!sanitized.includes("fetch("));
  });

  it("should neutralize javascript: and data: pseudo-protocols in href and src", () => {
    const payload = '<a href="javascript:stealCookie()">View</a><img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==" />';
    const sanitized = sanitizeAstrologyReportHtml(payload);
    assert.ok(sanitized);
    assert.ok(!sanitized.includes("javascript:"));
    assert.ok(!sanitized.includes("data:"));
    assert.ok(sanitized.includes('href="#"'));
  });

  it("should preserve valid astrology report styling and table structures", () => {
    const validReport = '<div style="color: #0A1F44;"><table class="porutham-table"><tr><td>Rasi Porutham</td><td>Uthama (Good)</td></tr></table></div>';
    const sanitized = sanitizeAstrologyReportHtml(validReport);
    assert.ok(sanitized);
    assert.ok(sanitized.includes("Rasi Porutham"));
    assert.ok(sanitized.includes("Uthama (Good)"));
    assert.ok(sanitized.includes("<table"));
  });
});

describe("2. Validation: AstrologyValidationError & Rule Enforcement", () => {
  it("should properly construct AstrologyValidationError with granular flags", () => {
    const err = new AstrologyValidationError("Missing DOB details", {
      currentUserMissingDob: true,
      targetUserMissingDob: false,
      missingFields: ["Your profile is missing Date of Birth"],
    });

    assert.equal(err.name, "AstrologyValidationError");
    assert.equal(err.message, "Missing DOB details");
    assert.equal(err.details.currentUserMissingDob, true);
    assert.equal(err.details.targetUserMissingDob, false);
    assert.equal(err.details.missingFields.length, 1);
  });

  it("should validate and format Porutham items correctly", () => {
    const mockPoruthams = [
      { name: "രാശിപൊരുത്തം", status: "ഉത്തമം", score: 1.0 },
      { name: "ദിനപൊരുത്തം", status: "മധ്യമം", score: 0.5 },
      { name: "രജ്ജുപൊരുത്തം", status: "വർജ്ജ്യം", score: 0.0 },
    ];

    const formatted = formatPoruthamItems(mockPoruthams);
    assert.equal(formatted.length, 3);
    assert.equal(formatted[0].nameEnglish, "Rasi Porutham");
    assert.equal(formatted[0].statusEnglish, "Excellent");
    assert.equal(formatted[0].score, 1.0);
    assert.equal(formatted[1].nameEnglish, "Dina Porutham");
    assert.equal(formatted[1].statusEnglish, "Moderate");
    assert.equal(formatted[1].score, 0.5);
    assert.equal(formatted[2].nameEnglish, "Rajju Porutham");
    assert.equal(formatted[2].statusEnglish, "Needs Attention");
    assert.equal(formatted[2].score, 0.0);
  });
});

describe("3. Engine Integration: SoftAstro Python Runner", () => {
  it("should execute SoftAstro engine and return authentic Kerala astrology calculations", async () => {
    const bride: BirthProfileInput = {
      name: "Ananya Nair",
      gender: "female",
      dob: "1998-05-15",
      tob: "10:30",
      place: "Ernakulam",
    };

    const groom: BirthProfileInput = {
      name: "Nagarajan P",
      gender: "male",
      dob: "1994-06-18",
      tob: "10:30",
      place: "Trivandrum",
    };

    const result = await executeSoftAstroMatch(bride, groom);

    assert.ok(result, "SoftAstro engine must return a result object");
    assert.equal(result.success, true);
    assert.ok(result.porutham, "porutham result object must exist");
    assert.ok(typeof result.porutham.total_score === "number", "total_score must be a number");
    assert.ok(result.porutham.total_score >= 0 && result.porutham.total_score <= 10, "Score must be within 0..10 range");
    assert.ok(Array.isArray(result.porutham.items), "porutham items must be an array");
    assert.ok(result.porutham.items.length >= 10, `Expected at least 10 Poruthams, got ${result.porutham.items.length}`);

    // Verify Papasamya
    assert.ok(result.papasamya, "Papasamya must be present");
    assert.ok(result.papasamya.bride, "Bride papasamya must exist");
    assert.ok(result.papasamya.groom, "Groom papasamya must exist");
    assert.ok(typeof result.papasamya.bride.total === "number", "Bride papa points must be number");
    assert.ok(typeof result.papasamya.groom.total === "number", "Groom papa points must be number");

    // Verify Kuja Dosha
    assert.ok(result.kuja_dosha, "Kuja dosha must be present");
    assert.ok(result.kuja_dosha.bride, "Bride kuja dosha must exist");
    assert.ok(result.kuja_dosha.groom, "Groom kuja dosha must exist");

    // Verify Report HTML is generated
    assert.ok(result.report_html, "3-page Kerala report HTML must be generated");
    assert.ok(
      result.report_html.includes("COMPATIBILITY REPORT") || result.report_html.includes("PORUTHAM"),
      "Report HTML must include marriage report header"
    );
  });
});

describe("4. Security & Privacy: HoroscopeMatchResultDTO Privacy Guarantee", () => {
  it("should verify that calculation output contains strictly vetted fields and zero private leaks", async () => {
    const service = new AstrologyService();

    // Calculate match using dev sandbox test profiles
    const dto = await service.calculateMatch("usr-sandbox-101", "prf-1");

    assert.ok(dto, "DTO must be returned");
    assert.ok(dto.compatibility, "Compatibility block must exist");
    assert.ok(typeof dto.compatibility.overallScore === "number");
    assert.ok(typeof dto.compatibility.traditionalScore === "number");
    assert.ok(typeof dto.compatibility.percentage === "number");
    assert.ok(dto.compatibility.verdict);
    assert.ok(dto.poruthams.length >= 10);
    assert.ok(dto.calculatedAt);

    // Strict privacy checks: verify that NO sensitive fields are leaked anywhere on the DTO
    const serialized = JSON.stringify(dto);
    assert.ok(!serialized.includes("password"), "DTO must never leak password");
    assert.ok(!serialized.includes("passwordHash"), "DTO must never leak passwordHash");
    assert.ok(!serialized.includes("km_session"), "DTO must never leak session tokens");
    assert.ok(!serialized.includes("secret"), "DTO must never leak secrets");
    assert.ok(!serialized.includes("phoneNumber"), "DTO must not leak raw contact phone");

    // Verify sanitized reportHtml has no script tags
    if (dto.reportHtml) {
      assert.ok(!dto.reportHtml.includes("<script"));
      assert.ok(!dto.reportHtml.includes("onerror="));
    }
  });

  it("should strictly reject self-match attempts", async () => {
    const service = new AstrologyService();

    await assert.rejects(
      async () => {
        // Attempting to match the user with themselves
        await service.calculateMatch("usr-sandbox-101", "prf-usr-sandbox-101");
      },
      (err: any) => {
        return err.message === "CANNOT_MATCH_SELF";
      },
      "Must reject self match with CANNOT_MATCH_SELF"
    );
  });
});

describe("5. Single Horoscope: Authentic 2-Page SoftAstro Report & Uploaded Document", () => {
  it("should generate authentic 2-page natal horoscope strictly matching SoftAstro desktop software", async () => {
    const service = new AstrologyService();
    const result = await service.getSingleHoroscope("me");

    assert.equal(result.success, true);
    assert.ok(result.profile);
    assert.equal(result.profile.name, "Nagarajan P");
    assert.ok(result.reportHtml);

    // Verify strictly 2 pages
    assert.ok(result.reportHtml.includes("page-cover"), "Must contain Page 1 Cover");
    assert.ok(result.reportHtml.includes("ജാതകം"), "Must contain Malayalam Cover Title ജാതകം");
    assert.ok(result.reportHtml.includes("Page 2 of 2"), "Must contain Page 2 of 2 indicator");
    assert.ok(!result.reportHtml.includes("Page 3 of 3"), "Must NOT contain 3rd page");

    // Verify Kerala astrological elements matching SoftAstro
    assert.ok(result.reportHtml.includes("ജനന വിവരങ്ങൾ"), "Must include Birth Details header");
    assert.ok(result.reportHtml.includes("കൊല്ലവർഷം"), "Must include Kollam Era");
    assert.ok(result.reportHtml.includes("ഉത്രട്ടാതി"), "Must calculate authentic star Uthrattathi for Nagarajan");
    assert.ok(
      result.reportHtml.includes("രാശി & നവാംശം ചാർട്ടുകൾ") || result.reportHtml.includes("RASI & NAVAMSA CHARTS"),
      "Must include authentic South Indian Kundli Charts"
    );
    assert.ok(result.reportHtml.includes("ഗ്രഹ സൂചിക"), "Must include Malayalam planet legend");
  });

  it("should return uploaded document metadata when present", async () => {
    const service = new AstrologyService();
    const result = await service.getSingleHoroscope("prf-usr-sandbox-101");

    assert.equal(result.success, true);
    assert.ok(typeof result.hasUploadedDocument === "boolean");
  });
});

describe("6. Zero-Dependency Native Engine Fallback", () => {
  it("should calculate Kerala 10-Porutham compatibility without external dependencies", async () => {
    const { executeNativeAstroMatch } = await import("../modules/astrology/astrology.adapter");

    const bride = {
      name: "Lakshmi",
      gender: "female",
      dob: "1998-05-15",
      tob: "10:30",
      place: "Ernakulam",
    };

    const groom = {
      name: "Rahul",
      gender: "male",
      dob: "1995-03-20",
      tob: "14:15",
      place: "Trivandrum",
    };

    const result = executeNativeAstroMatch(bride, groom);

    assert.equal(result.success, true);
    assert.ok(result.porutham);
    assert.equal(result.porutham.items.length, 10);
    assert.ok(result.porutham.total_score >= 0 && result.porutham.total_score <= 10);
    assert.ok(["ഉത്തമം", "മദ്ധ്യമം", "അധമം"].includes(result.porutham.verdict_mal));

    // Verify 3-page report generated
    assert.ok(result.report_html);
    assert.ok(result.report_html.includes("Page 1 of 3"));
    assert.ok(result.report_html.includes("Page 2 of 3"));
    assert.ok(result.report_html.includes("Page 3 of 3"));
  });
});

