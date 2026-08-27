"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/shared/logo";
import { Bell, MessageSquare, Crown, Menu } from "lucide-react";

export default function Header() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/auth/session-stats");
        const data = await res.json();
        if (data.isAuthenticated) {
          setStats(data);
        }
      } catch (err) {
        console.warn("Could not retrieve active session stats:", err);
      }
    }
    loadStats();
  }, []);

  const isGold = stats?.subscription?.plan?.name === "Gold" || stats?.subscription?.plan?.name === "Platinum";
  const user = stats?.user;
  const profile = stats?.profile;
  const initial = profile?.firstName?.charAt(0).toUpperCase() || "M";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(28,28,30,0.08)] bg-white/95 backdrop-blur-md transition-all shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Mobile Drawer Toggle */}
        <div className="flex items-center space-x-3">
          <Logo href={stats ? "/dashboard" : "/"} />
        </div>

        {/* Desktop Navigation Links */}
        {!stats && (
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-[#636366]">
            <Link href="/" className="hover:text-[#C81D45] transition-colors">Home</Link>
            <Link href="/trust#how-it-works" className="hover:text-[#C81D45] transition-colors">How It Works</Link>
            <Link href="/pricing" className="hover:text-[#C81D45] transition-colors">Pricing</Link>
            <Link href="/trust" className="hover:text-[#C81D45] transition-colors">Trust & Safety</Link>
            <Link href="/blog" className="hover:text-[#C81D45] transition-colors">Blog</Link>
          </nav>
        )}

        {/* Authenticated Header Icons vs Guest Action Buttons */}
        <div className="flex items-center space-x-4">
          {stats ? (
            <>
              {/* Premium Plan Indicator */}
              {isGold ? (
                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 shadow-2xs">
                  <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span>{stats.subscription.plan.name}</span>
                </div>
              ) : (
                <Link
                  href="/pricing"
                  className="hidden sm:flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                >
                  Upgrade
                </Link>
              )}

              {/* Message Icon with Badge */}
              <Link href="/chat" className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors">
                <MessageSquare className="h-4.5 w-4.5" />
                {stats.unreadMessagesCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-[#C81D45] text-white rounded-full flex items-center justify-center font-bold text-[8px] animate-pulse">
                    {stats.unreadMessagesCount}
                  </span>
                )}
              </Link>

              {/* Notification Icon with Badge */}
              <Link href="/notifications" className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors">
                <Bell className="h-4.5 w-4.5" />
                {stats.unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-[#C81D45] text-white rounded-full flex items-center justify-center font-bold text-[8px] animate-pulse">
                    {stats.unreadNotificationsCount}
                  </span>
                )}
              </Link>

              {/* User Avatar Circle */}
              <Link href={profile?.id ? `/profile/${profile.id}` : "/join"} className="flex items-center space-x-2 border-l border-slate-200 pl-3">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover border border-[#C81D45]/30 shadow-xs" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[#FCE8EC] text-[#C81D45] flex items-center justify-center font-bold text-xs border border-[#FAD2DA]">
                    {initial}
                  </div>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="text-xs font-semibold text-[#1C1C1E] hover:text-[#C81D45] px-3 py-2 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth?register=true"
                className="inline-flex items-center justify-center px-5 py-2 text-xs font-bold text-white bg-[#C81D45] hover:bg-[#A51436] rounded-full shadow-sm transition-all"
              >
                Create Account
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
