"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import Link from "next/link";
import { ShieldCheck, Lock, AlertTriangle, HelpCircle, UserX, CheckCircle2 } from "lucide-react";
import { getProfileDetailsAction } from "@/modules/profile/profile.controller";

export default function TrustPage() {
  const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await getProfileDetailsAction();
        if (res.success && res.profile) {
          setCurrentUserProfile(res.profile);
        }
      } catch (err) {
        console.error("Failed to load user profile in trust page:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] dark:bg-[#07132B] text-[#1C1C1E] dark:text-white transition-colors">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 mb-16 lg:mb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar Navigation */}
          <DashboardSidebar userProfile={currentUserProfile} />

          {/* Main Trust Content */}
          <main className="lg:col-span-9 space-y-6">
            {/* Header info */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1F44] dark:text-white tracking-tight">
                Trust & Safety Center
              </h1>
              <p className="text-xs text-[#636366] dark:text-slate-400 font-medium mt-1">
                How KeralamMatch protects your privacy, prevents fraud, and keeps our community safe.
              </p>
            </div>

            {/* Hero Overview Card */}
            <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-[#FF1475]/10 dark:bg-[#FF1475]/20 text-[#FF1475] flex items-center justify-center flex-shrink-0 shadow-xs">
                <ShieldCheck className="h-9 w-9" />
              </div>
              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Privacy-First Architecture</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#0A1F44] dark:text-white">
                  Your Safety Comes First
                </h2>
                <p className="text-xs text-[#636366] dark:text-slate-400 leading-relaxed max-w-2xl">
                  KeralamMatch is built on mutual consent, end-to-end privacy, and genuine human connections. Discover how our multi-layer verification and 24-hour ephemeral reveal system protect you at every step.
                </p>
              </div>
            </div>

            {/* Safety Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Pillar 1: Verified Profiles */}
              <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 transition-all hover:shadow-md">
                <div className="flex items-center space-x-3 text-[#FF1475]">
                  <div className="h-10 w-10 rounded-xl bg-[#FF1475]/10 dark:bg-[#FF1475]/20 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0A1F44] dark:text-white">Verified Profiles</h3>
                </div>
                <p className="text-xs text-[#636366] dark:text-slate-400 leading-relaxed">
                  Every account undergoes Mobile OTP verification, selfie liveness detection, and optional Aadhaar ID checks before receiving a verified badge.
                </p>
              </div>

              {/* Pillar 2: Contact Reveal Protection */}
              <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 transition-all hover:shadow-md">
                <div className="flex items-center space-x-3 text-[#FF1475]">
                  <div className="h-10 w-10 rounded-xl bg-[#FF1475]/10 dark:bg-[#FF1475]/20 flex items-center justify-center">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0A1F44] dark:text-white">Contact Reveal Protection</h3>
                </div>
                <p className="text-xs text-[#636366] dark:text-slate-400 leading-relaxed">
                  Your phone number and email are encrypted at rest with AES-256-GCM. They are only decrypted for 24 hours after mutual consent is granted.
                </p>
              </div>

              {/* Pillar 3: Report & Moderation */}
              <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 transition-all hover:shadow-md">
                <div className="flex items-center space-x-3 text-[#FF1475]">
                  <div className="h-10 w-10 rounded-xl bg-[#FF1475]/10 dark:bg-[#FF1475]/20 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0A1F44] dark:text-white">Report & Moderation</h3>
                </div>
                <p className="text-xs text-[#636366] dark:text-slate-400 leading-relaxed">
                  Flag suspicious behavior or fake profiles using our in-app Report tool. Our dedicated safety moderation team reviews all reports within 24 hours.
                </p>
              </div>

              {/* Pillar 4: Instant Blocking */}
              <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 transition-all hover:shadow-md">
                <div className="flex items-center space-x-3 text-[#FF1475]">
                  <div className="h-10 w-10 rounded-xl bg-[#FF1475]/10 dark:bg-[#FF1475]/20 flex items-center justify-center">
                    <UserX className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0A1F44] dark:text-white">Instant Blocking</h3>
                </div>
                <p className="text-xs text-[#636366] dark:text-slate-400 leading-relaxed">
                  Block any user with a single click. Blocked members can no longer view your profile, send requests, or message you.
                </p>
              </div>
            </div>

            {/* Need Help / Contact Support Banner */}
            <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-[#FF1475]/10 dark:bg-[#FF1475]/20 text-[#FF1475] flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0A1F44] dark:text-white">Need Assistance?</h4>
                  <p className="text-xs text-[#636366] dark:text-slate-400 mt-0.5">
                    Our dedicated customer support team is available 24/7 to assist you.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/faq"
                  className="flex-1 sm:flex-initial text-center px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#0A1F44] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  View FAQ
                </Link>
                <a
                  href="mailto:support@keralammatch.com"
                  className="flex-1 sm:flex-initial text-center px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF1475] to-[#C81D45] text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all whitespace-nowrap"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer variant="dashboard" />
    </div>
  );
}
