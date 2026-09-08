"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
  RefreshCw,
  X,
  Eye,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
} from "lucide-react";

interface MatchItem {
  id: string;
  createdAt: string;
  userId: string;
  userName: string;
  userEmail: string;
  matchType: "NEW_PERSON" | "REGISTERED_PROFILE";
  targetProfileId?: string | null;
  targetName: string;
  targetGender: string;
  targetDob: string;
  targetTob: string;
  targetPlace: string;
  targetMobile: string | null;
  marketingConsent: boolean;
  consentTimestamp: string | null;
  score: number;
  traditionalScore: number;
  verdict: string;
  verdictMalayalam: string | null;
  reportSummary: any;
  reportHtml?: string | null;
  repeatCheckCount: number;
  hasMultipleChecks: boolean;
}

interface AdminStats {
  totalChecks: number;
  registeredChecks: number;
  newPersonChecks: number;
  usersCount: number;
  newPeopleCount: number;
  todaysChecks: number;
}

function AdminHoroscopeMatchesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filters State
  const initialUserId = searchParams.get("userId") || "";
  const [userIdFilter, setUserIdFilter] = useState(initialUserId);
  const [search, setSearch] = useState("");
  const [matchType, setMatchType] = useState<string>("ALL");
  const [hasMobile, setHasMobile] = useState<string>("all");
  const [consentFilter, setConsentFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Data State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Detail Modal State
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (userIdFilter) params.set("userId", userIdFilter);
      if (matchType !== "ALL") params.set("matchType", matchType);
      if (hasMobile !== "all") params.set("hasMobile", hasMobile);
      if (consentFilter !== "all") params.set("consentFilter", consentFilter);
      if (dateFilter !== "all") params.set("dateFilter", dateFilter);
      params.set("page", String(page));
      params.set("limit", "20");

      const res = await fetch(`/api/admin/horoscope-matches?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setMatches(data.matches);
        setTotal(data.total);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      console.error("Failed to load admin horoscope matches:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userIdFilter, matchType, hasMobile, consentFilter, dateFilter, page]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      loadData();
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-full bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-[#C81D45] font-extrabold text-base">
              ॐ
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                HOROSCOPE MATCHES
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Track horoscope matching activity and non-registered match checks.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {userIdFilter && (
            <button
              onClick={() => {
                setUserIdFilter("");
                router.replace("/admin/horoscope-matches");
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear User Filter</span>
            </button>
          )}

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Top 6 Summary KPI Cards (Requirement 12) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            TOTAL CHECKS
          </span>
          <div className="text-2xl font-black text-white">
            {stats?.totalChecks ?? "—"}
          </div>
          <span className="text-[10px] text-slate-500">All compatibility checks</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider block">
            REGISTERED CHECKS
          </span>
          <div className="text-2xl font-black text-white">
            {stats?.registeredChecks ?? "—"}
          </div>
          <span className="text-[10px] text-purple-400/80">KeralamMatch profiles</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
            NEW PERSON CHECKS
          </span>
          <div className="text-2xl font-black text-white">
            {stats?.newPersonChecks ?? "—"}
          </div>
          <span className="text-[10px] text-amber-400/80">Non-registered leads</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider block">
            USERS USING MATCH
          </span>
          <div className="text-2xl font-black text-white">
            {stats?.usersCount ?? "—"}
          </div>
          <span className="text-[10px] text-blue-400/80">Distinct active users</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
            NEW PEOPLE CHECKED
          </span>
          <div className="text-2xl font-black text-white">
            {stats?.newPeopleCount ?? "—"}
          </div>
          <span className="text-[10px] text-emerald-400/80">Unique external names</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[9px] font-bold text-[#C81D45] uppercase tracking-wider block">
            TODAY'S CHECKS
          </span>
          <div className="text-2xl font-black text-white">
            {stats?.todaysChecks ?? "—"}
          </div>
          <span className="text-[10px] text-rose-400/80">Since midnight</span>
        </div>
      </div>

      {/* Search & Filters Row (Requirement 8, 25) */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by KeralamMatch user name, bride/groom name, or place..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950 text-white rounded-xl border border-slate-800 focus:outline-hidden focus:border-[#C81D45]"
            />
          </div>

          {/* Match Type */}
          <select
            value={matchType}
            onChange={(e) => {
              setMatchType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 text-xs bg-slate-950 text-white rounded-xl border border-slate-800 focus:outline-hidden focus:border-[#C81D45]"
          >
            <option value="ALL">All Match Types</option>
            <option value="NEW_PERSON">Non-Registered Candidate (New Person)</option>
            <option value="REGISTERED_PROFILE">Registered Member Match</option>
          </select>

          {/* Mobile Filter */}
          <select
            value={hasMobile}
            onChange={(e) => {
              setHasMobile(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 text-xs bg-slate-950 text-white rounded-xl border border-slate-800 focus:outline-hidden focus:border-[#C81D45]"
          >
            <option value="all">All Mobile Status</option>
            <option value="yes">Has Mobile Number</option>
            <option value="no">No Mobile Provided</option>
          </select>

          {/* Marketing Consent Filter */}
          <select
            value={consentFilter}
            onChange={(e) => {
              setConsentFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 text-xs bg-slate-950 text-white rounded-xl border border-slate-800 focus:outline-hidden focus:border-[#C81D45]"
          >
            <option value="all">All Marketing Consent</option>
            <option value="yes">Consent Given (YES)</option>
            <option value="no">No Consent (NO)</option>
          </select>
        </div>

        {/* Quick Date Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800 text-xs">
          <span className="text-[10px] font-bold uppercase text-slate-500 mr-1">Date Range:</span>
          {[
            { id: "all", label: "All Time" },
            { id: "today", label: "Today" },
            { id: "7days", label: "Last 7 Days" },
            { id: "30days", label: "Last 30 Days" },
            { id: "this_month", label: "This Month" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setDateFilter(d.id);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                dateFilter === d.id
                  ? "bg-[#C81D45] text-white shadow-xs font-bold"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table (Requirement 7, 13, 16) */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-black tracking-wider uppercase text-white flex items-center gap-2">
            <span>HOROSCOPE MATCH CHECKS</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {total} records
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">User Name</th>
                <th className="p-3.5">Bride/Groom Name</th>
                <th className="p-3.5">Date of Birth</th>
                <th className="p-3.5">Time of Birth</th>
                <th className="p-3.5">Place of Birth</th>
                <th className="p-3.5">Mobile Number</th>
                <th className="p-3.5">Marketing Consent</th>
                <th className="p-3.5">Score</th>
                <th className="p-3.5">Date Checked</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#C81D45] mb-2" />
                    <span>Loading horoscope records...</span>
                  </td>
                </tr>
              ) : matches.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-500">
                    <Sparkles className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-bold text-white">No horoscope match checks found</p>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Try adjusting the search query or filter options above.
                    </p>
                  </td>
                </tr>
              ) : (
                matches.map((item) => {
                  const isNewPerson = item.matchType === "NEW_PERSON";
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-850/60 transition-colors cursor-pointer"
                      onClick={() => setSelectedMatch(item)}
                    >
                      {/* Performing User */}
                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{item.userName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 truncate block max-w-[140px]">
                          {item.userEmail || item.userId}
                        </span>
                      </td>

                      {/* Candidate Name & Repeat Notice */}
                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{item.targetName}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              item.targetGender === "FEMALE"
                                ? "bg-pink-950/60 text-pink-300 border border-pink-500/20"
                                : "bg-blue-950/60 text-blue-300 border border-blue-500/20"
                            }`}
                          >
                            {item.targetGender === "FEMALE" ? "Bride" : "Groom"}
                          </span>
                        </div>
                        {item.hasMultipleChecks && (
                          <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-950/80 text-amber-300 border border-amber-500/30">
                            ⚠ Checked by {item.repeatCheckCount} users
                          </span>
                        )}
                        <span className="text-[9px] text-slate-500 block">
                          {isNewPerson ? "Non-Registered" : "KeralamMatch Profile"}
                        </span>
                      </td>

                      {/* DOB */}
                      <td className="p-3.5 whitespace-nowrap font-medium">
                        {item.targetDob || "—"}
                      </td>

                      {/* TOB */}
                      <td className="p-3.5 whitespace-nowrap text-slate-400">
                        {item.targetTob || "—"}
                      </td>

                      {/* Place */}
                      <td className="p-3.5 max-w-[140px] truncate text-slate-300">
                        {item.targetPlace || "—"}
                      </td>

                      {/* Mobile Number (Requirement 7: — if not provided) */}
                      <td className="p-3.5 whitespace-nowrap font-mono text-slate-200">
                        {item.targetMobile ? (
                          <span className="text-emerald-400 font-bold">
                            {item.targetMobile}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Marketing Consent (Requirement 15, 16) */}
                      <td className="p-3.5 whitespace-nowrap">
                        {!item.targetMobile ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-500">
                            NOT PROVIDED
                          </span>
                        ) : item.marketingConsent ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                            YES ✓
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400">
                            NO
                          </span>
                        )}
                      </td>

                      {/* Compatibility Score */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-extrabold text-amber-400">
                          {item.score}/10
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {item.verdictMalayalam || item.verdict}
                        </span>
                      </td>

                      {/* Checked Date */}
                      <td className="p-3.5 whitespace-nowrap text-slate-400 text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMatch(item);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-[#C81D45] text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page {page} of {totalPages} ({total} total checks)
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 bg-slate-950 rounded-lg text-white font-bold">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Record Detail Modal */}
      {selectedMatch && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#090D16] text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-[#C81D45] font-extrabold text-sm">
                  ॐ
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Horoscope Compatibility Record
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    ID: {selectedMatch.id} · Checked on {new Date(selectedMatch.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Checked By vs Target Person Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    CHECKED BY (Authenticated Member)
                  </span>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">{selectedMatch.userName}</div>
                    <div className="text-slate-400">Email/User: {selectedMatch.userEmail || selectedMatch.userId}</div>
                    <Link
                      href={`/admin/users`}
                      className="text-[11px] text-[#C81D45] hover:underline font-bold inline-flex items-center gap-1 mt-1"
                    >
                      <span>View User in Admin Panel</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    MATCHED CANDIDATE ({selectedMatch.matchType === "NEW_PERSON" ? "Non-Registered" : "Registered Profile"})
                  </span>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{selectedMatch.targetName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        Candidate Gender: {selectedMatch.targetGender === "FEMALE" ? "Female / Bride" : "Male / Groom"}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      DOB: {selectedMatch.targetDob} · TOB: {selectedMatch.targetTob}
                    </div>
                    <div className="text-slate-400">Place: {selectedMatch.targetPlace}</div>
                  </div>
                </div>
              </div>

              {/* Contact & Consent Information */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Candidate Mobile Number
                  </span>
                  <div className="text-sm font-mono font-bold text-emerald-400 mt-1">
                    {selectedMatch.targetMobile || "Not provided by member"}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Decrypted for authorized administrative access only.
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Marketing Contact Permission
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    {selectedMatch.marketingConsent ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                        YES — Agreed to Communications
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400">
                        NO — Not Agreed / Default Unchecked
                      </span>
                    )}
                  </div>
                  {selectedMatch.consentTimestamp && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Recorded on {new Date(selectedMatch.consentTimestamp).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </div>

              {/* Compatibility Results Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C81D45] block">
                  Vedic Compatibility Result
                </span>
                <div className="text-3xl font-black text-white">
                  {selectedMatch.traditionalScore} / 36 Gunas
                </div>
                <div className="text-xs font-bold text-amber-400">
                  {selectedMatch.score} / 10 Poruthams ({selectedMatch.verdictMalayalam || selectedMatch.verdict})
                </div>
              </div>

              {/* HTML Report View (if available) */}
              {selectedMatch.reportHtml && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Full SoftAstro Report Preview
                  </span>
                  <div className="max-h-96 overflow-y-auto p-4 bg-white text-black rounded-2xl border border-slate-700">
                    <div dangerouslySetInnerHTML={{ __html: selectedMatch.reportHtml }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminHoroscopeMatchesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="animate-spin rounded-full border-2 border-amber-500 border-t-transparent h-8 w-8" />
        </div>
      }
    >
      <AdminHoroscopeMatchesContent />
    </Suspense>
  );
}
