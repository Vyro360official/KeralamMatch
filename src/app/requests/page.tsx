"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ArrowUpRight, ArrowDownLeft, AlertCircle, CheckCircle, XCircle, ShieldAlert, Phone, Mail } from "lucide-react";
import { getProfileDetailsAction } from "@/modules/profile/profile.controller";

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<"received" | "sent" | "active" | "expired">("received");
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null);

  useEffect(() => {
    async function loadMe() {
      const res = await getProfileDetailsAction();
      if (res.success && res.profile) setCurrentUserProfile(res.profile);
    }
    loadMe();
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/requests");
      const result = await res.json();
      if (result.success) setRequests(result.requests);
    } catch {
      console.error("Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRespond = async (requestId: string, status: "ACCEPTED" | "DECLINED") => {
    setError(null);
    try {
      const res = await fetch("/api/requests/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });
      const result = await res.json();
      if (result.success) {
        fetchRequests();
      } else {
        setError(result.error || "Failed to update request.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const incoming = requests.filter((r) => r.isIncoming);
  const outgoing = requests.filter((r) => !r.isIncoming);
  const activeReveals = requests.filter(
    (r) => r.status === "ACCEPTED" && r.expiresAt && new Date(r.expiresAt) > new Date()
  );
  const expiredReveals = requests.filter(
    (r) => r.status === "EXPIRED" || (r.status === "ACCEPTED" && r.expiresAt && new Date(r.expiresAt) <= new Date())
  );

  const getFilteredList = () => {
    if (activeTab === "received") return incoming;
    if (activeTab === "sent") return outgoing;
    if (activeTab === "active") return activeReveals;
    return expiredReveals;
  };

  const displayList = getFilteredList();

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] text-[#1C1C1E]">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 mb-16 lg:mb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <DashboardSidebar userProfile={currentUserProfile} />

          <main className="lg:col-span-9 space-y-6">
            {/* Header info */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1F44] tracking-tight">Contact Requests</h1>
              <p className="text-xs text-[#636366] font-medium mt-1">
                Manage your ephemeral 24-hour contact reveal requests and user consents.
              </p>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Horizontal tab rows */}
            <div className="flex rounded-xl bg-white p-1 border border-[rgba(28,28,30,0.06)] shadow-xs text-xs font-semibold">
              {(["received", "sent", "active", "expired"] as const).map((tab) => {
                const count =
                  tab === "received"
                    ? incoming.length
                    : tab === "sent"
                    ? outgoing.length
                    : tab === "active"
                    ? activeReveals.length
                    : expiredReveals.length;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 rounded-lg capitalize transition-all ${
                      activeTab === tab
                        ? "bg-[#C81D45] text-white font-bold shadow-xs"
                        : "text-slate-500 hover:text-[#0A1F44]"
                    }`}
                  >
                    {tab} ({count})
                  </button>
                );
              })}
            </div>

            {/* Request Card Grids */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                ))}
              </div>
            ) : displayList.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center text-xs text-[#636366] border border-[rgba(28,28,30,0.06)] shadow-xs font-medium">
                No {activeTab} contact requests found.
              </div>
            ) : (
              <div className="space-y-4">
                {displayList.map((r) => {
                  const otherUser = r.isIncoming ? r.sender : r.receiver;
                  const profileInfo = otherUser?.profile;
                  const otherName = profileInfo ? `${profileInfo.firstName} ${profileInfo.lastName}` : "Member";
                  const initial = otherName.charAt(0).toUpperCase();

                  const expiresDate = r.expiresAt ? new Date(r.expiresAt) : null;
                  const isCurrentlyActive = r.status === "ACCEPTED" && expiresDate && expiresDate > new Date();
                  const isCurrentlyExpired = r.status === "EXPIRED" || (r.status === "ACCEPTED" && expiresDate && expiresDate <= new Date());

                  // Calculate countdown hours remaining
                  let hoursRemaining = 24;
                  if (expiresDate) {
                    const diffMs = expiresDate.getTime() - new Date().getTime();
                    hoursRemaining = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
                  }

                  return (
                    <div
                      key={r.id}
                      className="bg-white rounded-2xl p-5 border border-[rgba(28,28,30,0.06)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="h-11 w-11 rounded-full bg-[#FCE8EC] text-[#C81D45] flex items-center justify-center font-extrabold text-sm flex-shrink-0 border border-[#FAD2DA]">
                          {initial}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-xs font-bold text-[#0A1F44]">
                              {otherName}
                            </h3>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                              {r.isIncoming ? "Incoming" : "Outgoing"}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-[#636366] font-medium leading-normal">
                            {r.isIncoming
                              ? "Requested to unlock your verified contact details"
                              : "You requested to view their contact details"}
                          </p>

                          {/* Reveal Data display for active window */}
                          {isCurrentlyActive ? (
                            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1.5 mt-2 animate-fadeIn">
                              <div className="text-[10px] font-extrabold text-emerald-800 flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Contact access available for {hoursRemaining} hours</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-700 pt-1">
                                <div className="flex items-center gap-1.5">
                                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>{profileInfo?.phone || currentUserProfile?.phone || "+91 9400983851"}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Mail className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>{otherUser?.email || "verified.match@keralammatch.com"}</span>
                                </div>
                              </div>
                            </div>
                          ) : isCurrentlyExpired ? (
                            <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl space-y-1 mt-2">
                              <div className="text-[10px] font-extrabold text-red-800 flex items-center gap-1">
                                <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
                                <span>Contact access expired</span>
                              </div>
                              <p className="text-[10px] text-red-700 leading-normal font-medium">
                                Revealing details is hidden due to safety protocols. Re-request unlock if permitted.
                              </p>
                            </div>
                          ) : null}

                          <span className="text-[9px] text-slate-400 font-bold block">
                            Requested on {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Status and consent action triggers */}
                      <div className="flex items-center justify-end flex-shrink-0 self-end md:self-center">
                        {r.isIncoming && r.status === "PENDING" ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRespond(r.id, "ACCEPTED")}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRespond(r.id, "DECLINED")}
                              className="px-3 py-2 rounded-xl border border-slate-200 text-[11px] font-bold text-[#636366] hover:bg-slate-50 transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        ) : !r.isIncoming && r.status === "PENDING" ? (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg font-bold border border-amber-200">
                            Pending Consent
                          </span>
                        ) : isCurrentlyActive ? (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg font-bold border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Unlocked</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#8E8E93] font-bold flex items-center space-x-1.5">
                            <XCircle className="h-4 w-4" />
                            <span>Closed</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
