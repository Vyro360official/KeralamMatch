"use client";

import React from "react";
import { useHoroscopeMatch } from "./horoscope-match-context";

interface HoroscopeMatchButtonProps {
  targetProfile: {
    id: string;
    userId?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string | null;
  };
  currentUserId?: string;
  variant?: "primary" | "secondary" | "compact" | "outline" | "card";
  className?: string;
}

export default function HoroscopeMatchButton({
  targetProfile,
  currentUserId,
  variant = "primary",
  className = "",
}: HoroscopeMatchButtonProps) {
  const { openHoroscopeMatch } = useHoroscopeMatch();

  // Automatically hide when viewing own profile
  if (
    currentUserId &&
    (targetProfile.userId === currentUserId || targetProfile.id === currentUserId)
  ) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const fullName = `${targetProfile.firstName || ""} ${targetProfile.lastName || ""}`.trim() || "Candidate";

    openHoroscopeMatch({
      id: targetProfile.id,
      name: fullName,
      avatar: targetProfile.avatarUrl,
    });
  };

  // Base styling following KeralamMatch visual language:
  // white background, navy text (#0A1F44), subtle border, crimson accent on hover
  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center space-x-1 px-2.5 py-1 rounded-lg border border-[rgba(28,28,30,0.12)] bg-white hover:bg-rose-50 text-[#0A1F44] hover:text-[#C81D45] text-[10px] font-bold shadow-2xs transition-all cursor-pointer ${className}`}
        title="View Horoscope Match"
      >
        <span className="text-[#C81D45] font-extrabold text-[11px]">ॐ</span>
        <span>Horoscope</span>
      </button>
    );
  }

  if (variant === "card") {
    return (
      <button
        onClick={handleClick}
        className={`w-full py-2 px-3 rounded-xl border border-[#E9D5FF] dark:border-[#9333EA]/30 bg-[#FAF5FF] dark:bg-[#9333EA]/10 hover:bg-[#F3E8FF] dark:hover:bg-[#9333EA]/20 text-[#7E22CE] dark:text-[#C084FC] text-[11px] font-bold flex items-center justify-center space-x-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer ${className}`}
        title="Calculate Horoscope Compatibility"
      >
        <span className="text-[#7E22CE] dark:text-[#C084FC] font-extrabold text-xs">ॐ</span>
        <span>View Horoscope Match</span>
      </button>
    );
  }

  // Primary / Default button
  return (
    <button
      onClick={handleClick}
      className={`px-5 py-2.5 rounded-full border border-[rgba(28,28,30,0.12)] bg-white hover:bg-rose-50 text-[#0A1F44] hover:text-[#C81D45] hover:border-rose-200 text-xs font-bold flex items-center space-x-2 shadow-xs hover:shadow-sm transition-all cursor-pointer ${className}`}
      title="View Horoscope Match Analysis"
    >
      <span className="text-[#C81D45] font-extrabold text-sm leading-none">ॐ</span>
      <span>View Horoscope Match</span>
    </button>
  );
}
