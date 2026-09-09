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
}

const SIZE_MAP = {
  xs: 36,
  sm: 64,
  md: 104,
  lg: 144,
  xl: 184,
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
}: MatrimonialLogoLoaderProps) {
  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 104;
  const isMini = pixelSize <= 48;

  const svgContent = (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${
        staticLogo ? "km-loader-static" : "km-loader-animated"
      }`}
      style={{ width: pixelSize, height: Math.round(pixelSize * 0.89) }}
      aria-label="Loading..."
      role="status"
    >
      <svg
        viewBox="0 0 280 250"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible drop-shadow-xs"
      >
        <defs>
          <linearGradient id="kmGroomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0052CC" />
            <stop offset="40%" stopColor="#007BFF" />
            <stop offset="85%" stopColor="#00D2FF" />
            <stop offset="100%" stopColor="#38E1FF" />
          </linearGradient>

          <linearGradient id="kmGroomHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#A6E1FF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0088FF" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="kmBrideGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C2005A" />
            <stop offset="40%" stopColor="#FF1475" />
            <stop offset="85%" stopColor="#FF6EB3" />
            <stop offset="100%" stopColor="#FFA8D8" />
          </linearGradient>

          <linearGradient id="kmBrideHighlight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#FFB3DC" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FF1475" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="kmBlueRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0040A8" />
            <stop offset="35%" stopColor="#0077FF" />
            <stop offset="70%" stopColor="#70D4FF" />
            <stop offset="100%" stopColor="#0056D6" />
          </linearGradient>

          <linearGradient id="kmPinkRingGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A30048" />
            <stop offset="35%" stopColor="#FF1A7D" />
            <stop offset="70%" stopColor="#FFA8D5" />
            <stop offset="100%" stopColor="#BD0055" />
          </linearGradient>
        </defs>

        <style>{`
          @keyframes kmGroomAnim {
            0% {
              opacity: 0;
              transform: translate(-28px, 8px) scale(0.92);
            }
            18% {
              opacity: 1;
              transform: translate(0, 0) scale(1);
            }
            84% {
              opacity: 1;
              transform: translate(0, 0) scale(1);
            }
            94%, 100% {
              opacity: 0;
              transform: scale(0.98);
            }
          }

          @keyframes kmGroomStroke {
            0% {
              stroke-dashoffset: 480;
            }
            22%, 84% {
              stroke-dashoffset: 0;
            }
            94%, 100% {
              stroke-dashoffset: 0;
            }
          }

          @keyframes kmBrideAnim {
            0%, 14% {
              opacity: 0;
              transform: translate(28px, 8px) scale(0.92);
            }
            34% {
              opacity: 1;
              transform: translate(0, 0) scale(1);
            }
            84% {
              opacity: 1;
              transform: translate(0, 0) scale(1);
            }
            94%, 100% {
              opacity: 0;
              transform: scale(0.98);
            }
          }

          @keyframes kmBrideStroke {
            0%, 14% {
              stroke-dashoffset: 480;
            }
            38%, 84% {
              stroke-dashoffset: 0;
            }
            94%, 100% {
              stroke-dashoffset: 0;
            }
          }

          @keyframes kmSparksBurst {
            0%, 34% {
              opacity: 0;
              transform: scale(0.25);
              transform-origin: 140px 115px;
            }
            44% {
              opacity: 1;
              transform: scale(1.2);
              transform-origin: 140px 115px;
            }
            52% {
              opacity: 0.95;
              transform: scale(1);
              transform-origin: 140px 115px;
            }
            84% {
              opacity: 0.95;
            }
            94%, 100% {
              opacity: 0;
            }
          }

          @keyframes kmBlueRingMove {
            0%, 46% {
              opacity: 0;
              transform: translate(-30px, 4px) scale(0.65);
              transform-origin: 120px 165px;
            }
            56% {
              opacity: 1;
              transform: translate(-22px, 0) scale(1);
              transform-origin: 120px 165px;
            }
            70%, 84% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            94%, 100% {
              opacity: 0;
            }
          }

          @keyframes kmPinkRingMove {
            0%, 46% {
              opacity: 0;
              transform: translate(30px, 4px) scale(0.65);
              transform-origin: 160px 165px;
            }
            56% {
              opacity: 1;
              transform: translate(22px, 0) scale(1);
              transform-origin: 160px 165px;
            }
            70%, 84% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            94%, 100% {
              opacity: 0;
            }
          }

          @keyframes kmInterlockAppear {
            0%, 66% {
              opacity: 0;
            }
            73%, 84% {
              opacity: 1;
            }
            94%, 100% {
              opacity: 0;
            }
          }

          @keyframes kmOverallPulse {
            0%, 72% {
              transform: scale(1);
              filter: none;
            }
            80% {
              transform: scale(1.035);
              filter: drop-shadow(0 0 16px rgba(0, 136, 255, 0.45)) drop-shadow(0 0 16px rgba(255, 20, 117, 0.45));
            }
            88% {
              transform: scale(1);
              filter: drop-shadow(0 0 8px rgba(0, 136, 255, 0.2)) drop-shadow(0 0 8px rgba(255, 20, 117, 0.2));
            }
            94%, 100% {
              transform: scale(0.98);
              filter: none;
            }
          }

          .km-loader-animated .km-groom-group {
            animation: kmGroomAnim 2.8s cubic-bezier(0.25, 1, 0.5, 1) infinite;
          }
          .km-loader-animated .km-groom-stroke {
            stroke-dasharray: 480;
            animation: kmGroomStroke 2.8s ease-out infinite;
          }
          .km-loader-animated .km-bride-group {
            animation: kmBrideAnim 2.8s cubic-bezier(0.25, 1, 0.5, 1) infinite;
          }
          .km-loader-animated .km-bride-stroke {
            stroke-dasharray: 480;
            animation: kmBrideStroke 2.8s ease-out infinite;
          }
          .km-loader-animated .km-sparks-group {
            animation: kmSparksBurst 2.8s ease-out infinite;
          }
          .km-loader-animated .km-ring-blue-group {
            animation: kmBlueRingMove 2.8s cubic-bezier(0.34, 1.4, 0.64, 1) infinite;
          }
          .km-loader-animated .km-ring-pink-group {
            animation: kmPinkRingMove 2.8s cubic-bezier(0.34, 1.4, 0.64, 1) infinite;
          }
          .km-loader-animated .km-interlock-group {
            animation: kmInterlockAppear 2.8s ease-in-out infinite;
          }
          .km-loader-animated .km-pulse-container {
            animation: kmOverallPulse 2.8s ease-in-out infinite;
            transform-origin: 140px 135px;
          }

          /* Accessibility: Reduced Motion */
          @media (prefers-reduced-motion: reduce) {
            .km-loader-animated * {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
              stroke-dashoffset: 0 !important;
              filter: none !important;
            }
          }
        `}</style>

        <g className="km-pulse-container">
          <g className="km-sparks-group">
            <polygon points="140,50 142,118 138,118" fill="#E60067" />
            <path d="M 140 118 L 140 45" stroke="#FF1475" strokeWidth="2.5" strokeLinecap="round" />
            
            <path d="M 136 119 L 122 72" stroke="#0077FF" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 133 120 L 108 92" stroke="#00C4FF" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="98" cy="112" r="2.5" fill="#0088FF" />
            <circle cx="86" cy="132" r="1.8" fill="#00C4FF" />

            <path d="M 144 119 L 158 72" stroke="#FF1A7D" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 147 120 L 172 92" stroke="#FFA6D5" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="182" cy="112" r="2.5" fill="#FF1A7D" />
            <circle cx="194" cy="132" r="1.8" fill="#FFA6D5" />
          </g>

          <g className="km-groom-group">
            <path
              d="M 32 105 C 18 155 54 210 120 224"
              fill="none"
              stroke="#00A3FF"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.45"
              className="km-groom-stroke"
            />
            <path
              d="M 44 125 C 38 165 72 212 128 221"
              fill="none"
              stroke="#80D0FF"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.7"
              className="km-groom-stroke"
            />
          </g>

          <g className="km-bride-group">
            <path
              d="M 248 105 C 262 155 226 210 160 224"
              fill="none"
              stroke="#FF6BB5"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.45"
              className="km-bride-stroke"
            />
            <path
              d="M 236 125 C 242 165 208 212 152 221"
              fill="none"
              stroke="#FFA8D5"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.7"
              className="km-bride-stroke"
            />
          </g>

          <g className="km-groom-group">
            <path
              d="M 140 122 C 112 76 68 52 38 74 C 12 94 14 138 42 178 C 66 210 106 220 138 221 C 104 214 62 192 46 160 C 30 128 34 94 56 76 C 76 60 114 68 140 122 Z"
              fill="url(#kmGroomGrad)"
            />
            <path
              d="M 138 122 C 115 88 84 74 62 88 C 44 100 38 130 52 164"
              fill="none"
              stroke="url(#kmGroomHighlight)"
              strokeWidth="4.2"
              strokeLinecap="round"
              opacity="0.9"
            />
          </g>

          <g className="km-bride-group">
            <path
              d="M 140 122 C 168 76 212 52 242 74 C 268 94 266 138 238 178 C 214 210 174 220 142 221 C 176 214 218 192 234 160 C 250 128 246 94 224 76 C 204 60 166 68 140 122 Z"
              fill="url(#kmBrideGrad)"
            />
            <path
              d="M 142 122 C 165 88 196 74 218 88 C 236 100 242 130 228 164"
              fill="none"
              stroke="url(#kmBrideHighlight)"
              strokeWidth="4.2"
              strokeLinecap="round"
              opacity="0.9"
            />
          </g>

          <g className="km-ring-blue-group">
            <circle cx="120" cy="165" r="32" fill="none" stroke="url(#kmBlueRingGrad)" strokeWidth="9" strokeLinecap="round" />
            <circle cx="120" cy="165" r="27.5" fill="none" stroke="#A8E4FF" strokeWidth="1.8" opacity="0.75" />
          </g>

          <g className="km-ring-pink-group">
            <circle cx="160" cy="165" r="32" fill="none" stroke="url(#kmPinkRingGrad)" strokeWidth="9" strokeLinecap="round" />
            <circle cx="160" cy="165" r="27.5" fill="none" stroke="#FFC2E5" strokeWidth="1.8" opacity="0.75" />
          </g>

          <g className="km-interlock-group">
            <path
              d="M 136 138 A 32 32 0 0 1 152 165"
              fill="none"
              stroke="url(#kmBlueRingGrad)"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M 134 141 A 27.5 27.5 0 0 1 147.5 165"
              fill="none"
              stroke="#A8E4FF"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.75"
            />
          </g>
        </g>
      </svg>
    </div>
  );

  if (inline) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        {svgContent}
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
          {svgContent}
          {text && (
            <p className="mt-5 text-sm font-bold tracking-wide text-[#0A1F44] dark:text-white animate-pulse">
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
        {svgContent}
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
      {svgContent}
      {text && (
        <p className={`mt-3 text-xs font-bold tracking-wide text-[#0A1F44] dark:text-white ${isMini ? "text-[11px]" : ""}`}>
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
