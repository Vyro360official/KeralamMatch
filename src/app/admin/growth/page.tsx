"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp, Users, UserCheck, UserPlus, Heart, MessageCircle, Share2,
  MapPin, AlertOctagon, LineChart, Target, Compass, Sparkles, AlertCircle,
  HelpCircle, ShieldAlert, Award, ArrowUpRight, CheckCircle2
} from "lucide-react";
import MatrimonialLogoLoader from "@/components/ui/matrimonial-logo-loader";

interface GrowthData {
  totalMembers: number;
  newBridesToday: number;
  newGroomsToday: number;
  femaleMaleRatio: string;
  verifiedProfiles: number;
  profileCompletion: number;
  activeUsers: number;
  matchesGenerated: number;
  interestsSent: number;
  messagesStarted: number;
  successfulMatches: number;
  referralMembers: number;
  topLocations: Array<{ location: string; count: number; percentage: number }>;
  topTrafficSources: Array<{ source: string; share: number; count: number }>;
  conversionFunnel: Array<{ stage: string; count: number; percentage: number }>;
  fakeSpamFlagged: number;
  inactiveUsers: number;
  campaignPerformance: Array<{
    name: string;
    impressions: number;
    clicks: number;
    registrations: number;
    conversionRate: number;
    costPerLead: number;
  }>;
}

export default function GrowthCenterPage() {
  const [data, setData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/growth")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <MatrimonialLogoLoader size="md" text="Loading Growth Metrics..." />
      </div>
    );
  }

  // Strict Zero-Mock Rule: Default to 0 or empty if DB has no records yet
  const growth = data || {
    totalMembers: 0,
    newBridesToday: 0,
    newGroomsToday: 0,
    femaleMaleRatio: "0% / 0%",
    verifiedProfiles: 0,
    profileCompletion: 0,
    activeUsers: 0,
    matchesGenerated: 0,
    interestsSent: 0,
    messagesStarted: 0,
    successfulMatches: 0,
    referralMembers: 0,
    topLocations: [],
    topTrafficSources: [],
    conversionFunnel: [],
    fakeSpamFlagged: 0,
    inactiveUsers: 0,
    campaignPerformance: []
  };

  return (
    <div className="space-y-8 text-[#1C1C1E]">
      
      {/* Page Brand Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1F44]">Growth & Marketing Center</h1>
          <p className="text-xs text-[#636366]">Platform metrics, user conversion analysis, and advertising performance metrics</p>
        </div>
        <div className="bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] px-4 py-2 rounded-2xl flex items-center gap-1.5 text-xs text-[#C81D45] font-bold shadow-xs">
          <Sparkles className="h-4 w-4 text-[#D4AF37]" />
          <span>Growth Ledger Active</span>
        </div>
      </div>

      {/* ── SECTION 1: Core Growth Metrics (KPI Cards Grid) ───────────────── */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#636366]">1. Core Candidate Growth</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Members */}
          <div className="bg-white rounded-3xl p-5 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-[#0A1F44]/5 flex items-center justify-center text-[#0A1F44]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase block">Total Members</span>
              <span className="text-xl font-bold text-[#0A1F44]">{growth.totalMembers.toLocaleString()}</span>
            </div>
          </div>

          {/* New Brides Today */}
          <div className="bg-white rounded-3xl p-5 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-700">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase block">New Brides Today</span>
              <span className="text-xl font-bold text-[#0A1F44]">{growth.newBridesToday}</span>
            </div>
          </div>

          {/* New Grooms Today */}
          <div className="bg-white rounded-3xl p-5 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase block">New Grooms Today</span>
              <span className="text-xl font-bold text-[#0A1F44]">{growth.newGroomsToday}</span>
            </div>
          </div>

          {/* Female/Male Ratio */}
          <div className="bg-white rounded-3xl p-5 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-700">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase block">Female / Male Ratio</span>
              <span className="text-xl font-bold text-[#0A1F44]">{growth.femaleMaleRatio}</span>
            </div>
          </div>

          {/* Verified Profiles */}
          <div className="bg-white rounded-3xl p-5 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase block">Verified Profiles</span>
              <span className="text-xl font-bold text-[#0A1F44]">{growth.verifiedProfiles.toLocaleString()}</span>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="bg-white rounded-3xl p-5 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase block">Avg. Completion</span>
              <span className="text-xl font-bold text-[#0A1F44]">{growth.profileCompletion}%</span>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-3xl p-5 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase block">Active Users (7D)</span>
              <span className="text-xl font-bold text-[#0A1F44]">{growth.activeUsers.toLocaleString()}</span>
            </div>
          </div>

          {/* Matches Generated */}
          <div className="bg-white rounded-3xl p-5 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase block">Matches Generated</span>
              <span className="text-xl font-bold text-[#0A1F44]">{growth.matchesGenerated.toLocaleString()}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION 2: User Engagement Stats ─────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#636366]">2. User Engagement Stats</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Interests Sent */}
          <div className="bg-white rounded-3xl p-5 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase block">Interests Sent</span>
              <span className="text-xl font-bold text-[#0A1F44]">{growth.interestsSent.toLocaleString()}</span>
            </div>
          </div>

          {/* Messages Started */}
          <div className="bg-white rounded-3xl p-5 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase block">Messages Started</span>
              <span className="text-xl font-bold text-[#0A1F44]">{growth.messagesStarted.toLocaleString()}</span>
            </div>
          </div>

          {/* Successful Matches */}
          <div className="bg-white rounded-3xl p-5 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase block">Successful Matches</span>
              <span className="text-xl font-bold text-[#0A1F44]">{growth.successfulMatches.toLocaleString()}</span>
            </div>
          </div>

          {/* Referral Members */}
          <div className="bg-white rounded-3xl p-5 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase block">Referral Members</span>
              <span className="text-xl font-bold text-[#0A1F44]">{growth.referralMembers.toLocaleString()}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION 3: Locations, Funnel, and Traffic ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Locations */}
        <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#636366] flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-[#C81D45]" />
            <span>3. Top Registration Locations</span>
          </h3>
          <div className="space-y-4">
            {growth.topLocations.map((loc, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#0A1F44]">{loc.location}</span>
                  <span className="text-[#8E8E93]">{loc.count} ({loc.percentage}%)</span>
                </div>
                <div className="w-full bg-[#FCFBF7] h-2 rounded-full overflow-hidden border border-[rgba(28,28,30,0.04)]">
                  <div className="bg-[#C81D45] h-full rounded-full" style={{ width: `${loc.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Traffic Sources */}
        <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#636366] flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-[#C81D45]" />
            <span>4. Traffic Channel Share</span>
          </h3>
          <div className="space-y-4">
            {growth.topTrafficSources.map((src, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#0A1F44]">{src.source}</span>
                  <span className="text-[#8E8E93]">{src.share}%</span>
                </div>
                <div className="w-full bg-[#FCFBF7] h-2 rounded-full overflow-hidden border border-[rgba(28,28,30,0.04)]">
                  <div className="bg-[#0A1F44] h-full rounded-full" style={{ width: `${src.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#636366] flex items-center gap-1.5">
            <LineChart className="h-4 w-4 text-[#C81D45]" />
            <span>5. Conversion Funnel</span>
          </h3>
          <div className="space-y-4">
            {growth.conversionFunnel.map((layer, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#0A1F44]">{layer.stage}</span>
                  <span className="text-[#8E8E93]">{layer.count.toLocaleString()} ({layer.percentage}%)</span>
                </div>
                <div className="w-full bg-[#FCFBF7] h-2 rounded-full overflow-hidden border border-[rgba(28,28,30,0.04)]">
                  <div className="bg-[#D4AF37] h-full rounded-full" style={{ width: `${layer.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── SECTION 4: Spam Detection & Inactivity ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Fake & Spam Detection */}
        <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0A1F44]">Fake / Spam Flagged Profiles</h4>
              <p className="text-[11px] text-[#636366] mt-0.5">Pending security reports from community users</p>
              <span className="text-lg font-bold text-red-700 mt-2 block">{growth.fakeSpamFlagged} profiles pending review</span>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = "/admin/reports"}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold shadow-xs cursor-pointer"
          >
            Review Reports
          </button>
        </div>

        {/* Inactive Users */}
        <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0A1F44]">Inactive Accounts (30 Days+)</h4>
              <p className="text-[11px] text-[#636366] mt-0.5">Members with zero login or action logs this month</p>
              <span className="text-lg font-bold text-amber-800 mt-2 block">{growth.inactiveUsers} idle members</span>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = "/admin/users?filter=inactive"}
            className="px-4 py-2 border border-[rgba(28,28,30,0.12)] hover:bg-[#FCFBF7] text-[#0A1F44] rounded-full text-xs font-bold cursor-pointer"
          >
            Inspect Members
          </button>
        </div>

      </div>

      {/* ── SECTION 5: Campaign & Acquisition Performance ────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#636366] flex items-center gap-1.5">
              <Target className="h-4 w-4 text-[#C81D45]" />
              <span>6. Marketing Campaign Conversion Performance (UTM)</span>
            </h3>
            <p className="text-[10px] text-[#8E8E93]">Acquisition statistics parsed from campaign parameters</p>
          </div>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(28,28,30,0.08)] text-[#8E8E93] uppercase text-[10px] font-bold">
                <th className="pb-3">Campaign Source (UTM)</th>
                <th className="pb-3">Impressions</th>
                <th className="pb-3">Clicks</th>
                <th className="pb-3">Registrations</th>
                <th className="pb-3">Conversion Rate (%)</th>
                <th className="pb-3 text-right">Cost Per Lead (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(28,28,30,0.06)] font-semibold text-[#0A1F44]">
              {growth.campaignPerformance.map((cam, idx) => (
                <tr key={idx} className="hover:bg-[#FCFBF7] transition-colors">
                  <td className="py-3.5 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{cam.name}</span>
                  </td>
                  <td className="py-3.5">{cam.impressions.toLocaleString()}</td>
                  <td className="py-3.5">{cam.clicks.toLocaleString()}</td>
                  <td className="py-3.5">{cam.registrations.toLocaleString()}</td>
                  <td className="py-3.5">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-100">
                      {cam.conversionRate}%
                    </span>
                  </td>
                  <td className="py-3.5 text-right text-slate-500">₹ {cam.costPerLead}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
