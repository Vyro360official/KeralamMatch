"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  FileText,
  Printer,
  Download,
  ExternalLink,
  Upload,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Eye,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from "lucide-react";
import MatrimonialLogoLoader from "@/components/ui/matrimonial-logo-loader";

interface HoroscopeSingleModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  initialTab?: "software" | "uploaded";
}

export default function HoroscopeSingleModal({
  isOpen,
  onClose,
  profile,
  isOwnProfile = false,
  initialTab = "software",
}: HoroscopeSingleModalProps) {
  const [activeTab, setActiveTab] = useState<"software" | "uploaded">(initialTab);
  const [loading, setLoading] = useState(false);
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(
    profile.horoscopeDocumentUrl || profile.horoscopeImage || null
  );
  const [zoomLevel, setZoomLevel] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync activeTab when modal opens or initialTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setUploadedUrl(profile.horoscopeDocumentUrl || profile.horoscopeImage || null);
    }
  }, [isOpen, initialTab, profile]);

  // Load 2-page astro software report
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadReport = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/astrology/single?profileId=${encodeURIComponent(profile.id || profile.userId || "")}`);
        const data = await res.json();
        if (isMounted && data.success && data.reportHtml) {
          setReportHtml(data.reportHtml);
          if (data.uploadedDocumentUrl) {
            setUploadedUrl(data.uploadedDocumentUrl);
          }
        }
      } catch (err) {
        console.warn("[HoroscopeModal] Error fetching single horoscope:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadReport();
    return () => {
      isMounted = false;
    };
  }, [isOpen, profile.id, profile.userId]);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const candidateName =
    profile.name ||
    `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
    "Candidate";

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && reportHtml) {
      printWindow.document.write(reportHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setUploadedUrl(dataUrl);
        setUploadMessage("Horoscope document loaded successfully! (Saved for this session)");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadMessage("Failed to load file. Please select a valid PDF or image.");
      setUploading(false);
    }
  };

  const isPdf = uploadedUrl?.toLowerCase().includes(".pdf") || uploadedUrl?.startsWith("data:application/pdf");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="single-horoscope-title"
    >
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-[rgba(28,28,30,0.08)] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#FCFBF7] flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-[#C81D45] font-extrabold text-base">
              ॐ
            </div>
            <div>
              <h2 id="single-horoscope-title" className="text-base sm:text-lg font-extrabold text-[#0A1F44]">
                {isOwnProfile ? "My Horoscope (ജാതകം)" : `${candidateName}'s Horoscope`}
              </h2>
              <p className="text-[11px] text-[#636366] font-medium">
                Traditional Kerala Nirayana Ephemeris & Kundli Analysis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Two Main Option Buttons / Tabs (Reference Image 2) */}
        <div className="px-6 pt-4 pb-2 bg-white border-b border-slate-100 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100/80 rounded-2xl">
            {/* Button 1: Astro Software (2 Pages) */}
            <button
              onClick={() => setActiveTab("software")}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2.5 cursor-pointer ${
                activeTab === "software"
                  ? "bg-white text-[#0A1F44] shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-[#0A1F44] hover:bg-white/50"
              }`}
            >
              <div className="h-6 w-6 rounded-lg bg-rose-50 text-[#C81D45] flex items-center justify-center font-bold text-xs">
                ॐ
              </div>
              <div className="text-left leading-tight">
                <span className="block font-extrabold">View Horoscope (Astro Software)</span>
                <span className="text-[10px] text-slate-500 font-medium">First 2 Pages Only · Cover & Birth Charts</span>
              </div>
            </button>

            {/* Button 2: Uploaded Horoscope by User */}
            <button
              onClick={() => setActiveTab("uploaded")}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2.5 cursor-pointer ${
                activeTab === "uploaded"
                  ? "bg-white text-[#0A1F44] shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-[#0A1F44] hover:bg-white/50"
              }`}
            >
              <div className="h-6 w-6 rounded-lg bg-blue-50 text-[#0A369D] flex items-center justify-center font-bold text-xs">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <div className="text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="block font-extrabold">Uploaded Horoscope</span>
                  {uploadedUrl && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" title="Document Available" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {uploadedUrl ? "Scanned Physical Copy Available" : "Scanned Document Copy"}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {/* ── TAB 1: ASTRO SOFTWARE (FIRST 2 PAGES ONLY) ────────────────── */}
          {activeTab === "software" && (
            <div className="space-y-4">
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#0A1F44]">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>SoftAstro Generated Horoscope</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] border border-amber-200">
                    Pages 1 to 2 of 2
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0A1F44] hover:bg-[#07152E] text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                    title="Print or Download PDF"
                  >
                    <Printer className="h-3.5 w-3.5 text-amber-400" />
                    <span>Print / Save PDF</span>
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="py-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
                  <MatrimonialLogoLoader
                    size="md"
                    text="Generating 2-Page Natal Horoscope..."
                    subtext="Calculating Nirayana Sphutam, Rasi and Navamsa positions"
                  />
                </div>
              )}

              {/* Report View */}
              {!loading && reportHtml && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-2 sm:p-6">
                  <div
                    className="max-w-3xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: reportHtml }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: UPLOADED HOROSCOPE BY USER ────────────────────────── */}
          {activeTab === "uploaded" && (
            <div className="space-y-4">
              {uploadedUrl ? (
                <div className="space-y-4">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center space-x-2 text-xs font-bold text-[#0A1F44]">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Scanned Physical Horoscope</span>
                      <span className="text-[10px] text-slate-500 font-normal">Uploaded Document</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!isPdf && (
                        <div className="flex items-center space-x-1 border border-slate-200 rounded-lg p-0.5">
                          <button
                            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                            title="Zoom Out"
                          >
                            <ZoomOut className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-[10px] font-bold px-1 text-slate-600">
                            {Math.round(zoomLevel * 100)}%
                          </span>
                          <button
                            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                            title="Zoom In"
                          >
                            <ZoomIn className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}

                      <a
                        href={uploadedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Open Fullscreen</span>
                      </a>
                    </div>
                  </div>

                  {/* Viewer */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-8 min-h-[480px] flex items-center justify-center overflow-auto">
                    {isPdf ? (
                      <iframe
                        src={uploadedUrl}
                        className="w-full h-[600px] rounded-xl border border-slate-200"
                        title="Uploaded Horoscope PDF"
                      />
                    ) : (
                      <div className="overflow-auto max-h-[640px] max-w-full flex items-center justify-center">
                        <img
                          src={uploadedUrl}
                          alt="Uploaded Horoscope"
                          style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.15s ease-out" }}
                          className="max-w-full rounded-xl shadow-xs object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* No Document Uploaded State */
                <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm space-y-5 max-w-lg mx-auto my-6">
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <FileText className="h-8 w-8" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-extrabold text-[#0A1F44]">
                      {isOwnProfile ? "No Horoscope Document Uploaded" : "No Uploaded Horoscope Available"}
                    </h3>
                    <p className="text-xs text-[#636366] leading-relaxed max-w-sm mx-auto">
                      {isOwnProfile
                        ? "You haven't uploaded a scanned copy of your physical horoscope yet. You can upload a PDF or photo of your chart."
                        : `${candidateName} has not uploaded a scanned physical copy of their horoscope yet. You can examine the complete 2-page chart calculated by our Astro Software in the other tab.`}
                    </p>
                  </div>

                  {/* If viewing own profile, provide upload button */}
                  {isOwnProfile && (
                    <div className="pt-2 space-y-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-6 py-3 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-md transition-all inline-flex items-center space-x-2 cursor-pointer"
                      >
                        {uploading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            <span>Upload Horoscope Document (PDF / Image)</span>
                          </>
                        )}
                      </button>

                      {uploadMessage && (
                        <p className="text-xs text-emerald-700 font-medium">{uploadMessage}</p>
                      )}
                    </div>
                  )}

                  {!isOwnProfile && (
                    <button
                      onClick={() => setActiveTab("software")}
                      className="px-5 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-xs font-bold text-[#0A1F44] transition-colors"
                    >
                      &larr; Switch to Astro Software Horoscope
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 border-t border-slate-100 bg-[#FCFBF7] text-center text-[10px] text-[#8E8E93] flex-shrink-0">
          Kerala Nirayana Ephemeris Engine · Confidential Matrimonial Document
        </div>
      </div>
    </div>
  );
}
