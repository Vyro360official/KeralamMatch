import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  AdminHealthService,
  sanitizeOutput,
} from "../modules/admin/admin-health.service";

describe("Admin Health Checkup & Operational Diagnostics", () => {
  // 1. Output Sanitization & Zero Secrets Leakage
  describe("Security & Sensitive Data Redaction (sanitizeOutput)", () => {
    test("should redact PostgreSQL connection strings with credentials", () => {
      const raw = "Connection failed: postgresql://admin_user:SuperSecretP@ssw0rd@neon-db-123.ap-southeast-1.aws.neon.tech/keralammatch_prod?sslmode=require";
      const sanitized = sanitizeOutput(raw);
      assert.equal(sanitized.includes("admin_user"), false);
      assert.equal(sanitized.includes("SuperSecretP@ssw0rd"), false);
      assert.equal(sanitized.includes("neon-db-123"), false);
      assert.ok(sanitized.includes("[REDACTED_USER:REDACTED_PASSWORD]@[REDACTED_HOST]"));
    });

    test("should redact Bearer authorization tokens", () => {
      const raw = "Upstream HTTP 401 error with header Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0";
      const sanitized = sanitizeOutput(raw);
      assert.equal(sanitized.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"), false);
      assert.ok(sanitized.includes("Bearer [REDACTED_TOKEN]"));
    });

    test("should redact private keys in pem format", () => {
      const raw = "Firebase Admin cert error: -----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD...==\n-----END PRIVATE KEY----- could not load";
      const sanitized = sanitizeOutput(raw);
      assert.equal(sanitized.includes("MIIEvgIBADANBgkqhki"), false);
      assert.ok(sanitized.includes("[REDACTED_PRIVATE_KEY]"));
    });

    test("should redact passwords and secrets in key-value format", () => {
      const raw = "Config loaded: password=\"prod_secret_1234\", secret='shh_top_secret'";
      const sanitized = sanitizeOutput(raw);
      assert.equal(sanitized.includes("prod_secret_1234"), false);
      assert.equal(sanitized.includes("shh_top_secret"), false);
      assert.ok(sanitized.includes("password=[REDACTED]"));
      assert.ok(sanitized.includes("secret=[REDACTED]"));
    });
  });

  // 2. Admin Pages & Links Registry
  describe("Admin Pages & Links Registry Check", () => {
    test("should return all 16 registered admin pages", async () => {
      const pages = await AdminHealthService.checkAdminPages();
      assert.equal(pages.length, 16);
      for (const page of pages) {
        assert.equal(page.tab, "admin");
        assert.equal(page.category, "pages");
        assert.ok(page.route?.startsWith("/admin"));
        assert.ok(["WORKING", "PROTECTED", "WARNING"].includes(page.status));
      }
    });

    test("should include settings health checkup page in admin registry", async () => {
      const pages = await AdminHealthService.checkAdminPages();
      const healthPage = pages.find((p) => p.route === "/admin/settings/health-checkup");
      assert.ok(healthPage, "Health Checkup route must be present in admin pages registry");
      assert.equal(healthPage?.name, "Health Checkup Center");
    });
  });

  // 3. Admin APIs Registry
  describe("Admin APIs Registry Check", () => {
    test("should return all 14 registered admin APIs", async () => {
      const apis = await AdminHealthService.checkAdminAPIs();
      assert.equal(apis.length, 14);
      for (const api of apis) {
        assert.equal(api.tab, "admin");
        assert.equal(api.category, "apis");
        assert.ok(api.api?.startsWith("/api/admin"));
        assert.ok(api.method !== undefined);
        assert.ok(api.expectedStatus !== undefined);
      }
    });

    test("should include health check API in admin APIs list", async () => {
      const apis = await AdminHealthService.checkAdminAPIs();
      const healthApi = apis.find((a) => a.api === "/api/admin/health-check");
      assert.ok(healthApi, "Health Check API route must be present in registry");
      assert.equal(healthApi?.method, "GET");
    });
  });

  // 4. Admin Modules & Security Checks
  describe("Admin Modules and Security Hardening Checks", () => {
    test("should return 16 core admin functional modules", async () => {
      const modules = await AdminHealthService.checkAdminModules();
      assert.equal(modules.length, 16);
      for (const mod of modules) {
        assert.equal(mod.tab, "admin");
        assert.equal(mod.category, "modules");
        assert.equal(mod.status, "WORKING");
      }
    });

    test("should verify admin security posture (RBAC, PII, Cookies, PBKDF2)", async () => {
      const secChecks = await AdminHealthService.checkAdminSecurity();
      assert.ok(secChecks.length >= 5);
      const rbac = secChecks.find((s) => s.id === "sec_rbac");
      const pii = secChecks.find((s) => s.id === "sec_pii_masking");
      const cookie = secChecks.find((s) => s.id === "sec_cookies");

      assert.ok(rbac, "RBAC check must exist");
      assert.ok(pii, "PII masking check must exist");
      assert.ok(cookie, "Secure Cookie check must exist");
      assert.equal(rbac?.status, "WORKING");
      assert.equal(pii?.status, "WORKING");
    });
  });

  // 5. Member Diagnostics (Pages, APIs, Functional, Roles)
  describe("Member Operational Diagnostics View", () => {
    test("should return 13 member pages with protected routes classified properly", async () => {
      const pages = await AdminHealthService.checkMemberPages();
      assert.equal(pages.length, 13);
      for (const p of pages) {
        assert.equal(p.tab, "member");
        assert.equal(p.category, "pages");
      }

      const protectedDash = pages.find((p) => p.route === "/dashboard");
      assert.ok(protectedDash);
      assert.equal(protectedDash?.status, "PROTECTED");
    });

    test("should return 10 member APIs", async () => {
      const apis = await AdminHealthService.checkMemberAPIs();
      assert.equal(apis.length, 10);
      for (const a of apis) {
        assert.equal(a.tab, "member");
        assert.equal(a.category, "apis");
        assert.ok(a.api?.startsWith("/api/"));
      }
    });

    test("should return 24 member functional capability checks", async () => {
      const funcs = await AdminHealthService.checkMemberFunctional();
      assert.equal(funcs.length, 24);
      for (const f of funcs) {
        assert.equal(f.tab, "member");
        assert.equal(f.category, "functional");
        assert.equal(f.status, "WORKING");
      }
    });

    test("should enforce Bride/Groom opposite gender search policy", async () => {
      const roleChecks = await AdminHealthService.checkBrideGroomRoles();
      assert.equal(roleChecks.length, 3);
      const maleCheck = roleChecks.find((r) => r.id === "role_male_enforcement");
      const femaleCheck = roleChecks.find((r) => r.id === "role_female_enforcement");
      const horoCheck = roleChecks.find((r) => r.id === "role_horoscope_enforcement");

      assert.ok(maleCheck);
      assert.ok(femaleCheck);
      assert.ok(horoCheck);
      assert.equal(maleCheck?.status, "WORKING");
      assert.equal(femaleCheck?.status, "WORKING");
      assert.equal(horoCheck?.status, "WORKING");
      assert.ok(maleCheck?.message.includes("Male"));
      assert.ok(femaleCheck?.message.includes("Female"));
    });
  });

  // 6. SoftAstro Non-Destructive Fixture Test
  describe("SoftAstro Non-Destructive Health Fixture", () => {
    test("should execute SoftAstro match calculation fixture without modifying DB", async () => {
      const result = await AdminHealthService.checkSoftAstro();
      assert.equal(result.id, "service_softastro");
      assert.equal(result.tab, "admin");
      assert.equal(result.category, "horoscope");
      assert.ok(["WORKING", "ERROR"].includes(result.status));
      assert.ok(typeof result.durationMs === "number");
    });
  });

  // 7. Full Diagnostics Orchestrator & Scopes
  describe("AdminHealthService.runAllDiagnostics()", () => {
    test("should execute scope='all' returning aggregated admin and member diagnostics", async () => {
      const res = await AdminHealthService.runAllDiagnostics("all");
      assert.equal(res.success, true);
      assert.ok(res.summary);
      assert.ok(res.summary.totalChecks > 50);
      assert.ok(["OPERATIONAL", "DEGRADED", "CRITICAL"].includes(res.summary.overallStatus));
      assert.ok(Array.isArray(res.adminChecks));
      assert.ok(Array.isArray(res.memberChecks));
      assert.ok(Array.isArray(res.history));
      assert.ok(Array.isArray(res.incidents));
      assert.ok(res.history.length >= 1);
    });

    test("should execute scope='admin' focusing on admin checks", async () => {
      const res = await AdminHealthService.runAllDiagnostics("admin");
      assert.equal(res.success, true);
      assert.ok(res.adminChecks.length > 0);
      assert.ok(res.summary.totalChecks === res.adminChecks.length);
    });

    test("should execute scope='member' focusing on member checks", async () => {
      const res = await AdminHealthService.runAllDiagnostics("member");
      assert.equal(res.success, true);
      assert.ok(res.memberChecks.length > 0);
      assert.ok(res.summary.totalChecks === res.memberChecks.length);
    });
  });
});
