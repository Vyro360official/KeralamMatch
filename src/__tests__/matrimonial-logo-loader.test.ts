/**
 * KERALAMMATCH � MATRIMONIAL LOGO LOADER & BRAND ASSETS TEST SUITE
 * Rigorous automated tests for the centralized 60 FPS SVG + CSS matrimonial logo loader,
 * brand logo asset integration, accessibility, and global loading provider architecture.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = path.resolve(__dirname, "../..");

describe("1. Brand Assets & Logo System", () => {
  it("should have official brand emblem and logotype assets in public/brand/", () => {
    const emblemPng = path.join(PROJECT_ROOT, "public/brand/emblem.png");
    const logotypePng = path.join(PROJECT_ROOT, "public/brand/logotype.png");
    const emblemJpg = path.join(PROJECT_ROOT, "public/brand/emblem.jpg");
    const kmLogoPng = path.join(PROJECT_ROOT, "public/KM LOGO.png");

    assert.ok(fs.existsSync(emblemPng), "public/brand/emblem.png must exist");
    assert.ok(fs.existsSync(logotypePng), "public/brand/logotype.png must exist");
    assert.ok(fs.existsSync(emblemJpg), "public/brand/emblem.jpg must exist");
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

describe("2. Centralized Matrimonial Logo Loader Component", () => {
  const loaderFile = path.join(PROJECT_ROOT, "src/components/ui/matrimonial-logo-loader.tsx");

  it("should exist and export default MatrimonialLogoLoader component", () => {
    assert.ok(fs.existsSync(loaderFile), "matrimonial-logo-loader.tsx must exist");
    const content = fs.readFileSync(loaderFile, "utf-8");
    assert.ok(
      content.includes("export default function MatrimonialLogoLoader"),
      "Must have default export MatrimonialLogoLoader"
    );
  });

  it("should contain pure SVG vector paths for Groom, Bride, Heart, Sparks, and Wedding Rings", () => {
    const content = fs.readFileSync(loaderFile, "utf-8");

    // Vector parts
    assert.ok(content.includes("km-groom-group"), "Must have groom group");
    assert.ok(content.includes("km-bride-group"), "Must have bride group");
    assert.ok(content.includes("km-sparks-group"), "Must have celebration sparks");
    assert.ok(content.includes("km-ring-blue-group"), "Must have blue ring");
    assert.ok(content.includes("km-ring-pink-group"), "Must have pink ring");
    assert.ok(content.includes("km-interlock-group"), "Must have interlocked rings");

    // Brand Gradients
    assert.ok(content.includes("kmGroomGrad"), "Must define groom gradient");
    assert.ok(content.includes("kmBrideGrad"), "Must define bride gradient");
    assert.ok(content.includes("kmBlueRingGrad"), "Must define gold gradient");
  });

  it("should implement the complete 2.8s 60 FPS CSS animation sequence", () => {
    const content = fs.readFileSync(loaderFile, "utf-8");

    assert.ok(content.includes("@keyframes kmGroomAnim"), "Must define kmGroomAnim keyframe");
    assert.ok(content.includes("@keyframes kmBrideAnim"), "Must define kmBrideAnim keyframe");
    assert.ok(content.includes("@keyframes kmSparksBurst"), "Must define kmSparksBurst keyframe");
    assert.ok(content.includes("@keyframes kmBlueRingMove"), "Must define kmBlueRingMove keyframe");
    assert.ok(content.includes("@keyframes kmPinkRingMove"), "Must define kmPinkRingMove keyframe");
    assert.ok(content.includes("@keyframes kmInterlockAppear"), "Must define kmInterlockAppear keyframe");
    assert.ok(content.includes("@keyframes kmOverallPulse"), "Must define kmOverallPulse keyframe");
    assert.ok(content.includes("2.8s"), "Animation duration must be 2.8s");
  });

  it("should honor prefers-reduced-motion for accessibility", () => {
    const content = fs.readFileSync(loaderFile, "utf-8");
    assert.ok(
      content.includes("@media (prefers-reduced-motion: reduce)"),
      "Must have prefers-reduced-motion accessibility query"
    );
  });

  it("should support custom sizing, full-screen, inline, and custom messaging", () => {
    const content = fs.readFileSync(loaderFile, "utf-8");
    assert.ok(content.includes("fullscreen"), "Must support fullscreen prop");
    assert.ok(content.includes("inline"), "Must support inline prop");
    assert.ok(content.includes("overlay"), "Must support overlay prop");
    assert.ok(content.includes("size = \"md\""), "Must have default size md");
    assert.ok(content.includes("text"), "Must support text prop");
    assert.ok(content.includes("subtext"), "Must support subtext prop");
  });
});

describe("3. Global Loading Architecture & Integration", () => {
  it("should provide LoadingProvider and useLoading hook", () => {
    const providerFile = path.join(PROJECT_ROOT, "src/components/providers/loading-provider.tsx");
    assert.ok(fs.existsSync(providerFile), "loading-provider.tsx must exist");
    const content = fs.readFileSync(providerFile, "utf-8");

    assert.ok(content.includes("export function LoadingProvider"), "Must export LoadingProvider");
    assert.ok(content.includes("export function useLoading"), "Must export useLoading");
    assert.ok(content.includes("kmStartLoading"), "Must export kmStartLoading utility");
    assert.ok(content.includes("kmStopLoading"), "Must export kmStopLoading utility");
    assert.ok(content.includes("120"), "Must have 120ms anti-flicker delay threshold");
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

  it("should integrate MatrimonialLogoLoader into Horoscope Match modal & single report modal", () => {
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
