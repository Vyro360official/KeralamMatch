/**
 * KERALAMMATCH — ANTIGRAVITY-STYLE "O" CIRCULAR SPINNER & LOADING SUITE
 * Tests for the high-performance circular "O" loader, accessibility,
 * zero navigation click interception delay, and seamless component integration.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = path.resolve(__dirname, "../..");

describe("1. Brand Assets and Logo System", () => {
  it("should have official brand emblem and logotype assets in public/brand/", () => {
    const emblemPng = path.join(PROJECT_ROOT, "public/brand/emblem.png");
    const logotypePng = path.join(PROJECT_ROOT, "public/brand/logotype.png");
    const kmLogoPng = path.join(PROJECT_ROOT, "public/KM LOGO.png");

    assert.ok(fs.existsSync(emblemPng), "public/brand/emblem.png must exist");
    assert.ok(fs.existsSync(logotypePng), "public/brand/logotype.png must exist");
    assert.ok(fs.existsSync(kmLogoPng), "public/KM LOGO.png must exist");

    assert.ok(fs.statSync(emblemPng).size > 1000, "emblem.png must be non-empty");
    assert.ok(fs.statSync(logotypePng).size > 1000, "logotype.png must be non-empty");
    assert.ok(fs.statSync(kmLogoPng).size > 1000, "KM LOGO.png must be non-empty");
  });

  it("should render official brand assets in Logo component", () => {
    const logoFile = path.join(PROJECT_ROOT, "src/components/shared/logo.tsx");
    assert.ok(fs.existsSync(logoFile), "src/components/shared/logo.tsx must exist");
    const content = fs.readFileSync(logoFile, "utf-8");

    assert.ok(
      content.includes("/brand/emblem.png"),
      "Logo component must reference /brand/emblem.png"
    );
    assert.ok(
      content.includes("/brand/logotype.png"),
      "Logo component must reference /brand/logotype.png"
    );
  });
});

describe("2. Antigravity-Style 'O' Circular Spinner Loader Component", () => {
  const loaderFile = path.join(PROJECT_ROOT, "src/components/ui/matrimonial-logo-loader.tsx");

  it("should exist and export default MatrimonialLogoLoader component with AntigravityLoader alias", () => {
    assert.ok(fs.existsSync(loaderFile), "matrimonial-logo-loader.tsx must exist");
    const content = fs.readFileSync(loaderFile, "utf-8");
    assert.ok(
      content.includes("export default function MatrimonialLogoLoader"),
      "Must have default export MatrimonialLogoLoader"
    );
    assert.ok(
      content.includes("AntigravityLoader"),
      "Must export AntigravityLoader alias"
    );
  });

  it("should render an Antigravity-style 'O' circular spinner with SVG and spinning arc", () => {
    const content = fs.readFileSync(loaderFile, "utf-8");

    assert.ok(content.includes("animate-spin"), "Must use smooth animate-spin");
    assert.ok(content.includes("<svg"), "Must render vector SVG circular spinner");
    assert.ok(content.includes("strokeDasharray"), "Must have strokeDasharray for active arc");
    assert.ok(content.includes("strokeLinecap=\"round\""), "Must have rounded arc caps");
    assert.ok(content.includes("linearGradient"), "Must render modern branded gradient");
  });

  it("should not contain video elements or heavy animation keyframes in the loader", () => {
    const content = fs.readFileSync(loaderFile, "utf-8");

    assert.ok(!content.includes("<video"), "Must not render heavy <video> elements in loader");
    assert.ok(!content.includes("@keyframes kmFirstBlue"), "Must not use multi-step delay keyframes");
    assert.ok(!content.includes("@keyframes kmSecondPink"), "Must not use multi-step delay keyframes");
  });

  it("should support custom sizing, full-screen, inline, and custom messaging", () => {
    const content = fs.readFileSync(loaderFile, "utf-8");
    assert.ok(content.includes("fullscreen"), "Must support fullscreen prop");
    assert.ok(content.includes("inline"), "Must support inline prop");
    assert.ok(content.includes("overlay"), "Must support overlay prop");
    assert.ok(content.includes('size = "md"'), "Must have default size md");
    assert.ok(content.includes("text"), "Must support text prop");
    assert.ok(content.includes("subtext"), "Must support subtext prop");
  });
});

describe("3. Global Loading Architecture and Delay Removal", () => {
  it("should provide LoadingProvider without document click hijacking", () => {
    const providerFile = path.join(PROJECT_ROOT, "src/components/providers/loading-provider.tsx");
    assert.ok(fs.existsSync(providerFile), "loading-provider.tsx must exist");
    const content = fs.readFileSync(providerFile, "utf-8");

    assert.ok(content.includes("export function LoadingProvider"), "Must export LoadingProvider");
    assert.ok(content.includes("export function useLoading"), "Must export useLoading");
    assert.ok(content.includes("kmStartLoading"), "Must export kmStartLoading utility");
    assert.ok(content.includes("kmStopLoading"), "Must export kmStopLoading utility");

    // Critical: verify no handleDocumentClick intercepting link clicks
    assert.ok(
      !content.includes("handleDocumentClick"),
      "Must not intercept document link clicks causing navigation delays"
    );
  });

  it("should have root loading.tsx boundary in src/app/loading.tsx", () => {
    const rootLoading = path.join(PROJECT_ROOT, "src/app/loading.tsx");
    assert.ok(fs.existsSync(rootLoading), "src/app/loading.tsx must exist");
    const content = fs.readFileSync(rootLoading, "utf-8");
    assert.ok(
      content.includes("MatrimonialLogoLoader"),
      "root loading.tsx must use MatrimonialLogoLoader"
    );
  });

  it("should have root layout.tsx wrapped with LoadingProvider", () => {
    const layoutFile = path.join(PROJECT_ROOT, "src/app/layout.tsx");
    const content = fs.readFileSync(layoutFile, "utf-8");
    assert.ok(
      content.includes("<LoadingProvider>"),
      "layout.tsx must wrap children with <LoadingProvider>"
    );
  });

  it("should have profile loading boundary in src/app/profile/[id]/loading.tsx", () => {
    const profileLoading = path.join(PROJECT_ROOT, "src/app/profile/[id]/loading.tsx");
    assert.ok(fs.existsSync(profileLoading), "src/app/profile/[id]/loading.tsx must exist");
    const content = fs.readFileSync(profileLoading, "utf-8");
    assert.ok(
      content.includes("MatrimonialLogoLoader"),
      "profile loading.tsx must use MatrimonialLogoLoader"
    );
  });

  it("should integrate MatrimonialLogoLoader into global UI Button", () => {
    const buttonFile = path.join(PROJECT_ROOT, "src/components/ui/button.tsx");
    const content = fs.readFileSync(buttonFile, "utf-8");
    assert.ok(
      content.includes("MatrimonialLogoLoader"),
      "Button component must use MatrimonialLogoLoader for isLoading state"
    );
  });

  it("should integrate MatrimonialLogoLoader into Horoscope Match modal and single report modal", () => {
    const matchModal = path.join(PROJECT_ROOT, "src/components/astrology/horoscope-match-modal.tsx");
    const singleModal = path.join(PROJECT_ROOT, "src/components/astrology/horoscope-single-modal.tsx");

    assert.ok(fs.readFileSync(matchModal, "utf-8").includes("MatrimonialLogoLoader"));
    assert.ok(fs.readFileSync(singleModal, "utf-8").includes("MatrimonialLogoLoader"));
  });

  it("should integrate MatrimonialLogoLoader into Horoscope Match View page", () => {
    const matchView = path.join(PROJECT_ROOT, "src/app/horoscope-match/horoscope-match-view.tsx");
    const content = fs.readFileSync(matchView, "utf-8");
    assert.ok(
      content.includes("MatrimonialLogoLoader"),
      "horoscope-match-view.tsx must use MatrimonialLogoLoader"
    );
  });
});

