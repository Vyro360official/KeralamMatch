"use client";

import React, { useState } from "react";
import HoroscopeSingleModal from "./horoscope-single-modal";
import { FileText, Sparkles } from "lucide-react";

interface HoroscopeSingleButtonProps {
  profile: {
    id: string;
    userId?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    gender?: string;
    dateOfBirth?: any;
    timeOfBirth?: string;
    placeOfBirth?: string;
    district?: string;
    starNakshatram?: string;
    rasi?: string;
    avatarUrl?: string | null;
    horoscopeDocumentUrl?: string | null;
    horoscopeImage?: string | null;
  };
  isOwnProfile?: boolean;
  variant?: "primary" | "secondary" | "card" | "outline" | "compact";
  defaultTab?: "software" | "uploaded";
  label?: string;
  className?: string;
}

export default function HoroscopeSingleButton({
  profile,
  isOwnProfile = false,
  variant = "primary",
  defaultTab = "software",
  label,
  className = "",
}: HoroscopeSingleButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const displayLabel =
    label ||
    (defaultTab === "uploaded"
      ? "Uploaded Horoscope"
      : isOwnProfile
      ? "View Horoscope (Astro Software)"
      : "View Horoscope");

  const isUploadedStyle = defaultTab === "uploaded";

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setModalOpen(true);
        }}
        className={`inline-flex items-center justify-center space-x-2 transition-all cursor-pointer ${
          variant === "card"
            ? `w-full py-2.5 px-4 rounded-xl border text-xs font-bold shadow-2xs hover:shadow-xs ${
                isUploadedStyle
                  ? "bg-white hover:bg-blue-50/60 text-[#0A369D] border-blue-200"
                  : "bg-white hover:bg-rose-50/60 text-[#0A1F44] hover:text-[#C81D45] border-[rgba(28,28,30,0.12)]"
              }`
            : variant === "compact"
            ? "px-3 py-1.5 rounded-lg border border-[rgba(28,28,30,0.12)] bg-white hover:bg-slate-50 text-[#0A1F44] text-[11px] font-bold"
            : `px-5 py-2.5 rounded-full border text-xs font-bold shadow-xs hover:shadow-sm ${
                isUploadedStyle
                  ? "border-blue-200 bg-white hover:bg-blue-50 text-[#0A369D]"
                  : "border-[rgba(28,28,30,0.12)] bg-white hover:bg-rose-50 text-[#0A1F44] hover:text-[#C81D45]"
              }`
        } ${className}`}
        title={displayLabel}
      >
        {isUploadedStyle ? (
          <FileText className="h-4 w-4 text-[#0A369D]" />
        ) : (
          <span className="text-[#C81D45] font-extrabold text-sm leading-none">ॐ</span>
        )}
        <span>{displayLabel}</span>
      </button>

      {modalOpen && (
        <HoroscopeSingleModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          profile={profile}
          isOwnProfile={isOwnProfile}
          initialTab={defaultTab}
        />
      )}
    </>
  );
}
