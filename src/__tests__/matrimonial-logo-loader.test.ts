/**
 * KERALAMMATCH — MATRIMONIAL LOGO LOADER & BRAND ASSETS TEST SUITE
 * Rigorous automated tests for the centralized 60 FPS matrimonial logo loader,
 * brand logo asset integration, accessibility, and global loading provider architecture.
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

  it("should have Video Project 2 animation video assets in public/brand/loader/", () => {
    const mp4Video = path.join(PROJECT_ROOT, "public/brand/loader/video-project-2.mp4");
    const webmVideo = path.join(PROJECT_ROOT, "public/brand/loader/video-project-2.webm");

    const webpAsset = path.join(PROJECT_ROOT, "public/brand/loader/matrimonial-loader.webp");
    assert.ok(fs.existsSync(webpAsset), "matrimonial-loader.webp must exist");
    assert.ok(fs.statSync(webpAsset).size > 10000, "matrimonial-loader.webp must be non-empty");
    assert.ok(fs.existsSync(mp4Video), "video-project-2.mp4 must exist");
    assert.ok(fs.existsSync(webmVideo), "video-project-2.webm must exist");
    assert.ok(fs.statSync(mp4Video).size > 10000, "video-project-2.mp4 must be non-empty");
    assert.ok(fs.statSync(webmVideo).size > 10000, "video-project-2.webm must be non-empty");
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

  it("should implement the exact 4-step sequence: Blue -> Pink -> Rings -> Bright", () => {
    const content = fs.readFileSync(loaderFile, "utf-8");

    assert.ok(content.includes("km-flow-blue"), "Must have first blue layer");
    assert.ok(content.includes("km-flow-pink"), "Must have second pink layer");
    assert.ok(content.includes("km-flow-rings"), "Must have third rings layer");
    assert.ok(content.includes("km-flow-bright"), "Must have then bright layer");

    assert.ok(content.includes("@keyframes kmFirstBlue"), "Must define kmFirstBlue keyframe");
    assert.ok(content.includes("@keyframes kmSecondPink"), "Must define kmSecondPink keyframe");
    assert.ok(content.includes("@keyframes kmThirdRings"), "Must define kmThirdRings keyframe");
    assert.ok(content.includes("@keyframes kmThenBrightShine"), "Must define kmThenBrightShine keyframe");
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
    assert.ok(content.includes('size = "md"'), "Must have default size md");
    assert.ok(content.includes("text"), "Must support text prop");
    assert.ok(content.includes("subtext"), "Must support subtext prop");
  });

  it("should integrate Video Project 2 video animation with seamless fallback", () => {
    const content = fs.readFileSync(loaderFile, "utf-8");
    assert.ok(content.includes("video-project-2.webm"), "Must reference video-project-2.webm");
    assert.ok(content.includes("video-project-2.mp4"), "Must reference video-project-2.mp4");
    assert.ok(content.includes("matrimonial-loader.webp"), "Must reference matrimonial-loader.webp");
    assert.ok(content.includes('variant = "webp"'), "Must default to webp variant for instant performance");
    assert.ok(content.includes("km-flow-video"), "Must define km-flow-video class");
      });
});

describe("3. Global Loading Architecture and Integration", () => {
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
