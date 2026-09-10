"use client";

import React from "react";

export interface MatrimonialLogoLoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  text?: string;
  subtext?: string;
  fullscreen?: boolean;
  inline?: boolean;
  overlay?: boolean;
  className?: string;
  staticLogo?: boolean;
  variant?: "webp" | "video" | "sequence" | "spinner";
  useVideo?: boolean;
}

// Crisp sizing for the Antigravity-style "O" ring spinner
const SIZE_MAP: Record<string, { size: number; stroke: number }> = {
  xs: { size: 18, stroke: 3.5 },
  sm: { size: 26, stroke: 3.5 },
  md: { size: 42, stroke: 4.0 },
  lg: { size: 58, stroke: 4.5 },
  xl: { size: 76, stroke: 5.0 },
};

/**
 * Antigravity-Style "O" Circular Loader
 * Ultra-fast 0ms initial render, 0KB network payload, zero video/image dependencies.
 * Renders a sleek spinning "O" ring with a subtle track and animated gradient arc.
 */
export default function MatrimonialLogoLoader({
  size = "md",
  text,
  subtext,
  fullscreen = false,
  inline = false,
  overlay = false,
  className = "",
}: MatrimonialLogoLoaderProps) {
  const isNumeric = typeof size === "number";
  const pixelSize = isNumeric ? size : SIZE_MAP[size]?.size || SIZE_MAP.md.size;
  const strokeWidth = isNumeric
    ? Math.max(2.5, Math.round(size / 9))
    : SIZE_MAP[size]?.stroke || SIZE_MAP.md.stroke;

  const isMini = typeof size === "string" && size === "xs";

  // The sleek "O" ring spinner element
  const spinnerVisual = (
    <div
      className="relative inline-flex items-center justify-center flex-shrink-0 select-none"
      style={{ width: `${pixelSize}px`, height: `${pixelSize}px` }}
      aria-hidden="true"
    >
      <svg
        className="animate-spin w-full h-full"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Track circle: complete "O" ring base with low opacity */}
        <circle
          cx="24"
          cy="24"
          r="19"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-300 dark:text-slate-700 opacity-30"
        />
        {/* Spinning "O" active arc */}
        <circle
          cx="24"
          cy="24"
          r="19"
          stroke="url(#antigravity-loader-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="119.4"
          strokeDashoffset="75"
        />
        <defs>
          <linearGradient
            id="antigravity-loader-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FF1475" />
            <stop offset="50%" stopColor="#E01853" />
            <stop offset="100%" stopColor="#C81D45" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  // 1. Inline mode (e.g. inside buttons, badges, table cells)
  if (inline) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        {spinnerVisual}
        {text && <span className="text-xs font-medium">{text}</span>}
      </span>
    );
  }

  // 2. Fullscreen overlay mode (used during explicit critical blocking actions)
  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/75 dark:bg-[#07132B]/80 backdrop-blur-xs transition-all animate-in fade-in duration-150"
        role="alert"
        aria-busy="true"
        aria-label={text || "Loading"}
      >
        <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm">
          {spinnerVisual}
          {text && (
            <p className="mt-4 text-sm font-semibold tracking-wide text-[#0A1F44] dark:text-white">
              {text}
            </p>
          )}
          {subtext && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {subtext}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 3. Container overlay mode (used for card/modal content loaders)
  if (overlay) {
    return (
      <div
        className={`absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/75 dark:bg-[#07132B]/80 backdrop-blur-xs rounded-2xl transition-all ${className}`}
        role="alert"
        aria-busy="true"
        aria-label={text || "Loading"}
      >
        {spinnerVisual}
        {text && (
          <p className="mt-3 text-xs font-semibold text-[#0A1F44] dark:text-white tracking-wide">
            {text}
          </p>
        )}
        {subtext && (
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            {subtext}
          </p>
        )}
      </div>
    );
  }

  // 4. Standard block loader (used for page loading and fallback boundaries)
  return (
    <div
      className={`flex flex-col items-center justify-center py-6 px-4 text-center ${className}`}
      role="status"
      aria-label={text || "Loading"}
    >
      {spinnerVisual}
      {text && (
        <p
          className={`mt-3 text-xs font-semibold tracking-wide text-[#0A1F44] dark:text-white ${
            isMini ? "text-[11px]" : ""
          }`}
        >
          {text}
        </p>
      )}
      {subtext && (
        <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
          {subtext}
        </p>
      )}
    </div>
  );
}

// Named exports for convenient modern usage
export {
  MatrimonialLogoLoader as SimpleLoader,
  MatrimonialLogoLoader as CircularLoader,
  MatrimonialLogoLoader as AntigravityLoader,
};
