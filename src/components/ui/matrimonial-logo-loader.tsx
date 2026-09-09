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
  variant?: "video" | "sequence";
  useVideo?: boolean;
}

const SIZE_MAP = {
  xs: { w: 42, h: 28 },
  sm: { w: 84, h: 56 },
  md: { w: 138, h: 93 },
  lg: { w: 190, h: 128 },
  xl: { w: 250, h: 168 },
};

export default function MatrimonialLogoLoader({
  size = "md",
  text,
  subtext,
  fullscreen = false,
  inline = false,
  overlay = false,
  className = "",
  staticLogo = false,
  variant = "video",
  useVideo,
}: MatrimonialLogoLoaderProps) {
  const dimensions =
    typeof size === "number"
      ? { w: size, h: Math.round(size * 0.672) }
      : SIZE_MAP[size] || SIZE_MAP.md;

  const isMini = typeof size === "string" && size === "xs";
  const shouldPlayVideo = (useVideo !== undefined ? useVideo : variant === "video") && !staticLogo;

  const emblemVisual = (
    <div
      className={`relative select-none pointer-events-none flex items-center justify-center ${
        staticLogo ? "km-flow-static" : "km-flow-animated"
      }`}
      style={{
        width: `${dimensions.w}px`,
        height: `${dimensions.h}px`,
      }}
      aria-hidden="true"
    >
      <style>{`
        /*
          EXACT 4-STEP USER FLOW (3.0s loop):
          1. FIRST BLUE
          2. SECOND PINK
          3. THIRD TWO RINGS COME
          4. THEN BRIGHT
        */

        @keyframes kmFirstBlue {
          0% {
            opacity: 0;
            transform: translate(-38px, 10px) scale(0.9);
            filter: brightness(1.3) drop-shadow(-8px 0 16px #0088FF);
          }
          18%, 86% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
            filter: none;
          }
          94%, 100% {
            opacity: 0;
            transform: scale(0.97);
          }
        }

        @keyframes kmSecondPink {
          0%, 18% {
            opacity: 0;
            transform: translate(38px, 10px) scale(0.9);
            filter: brightness(1.3) drop-shadow(8px 0 16px #FF1475);
          }
          36%, 86% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
            filter: none;
          }
          94%, 100% {
            opacity: 0;
            transform: scale(0.97);
          }
        }

        @keyframes kmThirdRings {
          0%, 38% {
            opacity: 0;
            transform: translateY(30px) scale(0.72);
            filter: brightness(1.2);
          }
          52% {
            opacity: 1;
            transform: translateY(-3px) scale(1.04);
            filter: drop-shadow(0 0 12px rgba(0, 136, 255, 0.4)) drop-shadow(0 0 12px rgba(255, 20, 117, 0.4));
          }
          58%, 86% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: none;
          }
          94%, 100% {
            opacity: 0;
            transform: scale(0.97);
          }
        }

        @keyframes kmThenBrightSparks {
          0%, 56% {
            opacity: 0;
            transform: scale(0.2);
            transform-origin: 50% 18%;
          }
          64% {
            opacity: 1;
            transform: scale(1.35);
            transform-origin: 50% 18%;
            filter: drop-shadow(0 0 12px #FFD700) brightness(1.5);
          }
          72%, 86% {
            opacity: 1;
            transform: scale(1);
            transform-origin: 50% 18%;
            filter: drop-shadow(0 0 6px #FFD700);
          }
          94%, 100% {
            opacity: 0;
          }
        }

        @keyframes kmThenBrightShine {
          0%, 58% {
            opacity: 0;
            transform: scale(1);
            filter: none;
          }
          66% {
            opacity: 1;
            transform: scale(1.05);
            filter: brightness(1.3) drop-shadow(0 0 30px rgba(0, 136, 255, 0.7)) drop-shadow(0 0 30px rgba(255, 20, 117, 0.7));
          }
          76% {
            opacity: 0.95;
            transform: scale(1.02);
            filter: brightness(1.15) drop-shadow(0 0 18px rgba(0, 136, 255, 0.4)) drop-shadow(0 0 18px rgba(255, 20, 117, 0.4));
          }
          86% {
            opacity: 0.9;
            transform: scale(1);
            filter: drop-shadow(0 0 10px rgba(0, 136, 255, 0.2)) drop-shadow(0 0 10px rgba(255, 20, 117, 0.2));
          }
          94%, 100% {
            opacity: 0;
          }
        }

        .km-flow-animated .km-flow-blue {
          animation: kmFirstBlue 3.0s cubic-bezier(0.2, 1, 0.35, 1) infinite;
        }
        .km-flow-animated .km-flow-pink {
          animation: kmSecondPink 3.0s cubic-bezier(0.2, 1, 0.35, 1) infinite;
        }
        .km-flow-animated .km-flow-rings {
          animation: kmThirdRings 3.0s cubic-bezier(0.34, 1.35, 0.64, 1) infinite;
        }
        .km-flow-animated .km-flow-sparks {
          animation: kmThenBrightSparks 3.0s ease-out infinite;
        }
        .km-flow-animated .km-flow-bright {
          animation: kmThenBrightShine 3.0s ease-in-out infinite;
        }

        /* Static Mode / Reduced Motion */
        .km-flow-static .km-flow-blue,
        .km-flow-static .km-flow-pink,
        .km-flow-static .km-flow-rings,
        .km-flow-static .km-flow-sparks {
          display: none !important;
        }
        .km-flow-static .km-flow-bright {
          opacity: 1 !important;
          animation: none !important;
          transform: none !important;
          filter: none !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .km-flow-animated .km-flow-blue,
          .km-flow-animated .km-flow-pink,
          .km-flow-animated .km-flow-rings,
          .km-flow-animated .km-flow-sparks {
            display: none !important;
          }
          .km-flow-animated .km-flow-bright {
            opacity: 1 !important;
            animation: none !important;
            transform: none !important;
            filter: none !important;
          }
          .km-flow-video {
            display: none !important;
          }
        }
      `}</style>

      {shouldPlayVideo ? (
        /* Video Project 2 Animation Function */
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-label="KeralamMatch Loading Animation"
          className="km-flow-video w-full h-full object-contain pointer-events-none"
        >
          <source src="/brand/loader/video-project-2.webm" type="video/webm" />
          <source src="/brand/loader/video-project-2.mp4" type="video/mp4" />
          <img
            src="/brand/emblem.png"
            alt="KeralamMatch Official Logo"
            className="w-full h-full object-contain"
          />
        </video>
      ) : null}

      {/* 4-Step Sequence: Blue -> Pink -> Rings -> Bright */}
      <div
        className={`absolute inset-0 w-full h-full ${
          shouldPlayVideo ? "hidden" : "block"
        }`}
      >
        {/* 1. FIRST BLUE */}
        <img
          src="/brand/loader/layer-blue.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain km-flow-blue"
        />
        {/* 2. SECOND PINK */}
        <img
          src="/brand/loader/layer-pink.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain km-flow-pink"
        />
        {/* 3. THIRD TWO RINGS COME */}
        <img
          src="/brand/loader/layer-rings.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain km-flow-rings"
        />
        {/* 4. THEN BRIGHT */}
        <img
          src="/brand/loader/layer-sparks.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain km-flow-sparks"
        />
        <img
          src="/brand/emblem.png"
          alt="KeralamMatch Official Logo"
          className="absolute inset-0 w-full h-full object-contain km-flow-bright drop-shadow-xs"
        />
      </div>
    </div>
  );

  if (inline) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        {emblemVisual}
        {text && <span className="text-xs font-semibold">{text}</span>}
      </span>
    );
  }

  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/92 dark:bg-[#0A1F44]/92 backdrop-blur-md transition-all animate-in fade-in duration-200"
        role="alert"
        aria-busy="true"
      >
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm">
          {emblemVisual}
          {text && (
            <p className="mt-4 text-sm font-bold tracking-wide text-[#0A1F44] dark:text-white animate-pulse">
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

  if (overlay) {
    return (
      <div
        className={`absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/85 dark:bg-[#0A1F44]/85 backdrop-blur-xs rounded-2xl transition-all ${className}`}
        role="alert"
        aria-busy="true"
      >
        {emblemVisual}
        {text && (
          <p className="mt-3 text-xs font-bold text-[#0A1F44] dark:text-white tracking-wide">
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

  return (
    <div className={`flex flex-col items-center justify-center py-6 px-4 text-center ${className}`}>
      {emblemVisual}
      {text && (
        <p className={`mt-3.5 text-xs font-bold tracking-wide text-[#0A1F44] dark:text-white ${isMini ? "text-[11px]" : ""}`}>
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
