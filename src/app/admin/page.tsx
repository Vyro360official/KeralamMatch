"use client";

import React, { useState, useEffect } from "react";
import { Users, ShieldCheck, Crown, IndianRupee, UserPlus, Heart, MessageCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";

interface StatData {
  totalUsers: number;
  verifiedUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  newUsersToday: number;
  contactRequestsToday: number;
  messagesToday: number;
  pendingVerifications: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalUsersFormatted = typeof stats?.totalUsers === "number" ? stats.totalUsers.toLocaleString() : "25,430";
  const newRegistrationsFormatted = typeof stats?.newUsersToday === "number" ? stats.newUsersToday.toLocaleString() : "1,234";
  const verifiedProfilesFormatted = typeof stats?.verifiedUsers === "number" ? stats.verifiedUsers.toLocaleString() : "18,765";
  const activePremiumFormatted = typeof stats?.activeSubscriptions === "number" ? stats.activeSubscriptions.toLocaleString() : "2,456";

  return (
    <div className="space-y-8 text-[#1C1C1E]">
      
      {/* Dashboard Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F44]">Dashboard Overview</h1>
        <p className="text-xs text-[#636366] mt-0.5">Real-time metrics and platform activity</p>
      </div>

      {/* ── Top 4 KPI Cards (Matching Reference 2.2) ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Total Users */}
        <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs text-[#636366] font-semibold">
            <span>Total Users</span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
              ▲ +12.5%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0A1F44]">{totalUsersFormatted}</div>
        </div>

        {/* KPI 2: New Registrations */}
        <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs text-[#636366] font-semibold">
            <span>New Registrations</span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
              ▲ +8.2%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0A1F44]">{newRegistrationsFormatted}</div>
        </div>

        {/* KPI 3: Verified Profiles */}
        <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs text-[#636366] font-semibold">
            <span>Verified Profiles</span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
              ▲ +10.6%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0A1F44]">{verifiedProfilesFormatted}</div>
        </div>

        {/* KPI 4: Active Premium */}
        <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs text-[#636366] font-semibold">
            <span>Active Premium</span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
              ▲ +6.7%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0A1F44]">{activePremiumFormatted}</div>
        </div>

      </div>

      {/* ── Registrations Chart Row (Matching Reference 2.2) ───────────── */}
      <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-[#0A1F44]">Registrations (This Month)</h3>
            <p className="text-xs text-[#8E8E93]">Daily candidate registration trajectory</p>
          </div>
          <span className="text-xs font-semibold text-[#636366] bg-[#FCFBF7] px-3 py-1 rounded-full border">This Month</span>
        </div>

        {/* Visual Line Chart Graphic */}
        <div className="h-48 w-full flex items-end justify-between px-2 pt-8">
          {[40, 65, 50, 90, 120, 150, 110, 180, 240, 210, 290, 340, 310, 410].map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
              <div
                style={{ height: `${(h / 450) * 100}%` }}
                className="w-2.5 rounded-t-full bg-gradient-to-t from-[#C81D45]/40 to-[#C81D45] group-hover:opacity-80 transition-all"
              />
              <span className="text-[9px] text-[#8E8E93]">{i * 2 + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Verification & Reports Status Grid (Matching Reference 2.2) ──── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Verification Queue Summary */}
        <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#0A1F44]">Verification Queue</h3>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-[#FCFBF7] rounded-2xl border border-[rgba(28,28,30,0.06)]">
              <span className="text-xs text-[#8E8E93] block">Pending</span>
              <span className="text-xl font-bold text-[#C81D45]">324</span>
            </div>
            <div className="p-3 bg-[#FCFBF7] rounded-2xl border border-[rgba(28,28,30,0.06)]">
              <span className="text-xs text-[#8E8E93] block">In Review</span>
              <span className="text-xl font-bold text-amber-600">76</span>
            </div>
            <div className="p-3 bg-[#FCFBF7] rounded-2xl border border-[rgba(28,28,30,0.06)]">
              <span className="text-xs text-[#8E8E93] block">Completed</span>
              <span className="text-xl font-bold text-emerald-600">1,842</span>
            </div>
          </div>
        </div>

        {/* Reports Summary */}
        <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#0A1F44]">Reports (This Month)</h3>
            <span className="text-xs font-bold text-[#C81D45]">View All</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-[#FCFBF7] rounded-2xl border border-[rgba(28,28,30,0.06)]">
              <span className="text-xs text-[#8E8E93] block">Total Reports</span>
              <span className="text-xl font-bold text-[#0A1F44]">156</span>
            </div>
            <div className="p-3 bg-[#FCFBF7] rounded-2xl border border-[rgba(28,28,30,0.06)]">
              <span className="text-xs text-[#8E8E93] block">Resolved</span>
              <span className="text-xl font-bold text-emerald-600">120</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
