"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Download,
  RefreshCw,
  Phone,
  Calendar,
  Sparkles,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Clock,
  ChevronRight,
  Eye,
  EyeOff,
  Tag,
} from "lucide-react";
import MatrimonialLogoLoader from "@/components/ui/matrimonial-logo-loader";

interface HoroscopeLead {
  id: string;
  userId: string;
  userName?: string;
  targetName: string;
  targetGender: string;
  targetDob: string;
  targetTob?: string;
  targetPlace?: string;
  targetMobile?: string;
  displayPhone: string;
  isMasked: boolean;
  marketingConsent: boolean;
  consentTimestamp?: string;
  consentSource?: string;
  consentRecordedBy?: string;
  leadStatus: string;
  leadNotes?: string;
  leadAssignedTo?: string;
  leadLastContactedAt?: string;
  score: number;
  verdict: string;
  privacyBadge: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { id: "ALL", label: "All Statuses" },
  { id: "NEW", label: "New Lead" },
  { id: "CONTACTED", label: "Contacted" },
  { id: "INTERESTED", label: "Interested" },
  { id: "ACCOUNT_CREATED", label: "Account Created" },
  { id: "CONVERTED", label: "Converted to Paid" },
  { id: "DISQUALIFIED", label: "Disqualified" },
];

export default function HoroscopeLeadsPage() {
  const router = useRouter();
  const [view, setView] = useState<"consented" | "restricted">("consented");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState<HoroscopeLead[]>([]);
  const [counts, setCounts] = useState({ consented: 0, restricted: 0, totalNewPerson: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<HoroscopeLead | null>(null);
  const [updating, setUpdating] = useState(false);
  const [notesInput, setNotesInput] = useState("");
  const [statusInput, setStatusInput] = useState("NEW");

  const loadLeads = () => {
    setLoading(true);
    fetch(
      `/api/admin/horoscope-leads?view=${view}&status=${statusFilter}&search=${encodeURIComponent(search)}`
    )
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setLeads(res.leads || []);
          setCounts(res.counts || { consented: 0, restricted: 0, totalNewPerson: 0 });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadLeads();
  }, [view, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLeads();
  };

  const handleUpdateStatus = async () => {
    if (!selectedLead) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/horoscope-leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedLead.id,
          leadStatus: statusInput,
          leadNotes: notesInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === selectedLead.id ? { ...l, leadStatus: statusInput, leadNotes: notesInput } : l))
        );
        setSelectedLead((prev) => (prev ? { ...prev, leadStatus: statusInput, leadNotes: notesInput } : null));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = [
      "ID",
      "Candidate Name",
      "Gender",
      "DOB",
      "Place",
      "Mobile",
      "Marketing Consent",
      "Consent Timestamp",
      "Consent Source",
      "Score",
      "Verdict",
      "Lead Status",
      "Notes",
    ];
    const rows = leads.map((l) => [
      l.id,
      `"${l.targetName}"`,
      l.targetGender,
      l.targetDob,
      `"${l.targetPlace || ""}"`,
      `"${l.displayPhone}"`,
      l.marketingConsent ? "YES" : "NO",
      `"${l.consentTimestamp || ""}"`,
      `"${l.consentSource || ""}"`,
      l.score,
      `"${l.verdict}"`,
      l.leadStatus,
      `"${(l.leadNotes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keralammatch_horoscope_leads_${view}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openLeadDrawer = (lead: HoroscopeLead) => {
    setSelectedLead(lead);
    setStatusInput(lead.leadStatus || "NEW");
    setNotesInput(lead.leadNotes || "");
  };

  const handleCreateProfileFromLead = (lead: HoroscopeLead) => {
    const params = new URLSearchParams({
      name: lead.targetName,
      phone: lead.targetMobile || "",
      gender: lead.targetGender === "MALE" ? "MALE" : "FEMALE",
      dob: lead.targetDob ? lead.targetDob.split("T")[0] : "",
      tob: lead.targetTob || "",
      place: lead.targetPlace || "",
      source: "HOROSCOPE_LEAD",
    });
    router.push(`/admin/users/create?${params.toString()}`);
  };

  return (
    <div className="space-y-6 text-[#0A1F44]">
      {/* Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-extrabold text-[#0A1F44] tracking-tight">Horoscope Leads CRM</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Converting non-registered horoscope compatibility inquiries into verified member profiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="h-9 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/admin/users/create"
            className="h-9 px-3.5 rounded-xl bg-[#0A1F44] hover:bg-[#132A57] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <UserPlus className="h-3.5 w-3.5 text-[#FF1475]" />
            <span>+ Create Profile</span>
          </Link>
        </div>
      </div>

      {/* Privacy Policy Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-50 to-white p-4 rounded-xl border border-blue-200 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />
        <div className="text-xs">
          <span className="font-bold text-blue-900 block">Strict Marketing Privacy Rule</span>
          <span className="text-blue-800 leading-relaxed">
            Non-registered candidate mobile numbers appear as actionable marketing leads <strong>ONLY</strong> when explicit consent is recorded (<code>marketingConsent = true</code>). Non-consented checks remain strictly segregated in the operational audit view with masked phone numbers.
          </span>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Consent vs Restricted Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("consented")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              view === "consented"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Consented Leads ({counts.consented})</span>
          </button>

          <button
            onClick={() => setView("restricted")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              view === "restricted"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Marketing Restricted ({counts.restricted})</span>
          </button>
        </div>

        {/* Status filter & Search bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0A1F44] focus:outline-none focus:border-[#0A1F44]"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, place..."
              className="h-9 w-48 sm:w-60 rounded-xl bg-slate-50 border border-slate-200 pl-8 pr-3 text-xs font-medium text-[#0A1F44] placeholder-slate-400 focus:outline-none focus:border-[#0A1F44]"
            />
          </form>

          <button
            onClick={loadLeads}
            className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#0A1F44] flex items-center justify-center transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* CRM Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <MatrimonialLogoLoader size="md" text="Loading CRM Leads..." />
          </div>
        ) : leads.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Sparkles className="h-8 w-8 text-slate-300 mx-auto" />
            <span className="text-xs font-bold text-slate-500 block">No leads match the current filter.</span>
            <span className="text-[11px] text-slate-400 block">
              {view === "consented"
                ? "When users run non-registered horoscope checks with marketing opt-in, they appear here."
                : "No unconsented checks found."}
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Mobile & Consent</th>
                  <th className="px-4 py-3">Birth & Location</th>
                  <th className="px-4 py-3">Compatibility</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-[#0A1F44] block">{lead.targetName}</span>
                      <span className="text-[11px] text-slate-500">
                        {lead.targetGender} • Inquirer: {lead.userName || "Guest"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-bold text-[#0A1F44]">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{lead.displayPhone}</span>
                      </div>
                      <div className="mt-0.5">
                        {lead.marketingConsent ? (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                            Consent Verified ✓
                          </span>
                        ) : (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800">
                            Marketing Restricted ✕
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-[#0A1F44] font-medium block">
                        {new Date(lead.targetDob).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        {lead.targetTob ? `(${lead.targetTob})` : ""}
                      </span>
                      <span className="text-[11px] text-slate-500 block">{lead.targetPlace || "Kerala"}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-extrabold text-purple-700 block">{lead.score} / 36</span>
                      <span className="text-[11px] text-slate-500">{lead.verdict}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          lead.leadStatus === "NEW"
                            ? "bg-blue-100 text-blue-800"
                            : lead.leadStatus === "CONTACTED"
                            ? "bg-amber-100 text-amber-800"
                            : lead.leadStatus === "INTERESTED"
                            ? "bg-purple-100 text-purple-800"
                            : lead.leadStatus === "ACCOUNT_CREATED"
                            ? "bg-emerald-100 text-emerald-800"
                            : lead.leadStatus === "CONVERTED"
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {lead.leadStatus}
                      </span>
                      {lead.leadNotes && (
                        <p className="text-[10px] text-slate-400 truncate max-w-[140px] mt-0.5">
                          {lead.leadNotes}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => openLeadDrawer(lead)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                      >
                        Update
                      </button>

                      <button
                        onClick={() => handleCreateProfileFromLead(lead)}
                        title="Create verified member profile"
                        className="px-2.5 py-1 rounded-lg bg-[#0A1F44] hover:bg-[#132A57] text-white font-bold text-[11px] transition-colors"
                      >
                        + Create
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Update Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-[#0A1F44]">Lead Management: {selectedLead.targetName}</h3>
                <span className="text-xs text-slate-500">
                  {selectedLead.targetGender} • {selectedLead.displayPhone}
                </span>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Lead Workflow Status</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full h-9 rounded-xl bg-slate-50 border border-slate-200 px-3 font-bold text-[#0A1F44] focus:outline-none"
                >
                  <option value="NEW">New Lead</option>
                  <option value="CONTACTED">Contacted (Called / WhatsApp sent)</option>
                  <option value="INTERESTED">Interested in Registration</option>
                  <option value="ACCOUNT_CREATED">Account Created</option>
                  <option value="CONVERTED">Converted to Paid Membership</option>
                  <option value="DISQUALIFIED">Disqualified (Wrong number / Not interested)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Admin Communication Notes</label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Record conversation outcome, candidate preferences, callback dates..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 font-medium text-[#0A1F44] focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Consent Status:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedLead.marketingConsent ? "Explicitly Granted" : "Restricted"}
                  </span>
                </div>
                {selectedLead.consentTimestamp && (
                  <div className="flex justify-between">
                    <span>Consent Recorded At:</span>
                    <span>{new Date(selectedLead.consentTimestamp).toLocaleString("en-IN")}</span>
                  </div>
                )}
                {selectedLead.consentSource && (
                  <div className="flex justify-between">
                    <span>Consent Channel:</span>
                    <span>{selectedLead.consentSource}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleCreateProfileFromLead(selectedLead)}
                className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
              >
                Pre-fill Profile Wizard
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-[#0A1F44] hover:bg-[#132A57] text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
