"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Search,
  ExternalLink,
  Clock,
  ChevronRight,
  Sparkles,
  Database,
  Lock,
  Globe,
  Radio,
  Server,
  Zap,
  Flame,
  CreditCard,
  Mail,
  HardDrive,
  Users,
  Compass,
  FileText,
  X,
  Play,
  Filter,
  Check,
  HelpCircle,
} from "lucide-react";
import type { HealthCheckItem, HealthSummary } from "@/modules/admin/admin-health.service";

export default function HealthCheckupPage() {
  const [activeTab, setActiveTab] = useState<"admin" | "member">("admin");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0); // 0 = off

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [adminChecks, setAdminChecks] = useState<HealthCheckItem[]>([]);
  const [memberChecks, setMemberChecks] = useState<HealthCheckItem[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);

  // Selected item modal
  const [selectedItem, setSelectedItem] = useState<HealthCheckItem | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const fetchDiagnostics = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/health-check?scope=all");
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setAdminChecks(data.adminChecks || []);
        setMemberChecks(data.memberChecks || []);
        setHistory(data.history || []);
        setIncidents(data.incidents || []);
      }
    } catch (err) {
      console.error("[HealthCheckup] Failed to fetch diagnostics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  // Auto-refresh timer
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchDiagnostics(true);
    }, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval]);

  // Current checks based on activeTab
  const currentChecks = activeTab === "admin" ? adminChecks : memberChecks;

  // Filtered checks based on category, status, and search query
  const filteredChecks = useMemo(() => {
    return currentChecks.filter((item) => {
      // Category filter
      if (activeCategory !== "all") {
        if (activeCategory === "pages" && item.category !== "pages") return false;
        if (activeCategory === "apis" && item.category !== "apis") return false;
        if (activeCategory === "database" && item.category !== "database") return false;
        if (activeCategory === "services" && item.category !== "services") return false;
        if (activeCategory === "modules" && item.category !== "modules") return false;
        if (activeCategory === "security" && item.category !== "security") return false;
        if (activeCategory === "horoscope" && item.category !== "horoscope") return false;
        if (activeCategory === "payments" && item.category !== "payments") return false;
        if (activeCategory === "functional" && item.category !== "functional" && item.category !== "roles") return false;
      }

      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesRoute = (item.route || "").toLowerCase().includes(q);
        const matchesApi = (item.api || "").toLowerCase().includes(q);
        const matchesMsg = item.message.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesRoute && !matchesApi && !matchesMsg && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [currentChecks, activeCategory, statusFilter, searchQuery]);

  // Status helper badge
  const renderStatusBadge = (status: HealthCheckItem["status"]) => {
    switch (status) {
      case "WORKING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-extrabold whitespace-nowrap">
            <CheckCircle2 className="h-3 w-3" />
            <span>✓ Working</span>
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 text-[10px] font-extrabold whitespace-nowrap">
            <AlertTriangle className="h-3 w-3" />
            <span>⚠ Warning</span>
          </span>
        );
      case "ERROR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 text-[10px] font-extrabold whitespace-nowrap">
            <XCircle className="h-3 w-3" />
            <span>✕ Error</span>
          </span>
        );
      case "PROTECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 text-[10px] font-extrabold whitespace-nowrap">
            <Lock className="h-3 w-3" />
            <span>🔒 Protected</span>
          </span>
        );
      case "NOT_CONFIGURED":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] font-extrabold whitespace-nowrap">
            <span>⚪ Not Set</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-[#0A1F44] dark:text-white pb-12">
      {/* 1. Sub-Header: Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">
            Admin / Settings / Health Checkup
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1F44] dark:text-white">
            Health Checkup
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Check the health and connectivity of KeralamMatch Admin and Member panels.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Auto Refresh Dropdown */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#0D1E3D] px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Auto:</span>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-[#0A1F44] dark:text-white font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value={0} className="dark:bg-[#0D1E3D]">Off</option>
              <option value={30} className="dark:bg-[#0D1E3D]">30s</option>
              <option value={60} className="dark:bg-[#0D1E3D]">1m</option>
              <option value={300} className="dark:bg-[#0D1E3D]">5m</option>
            </select>
          </div>

          {/* History Button */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="h-10 px-3.5 rounded-xl bg-white dark:bg-[#0D1E3D] hover:bg-slate-50 dark:hover:bg-[#132B57] border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-[#0A1F44] dark:text-white flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Activity className="h-3.5 w-3.5 text-purple-600" />
            <span>History</span>
          </button>

          {/* Run Full Check Button */}
          <button
            onClick={() => fetchDiagnostics(false)}
            disabled={refreshing}
            className="h-10 px-4 rounded-xl bg-[#FF1475] hover:bg-[#E60067] text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer disabled:opacity-75"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Run Full Health Check</span>
          </button>
        </div>
      </div>

      {/* 2. Overall System Status Banner */}
      <div className="bg-white dark:bg-[#0D1E3D] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div
              className={`h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                summary?.overallStatus === "OPERATIONAL"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                  : summary?.overallStatus === "DEGRADED"
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-600"
              }`}
            >
              {summary?.overallStatus === "OPERATIONAL" ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : summary?.overallStatus === "DEGRADED" ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <ShieldAlert className="h-6 w-6" />
              )}
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                Overall System Status
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0A1F44] dark:text-white flex items-center gap-2">
                <span>
                  {summary?.overallStatus === "OPERATIONAL"
                    ? "🟢 All Systems Operational"
                    : summary?.overallStatus === "DEGRADED"
                    ? "🟡 Some Issues Detected"
                    : "🔴 Critical Issues Found"}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Last Checked</span>
              <span className="font-bold text-[#0A1F44] dark:text-white">
                {summary?.lastChecked ? new Date(summary.lastChecked).toLocaleTimeString("en-IN") : "Checking..."}
              </span>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Check Duration</span>
              <span className="font-bold text-[#0A1F44] dark:text-white">{summary?.durationMs || 0} ms</span>
            </div>
            {incidents.filter((i) => !i.resolved).length > 0 && (
              <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
                <span className="block text-[10px] text-rose-500 uppercase tracking-wider font-extrabold">
                  Active Incidents
                </span>
                <span className="font-extrabold text-rose-600">
                  {incidents.filter((i) => !i.resolved).length} Pending
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Category Quick Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
            Quick Scope:
          </span>
          {[
            { id: "all", label: "All Systems" },
            { id: "pages", label: "Check Links" },
            { id: "apis", label: "Check APIs" },
            { id: "database", label: "Check Database" },
            { id: "services", label: "Check Integrations" },
            { id: "security", label: "Check Security" },
            { id: "horoscope", label: "Check Horoscope" },
            { id: "payments", label: "Check Payments" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-[#0A1F44] dark:bg-white text-white dark:text-[#0A1F44]"
                  : "bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Summary Counters & Filters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Checks", count: summary?.totalChecks || 0, color: "text-[#0A1F44] dark:text-white", filterId: "all" },
          { label: "Working (✓)", count: summary?.working || 0, color: "text-emerald-600", filterId: "WORKING" },
          { label: "Warnings (⚠)", count: summary?.warnings || 0, color: "text-amber-600", filterId: "WARNING" },
          { label: "Errors (✕)", count: summary?.errors || 0, color: "text-rose-600", filterId: "ERROR" },
          { label: "Protected (🔒)", count: summary?.protectedCount || 0, color: "text-blue-600", filterId: "PROTECTED" },
          { label: "Not Configured", count: summary?.notConfigured || 0, color: "text-slate-400", filterId: "NOT_CONFIGURED" },
        ].map((c) => (
          <button
            key={c.label}
            onClick={() => setStatusFilter(c.filterId)}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === c.filterId
                ? "bg-white dark:bg-[#0D1E3D] border-[#FF1475] shadow-xs ring-1 ring-[#FF1475]"
                : "bg-white dark:bg-[#0D1E3D] border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              {c.label}
            </span>
            <span className={`text-xl font-extrabold mt-1 block ${c.color}`}>{c.count}</span>
          </button>
        ))}
      </div>

      {/* 4. EXACTLY TWO MAIN TABS: TAB 1: ADMIN PANEL | TAB 2: MEMBER PANEL */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "admin"
                ? "bg-[#0A1F44] text-white shadow-xs"
                : "bg-white dark:bg-[#0D1E3D] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            <Server className="h-4 w-4" />
            <span>TAB 1: ADMIN PANEL</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/20 text-white">
              {adminChecks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("member")}
            className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "member"
                ? "bg-[#0A1F44] text-white shadow-xs"
                : "bg-white dark:bg-[#0D1E3D] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>TAB 2: MEMBER PANEL</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/20 text-white">
              {memberChecks.length}
            </span>
          </button>
        </div>

        {/* Active Tab Explainer */}
        <span className="hidden md:inline text-xs font-semibold text-slate-400">
          {activeTab === "admin"
            ? "Verifying Admin pages, APIs, database, RBAC & integrations"
            : "Admin diagnostics view of Bride/Groom portal health"}
        </span>
      </div>

      {/* 5. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === "admin" ? "Admin" : "Member"} pages, APIs, services, routes...`}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-[#0D1E3D] border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-[#0A1F44] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0A1F44] dark:focus:border-white transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Clear Filter ({statusFilter})</span>
              <X className="h-3 w-3" />
            </button>
          )}
          <span className="text-xs font-semibold text-slate-400 ml-auto sm:ml-0">
            Showing {filteredChecks.length} of {currentChecks.length} items
          </span>
        </div>
      </div>

      {/* 6. Main Diagnostics Table */}
      <div className="bg-white dark:bg-[#0D1E3D] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-white/5">
                <th className="py-3 px-4">Component / Service</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Route / Endpoint</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Response & Details</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {filteredChecks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    No diagnostics match your active filters.
                  </td>
                </tr>
              ) : (
                filteredChecks.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    {/* Component Name */}
                    <td className="py-3.5 px-4 font-bold text-[#0A1F44] dark:text-white max-w-[200px]">
                      <div className="truncate">{item.name}</div>
                      {item.durationMs > 0 && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          {item.durationMs} ms
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold">
                        {item.category}
                      </span>
                    </td>

                    {/* Route / API */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300 max-w-[220px]">
                      {item.route ? (
                        <div className="flex items-center gap-1 truncate" title={item.route}>
                          <Globe className="h-3 w-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{item.route}</span>
                        </div>
                      ) : item.api ? (
                        <div className="flex items-center gap-1 truncate" title={item.api}>
                          <span className="font-extrabold text-[9px] px-1 rounded bg-slate-200 dark:bg-slate-700 text-[#0A1F44] dark:text-white">
                            {item.method || "API"}
                          </span>
                          <span className="truncate">{item.api}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Internal Service</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">{renderStatusBadge(item.status)}</td>

                    {/* Message Preview */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-[320px]">
                      <p className="truncate text-xs font-medium">{item.message}</p>
                      {item.technicalDetails && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                          {item.technicalDetails}
                        </p>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#FF1475] hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-colors inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Error & Detail Drawer/Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-[#FF1475]" />
                <h3 className="text-sm font-extrabold text-[#0A1F44] dark:text-white">
                  Diagnostics Inspector
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Service / Component
                </span>
                <span className="text-base font-extrabold text-[#0A1F44] dark:text-white">
                  {selectedItem.name}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Status
                  </span>
                  <div className="mt-1">{renderStatusBadge(selectedItem.status)}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Scope / Tab
                  </span>
                  <span className="font-bold text-[#0A1F44] dark:text-white uppercase">
                    {selectedItem.tab} Panel
                  </span>
                </div>
                {selectedItem.durationMs !== undefined && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Latency
                    </span>
                    <span className="font-bold text-[#0A1F44] dark:text-white">
                      {selectedItem.durationMs} ms
                    </span>
                  </div>
                )}
              </div>

              {(selectedItem.route || selectedItem.api) && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Endpoint / Route
                  </span>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 font-mono text-slate-700 dark:text-slate-300 font-bold mt-1">
                    {selectedItem.method ? `[${selectedItem.method}] ` : ""}
                    {selectedItem.route || selectedItem.api}
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Diagnostics Response
                </span>
                <p className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 leading-relaxed mt-1 font-medium">
                  {selectedItem.message}
                </p>
              </div>

              {selectedItem.technicalDetails && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Technical Specifications (Sanitized)
                  </span>
                  <pre className="p-3 rounded-xl bg-slate-100 dark:bg-[#07132B] font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto mt-1">
                    {selectedItem.technicalDetails}
                  </pre>
                </div>
              )}

              {selectedItem.suggestedAction && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300">
                  <span className="font-extrabold block text-[11px] uppercase tracking-wider mb-1">
                    Recommended Action:
                  </span>
                  <span className="leading-snug">{selectedItem.suggestedAction}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-[#0A1F44] hover:bg-[#132A57] text-white text-xs font-bold transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Diagnostics Run History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-extrabold text-[#0A1F44] dark:text-white">
                  Health Check History Log
                </h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {history.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-semibold">
                  No previous check records in session.
                </div>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-[#0A1F44] dark:text-white block">
                        {new Date(h.timestamp).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Scope: {h.scope} • Duration: {h.durationMs}ms
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <span className="text-emerald-600">✓ {h.working}</span>
                      <span className="text-amber-600">⚠ {h.warnings}</span>
                      <span className="text-rose-600">✕ {h.errors}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                          h.overallStatus === "OPERATIONAL"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {h.overallStatus}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-[#0A1F44] text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
