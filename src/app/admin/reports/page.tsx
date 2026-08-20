"use client";

import React, { useState } from "react";
import { AlertTriangle, ShieldCheck, Check, Ban, X, CheckCircle2, AlertOctagon, Eye } from "lucide-react";

interface ReportItem {
  id: string;
  category: string;
  reportedBy: string;
  against: string;
  againstUserId: string;
  details: string;
  time: string;
  status: "Pending" | "In Review" | "Resolved" | "Banned";
}

const INITIAL_REPORTS: ReportItem[] = [
  { id: "rep-1", category: "Inappropriate Message", reportedBy: "Meera Unni", against: "Arjun Menon", againstUserId: "usr-105", details: "User sent unsolicited contact requests outside allowed communication rules.", time: "2 hours ago", status: "Pending" },
  { id: "rep-2", category: "Fake Profile", reportedBy: "Ananya Nair", against: "User KM87900", againstUserId: "usr-879", details: "Profile photos appear to be stolen from public Instagram accounts.", time: "5 hours ago", status: "Pending" },
  { id: "rep-3", category: "Harassment", reportedBy: "Devika Suresh", against: "User KM54321", againstUserId: "usr-543", details: "Repeated spam messages after request was declined.", time: "1 day ago", status: "In Review" },
  { id: "rep-4", category: "Spam / Promotion", reportedBy: "Rahul Nair", against: "User KM11223", againstUserId: "usr-112", details: "Commercial marketing links sent in private chat.", time: "2 days ago", status: "Resolved" },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "review" | "resolved" | "banned">("all");
  const [investigatingReport, setInvestigatingReport] = useState<ReportItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (id: string, action: "Resolved" | "Banned") => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action } : r))
    );
    showToast(
      action === "Banned"
        ? `Account ${investigatingReport?.against || "User"} banned successfully.`
        : `Report ${id} dismissed and marked as Resolved.`
    );
    setInvestigatingReport(null);
  };

  const filtered = reports.filter((r) => {
    if (activeTab === "pending") return r.status === "Pending";
    if (activeTab === "review") return r.status === "In Review";
    if (activeTab === "resolved") return r.status === "Resolved";
    if (activeTab === "banned") return r.status === "Banned";
    return true;
  });

  return (
    <div className="space-y-6 text-[#1C1C1E]">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F44]">Reports & Moderation</h1>
        <p className="text-xs text-[#636366]">Investigate user safety reports, moderate behavior, and enforce account bans</p>
      </div>

      {toast && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-6">
        <div className="flex rounded-full bg-[#FCFBF7] p-1 border border-[rgba(28,28,30,0.08)] text-xs font-semibold max-w-lg">
          {(["all", "pending", "review", "resolved", "banned"] as const).map((tab) => {
            const count =
              tab === "all"
                ? reports.length
                : tab === "pending"
                ? reports.filter((r) => r.status === "Pending").length
                : tab === "review"
                ? reports.filter((r) => r.status === "In Review").length
                : tab === "resolved"
                ? reports.filter((r) => r.status === "Resolved").length
                : reports.filter((r) => r.status === "Banned").length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-full capitalize transition-all ${
                  activeTab === tab ? "bg-[#C81D45] text-white shadow-sm font-bold" : "text-[#636366]"
                }`}
              >
                {tab === "all" ? "All" : tab} ({count})
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#8E8E93] bg-[#FCFBF7] rounded-2xl">
              No reports in this category.
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-[#C81D45]" />
                    <span className="text-sm font-bold text-[#0A1F44]">{item.category}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === "Resolved"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.status === "Banned"
                        ? "bg-red-100 text-red-800"
                        : item.status === "In Review"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#636366] mt-1">
                    Reported by <span className="font-semibold text-[#0A1F44]">{item.reportedBy}</span> against <span className="font-semibold text-[#0A1F44]">{item.against}</span>
                  </div>
                  <p className="text-xs text-[#636366] mt-1 bg-white p-2.5 rounded-xl border border-[rgba(28,28,30,0.06)] max-w-xl">
                    "{item.details}"
                  </p>
                  <span className="text-[10px] text-[#8E8E93] mt-1 block">{item.time}</span>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <button
                    onClick={() => setInvestigatingReport(item)}
                    className="px-4 py-2 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#0A1F44] hover:bg-white flex items-center space-x-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Investigate</span>
                  </button>
                  {item.status !== "Banned" && (
                    <button
                      onClick={() => handleAction(item.id, "Banned")}
                      className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm flex items-center space-x-1"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      <span>Ban User</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── INVESTIGATE REPORT MODAL ─────────────────────────────────────── */}
      {investigatingReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[rgba(28,28,30,0.12)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0A1F44]">Report Investigation</h3>
                <p className="text-xs text-[#636366]">Case ID: {investigatingReport.id}</p>
              </div>
              <button onClick={() => setInvestigatingReport(null)} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 bg-[#FCFBF7] rounded-2xl border border-[rgba(28,28,30,0.06)] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Category:</span>
                <span className="font-bold text-[#C81D45]">{investigatingReport.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Complaining User:</span>
                <span className="font-semibold text-[#0A1F44]">{investigatingReport.reportedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Reported Candidate:</span>
                <span className="font-bold text-[#0A1F44]">{investigatingReport.against} ({investigatingReport.againstUserId})</span>
              </div>
              <div className="pt-2 border-t border-[rgba(28,28,30,0.06)]">
                <span className="text-[#8E8E93] block mb-1">Incident Report:</span>
                <p className="text-xs text-[#1C1C1E] bg-white p-3 rounded-xl border border-[rgba(28,28,30,0.06)]">
                  {investigatingReport.details}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => handleAction(investigatingReport.id, "Resolved")}
                className="px-5 py-2.5 rounded-full border border-[rgba(28,28,30,0.12)] text-[#0A1F44] hover:bg-gray-50 text-xs font-bold"
              >
                Dismiss & Resolve
              </button>
              <button
                type="button"
                onClick={() => handleAction(investigatingReport.id, "Banned")}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Ban className="h-4 w-4" />
                <span>Ban Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
