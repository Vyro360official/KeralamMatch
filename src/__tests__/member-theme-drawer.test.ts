import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

describe("Global Member UI Consistency, PWA Right-Drawer and Theme Fix", () => {
  const rootDir = path.resolve(__dirname, "..");

  it("should verify mobile PWA drawer is anchored to the right and opens right-to-left", () => {
    const sidebarContent = fs.readFileSync(
      path.join(rootDir, "components/dashboard/dashboard-sidebar.tsx"),
      "utf-8"
    );

    assert.ok(sidebarContent.includes("right-0"), "Mobile drawer must be anchored to right-0");
    assert.ok(sidebarContent.includes("translate-x-full"), "Closed state must be translate-x-full (offscreen to the right)");
    assert.ok(sidebarContent.includes("translate-x-0"), "Open state must be translate-x-0");
    assert.ok(!sidebarContent.includes("-translate-x-full"), "Should not use -translate-x-full which slides from left");
    assert.ok(sidebarContent.includes("lg:col-span-3"), "Desktop sidebar must remain in standard left column (lg:col-span-3)");
  });

  it("should verify Tailwind CSS v4 custom variant and theme variables in globals.css", () => {
    const globalsCss = fs.readFileSync(
      path.join(rootDir, "app/globals.css"),
      "utf-8"
    );

    assert.ok(globalsCss.includes("@custom-variant dark"), "globals.css must define @custom-variant dark for Tailwind v4");
    assert.ok(globalsCss.includes("--color-bg-primary: #07132B"), "globals.css must define dark primary bg #07132B");
    assert.ok(globalsCss.includes("--color-bg-secondary: #0D1E3D"), "globals.css must define dark card bg #0D1E3D");
  });

  it("should verify ThemeProvider supports light, dark, system and syncs with km_theme", () => {
    const themeProviderContent = fs.readFileSync(
      path.join(rootDir, "components/providers/theme-provider.tsx"),
      "utf-8"
    );

    assert.ok(themeProviderContent.includes('"light" | "dark" | "system"'), "Must support light, dark, and system themes");
    assert.ok(themeProviderContent.includes("km_theme"), "Must store and sync with localStorage key km_theme");
    assert.ok(themeProviderContent.includes("useTheme"), "Must export useTheme hook");
  });

  it("should verify Root Layout prevents theme flash and wraps with ThemeProvider", () => {
    const layoutContent = fs.readFileSync(
      path.join(rootDir, "app/layout.tsx"),
      "utf-8"
    );

    assert.ok(layoutContent.includes("<ThemeProvider"), "Root layout must wrap tree with ThemeProvider");
    assert.ok(layoutContent.includes("suppressHydrationWarning"), "html element must have suppressHydrationWarning");
    assert.ok(layoutContent.includes("km_theme"), "Head must have synchronous script checking km_theme to prevent flash");
  });

  it("should verify Trust & Safety page adheres to Member Dashboard layout and compact footer", () => {
    const trustContent = fs.readFileSync(
      path.join(rootDir, "app/trust/page.tsx"),
      "utf-8"
    );

    assert.ok(trustContent.includes("DashboardSidebar"), "Trust page must include DashboardSidebar for member consistency");
    assert.ok(trustContent.includes("rounded-3xl"), "Trust page must use rounded-3xl cards matching Member Dashboard");
    assert.ok(trustContent.includes('<Footer variant="dashboard" />'), "Trust page must use compact dashboard footer");
  });

  it("should verify all authenticated member pages use the clean dashboard footer", () => {
    const memberPages = [
      "app/dashboard/page.tsx",
      "app/chat/page.tsx",
      "app/requests/page.tsx",
      "app/find/page.tsx",
      "app/profile/[id]/page.tsx",
      "app/horoscope-match/page.tsx",
      "app/notifications/page.tsx",
      "app/pricing/page.tsx",
      "app/settings/page.tsx",
      "app/trust/page.tsx",
      "app/faq/page.tsx",
      "app/privacy/page.tsx",
      "app/terms/page.tsx",
    ];

    for (const pagePath of memberPages) {
      const pageContent = fs.readFileSync(path.join(rootDir, pagePath), "utf-8");
      assert.ok(
        pageContent.includes('<Footer variant="dashboard" />'),
        `${pagePath} must use <Footer variant="dashboard" />`
      );
    }
  });
});
