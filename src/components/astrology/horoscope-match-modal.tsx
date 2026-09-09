"use client";

import React, { useEffect, useRef } from "react";
import { useHoroscopeMatch } from "./horoscope-match-context";
import MatrimonialLogoLoader from "@/components/ui/matrimonial-logo-loader";
import {
  X,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function HoroscopeMatchModal() {
  const {
    isOpen,
    targetProfile,
    loading,
    error,
    errorDetails,
    result,
    fullReportOpen,
    closeHoroscopeMatch,
    openFullReport,
    closeFullReport,
  } = useHoroscopeMatch();

  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (fullReportOpen) {
          closeFullReport();
        } else if (isOpen) {
          closeHoroscopeMatch();
        }
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, fullReportOpen, closeHoroscopeMatch, closeFullReport]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeHoroscopeMatch();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="horoscope-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-[rgba(28,28,30,0.08)] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#FCFBF7] flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-[#C81D45] font-extrabold text-sm">
              ॐ
            </div>
            <div>
              <h2 id="horoscope-modal-title" className="text-sm sm:text-base font-extrabold text-[#0A1F44]">
                Horoscope Match Analysis
              </h2>
              <p className="text-[10px] text-[#636366] font-medium">
                Authentic 10-Porutham & Dasa Evaluation
              </p>
            </div>
          </div>
          <button
            onClick={closeHoroscopeMatch}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close horoscope analysis dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-[#1C1C1E]">
          {/* Loading State */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center">
              <MatrimonialLogoLoader
                size="md"
                text="Calculating Horoscope Compatibility..."
                subtext="Executing high-precision planetary calculations and traditional Kerala Porutham alignments."
              />
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs">
                <AlertCircle className="h-4 w-4 text-[#C81D45] flex-shrink-0" />
                <span>Horoscope Compatibility Notice</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed font-medium">{error}</p>

              {errorDetails?.missingFields && errorDetails.missingFields.length > 0 && (
                <div className="pt-2 border-t border-rose-200/60 space-y-1">
                  <span className="text-[11px] font-bold text-rose-800 block">Missing Information:</span>
                  <ul className="text-[11px] text-rose-700 list-disc list-inside space-y-0.5">
                    {errorDetails.missingFields.map((f: string, i: number) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-rose-600 mt-2 font-medium">
                    Please update your profile in Account Settings or ask the candidate to provide birth details.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Results View */}
          {!loading && !error && result && (
            <>
              {/* Profile Comparison Header */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)]">
                {/* Current User */}
                <div className="space-y-1.5 text-left border-r border-slate-200/80 pr-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E8E93] block">
                    You ({result.currentUser.gender === "FEMALE" ? "Bride" : "Groom"})
                  </span>
                  <div className="flex items-center space-x-2">
                    {result.currentUser.avatarUrl ? (
                      <img
                        src={result.currentUser.avatarUrl}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover border border-[#C81D45]/30"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#FCE8EC] text-[#C81D45] flex items-center justify-center font-bold text-xs">
                        {result.currentUser.displayName.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs font-bold text-[#0A1F44] truncate block">
                      {result.currentUser.displayName}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#636366] space-y-0.5 pt-1">
                    <div className="font-semibold text-[#0A1F44]">
                      ★ {result.currentUser.starNakshatram} ({result.currentUser.rasi})
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-[#8E8E93]">
                      <Calendar className="h-2.5 w-2.5" />
                      <span>{result.currentUser.dateOfBirth} · {result.currentUser.timeOfBirth}</span>
                    </div>
                  </div>
                </div>

                {/* Target User */}
                <div className="space-y-1.5 text-left pl-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E8E93] block">
                    Match ({result.targetUser.gender === "FEMALE" ? "Bride" : "Groom"})
                  </span>
                  <div className="flex items-center space-x-2">
                    {result.targetUser.avatarUrl ? (
                      <img
                        src={result.targetUser.avatarUrl}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover border border-[#C81D45]/30"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#FCE8EC] text-[#C81D45] flex items-center justify-center font-bold text-xs">
                        {result.targetUser.displayName.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs font-bold text-[#0A1F44] truncate block">
                      {result.targetUser.displayName}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#636366] space-y-0.5 pt-1">
                    <div className="font-semibold text-[#0A1F44]">
                      ★ {result.targetUser.starNakshatram} ({result.targetUser.rasi})
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-[#8E8E93]">
                      <Calendar className="h-2.5 w-2.5" />
                      <span>{result.targetUser.dateOfBirth} · {result.targetUser.timeOfBirth}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Compatibility Score Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 border border-rose-100/80 text-center space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C81D45] block">
                  Overall Compatibility
                </span>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[#0A1F44]">
                    {result.compatibility.traditionalScore}
                  </span>
                  <span className="text-lg font-bold text-slate-400">/ 36</span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      result.compatibility.overallScore >= 6.5
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : result.compatibility.overallScore >= 4.0
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {result.compatibility.verdict} ({result.compatibility.verdictMalayalam})
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    • {result.compatibility.overallScore} / 10 Poruthams
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      result.compatibility.overallScore >= 6.5
                        ? "bg-emerald-500"
                        : result.compatibility.overallScore >= 4.0
                        ? "bg-amber-500"
                        : "bg-slate-400"
                    }`}
                    style={{ width: `${result.compatibility.percentage}%` }}
                  />
                </div>
              </div>

              {/* 10 Poruthams Breakdown Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0A1F44]">
                    Traditional 10-Porutham Evaluation
                  </h4>
                  <span className="text-[10px] text-[#8E8E93] font-semibold">
                    {result.poruthams.filter((p) => p.score >= 1.0).length} / 10 Favorable
                  </span>
                </div>

                <div className="rounded-2xl border border-[rgba(28,28,30,0.06)] overflow-hidden divide-y divide-slate-100 text-xs">
                  {result.poruthams.map((p, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="space-y-0.5 text-left">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#0A1F44]">{p.name}</span>
                          <span className="text-[10px] text-[#8E8E93]">({p.nameEnglish})</span>
                        </div>
                        {p.explanation && (
                          <span className="text-[10px] text-[#636366] block">{p.explanation}</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.score >= 1.0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : p.score >= 0.5
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {p.status} ({p.statusEnglish})
                        </span>
                        <span className="text-xs font-extrabold text-[#0A1F44] w-6 text-right">
                          {p.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Astrological Doshas & Timelines Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Papasamya */}
                <div className="p-3.5 rounded-2xl bg-white border border-[rgba(28,28,30,0.06)] shadow-xs space-y-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">
                      Papasamyam
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        result.papasamya.isBalanced
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {result.papasamya.isBalanced ? "Balanced ✓" : "Review Needed"}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#0A1F44]">
                    Bride: {result.papasamya.brideScore} pts · Groom: {result.papasamya.groomScore} pts
                  </div>
                  <p className="text-[10px] text-[#636366] leading-normal">
                    {result.papasamya.verdictDescription}
                  </p>
                </div>

                {/* Kuja Dosha */}
                <div className="p-3.5 rounded-2xl bg-white border border-[rgba(28,28,30,0.06)] shadow-xs space-y-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">
                      Kuja Dosha (Mars)
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        result.kujaDosha.isResolved
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {result.kujaDosha.isResolved ? "Resolved ✓" : "Present"}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#0A1F44]">
                    {result.kujaDosha.isResolved ? "Pariharam / Exempted" : "Astrological review"}
                  </div>
                  <p className="text-[10px] text-[#636366] leading-normal">
                    {result.kujaDosha.verdictDescription}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Full Report View */}
              {result.sanitizedReportHtml && (
                <div className="pt-2">
                  <button
                    onClick={openFullReport}
                    className="w-full py-3 px-4 rounded-2xl bg-[#0A1F44] hover:bg-[#07152E] text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-amber-400" />
                    <span>View Full 3-Page Horoscope Report (Grahanila & Charts)</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info banner */}
        <div className="px-6 py-3 border-t border-slate-100 bg-[#FCFBF7] text-center text-[10px] text-[#8E8E93] flex-shrink-0">
          Astrological computations powered by SoftAstro Nirayana Ephemeris Engine. Calculations for matrimonial compatibility.
        </div>
      </div>

      {/* Full 3-Page Report Dedicated Drawer / Modal */}
      {fullReportOpen && result?.sanitizedReportHtml && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl h-[94vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Top Bar */}
            <div className="px-6 py-4 bg-[#0A1F44] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold">Traditional Marriage Compatibility Full Report</h3>
                  <span className="text-[10px] text-slate-300">
                    {result.currentUser.displayName} & {result.targetUser.displayName} · 3-Page Astrological Chart
                  </span>
                </div>
              </div>
              <button
                onClick={closeFullReport}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close full report"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sanitized Report Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
              <div
                className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200"
                dangerouslySetInnerHTML={{ __html: result.sanitizedReportHtml }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
