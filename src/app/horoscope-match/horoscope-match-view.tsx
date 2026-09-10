"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import MatrimonialLogoLoader from "@/components/ui/matrimonial-logo-loader";
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Users,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  FileText,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  X,
  Search,
  ArrowRight,
  History as HistoryIcon,
} from "lucide-react";
import type { HoroscopeMatchResultDTO, HoroscopeMatchHistoryItemDTO } from "@/modules/astrology/astrology.types";

const KERALA_DISTRICTS = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
];

interface HoroscopeMatchViewProps {
  userProfile: any;
  initialCandidates: any[];
}

export default function HoroscopeMatchView({
  userProfile,
  initialCandidates,
}: HoroscopeMatchViewProps) {
  // Tabs: "manual" | "registered" | "history"
  const [activeTab, setActiveTab] = useState<"manual" | "registered" | "history">("manual");

  // User Gender & Profile Completeness (Requirements 1, 9)
  const userGender = (userProfile?.gender || "").trim().toUpperCase();
  const isUserGenderMissing = !userGender || (userGender !== "MALE" && userGender !== "FEMALE");
  const isUserDobMissing = !userProfile?.dateOfBirth;
  const isProfileIncomplete = isUserDobMissing || isUserGenderMissing;

  // Opposite-Gender Logic (Requirements 1, 3, 4):
  // Male user -> Candidate is Bride
  // Female user -> Candidate is Groom
  const candidateRole = userGender === "FEMALE" ? "Groom" : "Bride";

  // Manual Candidate Form State (No role or gender selector)
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("12:00");
  const [place, setPlace] = useState("Ernakulam");
  const [customPlace, setCustomPlace] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Registered Candidate State
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    initialCandidates?.[0]?.id || ""
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Calculation & Loading State
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any | null>(null);
  const [result, setResult] = useState<HoroscopeMatchResultDTO | null>(null);
  const [showFullReportModal, setShowFullReportModal] = useState(false);

  // History State
  const [historyItems, setHistoryItems] = useState<HoroscopeMatchHistoryItemDTO[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load history when tab is clicked
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/astrology/history");
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        setHistoryItems(data.history);
      }
    } catch (e) {
      console.error("Failed to load match history:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab]);

  // Handle Manual Match Submit (Option B)
  const handleManualMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUserGenderMissing) {
      setError("Please complete your gender/profile information before checking horoscope compatibility.");
      return;
    }
    if (isUserDobMissing) {
      setError("Your profile is missing Date of Birth. Please update your profile before calculating compatibility.");
      return;
    }
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError(`Please enter the ${candidateRole.toLowerCase()}'s full name (at least 2 characters).`);
      return;
    }
    if (!dob) {
      setError(`Please select the ${candidateRole.toLowerCase()}'s date of birth.`);
      return;
    }

    const birthPlace = place === "OTHER" ? (customPlace.trim() || "Kerala") : place;

    setCalculating(true);
    setError(null);
    setErrorDetails(null);
    setResult(null);

    try {
      const res = await fetch("/api/astrology/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manualProfile: {
            fullName: fullName.trim(),
            dateOfBirth: dob,
            timeOfBirth: tob || "12:00",
            placeOfBirth: birthPlace,
            mobileNumber: mobileNumber.trim() || undefined,
            marketingConsent,
          },
          includeReportHtml: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to calculate horoscope compatibility.");
        if (data.details) setErrorDetails(data.details);
      } else {
        setResult(data.result);
      }
    } catch (err: any) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setCalculating(false);
    }
  };

  // Handle Registered Profile Match (Option A)
  const handleRegisteredMatchSubmit = async () => {
    if (isUserDobMissing) {
      setError("Your profile is missing Date of Birth. Please update your profile before calculating compatibility.");
      return;
    }
    if (!selectedCandidateId) {
      setError("Please select a candidate profile to match.");
      return;
    }

    setCalculating(true);
    setError(null);
    setErrorDetails(null);
    setResult(null);

    try {
      const res = await fetch("/api/astrology/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetProfileId: selectedCandidateId,
          includeReportHtml: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to calculate horoscope compatibility.");
        if (data.details) setErrorDetails(data.details);
      } else {
        setResult(data.result);
      }
    } catch (err: any) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setCalculating(false);
    }
  };

  // View Past Report from History
  const handleViewHistoryReport = async (checkId: string) => {
    setCalculating(true);
    setError(null);
    try {
      const res = await fetch(`/api/astrology/history?checkId=${encodeURIComponent(checkId)}`);
      const data = await res.json();
      if (res.ok && data.success && data.check) {
        if (data.check.reportHtml) {
          setResult({
            currentUser: {
              id: userProfile?.id || "me",
              displayName: `${userProfile?.firstName || ""} ${userProfile?.lastName || ""}`.trim() || "You",
              avatarUrl: userProfile?.avatarUrl,
              gender: userProfile?.gender || "MALE",
              dateOfBirth: userProfile?.dateOfBirth ? new Date(userProfile.dateOfBirth).toISOString().split("T")[0] : "",
              timeOfBirth: userProfile?.timeOfBirth || "12:00 PM",
              placeOfBirth: userProfile?.placeOfBirth || userProfile?.district || "Kerala",
              starNakshatram: "Nakshatra",
              rasi: "Rasi",
            },
            targetUser: {
              id: data.check.targetProfileId || "manual",
              displayName: data.check.targetName,
              avatarUrl: null,
              gender: data.check.targetGender,
              dateOfBirth: "",
              timeOfBirth: "",
              placeOfBirth: "",
              starNakshatram: "Nakshatra",
              rasi: "Rasi",
            },
            compatibility: {
              overallScore: data.check.score,
              traditionalScore: Math.round(data.check.score * 3.6),
              percentage: Math.round(data.check.score * 10),
              verdict: data.check.verdict,
              verdictMalayalam: data.check.verdictMalayalam,
              description: `Compatibility: ${data.check.score}/10 Poruthams — ${data.check.verdictMalayalam}.`,
            },
            poruthams: [],
            papasamya: {
              brideScore: 0,
              groomScore: 0,
              difference: 0,
              isBalanced: data.check.reportSummary?.papasamyaBalanced ?? true,
              verdictDescription: "Papasamya analyzed in attached full report.",
            },
            kujaDosha: {
              brideStatus: "None",
              brideHasDosha: false,
              brideHasPariharam: false,
              groomStatus: "None",
              groomHasDosha: false,
              groomHasPariharam: false,
              isResolved: data.check.reportSummary?.kujaResolved ?? true,
              verdictDescription: "Kuja Dosha analyzed in attached full report.",
            },
            dasa: {
              hasSandhi: data.check.reportSummary?.dasaHasSandhi ?? false,
              verdictDescription: "Dasa balance analyzed in attached full report.",
              brideTimeline: [],
              groomTimeline: [],
            },
            sanitizedReportHtml: data.check.reportHtml,
            reportHtml: data.check.reportHtml,
            calculatedAt: data.check.createdAt,
            engine: "SoftAstro Nirayana Engine",
          });
          setShowFullReportModal(true);
        }
      } else {
        setError("Could not load report details.");
      }
    } catch {
      setError("Failed to load historical report.");
    } finally {
      setCalculating(false);
    }
  };

  // Filter candidates for Option A
  const filteredCandidates = (initialCandidates || []).filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
    const dist = (c.district || "").toLowerCase();
    return name.includes(q) || dist.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle (Requirement 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-[#C81D45] font-extrabold text-base">
              ॐ
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1F44] dark:text-white tracking-tight">
                HOROSCOPE MATCH
              </h1>
              <p className="text-xs text-[#636366] dark:text-slate-400 mt-0.5 font-medium">
                Check horoscope compatibility with someone who is not registered on KeralamMatch.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-600" />
            SoftAstro Nirayana Engine
          </span>
        </div>
      </div>

      {/* Profile Incomplete Banner (Requirement 9) */}
      {isProfileIncomplete && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-amber-900">
                {isUserGenderMissing
                  ? "Please complete your gender/profile information before checking horoscope compatibility."
                  : "Your birth details are incomplete"}
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                {isUserGenderMissing
                  ? "Your profile requires gender specification to calculate compatibility roles automatically."
                  : "Vedic horoscope matching requires your Date of Birth. Please update your profile before checking compatibility."}
              </p>
            </div>
          </div>
          <Link
            href="/settings"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold whitespace-nowrap shadow-xs transition-colors"
          >
            Update My Profile
          </Link>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E3D] rounded-2xl p-1.5 shadow-xs">
        <button
          onClick={() => {
            setActiveTab("manual");
            setError(null);
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === "manual"
              ? "bg-[#0A1F44] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Match with New Person</span>
          <span className="text-[10px] opacity-75 font-normal hidden sm:inline">(Non-Registered)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("registered");
            setError(null);
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === "registered"
              ? "bg-[#0A1F44] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>KeralamMatch Member</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("history");
            setError(null);
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === "history"
              ? "bg-[#0A1F44] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
          }`}
        >
          <HistoryIcon className="h-4 w-4" />
          <span>Match History</span>
        </button>
      </div>

      {/* Tab 1: Option B - Match with New Person (Non-Registered) */}
      {activeTab === "manual" && (
        <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-[#0A1F44] dark:text-white flex items-center space-x-2">
              <span>Enter {candidateRole} Details</span>
            </h2>
            <p className="text-xs text-[#636366] dark:text-slate-400 mt-1 leading-relaxed">
              Calculate genuine 10-Porutham compatibility with any {candidateRole.toLowerCase()} without creating a user account.
              The details you enter are kept private and never published.
            </p>
          </div>

          <form onSubmit={handleManualMatchSubmit} className="space-y-5">
            {/* Candidate Name (Opposite Role determined automatically) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0A1F44] dark:text-white">
                {candidateRole} Name <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder={`Enter ${candidateRole.toLowerCase()} name`}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#07132B] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#FF1475] focus:ring-1 focus:ring-[#FF1475]"
                />
              </div>
            </div>

            {/* Date of Birth & Time of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A1F44] dark:text-white">
                  Date of Birth <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split("T")[0]}
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#07132B] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#FF1475] focus:ring-1 focus:ring-[#FF1475]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A1F44] dark:text-white">
                  Time of Birth <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="time"
                    required
                    value={tob}
                    onChange={(e) => setTob(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#07132B] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#FF1475] focus:ring-1 focus:ring-[#FF1475]"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Exact time produces the most precise Lagna and Grahanila</p>
              </div>
            </div>

            {/* Place of Birth & Mobile Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A1F44] dark:text-white">
                  Place of Birth <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <select
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#07132B] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#FF1475] focus:ring-1 focus:ring-[#FF1475] bg-white"
                  >
                    {KERALA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}, Kerala
                      </option>
                    ))}
                    <option value="OTHER">Other Place / City</option>
                  </select>
                </div>
                {place === "OTHER" && (
                  <input
                    type="text"
                    placeholder="Search place / enter city"
                    value={customPlace}
                    onChange={(e) => setCustomPlace(e.target.value)}
                    className="w-full mt-2 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#C81D45]"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A1F44] dark:text-white">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+91 __________"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#07132B] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#FF1475] focus:ring-1 focus:ring-[#FF1475]"
                  />
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  Optional: calculation works without phone number. Stored securely.
                </p>
              </div>
            </div>

            {/* Marketing Contact Permission (Optional) Checkbox (Requirement 15) */}
            <div className="p-3.5 bg-[#FCFBF7] border border-slate-200 rounded-2xl flex items-start space-x-3">
              <input
                type="checkbox"
                id="marketingConsent"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#C81D45] focus:ring-[#C81D45] cursor-pointer"
              />
              <label htmlFor="marketingConsent" className="text-xs text-slate-700 cursor-pointer">
                <span className="font-bold block text-[#0A1F44] dark:text-white">
                  Marketing Contact Permission (Optional)
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  This person agrees to receive communications from KeralamMatch. (Unchecked by default)
                </span>
              </label>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <div className="font-bold flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-[#C81D45]" />
                  <span>Horoscope Matching Notice</span>
                </div>
                <p>{error}</p>
                {errorDetails?.missingFields && (
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-rose-700">
                    {errorDetails.missingFields.map((f: string, i: number) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Submit Button (Requirement 2: [ Check Horoscope Match ]) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={calculating || isProfileIncomplete}
                className={`w-full py-3.5 px-6 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer ${
                  calculating || isProfileIncomplete
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-[#C81D45] hover:bg-[#A31636] text-white hover:shadow-lg"
                }`}
              >
                {calculating ? (
                  <>
                    <MatrimonialLogoLoader size="xs" inline />
                    <span>Calculating SoftAstro Ephemeris & 10 Poruthams...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Check Horoscope Match</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Option A - Match with KeralamMatch Member */}
      {activeTab === "registered" && (
        <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-[#0A1F44] dark:text-white">
              Match with Registered KeralamMatch Profiles
            </h2>
            <p className="text-xs text-[#636366] dark:text-slate-400 mt-1">
              Select a member profile to calculate authentic astrological compatibility against your registered birth details.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search member by name or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#C81D45]"
            />
          </div>

          {/* Candidate Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredCandidates.map((c) => {
              const isSelected = selectedCandidateId === c.id;
              const photo = c.avatarUrl || (c.media && c.media[0] ? c.media[0].url : null);
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCandidateId(c.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                    isSelected
                      ? "border-[#C81D45] bg-rose-50/50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-[#FCFBF7] border border-slate-200 flex items-center justify-center font-bold text-sm text-[#0A1F44] dark:text-white flex-shrink-0">
                      {c.firstName?.charAt(0) || "M"}
                    </div>
                  )}

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0A1F44] dark:text-white truncate">
                        {c.firstName} {c.lastName || ""}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-[#C81D45] flex-shrink-0 ml-1" />
                      )}
                    </div>
                    <p className="text-[10px] text-[#636366] dark:text-slate-400 truncate">
                      {c.district || "Kerala"} · {c.religion || "Vedic"}
                    </p>
                    {c.starNakshatram && (
                      <span className="inline-block mt-0.5 text-[9px] font-bold text-[#C81D45]">
                        ★ {c.starNakshatram}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredCandidates.length === 0 && (
              <div className="col-span-full py-8 text-center text-xs text-slate-500">
                No matching candidate profiles found. You can enter candidate details manually under "Match with New Person".
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
              <div className="font-bold flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-[#C81D45]" />
                <span>Horoscope Matching Notice</span>
              </div>
              <p>{error}</p>
              {errorDetails?.missingFields && (
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-rose-700">
                  {errorDetails.missingFields.map((f: string, i: number) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Submit Action */}
          <button
            onClick={handleRegisteredMatchSubmit}
            disabled={calculating || isProfileIncomplete || !selectedCandidateId}
            className={`w-full py-3.5 px-6 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer ${
              calculating || isProfileIncomplete || !selectedCandidateId
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-[#C81D45] hover:bg-[#A31636] text-white hover:shadow-lg"
            }`}
          >
            {calculating ? (
              <>
                <MatrimonialLogoLoader size="xs" inline />
                <span>Calculating SoftAstro Ephemeris & 10 Poruthams...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Check Horoscope Match</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Tab 3: Match History */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#0A1F44] dark:text-white">Your Horoscope Match History</h2>
              <p className="text-xs text-[#636366] dark:text-slate-400 mt-0.5">
                Past compatibility checks calculated on KeralamMatch. Stored privately for your account.
              </p>
            </div>
            <button
              onClick={loadHistory}
              disabled={loadingHistory}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Refresh history"
            >
              <RefreshCw className={`h-4 w-4 ${loadingHistory ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <MatrimonialLogoLoader size="sm" text="Loading your match history..." />
            </div>
          ) : historyItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <HistoryIcon className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No match history yet</p>
              <p className="text-slate-400 max-w-xs mx-auto">
                Calculate compatibility with a registered member or enter candidate details manually to see past results here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 p-3 rounded-2xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#0A1F44] dark:text-white">
                        {item.targetName}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          item.targetGender === "FEMALE"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {item.targetGender === "FEMALE" ? "Bride" : "Groom"}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                          item.overallScore >= 6.5
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.overallScore >= 4.0
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.verdictMalayalam || item.verdict}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Calculated on {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {item.overallScore}/10 Poruthams ({item.traditionalScore}/36 Gunas)
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewHistoryReport(item.id)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#0A1F44] hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer flex-shrink-0"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>View Report</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Match Result Display (When calculation succeeds) */}
      {result && (
        <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-5 sm:p-7 border border-rose-200 shadow-lg space-y-6 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-[#C81D45] font-extrabold text-sm">
                ॐ
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#0A1F44] dark:text-white">
                  Horoscope Compatibility Analysis
                </h3>
                <p className="text-[10px] text-[#636366] dark:text-slate-400">
                  Calculated by {result.engine || "SoftAstro Ephemeris Engine"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
            >
              Clear Result
            </button>
          </div>

          {/* Profile Comparison Header (Requirement 5) */}
          {(() => {
            const isCurrentUserMale = (result.currentUser.gender || "").toUpperCase() === "MALE";
            const groomUser = isCurrentUserMale ? result.currentUser : result.targetUser;
            const brideUser = isCurrentUserMale ? result.targetUser : result.currentUser;
            const isGroomSelf = isCurrentUserMale;
            const isBrideSelf = !isCurrentUserMale;

            return (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 p-4 rounded-2xl bg-[#FCFBF7] border border-slate-200/80 dark:border-slate-800">
                {/* Groom Section */}
                <div className="space-y-1.5 text-left border-r border-slate-200/80 pr-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                      <span>🤵 Groom:</span>
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isGroomSelf ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-700"
                    }`}>
                      {isGroomSelf ? "You (Logged-In)" : "Candidate"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {groomUser.avatarUrl ? (
                      <img
                        src={groomUser.avatarUrl}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover border border-blue-300"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                        {groomUser.displayName?.charAt(0) || "G"}
                      </div>
                    )}
                    <span className="text-xs font-bold text-[#0A1F44] dark:text-white truncate block">
                      {groomUser.displayName}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#636366] dark:text-slate-400 space-y-0.5 pt-1">
                    <div className="font-semibold text-[#0A1F44] dark:text-white">
                      ★ {groomUser.starNakshatram} ({groomUser.rasi})
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-[#8E8E93]">
                      <Calendar className="h-2.5 w-2.5" />
                      <span>{groomUser.dateOfBirth} · {groomUser.timeOfBirth}</span>
                    </div>
                  </div>
                </div>

                {/* Bride Section */}
                <div className="space-y-1.5 text-left pl-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 flex items-center gap-1">
                      <span>👰 Bride:</span>
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isBrideSelf ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-700"
                    }`}>
                      {isBrideSelf ? "You (Logged-In)" : "Candidate"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {brideUser.avatarUrl ? (
                      <img
                        src={brideUser.avatarUrl}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover border border-rose-300"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs">
                        {brideUser.displayName?.charAt(0) || "B"}
                      </div>
                    )}
                    <span className="text-xs font-bold text-[#0A1F44] dark:text-white truncate block">
                      {brideUser.displayName}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#636366] dark:text-slate-400 space-y-0.5 pt-1">
                    <div className="font-semibold text-[#0A1F44] dark:text-white">
                      ★ {brideUser.starNakshatram} ({brideUser.rasi})
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-[#8E8E93]">
                      <Calendar className="h-2.5 w-2.5" />
                      <span>{brideUser.dateOfBirth} · {brideUser.timeOfBirth}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Overall Score Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 border border-rose-100/80 text-center space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C81D45] block">
              Overall Compatibility
            </span>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-[#0A1F44] dark:text-white">
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

            {/* Progress Bar */}
            <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden mt-2 max-w-md mx-auto">
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

          {/* 10-Porutham Breakdown */}
          {result.poruthams && result.poruthams.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0A1F44] dark:text-white">
                Traditional 10-Porutham Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.poruthams.map((p: any) => (
                  <div
                    key={p.name}
                    className="p-3 rounded-xl bg-[#FCFBF7] border border-slate-200/80 dark:border-slate-800 flex items-start justify-between space-x-2 text-left"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-[#0A1F44] dark:text-white">{p.name}</span>
                        {p.malayalamName && (
                          <span className="text-[10px] text-[#8E8E93]">({p.malayalamName})</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#636366] dark:text-slate-400 leading-tight">{p.explanation}</p>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap ${
                        p.score > 0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Papasamya & Kuja Dosha Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Papasamya */}
            <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">
                  Papasamya Balance
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    result.papasamya.isBalanced
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {result.papasamya.isBalanced ? "Harmonious" : "Difference"}
                </span>
              </div>
              <div className="text-xs font-bold text-[#0A1F44] dark:text-white">
                Bride: {result.papasamya.brideScore} pts · Groom: {result.papasamya.groomScore} pts (Diff: {result.papasamya.difference})
              </div>
              <p className="text-[10px] text-[#636366] dark:text-slate-400 leading-normal">
                {result.papasamya.verdictDescription}
              </p>
            </div>

            {/* Kuja Dosha */}
            <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-left">
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
              <div className="text-xs font-bold text-[#0A1F44] dark:text-white">
                {result.kujaDosha.isResolved ? "Pariharam / Exempted" : "Astrological review"}
              </div>
              <p className="text-[10px] text-[#636366] dark:text-slate-400 leading-normal">
                {result.kujaDosha.verdictDescription}
              </p>
            </div>
          </div>

          {/* Dasa Sandhi Note */}
          {result.dasa && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">
                Dasa Sandhi & Timeline
              </span>
              <p className="text-xs text-[#0A1F44] dark:text-white font-medium">
                {result.dasa.verdictDescription}
              </p>
            </div>
          )}

          {/* Action: Open Full 3-Page Report Modal */}
          {result.sanitizedReportHtml && (
            <div className="pt-2">
              <button
                onClick={() => setShowFullReportModal(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0A1F44] hover:bg-[#07152E] text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <FileText className="h-4 w-4 text-amber-400" />
                <span>View Full 3-Page Horoscope Report (Grahanila & Charts)</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Full 3-Page Report Modal */}
      {showFullReportModal && result?.sanitizedReportHtml && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl h-[94vh] flex flex-col bg-white dark:bg-[#0D1E3D] rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Top Bar */}
            <div className="px-6 py-4 bg-[#0A1F44] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold">Traditional Marriage Compatibility Full Report</h3>
                  <span className="text-[10px] text-slate-300">
                    {result.currentUser.displayName} & {result.targetUser.displayName} · Complete Astrological Charts
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowFullReportModal(false)}
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
