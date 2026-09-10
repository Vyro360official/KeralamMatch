"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  User,
  UserPlus,
  Crown,
  IndianRupee,
  Calendar,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import MatrimonialLogoLoader from "@/components/ui/matrimonial-logo-loader";

interface DashboardData {
  range: string;
  kpis: {
    totalUsers: { value: number; growth: string; isPositive: boolean };
    verifiedUsers: { value: number; growth: string; isPositive: boolean };
    activeUsers: { value: number; growth: string; isPositive: boolean };
    newSignups: { value: number; growth: string; isPositive: boolean };
    premiumMembers: { value: number; growth: string; isPositive: boolean };
    totalRevenue: { value: number; growth: string; isPositive: boolean; allTimeValue: number };
  };
  subscriptionDonut: {
    totalMembers: number;
    segments: Array<{ name: string; count: number; percentage: number; color: string }>;
  };
  horoscopeDonut: {
    totalChecks: number;
    segments: Array<{ name: string; shortName: string; count: number; percentage: number; color: string }>;
  };
  usersVsHoroscope: {
    months: Array<{
      month: string;
      monthKey: string;
      totalUsers: number;
      usedHoroscope: number;
      totalChecks: number;
      combinedTotal: number;
    }>;
    adoptionRate: number;
    uniqueHoroscopeUsers: number;
    totalRegisteredUsers: number;
  };
  userGrowthChart: Array<{
    date: string;
    label: string;
    totalUsers: number;
    verifiedUsers: number;
  }>;
  recentSignups: Array<{
    index: number;
    id: string;
    name: string;
    email: string;
    registeredOn: string;
    status: string;
  }>;
}

const RANGES = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "this_month", label: "This Month" },
  { id: "all", label: "All Time" },
];

/**
 * Helper to format compact numbers (e.g. 18452 -> 18.5K)
 */
function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 10_000) return (num / 1_000).toFixed(1) + "K";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString("en-IN");
}

/**
 * Donut SVG Component with center total and clean strokeDasharray segments
 */
function SvgDonutChart({
  total,
  totalLabel,
  segments,
  size = 180,
  strokeWidth = 26,
}: {
  total: number;
  totalLabel: string;
  segments: Array<{ name: string; count: number; percentage: number; color: string }>;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (total === 0 || segments.length === 0) {
    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            strokeWidth={strokeWidth}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
          <span className="text-xl font-extrabold text-[#0A1F44] dark:text-white">0</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{totalLabel}</span>
        </div>
      </div>
    );
  }

  let accumulatedPercent = 0;

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-100 dark:text-slate-800"
          strokeWidth={strokeWidth}
        />
        {segments.map((seg, i) => {
          if (seg.count <= 0) return null;
          const strokeDasharray = `${(seg.percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
          accumulatedPercent += seg.percentage;

          return (
            <circle
              key={seg.name + i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              className="transition-all duration-500 hover:opacity-85"
            />
          );
        })}
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
        <span className="text-lg sm:text-xl font-extrabold text-[#0A1F44] dark:text-white leading-tight">
          {total.toLocaleString("en-IN")}
        </span>
        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
          {totalLabel}
        </span>
      </div>
    </div>
  );
}

/**
 * Dynamic, sensible Y-axis scale calculation for charts.
 * Prevents flatline rendering when data is small (e.g. 1-10 items).
 */
function calculateSensibleYAxis(rawMax: number) {
  const max = Math.max(rawMax, 1);
  let yMax = 5;
  if (max <= 5) yMax = 5;
  else if (max <= 10) yMax = 10;
  else if (max <= 20) yMax = 20;
  else if (max <= 50) yMax = 50;
  else if (max <= 100) yMax = 100;
  else if (max <= 250) yMax = 250;
  else if (max <= 500) yMax = 500;
  else if (max <= 1000) yMax = 1000;
  else if (max <= 2500) yMax = 2500;
  else if (max <= 5000) yMax = 5000;
  else yMax = Math.ceil(max / 1000) * 1000;

  const yTicks = [
    yMax,
    Math.round(yMax * 0.75),
    Math.round(yMax * 0.5),
    Math.round(yMax * 0.25),
    0,
  ];

  return { yMax, yTicks };
}

/**
 * Honest, non-misleading KPI growth indicator badge.
 * Shows 'New' or 'No previous data' when prior period is zero rather than fake +100%.
 */
function KpiGrowthBadge({ growth, isPositive }: { growth?: string; isPositive?: boolean }) {
  if (!growth || growth === "No previous data" || growth === "No data") {
    return (
      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
        No previous data
      </span>
    );
  }

  if (growth === "New") {
    return (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
        New
      </span>
    );
  }

  if (growth === "All Time" || growth === "Active") {
    return (
      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
        {growth}
      </span>
    );
  }

  return isPositive ? (
    <span className="text-emerald-600 dark:text-emerald-400 flex items-center text-[11px] font-semibold">
      <TrendingUp className="h-3 w-3 mr-0.5" />
      {growth}
    </span>
  ) : (
    <span className="text-rose-600 dark:text-rose-400 flex items-center text-[11px] font-semibold">
      <TrendingDown className="h-3 w-3 mr-0.5" />
      {growth}
    </span>
  );
}

/**
 * Stacked Bar Chart Component for Users vs Unique Horoscope Users
 */
function StackedBarChart({
  months,
}: {
  months: Array<{
    month: string;
    totalUsers: number;
    usedHoroscope: number;
    combinedTotal: number;
  }>;
}) {
  const chartHeight = 120;
  const maxVal = Math.max(...months.map((m) => Math.max(m.totalUsers, m.usedHoroscope)), 1);
  const { yMax, yTicks } = calculateSensibleYAxis(maxVal);

  return (
    <div className="w-full flex flex-col justify-end pt-2">
      <div className="flex items-end h-[135px] gap-2 sm:gap-3 w-full pl-7 sm:pl-8 pr-2 relative">
        {/* Y-axis gridlines & labels */}
        <div className="absolute left-0 top-0 bottom-6 w-6 sm:w-7 flex flex-col justify-between text-[9px] font-semibold text-slate-400 select-none">
          {yTicks.map((val) => (
            <span key={val} className="truncate text-right pr-1">
              {val === 0 ? "0" : formatCompactNumber(val)}
            </span>
          ))}
        </div>

        {/* Horizontal grid lines */}
        <div className="absolute left-7 sm:left-8 right-2 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
          {yTicks.map((val) => (
            <div key={val} className="border-b border-slate-100 dark:border-slate-800/80 w-full" />
          ))}
        </div>

        {/* Bars */}
        {months.map((m, idx) => {
          const totalUsersHeight = (m.totalUsers / yMax) * chartHeight;
          const usedHoroHeight = (m.usedHoroscope / yMax) * chartHeight;
          const combined = m.totalUsers + m.usedHoroscope;

          return (
            <div key={m.month + idx} className="flex-1 flex flex-col items-center h-full justify-end group z-10">
              {/* Value label on top of bar */}
              <span className="text-[10px] font-extrabold text-[#0A1F44] dark:text-white mb-1 transition-transform group-hover:-translate-y-0.5">
                {combined > 0 ? formatCompactNumber(combined) : "0"}
              </span>

              {/* Stacked Pillar */}
              <div className="w-full max-w-[28px] sm:max-w-[34px] flex flex-col justify-end rounded-t-md overflow-hidden shadow-xs">
                {/* Upper stack: Unique Horoscope Users (Pink #FF1475) */}
                <div
                  style={{ height: `${Math.max(usedHoroHeight, m.usedHoroscope > 0 ? 3 : 0)}px` }}
                  className="w-full bg-[#FF1475] transition-all duration-500 rounded-t-md hover:brightness-110"
                  title={`Used Horoscope: ${m.usedHoroscope.toLocaleString()} users`}
                />
                {/* Lower stack: Total Users (Blue #3A7DFF) */}
                <div
                  style={{ height: `${Math.max(totalUsersHeight, m.totalUsers > 0 ? 3 : 0)}px` }}
                  className="w-full bg-[#3A7DFF] transition-all duration-500 hover:brightness-110"
                  title={`Total Users: ${m.totalUsers.toLocaleString()}`}
                />
              </div>

              {/* X-axis Month Label */}
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2">
                {m.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * User Growth Overview Area Chart Component
 */
function UserGrowthAreaChart({
  data,
}: {
  data: Array<{
    date: string;
    label: string;
    totalUsers: number;
    verifiedUsers: number;
  }>;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-xs text-slate-400 font-semibold">
        No growth data recorded for this period yet.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.totalUsers, d.verifiedUsers)), 1);
  const { yMax, yTicks } = calculateSensibleYAxis(maxVal);

  const svgWidth = 650;
  const svgHeight = 170;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 30;

  const innerWidth = svgWidth - paddingLeft - paddingRight;
  const innerHeight = svgHeight - paddingTop - paddingBottom;

  const pointsCount = data.length;
  const getX = (i: number) => paddingLeft + (i / Math.max(pointsCount - 1, 1)) * innerWidth;
  const getY = (val: number) => paddingTop + innerHeight - (val / yMax) * innerHeight;

  // Build SVG Path strings
  let totalPath = "";
  let verifiedPath = "";

  data.forEach((d, i) => {
    const x = getX(i);
    const yTotal = getY(d.totalUsers);
    const yVerif = getY(d.verifiedUsers);

    if (i === 0) {
      totalPath += `M ${x} ${yTotal}`;
      verifiedPath += `M ${x} ${yVerif}`;
    } else {
      totalPath += ` L ${x} ${yTotal}`;
      verifiedPath += ` L ${x} ${yVerif}`;
    }
  });

  const totalAreaPath = `${totalPath} L ${getX(pointsCount - 1)} ${paddingTop + innerHeight} L ${getX(0)} ${paddingTop + innerHeight} Z`;
  const verifiedAreaPath = `${verifiedPath} L ${getX(pointsCount - 1)} ${paddingTop + innerHeight} L ${getX(0)} ${paddingTop + innerHeight} Z`;

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          {/* Pink Gradient for Total Users */}
          <linearGradient id="pinkAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF1475" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FF1475" stopOpacity="0.0" />
          </linearGradient>

          {/* Blue Gradient for Verified Users */}
          <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3A7DFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3A7DFF" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y Grid lines and labels */}
        {yTicks.map((val) => {
          const y = getY(val);
          return (
            <g key={val}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={svgWidth - paddingRight}
                y2={y}
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[9px] fill-slate-400 font-semibold"
              >
                {val === 0 ? "0" : formatCompactNumber(val)}
              </text>
            </g>
          );
        })}

        {/* X-axis Dates */}
        {data.map((d, i) => {
          const x = getX(i);
          return (
            <text
              key={d.label + i}
              x={x}
              y={svgHeight - 10}
              textAnchor="middle"
              className="text-[9px] fill-slate-400 font-semibold"
            >
              {d.label}
            </text>
          );
        })}

        {/* Shaded Areas */}
        <path d={totalAreaPath} fill="url(#pinkAreaGrad)" />
        <path d={verifiedAreaPath} fill="url(#blueAreaGrad)" />

        {/* Lines */}
        <path
          d={totalPath}
          fill="none"
          stroke="#FF1475"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={verifiedPath}
          fill="none"
          stroke="#3A7DFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive Data Points */}
        {data.map((d, i) => {
          const x = getX(i);
          const yTotal = getY(d.totalUsers);
          const yVerif = getY(d.verifiedUsers);

          return (
            <g key={"point-" + i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
              {/* Invisible touch/hover target */}
              <rect
                x={x - 12}
                y={paddingTop}
                width={24}
                height={innerHeight}
                fill="transparent"
                className="cursor-pointer"
              />
              {/* Total Users Point */}
              <circle
                cx={x}
                cy={yTotal}
                r={hoveredIdx === i ? 5 : 3.5}
                fill="#FFFFFF"
                stroke="#FF1475"
                strokeWidth="2"
                className="transition-all"
              />
              {/* Verified Users Point */}
              <circle
                cx={x}
                cy={yVerif}
                r={hoveredIdx === i ? 5 : 3.5}
                fill="#FFFFFF"
                stroke="#3A7DFF"
                strokeWidth="2"
                className="transition-all"
              />
            </g>
          );
        })}
      </svg>

      {/* Hover Tooltip */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          className="absolute bg-white dark:bg-[#0F2248] p-2.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 text-xs z-30 pointer-events-none animate-in fade-in duration-100"
          style={{
            left: `${Math.min(Math.max((hoveredIdx / (pointsCount - 1)) * 85, 10), 75)}%`,
            top: "20px",
          }}
        >
          <div className="font-bold text-[#0A1F44] dark:text-white mb-1">{data[hoveredIdx].label}</div>
          <div className="flex items-center gap-2 text-[#FF1475] font-semibold text-[11px]">
            <span className="h-2 w-2 rounded-full bg-[#FF1475]" />
            <span>Total: {data[hoveredIdx].totalUsers.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-[#3A7DFF] font-semibold text-[11px] mt-0.5">
            <span className="h-2 w-2 rounded-full bg-[#3A7DFF]" />
            <span>Verified: {data[hoveredIdx].verifiedUsers.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);

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
      <div className="flex h-[75vh] flex-col items-center justify-center">
        <MatrimonialLogoLoader size="md" text="Loading Real Business Metrics..." />
      </div>
    );
  }

  const kpis = data?.kpis;
  const currentRangeLabel = RANGES.find((r) => r.id === range)?.label || "Last 30 Days";

  return (
    <div className="space-y-6 text-[#0A1F44] dark:text-white pb-8">
      {/* 1. Header Section: Title, Subtitle, Date Range Dropdown & Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">
            Admin / Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1F44] dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, Admin! Here's what's happening with KeralamMatch today.
          </p>
        </div>

        {/* Date Range Selector & Refresh Action */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Dynamic Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRangeDropdownOpen(!rangeDropdownOpen)}
              className="h-10 px-3.5 rounded-xl bg-white dark:bg-[#0D1E3D] hover:bg-slate-50 dark:hover:bg-[#132B57] border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#0A1F44] dark:text-white flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{currentRangeLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {rangeDropdownOpen && (
              <div className="absolute right-0 top-12 w-44 bg-white dark:bg-[#0D1E3D] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-40 animate-in fade-in duration-150">
                {RANGES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRange(r.id);
                      setRangeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${
                      range === r.id
                        ? "text-[#FF1475] bg-pink-50/60 dark:bg-pink-950/30 font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <span>{r.label}</span>
                    {range === r.id && <span className="h-1.5 w-1.5 rounded-full bg-[#FF1475]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-10 px-4 rounded-xl bg-[#FF1475] hover:bg-[#E60067] text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer disabled:opacity-75"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Top 6 KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* KPI 1: Total Users */}
        <div className="bg-white dark:bg-[#0D1E3D] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Users</span>
            <div className="h-8 w-8 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-[#FF1475] flex items-center justify-center flex-shrink-0">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-extrabold text-[#0A1F44] dark:text-white block tracking-tight">
              {kpis?.totalUsers.value.toLocaleString("en-IN") || "0"}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <KpiGrowthBadge growth={kpis?.totalUsers.growth} isPositive={kpis?.totalUsers.isPositive} />
            </div>
          </div>
        </div>

        {/* KPI 2: Verified Users */}
        <div className="bg-white dark:bg-[#0D1E3D] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verified Users</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#3A7DFF] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-extrabold text-[#0A1F44] dark:text-white block tracking-tight">
              {kpis?.verifiedUsers.value.toLocaleString("en-IN") || "0"}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <KpiGrowthBadge growth={kpis?.verifiedUsers.growth} isPositive={kpis?.verifiedUsers.isPositive} />
            </div>
          </div>
        </div>

        {/* KPI 3: Active Users */}
        <div className="bg-white dark:bg-[#0D1E3D] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Users</span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-extrabold text-[#0A1F44] dark:text-white block tracking-tight">
              {kpis?.activeUsers.value.toLocaleString("en-IN") || "0"}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <KpiGrowthBadge growth={kpis?.activeUsers.growth} isPositive={kpis?.activeUsers.isPositive} />
            </div>
          </div>
        </div>

        {/* KPI 4: New Signups */}
        <div className="bg-white dark:bg-[#0D1E3D] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">New Signups</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <UserPlus className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-extrabold text-[#0A1F44] dark:text-white block tracking-tight">
              {kpis?.newSignups.value.toLocaleString("en-IN") || "0"}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <KpiGrowthBadge growth={kpis?.newSignups.growth} isPositive={kpis?.newSignups.isPositive} />
            </div>
          </div>
        </div>

        {/* KPI 5: Premium Members */}
        <div className="bg-white dark:bg-[#0D1E3D] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Premium Members</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#D4A853] flex items-center justify-center flex-shrink-0">
              <Crown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-extrabold text-[#0A1F44] dark:text-white block tracking-tight">
              {kpis?.premiumMembers.value.toLocaleString("en-IN") || "0"}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <KpiGrowthBadge growth={kpis?.premiumMembers.growth} isPositive={kpis?.premiumMembers.isPositive} />
            </div>
          </div>
        </div>

        {/* KPI 6: Total Revenue */}
        <div className="bg-white dark:bg-[#0D1E3D] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Revenue</span>
            <div className="h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-extrabold text-[#0A1F44] dark:text-white block tracking-tight">
              ₹ {kpis?.totalRevenue.value.toLocaleString("en-IN") || "0"}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <KpiGrowthBadge growth={kpis?.totalRevenue.growth} isPositive={kpis?.totalRevenue.isPositive} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Row (3 Analytics Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Subscription Distribution Donut */}
        <div className="bg-white dark:bg-[#0D1E3D] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <h2 className="text-xs font-bold text-[#0A1F44] dark:text-white uppercase tracking-wider">
              Subscription Distribution
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Live membership breakdown across registered profiles
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 py-4">
            <SvgDonutChart
              total={data?.subscriptionDonut.totalMembers || 0}
              totalLabel="TOTAL MEMBERS"
              segments={data?.subscriptionDonut.segments || []}
              size={175}
              strokeWidth={24}
            />

            {/* Legend List */}
            <div className="w-full sm:flex-1 space-y-2.5">
              {(data?.subscriptionDonut.segments || []).map((seg) => (
                <div key={seg.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="font-semibold text-[#0A1F44] dark:text-slate-200 truncate">{seg.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      {seg.count.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 min-w-[38px] text-right">
                      {seg.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Free vs Paid Tier Ratio</span>
            <span className="font-bold text-[#0A1F44] dark:text-slate-300">
              {data?.kpis.premiumMembers.value || 0} Paid Active
            </span>
          </div>
        </div>

        {/* Card 2: Horoscope Compatibility Checks Donut */}
        <div className="bg-white dark:bg-[#0D1E3D] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <h2 className="text-xs font-bold text-[#0A1F44] dark:text-white uppercase tracking-wider">
              Horoscope Compatibility Checks
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Breakdown by Gun Milan score tiers (36 Gunas)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 py-4">
            <SvgDonutChart
              total={data?.horoscopeDonut.totalChecks || 0}
              totalLabel="TOTAL CHECKS"
              segments={data?.horoscopeDonut.segments || []}
              size={175}
              strokeWidth={24}
            />

            {/* Legend List */}
            <div className="w-full sm:flex-1 space-y-2.5">
              {(data?.horoscopeDonut.segments || []).map((seg) => (
                <div key={seg.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="font-semibold text-[#0A1F44] dark:text-slate-200 truncate">{seg.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      {seg.count.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 min-w-[38px] text-right">
                      {seg.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>High Compatibility (18+)</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {((data?.horoscopeDonut.segments[0]?.percentage || 0) + (data?.horoscopeDonut.segments[1]?.percentage || 0)).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Card 3: Users vs Horoscope Checks (Stacked Bar Chart) */}
        <div className="bg-white dark:bg-[#0D1E3D] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-[#0A1F44] dark:text-white uppercase tracking-wider">
                Users vs Horoscope Checks
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Monthly user cohort vs horoscope engagement
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex-shrink-0">
              Adoption: {data?.usersVsHoroscope.adoptionRate || 0}%
            </span>
          </div>

          {/* Legend row */}
          <div className="flex items-center gap-4 text-xs font-semibold pt-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-[#3A7DFF]" />
              <span className="text-slate-600 dark:text-slate-300">Total Users</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-[#FF1475]" />
              <span className="text-slate-600 dark:text-slate-300">Used Horoscope</span>
            </div>
          </div>

          {/* Stacked Bar Chart */}
          <StackedBarChart months={data?.usersVsHoroscope.months || []} />

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Unique Horoscope Users</span>
            <span className="font-bold text-[#0A1F44] dark:text-slate-300">
              {data?.usersVsHoroscope.uniqueHoroscopeUsers.toLocaleString("en-IN") || 0} Users
            </span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: User Growth Overview (7 cols) + Recent Signups (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (7 cols): User Growth Overview Area Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0D1E3D] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 gap-2">
            <div>
              <h2 className="text-xs font-bold text-[#0A1F44] dark:text-white uppercase tracking-wider">
                User Growth Overview
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Cumulative registrations & verified profiles
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF1475]" />
                <span className="text-slate-600 dark:text-slate-300">Total Users</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3A7DFF]" />
                <span className="text-slate-600 dark:text-slate-300">Verified Users</span>
              </div>
            </div>
          </div>

          <div className="py-2">
            <UserGrowthAreaChart data={data?.userGrowthChart || []} />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Verification Conversion Rate</span>
            <span className="font-bold text-[#3A7DFF]">
              {data?.kpis.totalUsers.value
                ? ((data.kpis.verifiedUsers.value / data.kpis.totalUsers.value) * 100).toFixed(1)
                : "0"}
              %
            </span>
          </div>
        </div>

        {/* Right (5 cols): Recent Signups Table */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0D1E3D] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-xs font-bold text-[#0A1F44] dark:text-white uppercase tracking-wider">
                Recent Signups
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Latest member accounts created in platform
              </p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-bold text-[#FF1475] hover:text-[#E60067] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto py-2 flex-1">
            {(data?.recentSignups || []).length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No user registrations recorded yet.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-2.5 font-bold">#</th>
                    <th className="pb-2.5 font-bold">Name</th>
                    <th className="pb-2.5 font-bold">Email</th>
                    <th className="pb-2.5 font-bold">Registered On</th>
                    <th className="pb-2.5 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {data?.recentSignups.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors">
                      <td className="py-2.5 font-bold text-slate-400 text-[11px]">{user.index}</td>
                      <td className="py-2.5 font-bold text-[#0A1F44] dark:text-white truncate max-w-[120px]">
                        {user.name}
                      </td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400 font-mono text-[11px] truncate max-w-[130px]">
                        {user.email}
                      </td>
                      <td className="py-2.5 text-slate-400 text-[11px] whitespace-nowrap">
                        {user.registeredOn}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            user.status === "Verified"
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                              : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Showing top 5 recent signups</span>
            <Link href="/admin/users" className="font-bold text-[#0A1F44] dark:text-slate-300 hover:underline">
              Manage Users →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
