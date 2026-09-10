"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";

interface CandidateImageProps {
  src?: string | null;
  alt: string;
  initials: string;
  gender?: string | null;
  isVerified?: boolean;
  isNew?: boolean;
}

export default function CandidateImage({
  src,
  alt,
  initials,
  gender,
  isVerified = false,
  isNew = true,
}: CandidateImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const showFallback = !src || hasError;

  return (
    <div className="aspect-[4/5] relative bg-slate-100 dark:bg-slate-800 overflow-hidden select-none">
      {!showFallback ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#0A1F44] via-[#162D5A] to-[#0A1F44] flex flex-col items-center justify-center text-white relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
          {/* Subtle decorative glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#FF1475]/15 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-blue-500/15 blur-2xl" />

          <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl font-extrabold shadow-lg">
            {initials || "K"}
          </div>
          <span className="text-[11px] font-semibold text-slate-300 mt-2.5 tracking-wide uppercase text-center px-2">
            {gender === "MALE" ? "Groom Profile" : "Bride Profile"}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">Photo Protected</span>
        </div>
      )}

      {/* Badges Over Image */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
        {isNew && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold shadow-xs">
            New
          </span>
        )}
        {isVerified && (
          <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold shadow-xs">
            Verified
          </span>
        )}
      </div>

      {/* Shortlist Heart Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsLiked(!isLiked);
        }}
        aria-label={isLiked ? "Remove from shortlist" : "Add to shortlist"}
        className={`absolute top-3 right-3 h-8 w-8 rounded-full ${
          isLiked
            ? "bg-[#FF1475] text-white shadow-md scale-105"
            : "bg-white/90 dark:bg-[#0A1F44]/90 text-slate-400 hover:text-[#FF1475] shadow-xs"
        } backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer z-10 active:scale-95`}
      >
        <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      </button>
    </div>
  );
}
