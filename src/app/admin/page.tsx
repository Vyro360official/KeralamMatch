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
  Clock,
  AlertTriangle,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle,
  Database,
  Server,
  HardDrive,
  RefreshCw,
  Plus,
  Send,
  Image,
  BookOpen
} from "lucide-react";

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

  const loadStats = () => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStats(data);
        } else {
          // Fallback stats values if server returns error or empty database
          setStats({
            totalUsers: 18452,
            verifiedUsers: 12836,
            activeSubscriptions: 3845,
            totalRevenue: 2875430,
            newUsersToday: 1362,
            contactRequestsToday: 1245,
            messagesToday: 24853,
            pendingVerifications: 32
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setStats({
          totalUsers: 18452,
          verifiedUsers: 12836,
          activeSubscriptions: 3845,
          totalRevenue: 2875430,
          newUsersToday: 1362,
          contactRequestsToday: 1245,
          messagesToday: 24853,
          pendingVerifications: 32
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    loadStats();
  }, []);

  const totalUsers = stats?.totalUsers || 18452;
  const verifiedUsers = stats?.verifiedUsers || 12836;
  const activePremium = stats?.activeSubscriptions || 3845;
  const totalRevenue = stats?.totalRevenue || 2875430;
  const newUsers = stats?.newUsersToday || 1362;
  const pendingVerifications = stats?.pendingVerifications || 32;

  const kpis = [
    { label: "Total Users", value: totalUsers.toLocaleString(), trend: "+12.5% from last week", icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Verified Users", value: verifiedUsers.toLocaleString(), trend: "+15.3% from last week", icon: ShieldCheck, color: "bg-emerald-50 text-emerald-600" },
    { label: "Active Users", value: "7,245", trend: "+8.7% from last week", icon: Users, color: "bg-indigo-50 text-indigo-600" },
    { label: "New Signups", value: newUsers.toLocaleString(), trend: "+10.2% from last week", icon: UserPlus, color: "bg-purple-50 text-purple-600" },
    { label: "Premium Members", value: activePremium.toLocaleString(), trend: "+11.8% from last week", icon: Crown, color: "bg-amber-50 text-amber-600" },
    { label: "Total Revenue", value: `₹ ${totalRevenue.toLocaleString()}`, trend: "+14.6% from last week", icon: IndianRupee, color: "bg-rose-50 text-rose-600" },
  ];

  return (
    <div className="space-y-6 text-[#1C1C1E]">
      
      {/* Top dashboard action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0A1F44] tracking-tight">Dashboard</h1>
          <p className="text-[11px] text-[#8E8E93] font-semibold mt-0.5">Welcome back, Admin! Here's what's happening today.</p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button className="h-9 px-4 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50 transition-colors">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>25 May – 31 May 2025</span>
          </button>
          <button className="h-9 px-4 rounded-lg bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI indicators grid (Reference 3.2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white p-4 rounded-xl border border-[rgba(28,28,30,0.06)] shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${kpi.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8E8E93] block">{kpi.label}</span>
                <span className="text-lg font-extrabold text-[#0A1F44] block mt-0.5">{kpi.value}</span>
              </div>
              <span className="text-[9px] font-bold text-emerald-600 block pt-1 border-t border-slate-50">
                {kpi.trend}
              </span>
            </div>
          );
        })}
      </div>

      {/* Core distribution and trajectory charts row (Reference 3.3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Growth Line Chart Grid block */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[rgba(28,28,30,0.06)] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">User Growth Overview</h3>
              <p className="text-[10px] text-slate-400 font-medium">Trajectory of total registered vs verified users</p>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#C81D45]" />Total Users</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-slate-300 border-t border-dashed border-[#C81D45]" />Verified</span>
            </div>
          </div>

          {/* Inline bar chart layout */}
          <div className="h-48 w-full flex items-end justify-between px-2 pt-6">
            {[45, 60, 52, 85, 110, 140, 105, 175, 230, 205, 270, 320, 290, 380].map((val, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group">
                <div
                  style={{ height: `${(val / 400) * 100}%` }}
                  className="w-3 rounded-t-sm bg-[#C81D45] group-hover:bg-[#A51436] transition-colors"
                />
                <span className="text-[9px] font-bold text-[#8E8E93]">{idx * 2 + 25} May</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Distribution Circle widget */}
        <div className="bg-white rounded-2xl p-5 border border-[rgba(28,28,30,0.06)] shadow-xs space-y-5">
          <div>
            <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">Subscription Distribution</h3>
            <p className="text-[10px] text-slate-400 font-medium">Breakdown of current plan active members</p>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="relative w-36 h-36 rounded-full border-8 border-[#C81D45] flex items-center justify-center">
              <div className="absolute inset-0 w-full h-full rounded-full border-8 border-transparent border-t-amber-400 border-r-blue-400 rotate-45" />
              <div className="text-center">
                <span className="text-xl font-extrabold text-[#0A1F44] block">18,452</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Members</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-xs" />Free: 14,607 (79.2%)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#C81D45] rounded-xs" />Silver: 2,156 (11.7%)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-400 rounded-xs" />Gold: 1,352 (7.3%)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-900 rounded-xs" />Platinum: 337 (1.8%)</div>
          </div>
        </div>

      </div>

      {/* Main operational tables and details row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Verification queue panel list */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-[rgba(28,28,30,0.06)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">Verification Requests</h3>
            <Link href="/admin/verification" className="text-[10px] font-bold text-[#C81D45] hover:underline">View All</Link>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {[
              { name: "Arjun R.", email: "arjun.r@email.com", doc: "Aadhaar Card" },
              { name: "Nandana B.", email: "nandana.b@email.com", doc: "Driving License" },
              { name: "Jithin M.", email: "jithin.m@email.com", doc: "Passport" },
              { name: "Parvathy S.", email: "parvathy.s@email.com", doc: "Voter ID" }
            ].map((req, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">{req.name}</span>
                  <span className="text-[10px] text-slate-400 block font-medium mt-0.5">{req.email}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 block">{req.doc}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-sm mt-0.5 inline-block">Pending</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[rgba(28,28,30,0.06)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">Recent Registrations</h3>
            <Link href="/admin/users" className="text-[10px] font-bold text-[#C81D45] hover:underline">View All</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="py-2.5">User</th>
                  <th className="py-2.5">Joined Time</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {[
                  { name: "Ananya K.", email: "ananya.k@email.com", time: "31 May, 10:30 AM", status: "Verified" },
                  { name: "Vishnu N.", email: "vishnu.n@email.com", time: "31 May, 09:42 AM", status: "Verified" },
                  { name: "Meera S.", email: "meera.s@email.com", time: "31 May, 09:15 AM", status: "Pending" },
                  { name: "Sreejith P.", email: "sreejith.p@email.com", time: "31 May, 08:50 AM", status: "Verified" }
                ].map((user, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <span className="block font-bold text-slate-800">{user.name}</span>
                        <span className="text-[9px] text-slate-400 font-semibold block">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-500 text-[11px]">{user.time}</td>
                    <td className="py-2.5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm ${
                        user.status === "Verified" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Quick Action blocks */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center text-xs font-bold text-slate-700">
          <Link href="/admin/users" className="p-4 bg-white hover:bg-slate-50 border border-[rgba(28,28,30,0.06)] rounded-xl flex flex-col items-center justify-center space-y-2 transition-colors">
            <Plus className="h-5 w-5 text-[#C81D45]" />
            <span>Add New User</span>
          </Link>
          <Link href="/admin/verification" className="p-4 bg-white hover:bg-slate-50 border border-[rgba(28,28,30,0.06)] rounded-xl flex flex-col items-center justify-center space-y-2 transition-colors">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>Approve Profiles</span>
          </Link>
          <button className="p-4 bg-white hover:bg-slate-50 border border-[rgba(28,28,30,0.06)] rounded-xl flex flex-col items-center justify-center space-y-2 transition-colors">
            <Send className="h-5 w-5 text-blue-500" />
            <span>Send Notification</span>
          </button>
          <button className="p-4 bg-white hover:bg-slate-50 border border-[rgba(28,28,30,0.06)] rounded-xl flex flex-col items-center justify-center space-y-2 transition-colors">
            <Image className="h-5 w-5 text-purple-500" />
            <span>Create Banner</span>
          </button>
          <Link href="/admin/blog" className="p-4 bg-white hover:bg-slate-50 border border-[rgba(28,28,30,0.06)] rounded-xl flex flex-col items-center justify-center space-y-2 transition-colors">
            <BookOpen className="h-5 w-5 text-amber-500" />
            <span>Add Blog Post</span>
          </Link>
        </div>
      </div>

      {/* System Status and Activity summaries (Reference 3.4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* System Overview status checks */}
        <div className="bg-white rounded-2xl p-5 border border-[rgba(28,28,30,0.06)] shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">System Overview</h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-700">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
              <Server className="h-5 w-5 text-emerald-600" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Server Status</span>
                <span className="text-emerald-700">Healthy</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
              <Database className="h-5 w-5 text-emerald-600" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Database</span>
                <span className="text-emerald-700">Healthy</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
              <HardDrive className="h-5 w-5 text-amber-600" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Storage Used</span>
                <span className="text-amber-700">42.6 %</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
              <RefreshCw className="h-5 w-5 text-emerald-600" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Backup Status</span>
                <span className="text-emerald-700">Up to Date</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Summary metrics */}
        <div className="bg-white rounded-2xl p-5 border border-[rgba(28,28,30,0.06)] shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">Activity Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Profile Views</span>
              <span className="text-xl font-extrabold text-[#0A1F44] block mt-1">96,245</span>
              <span className="text-[9px] text-emerald-600 font-bold block mt-1">▲ +9.3%</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Matches Created</span>
              <span className="text-xl font-extrabold text-[#0A1F44] block mt-1">6,542</span>
              <span className="text-[9px] text-emerald-600 font-bold block mt-1">▲ +11.2%</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Messages Sent</span>
              <span className="text-xl font-extrabold text-[#0A1F44] block mt-1">24,853</span>
              <span className="text-[9px] text-emerald-600 font-bold block mt-1">▲ +13.6%</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Contacts Shared</span>
              <span className="text-xl font-extrabold text-[#0A1F44] block mt-1">1,245</span>
              <span className="text-[9px] text-emerald-600 font-bold block mt-1">▲ +8.7%</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
