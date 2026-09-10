"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Users,
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Clock,
  ArrowRight,
  Filter,
  BarChart3,
  UserCheck,
  ShieldCheck,
  Percent,
} from "lucide-react";
import MatrimonialLogoLoader from "@/components/ui/matrimonial-logo-loader";

interface AnalyticsData {
  range: string;
  kpis: {
    totalChecksPeriod: number;
    totalChecksAllTime: number;
    registeredChecks: number;
    newPersonChecks: number;
    uniqueUsers: number;
    avgCompatibilityScore: number;
    highMatchRate: number;
    consentConversionRate: number;
  };
  distribution: {
    allTime: {
      registered: number;
      newPerson: number;
    };
    verdicts: {
      Uthamam: number;
      Madhyamam: number;
      Adhamam: number;
    };
    poruthamStats: Array<{
      name: string;
      pass: number;
      fail: number;
      rate: number;
    }>;
  };
  hourlyDistribution: Array<{ hour: string; count: number }>;
  volumeTrend: Array<{ date: string; registered: number; newPerson: number; total: number }>;
  topProfiles: Array<{
    profileId: string;
    checkCount: number;
    name: string;
    gender: string;
    district: string;
    star: string;
  }>;
  topUsers: Array<{
    userId: string;
    checkCount: number;
    name: string;
    phone: string;
    district: string;
  }>;
}

const RANGES = [
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "this_month", label: "This Month" },
  { id: "all", label: "All Time" },
];

export default function HoroscopeAnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = (selectedRange: string) => {
    setLoading(true);
    fetch(`/api/admin/analytics/horoscope?range=${selectedRange}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setData(res);
        }
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadData(range);
  }, [range]);

  if (loading && !data) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <MatrimonialLogoLoader size="md" text="Mining Horoscope Analytics..." />
      </div>
    );
  }

  const kpis = data?.kpis;
  const verdicts = data?.distribution?.verdicts || { Uthamam: 0, Madhyamam: 0, Adhamam: 0 };
  const totalVerdicts = verdicts.Uthamam + verdicts.Madhyamam + verdicts.Adhamam || 1;
  const uthamamPct = Math.round((verdicts.Uthamam / totalVerdicts) * 100);
  const madhyamamPct = Math.round((verdicts.Madhyamam / totalVerdicts) * 100);
  const adhamamPct = Math.round((verdicts.Adhamam / totalVerdicts) * 100);

  const hourly = data?.hourlyDistribution || [];
  const maxHourly = Math.max(...hourly.map((h) => h.count), 1);

  const trend = data?.volumeTrend || [];
  const maxTrend = Math.max(...trend.map((t) => t.total), 1);

  return (
    <div className="space-y-6 text-[#0A1F44]">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h1 className="text-xl font-extrabold text-[#0A1F44] tracking-tight">Horoscope Intelligence & Analytics</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Astrological compatibility usage, 10-Porutham pass rates, and candidate conversion telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/horoscope-leads"
            className="h-9 px-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Horoscope Leads CRM</span>
          </Link>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  range === r.id ? "bg-[#0A1F44] text-white shadow-xs" : "text-slate-600 hover:text-[#0A1F44]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setRefreshing(true);
              loadData(range);
            }}
            className="h-9 w-9 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:text-[#0A1F44] transition-colors"
            title="Refresh analytics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#FF1475]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 6 Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Total Checks */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Checks</span>
          <span className="text-xl font-black text-[#0A1F44] block">
            {kpis?.totalChecksPeriod ? kpis.totalChecksPeriod.toLocaleString() : "0"}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 block">
            All-time: {kpis?.totalChecksAllTime || 0}
          </span>
        </div>

        {/* KPI 2: Registered vs New Person */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Candidate Split</span>
          <span className="text-xl font-black text-purple-700 block">
            {kpis?.registeredChecks || 0} / {kpis?.newPersonChecks || 0}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 block">Registered / New Person</span>
        </div>

        {/* KPI 3: Unique Users Checking */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Searchers</span>
          <span className="text-xl font-black text-[#0A1F44] block">{kpis?.uniqueUsers || 0}</span>
          <span className="text-[10px] font-semibold text-slate-400 block">Unique users checking</span>
        </div>

        {/* KPI 4: Average Score */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Score</span>
          <span className="text-xl font-black text-emerald-600 block">
            {kpis?.avgCompatibilityScore || 0} <span className="text-xs text-slate-400 font-semibold">/ 36</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-400 block">Mean Porutham score</span>
        </div>

        {/* KPI 5: High Match Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">High Match Rate</span>
          <span className="text-xl font-black text-[#FF1475] block">{kpis?.highMatchRate || 0}%</span>
          <span className="text-[10px] font-semibold text-slate-400 block">Score ≥ 20 (Uthamam)</span>
        </div>

        {/* KPI 6: Consent Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consent Rate</span>
          <span className="text-xl font-black text-blue-600 block">{kpis?.consentConversionRate || 0}%</span>
          <span className="text-[10px] font-semibold text-slate-400 block">Marketing opt-in %</span>
        </div>
      </div>

      {/* Row 2: Check Volume Trend & Verdict Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check Volume Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">Horoscope Check Volume Trend</h3>
              <p className="text-[11px] text-slate-500">Live checks volume over time</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-600" />
                Registered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#FF1475]" />
                New Person
              </span>
            </div>
          </div>

          <div className="h-44 w-full flex items-end justify-between gap-1 pt-4">
            {trend.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                No check activity recorded in this period.
              </div>
            ) : (
              trend.map((item, idx) => {
                const regPct = Math.round((item.registered / maxTrend) * 100);
                const newPct = Math.round((item.newPerson / maxTrend) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.total}
                    </div>
                    <div className="w-full max-w-[18px] flex flex-col items-center">
                      <div style={{ height: `${newPct}%` }} className="w-full bg-[#FF1475] rounded-t-sm" />
                      <div style={{ height: `${regPct}%` }} className="w-full bg-purple-600 rounded-b-sm" />
                    </div>
                    <span className="text-[9px] text-slate-400 truncate w-full text-center">{item.date}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Verdict Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">Result Verdict Distribution</h3>
            <p className="text-[11px] text-slate-500">Compatibility classification breakdown</p>
          </div>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-700">Uthamam (ഉത്തമം - Excellent)</span>
                <span>
                  {verdicts.Uthamam} ({uthamamPct}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${uthamamPct}%` }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-amber-700">Madhyamam (മധ്യമം - Moderate)</span>
                <span>
                  {verdicts.Madhyamam} ({madhyamamPct}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${madhyamamPct}%` }} className="h-full bg-amber-500 rounded-full" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-rose-700">Adhamam (അധമം - Low)</span>
                <span>
                  {verdicts.Adhamam} ({adhamamPct}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${adhamamPct}%` }} className="h-full bg-rose-500 rounded-full" />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
            High compatibility (Uthamam) accounts for <strong>{uthamamPct}%</strong> of all checks in this period.
          </div>
        </div>
      </div>

      {/* Row 3: 10-Porutham Pass/Fail Breakdown & Hourly Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 10-Porutham Pass Rates */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
              10-Porutham Pass/Fail Breakdown
            </h3>
            <p className="text-[11px] text-slate-500">
              Aggregated success rates across traditional Kerala Poruthams
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(data?.distribution?.poruthamStats || []).map((p) => (
              <div key={p.name} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#0A1F44]">{p.name}</span>
                  <span className={p.rate >= 50 ? "text-emerald-600" : "text-rose-600"}>{p.rate}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.max(p.rate, 2)}%` }}
                    className={`h-full rounded-full ${p.rate >= 50 ? "bg-emerald-500" : "bg-rose-500"}`}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-400">
                  <span>Pass: {p.pass}</span>
                  <span>Fail: {p.fail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Check Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
              Hourly Check Usage Distribution
            </h3>
            <p className="text-[11px] text-slate-500">Peak hours for astrological checks (00:00 – 23:00 IST)</p>
          </div>

          <div className="h-44 w-full flex items-end justify-between gap-1 pt-4">
            {hourly.map((h) => {
              const heightPct = Math.max(Math.round((h.count / maxHourly) * 100), 4);
              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="text-[8px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {h.count}
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full rounded-t-sm bg-gradient-to-t from-[#0A1F44] to-purple-500 group-hover:to-[#FF1475] transition-all"
                  />
                  <span className="text-[8px] text-slate-400 truncate w-full text-center">
                    {h.hour.split(":")[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 text-center font-medium">
            Peak engagement typically concentrates around evening 18:00 – 22:00 IST.
          </div>
        </div>
      </div>

      {/* Row 4: Top Checked Profiles & Top Active Searchers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Checked Profiles */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
              Most Checked Profiles (Registered)
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Top 10 candidates</span>
          </div>

          <div className="divide-y divide-slate-100">
            {(data?.topProfiles || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No registered profile check records found.
              </div>
            ) : (
              data?.topProfiles.map((p, idx) => (
                <div key={p.profileId} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-black text-slate-400 w-4">{idx + 1}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#0A1F44] block truncate">{p.name}</span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {p.gender} • {p.district} • Nakshatram: {p.star}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                    {p.checkCount} checks
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Active Users */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">Top Checking Users</h3>
            <span className="text-[10px] text-slate-400 font-semibold">Most active compatibility evaluators</span>
          </div>

          <div className="divide-y divide-slate-100">
            {(data?.topUsers || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No user search check records found.
              </div>
            ) : (
              data?.topUsers.map((u, idx) => (
                <div key={u.userId} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-black text-slate-400 w-4">{idx + 1}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#0A1F44] block truncate">{u.name}</span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {u.district} • {u.phone}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                    {u.checkCount} checks
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
