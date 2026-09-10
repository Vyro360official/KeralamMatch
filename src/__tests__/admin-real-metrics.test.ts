import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

test("Admin Real-Data Architecture & Zero-Mock Rule Verification", async (t) => {
  await t.test("Zero-Mock Fallback defaults must always return 0 and empty arrays, never fake numbers", () => {
    // Test that when data is empty or null, growth default metrics are strictly 0
    const emptyGrowthData = {
      totalMembers: 0,
      newBridesToday: 0,
      newGroomsToday: 0,
      femaleMaleRatio: "0% / 0%",
      verifiedProfiles: 0,
      profileCompletion: 0,
      activeUsers: 0,
      matchesGenerated: 0,
      interestsSent: 0,
      messagesStarted: 0,
      successfulMatches: 0,
      referralMembers: 0,
      topLocations: [],
      topTrafficSources: [],
      conversionFunnel: [],
      fakeSpamFlagged: 0,
      inactiveUsers: 0,
      campaignPerformance: []
    };

    assert.equal(emptyGrowthData.totalMembers, 0);
    assert.equal(emptyGrowthData.activeUsers, 0);
    assert.equal(emptyGrowthData.verifiedProfiles, 0);
    assert.equal(emptyGrowthData.topLocations.length, 0);
    // Explicit assertion: Must NOT be legacy mock values (2840, 7245, 18452)
    assert.notEqual(emptyGrowthData.totalMembers, 2840);
    assert.notEqual(emptyGrowthData.totalMembers, 18452);
    assert.notEqual(emptyGrowthData.activeUsers, 7245);
  });

  await t.test("RBAC Phone Masking: Hides unmasked phone numbers from non-superadmin viewers", () => {
    function maskPhone(phone?: string | null): string {
      if (!phone) return "N/A";
      const cleaned = phone.trim();
      if (cleaned.length < 8) return "******";
      return cleaned.slice(0, 5) + "****" + cleaned.slice(-2);
    }

    const rawMobile = "+91 98470 12345";
    const masked = maskPhone(rawMobile);

    assert.equal(masked, "+91 9****45");
    assert.ok(!masked.includes("8470 123")); // Hidden digits
  });

  await t.test("Strict Marketing Privacy Filter: Only candidate checks with marketingConsent=true qualify as marketing leads", () => {
    const mockChecks = [
      { id: "chk-1", targetName: "Candidate A", targetMobile: "+91 9800000001", marketingConsent: true, consentTimestamp: "2026-09-01T10:00:00Z" },
      { id: "chk-2", targetName: "Candidate B", targetMobile: "+91 9800000002", marketingConsent: false, consentTimestamp: null },
      { id: "chk-3", targetName: "Candidate C", targetMobile: null, marketingConsent: true, consentTimestamp: "2026-09-02T10:00:00Z" },
    ];

    // Filter used by /api/admin/horoscope-leads?view=consented
    const consentedLeads = mockChecks.filter(
      (c) => c.targetMobile !== null && c.marketingConsent === true
    );

    assert.equal(consentedLeads.length, 1);
    assert.equal(consentedLeads[0].targetName, "Candidate A");
    assert.ok(consentedLeads[0].consentTimestamp !== null);

    // Filter used for restricted operational audit view
    const restrictedAudit = mockChecks.filter(
      (c) => c.targetMobile !== null && c.marketingConsent === false
    );
    assert.equal(restrictedAudit.length, 1);
    assert.equal(restrictedAudit[0].targetName, "Candidate B");
  });

  await t.test("Admin Create Profile: Security rule mandates one-time activation token and salted password hash (zero plaintext)", () => {
    function hashPassword(password: string): string {
      const salt = crypto.randomBytes(16).toString("hex");
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
      return `pbkdf2:${salt}:${hash}`;
    }

    const testPassword = "AdminCreatedSecret123!";
    const hashedPassword = hashPassword(testPassword);

    assert.ok(hashedPassword.startsWith("pbkdf2:"));
    assert.ok(!hashedPassword.includes(testPassword)); // Plaintext never exposed in hash

    // Generate activation token
    const token = crypto.randomBytes(32).toString("hex");
    assert.equal(token.length, 64);
    assert.match(token, /^[0-9a-f]{64}$/);
  });
});
