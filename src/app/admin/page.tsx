"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Crown,
  IndianRupee,
  UserPlus,
  Heart,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldAlert,
  Search,
  ExternalLink,
} from "lucide-react";
import MatrimonialLogoLoader from "@/components/ui/matrimonial-logo-loader";

interface DashboardData {
  range: string;
  kpis: {
    totalUsers: number;
    verifiedUsers: number;
    activeUsers: number;
    newUsers: number;
    newUsersToday: number;
    premiumMembers: number;
    allTimeRevenue: number;
    periodRevenue: number;
    todayRevenue: number;
    contactRequests: number;
    contactRequestsToday: number;
    horoscopeChecks: number;
    nonRegChecks: number;
    messagesCount: number;
    messagesToday: number;
    pendingVerifications: number;
  };
  smartAlerts: {
    staleVerificationsCount: number;
    unresolvedReportsCount: number;
    failedPayments24hCount: number;
  };
  trajectoryChart: Array<{ total: number; label: string }>;
  planDistribution: Array<{ planId: string; name: string; count: number }>;
  recentUsers: Array<{
    id: string;
    name: string;
    phone: string;
    email: string;
    gender: string;
    district: string;
    plan: string;
    verificationStatus: string;
    profileSource: string;
    createdAt: string;
  }>;
  pendingVerificationsList: Array<{
    profileId: string;
    userId: string;
    name: string;
    gender: string;
    district: string;
    phone: string;
    email: string;
    hasSelfie: boolean;
    hasAadhaar: boolean;
    createdAt: string;
  }>;
}

const RANGES = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "this_month", label: "This Month" },
  { id: "all", label: "All Time" },
];

export default function AdminDashboard() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = (selectedRange: string) => {
    setLoading(true);
    fetch(`/api/admin/dashboard/stats?range=${selectedRange}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setData(res);
        }
        setLoading(false);
        setRefreshing(false);
      })
      .catch((err) => {
        console.error("Dashboard stats error:", err);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadData(range);
  }, [range]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(range);
  };

  if (loading && !data) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <MatrimonialLogoLoader size="md" text="Loading Real Business Metrics..." />
      </div>
    );
  }

  const kpis = data?.kpis;
  const alerts = data?.smartAlerts;
  const totalAlerts = (alerts?.staleVerificationsCount || 0) + (alerts?.unresolvedReportsCount || 0) + (alerts?.failedPayments24hCount || 0);

  // Trajectory calculation for SVG path
  const trajectory = data?.trajectoryChart || [];
  const maxVal = Math.max(...trajectory.map((t) => t.total), 5);

  return (
    <div className="space-y-6 text-[#0A1F44]">
      {/* Top Console Header & Dynamic Date Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#0A1F44] tracking-tight">Business Management Console</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live DB
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time operations, memberships, horoscope checks, and revenue metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dynamic Range Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  range === r.id
                    ? "bg-[#0A1F44] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#0A1F44]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            title="Refresh metrics from live database"
            className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0A1F44] text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#FF1475]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Quick Action Shortcuts Bar (Ambience ERP UX Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Link
          href="/admin/users/create"
          className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0A1F44] hover:bg-[#132A57] text-white text-xs font-bold transition-all shadow-xs group"
        >
          <div className="h-7 w-7 rounded-lg bg-[#FF1475] flex items-center justify-center flex-shrink-0">
            <UserPlus className="h-4 w-4 text-white" />
          </div>
          <span className="truncate">+ Create Profile (Wizard)</span>
        </Link>

        <Link
          href="/admin/verification"
          className="flex items-center gap-2.5 p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#0A1F44] transition-all shadow-xs"
        >
          <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="truncate">Verification Queue</span>
          {kpis?.pendingVerifications ? (
            <span className="ml-auto text-[10px] font-black px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-700">
              {kpis.pendingVerifications}
            </span>
          ) : null}
        </Link>

        <Link
          href="/admin/analytics/horoscope"
          className="flex items-center gap-2.5 p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#0A1F44] transition-all shadow-xs"
        >
          <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="truncate">Horoscope Analytics</span>
        </Link>

        <Link
          href="/admin/horoscope-leads"
          className="flex items-center gap-2.5 p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#0A1F44] transition-all shadow-xs"
        >
          <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <span className="truncate">Horoscope Leads CRM</span>
        </Link>

        <Link
          href="/admin/payments"
          className="flex items-center gap-2.5 p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#0A1F44] transition-all shadow-xs"
        >
          <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <IndianRupee className="h-4 w-4" />
          </div>
          <span className="truncate">Payments & Revenue</span>
        </Link>
      </div>

      {/* Smart Alerts Banner (High-contrast operational status) */}
      {totalAlerts > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-white p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-900 block">
                Attention Required: {totalAlerts} Operational Items Pending
              </span>
              <span className="text-[11px] text-amber-700 font-medium">
                {alerts?.staleVerificationsCount ? `${alerts.staleVerificationsCount} verifications waiting > 24h. ` : ""}
                {alerts?.unresolvedReportsCount ? `${alerts.unresolvedReportsCount} safety reports unresolved. ` : ""}
                {alerts?.failedPayments24hCount ? `${alerts.failedPayments24hCount} failed transactions in last 24h.` : ""}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/verification"
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
            >
              Review Verifications
            </Link>
          </div>
        </div>
      )}

      {/* ZONE 1: REVENUE & MEMBERSHIP HEALTH (4 Dense Cards) */}
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Revenue & Subscriptions ({RANGES.find((r) => r.id === range)?.label})
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today's Revenue */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500">Today's Revenue</span>
              <span className="text-2xl font-black text-[#0A1F44] block">
                ₹ {kpis?.todayRevenue ? kpis.todayRevenue.toLocaleString() : "0"}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block">From successful payments</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2: Period Revenue */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500">Revenue in Period</span>
              <span className="text-2xl font-black text-[#0A1F44] block">
                ₹ {kpis?.periodRevenue ? kpis.periodRevenue.toLocaleString() : "0"}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block">
                All-time: ₹ {kpis?.allTimeRevenue ? kpis.allTimeRevenue.toLocaleString() : "0"}
              </span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3: Active Premium Subscriptions */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500">Active Premium Members</span>
              <span className="text-2xl font-black text-[#0A1F44] block">
                {kpis?.premiumMembers ? kpis.premiumMembers.toLocaleString() : "0"}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block">Paying active subscribers</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Crown className="h-6 w-6" />
            </div>
          </div>

          {/* Card 4: Pending Verifications */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500">Pending Verifications</span>
              <span className="text-2xl font-black text-[#0A1F44] block">
                {kpis?.pendingVerifications ? kpis.pendingVerifications.toLocaleString() : "0"}
              </span>
              <span className="text-[10px] font-semibold text-amber-600 block">
                {alerts?.staleVerificationsCount ? `${alerts.staleVerificationsCount} overdue > 24h` : "Queue is fresh"}
              </span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* ZONE 2: MATCH & USER OPERATIONS (4 Dense Cards) */}
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          User Operations & Astrological Engagement
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 5: Total Users */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500">Total Registered Users</span>
              <span className="text-2xl font-black text-[#0A1F44] block">
                {kpis?.totalUsers ? kpis.totalUsers.toLocaleString() : "0"}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 block">
                +{kpis?.newUsers || 0} in {RANGES.find((r) => r.id === range)?.label.toLowerCase()}
              </span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>

          {/* Card 6: Active Users */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500">Active Users</span>
              <span className="text-2xl font-black text-[#0A1F44] block">
                {kpis?.activeUsers ? kpis.activeUsers.toLocaleString() : "0"}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block">Active in selected period</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>

          {/* Card 7: Horoscope Compatibility Checks */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500">Horoscope Checks</span>
              <span className="text-2xl font-black text-[#0A1F44] block">
                {kpis?.horoscopeChecks ? kpis.horoscopeChecks.toLocaleString() : "0"}
              </span>
              <span className="text-[10px] font-semibold text-purple-600 block">
                {kpis?.nonRegChecks || 0} new candidate checks
              </span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>

          {/* Card 8: Contact Reveal Requests */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500">Contact Requests</span>
              <span className="text-2xl font-black text-[#0A1F44] block">
                {kpis?.contactRequests ? kpis.contactRequests.toLocaleString() : "0"}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block">
                +{kpis?.contactRequestsToday || 0} today
              </span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-pink-50 text-[#FF1475] flex items-center justify-center">
              <Heart className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* REAL CHARTS ROW: Trajectory & Subscription Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real User Growth Trajectory Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                User Registration Trajectory
              </h3>
              <p className="text-[11px] text-slate-500">Live database counts plotted by dynamic date interval</p>
            </div>
            <span className="text-xs font-extrabold text-[#FF1475]">
              +{kpis?.newUsers || 0} Registrations
            </span>
          </div>

          {/* SVG Trajectory Chart */}
          <div className="h-48 w-full pt-4">
            {trajectory.length === 0 || trajectory.every((t) => t.total === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>No signups recorded in this date range yet.</span>
                <span className="text-[10px] text-slate-300 mt-1">Showing 0 live data point</span>
              </div>
            ) : (
              <div className="h-full flex items-end justify-between gap-1.5 px-2">
                {trajectory.map((item, idx) => {
                  const heightPct = Math.max(Math.round((item.total / maxVal) * 100), 4);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end">
                      <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.total}
                      </div>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full max-w-[20px] rounded-t-md bg-gradient-to-t from-[#0A1F44] to-[#FF1475] group-hover:from-[#0A1F44] group-hover:to-[#D4A853] transition-all"
                      />
                      <span className="text-[9px] font-semibold text-slate-400 truncate w-full text-center">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Real Subscription Plan Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">Plan Distribution</h3>
            <p className="text-[11px] text-slate-500">Breakdown of member subscriptions from Neon DB</p>
          </div>

          <div className="space-y-3 py-2">
            {(data?.planDistribution || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active plan subscriptions yet.
              </div>
            ) : (
              data?.planDistribution.map((plan) => {
                const total = kpis?.totalUsers || 1;
                const pct = Math.round((plan.count / total) * 100);
                return (
                  <div key={plan.planId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#0A1F44]">{plan.name}</span>
                      <span className="text-slate-500">
                        {plan.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.max(pct, 2)}%` }}
                        className="h-full bg-gradient-to-r from-[#D4A853] to-[#FF1475] rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Total Memberships</span>
            <span className="text-[#0A1F44] font-black">{kpis?.totalUsers || 0}</span>
          </div>
        </div>
      </div>

      {/* ACTIONABLE QUEUES ROW: Pending Verifications & Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Requests Queue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
                Pending Verification Queue
              </h3>
            </div>
            <Link
              href="/admin/verification"
              className="text-xs font-bold text-[#FF1475] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(data?.pendingVerificationsList || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-1.5 opacity-60" />
                <span>Verification queue is empty. All submitted profiles are reviewed!</span>
              </div>
            ) : (
              data?.pendingVerificationsList.map((item) => (
                <div key={item.profileId} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#0A1F44] block truncate">{item.name}</span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {item.gender} • {item.district} • {item.phone}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {item.hasAadhaar && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700">
                          Aadhaar
                        </span>
                      )}
                      {item.hasSelfie && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-purple-50 text-purple-700">
                          Selfie
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href="/admin/verification"
                    className="px-3 py-1.5 rounded-lg bg-[#0A1F44] hover:bg-[#132A57] text-white text-xs font-bold transition-colors flex-shrink-0"
                  >
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">Recent Registrations</h3>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-bold text-[#FF1475] hover:underline flex items-center gap-1"
            >
              <span>View All Users</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(data?.recentUsers || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <span>No registrations recorded yet.</span>
              </div>
            ) : (
              data?.recentUsers.map((user) => (
                <div key={user.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0A1F44] truncate">{user.name}</span>
                      {user.profileSource === "ADMIN_CREATED" && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-[#D4A853]/20 text-[#0A1F44] border border-[#D4A853]/40">
                          Admin Created
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {user.gender} • {user.district} • Plan: {user.plan}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      user.verificationStatus === "VERIFIED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.verificationStatus}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
