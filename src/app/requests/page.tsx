"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ArrowUpRight, ArrowDownLeft, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
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

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <DashboardSidebar userProfile={currentUserProfile} />

          <main className="lg:col-span-9 space-y-6">
            {/* Header Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F44]">Contact Requests</h1>
              <p className="text-xs text-[#636366] mt-1">
                Manage your ephemeral 24-hour contact reveal requests & consents
              </p>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Tabs Row (Matching Reference 1.8) */}
            <div className="flex rounded-full bg-white p-1 border border-[rgba(28,28,30,0.08)] shadow-sm text-xs font-semibold">
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
                    className={`flex-1 py-2.5 rounded-full capitalize transition-all ${
                      activeTab === tab
                        ? "bg-[#C81D45] text-white font-bold shadow-sm"
                        : "text-[#636366] hover:text-[#0A1F44]"
                    }`}
                  >
                    {tab} ({count})
                  </button>
                );
              })}
            </div>

            {/* Request List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-3xl" />
                ))}
              </div>
            ) : displayList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-xs text-[#636366] border border-[rgba(28,28,30,0.08)]">
                No {activeTab} contact requests found.
              </div>
            ) : (
              <div className="space-y-4">
                {displayList.map((r) => {
                  const otherUser = r.isIncoming ? r.sender : r.receiver;
                  const isExpired = r.expiresAt && new Date(r.expiresAt) <= new Date();

                  return (
                    <div
                      key={r.id}
                      className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-[#FCFBF7] border border-[rgba(28,28,30,0.08)] flex items-center justify-center font-bold text-[#0A1F44] text-sm">
                          {otherUser?.firstName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-[#0A1F44]">
                              {otherUser?.firstName} {otherUser?.lastName}
                            </h3>
                            <span className="text-[10px] font-semibold text-[#8E8E93]">
                              {r.isIncoming ? "Incoming Request" : "Outgoing Request"}
                            </span>
                          </div>
                          <p className="text-xs text-[#636366] mt-0.5">
                            {r.isIncoming
                              ? "Requested to unlock your contact details"
                              : "You requested to view contact details"}
                          </p>
                          <span className="text-[10px] text-[#8E8E93] block mt-1">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Status / Action Buttons */}
                      <div className="flex items-center space-x-3">
                        {r.isIncoming && r.status === "PENDING" ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRespond(r.id, "ACCEPTED")}
                              className="px-4 py-2 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-sm"
                            >
                              Accept (24h)
                            </button>
                            <button
                              onClick={() => handleRespond(r.id, "DECLINED")}
                              className="px-4 py-2 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#636366] hover:bg-gray-50"
                            >
                              Decline
                            </button>
                          </div>
                        ) : !r.isIncoming && r.status === "PENDING" ? (
                          <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full font-semibold border border-amber-200">
                            Pending Consent
                          </span>
                        ) : !isExpired && r.status === "ACCEPTED" ? (
                          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                            <Clock className="h-4 w-4 text-emerald-600" />
                            <span>Active 24h Window</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#8E8E93] font-semibold flex items-center space-x-1">
                            <XCircle className="h-4 w-4 text-[#8E8E93]" />
                            <span>Expired</span>
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
