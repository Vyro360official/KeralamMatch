"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/shared/logo";
import {
  Bell,
  MessageSquare,
  Crown,
  LogOut,
  User,
  Settings,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { logoutAction } from "@/modules/auth/auth.controller";

export default function Header() {
  const [stats, setStats] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<
    "upgrade" | "messages" | "notifications" | "profile" | null
  >(null);

  // Load stats dynamically from route handler
  const loadStats = async () => {
    try {
      const res = await fetch("/api/auth/session-stats");
      const data = await res.json();
      if (data.isAuthenticated) {
        setStats(data);
      } else {
        setStats(null);
      }
    } catch (err) {
      console.warn("Could not retrieve active session stats:", err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Handle click outside to close open dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest("#header-container")) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAction();
      window.location.href = "/auth";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const toggleDropdown = (
    type: "upgrade" | "messages" | "notifications" | "profile"
  ) => {
    setActiveDropdown((prev) => (prev === type ? null : type));
  };

  const isGold =
    stats?.subscription?.plan?.name === "Gold" ||
    stats?.subscription?.plan?.name === "Platinum";
  const profile = stats?.profile;
  const initial = profile?.firstName?.charAt(0).toUpperCase() || "M";

  return (
    <header
      id="header-container"
      className="sticky top-0 z-40 w-full border-b border-[rgba(28,28,30,0.08)] bg-white/95 backdrop-blur-md transition-all shadow-xs"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <Logo href={stats ? "/dashboard" : "/"} />
        </div>

        {/* Desktop Navigation Links (Unauthenticated) */}
        {!stats && (
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-[#636366]">
            <Link href="/" className="hover:text-[#C81D45] transition-colors">
              Home
            </Link>
            <Link
              href="/trust#how-it-works"
              className="hover:text-[#C81D45] transition-colors"
            >
              How It Works
            </Link>
            <Link href="/pricing" className="hover:text-[#C81D45] transition-colors">
              Pricing
            </Link>
            <Link href="/trust" className="hover:text-[#C81D45] transition-colors">
              Trust & Safety
            </Link>
            <Link href="/blog" className="hover:text-[#C81D45] transition-colors">
              Blog
            </Link>
          </nav>
        )}

        {/* Authenticated Icons vs Guest Action Buttons */}
        <div className="flex items-center space-x-4">
          {stats ? (
            <>
              {/* Premium Plan Indicator / Upgrade Button */}
              {isGold ? (
                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 shadow-2xs">
                  <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span>{stats.subscription.plan.name}</span>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown("upgrade")}
                    className="hidden sm:flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer focus:outline-hidden"
                  >
                    <span>Upgrade</span>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </button>

                  {activeDropdown === "upgrade" && (
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#636366] mb-3">
                        Premium Memberships
                      </h3>
                      <div className="space-y-3">
                        <Link
                          href="/pricing?plan=gold"
                          onClick={() => setActiveDropdown(null)}
                          className="block p-3 rounded-xl hover:bg-amber-50/50 border border-transparent hover:border-amber-200 transition-all text-left"
                        >
                          <div className="flex items-center space-x-2 text-amber-800 font-extrabold text-sm">
                            <Crown className="h-4 w-4 text-amber-500 fill-amber-500" />
                            <span>Gold Membership</span>
                          </div>
                          <p className="text-[10px] text-amber-700 font-medium mt-1 leading-relaxed">
                            Unlock 50 contact reveals, direct messaging, and priority verification.
                          </p>
                        </Link>
                        <Link
                          href="/pricing?plan=platinum"
                          onClick={() => setActiveDropdown(null)}
                          className="block p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left"
                        >
                          <div className="flex items-center space-x-2 text-[#0A1F44] font-extrabold text-sm">
                            <Crown className="h-4 w-4 text-[#C81D45] fill-[#C81D45]" />
                            <span>Platinum Membership</span>
                          </div>
                          <p className="text-[10px] text-[#636366] font-medium mt-1 leading-relaxed">
                            Unlock 100 contact reveals, search filters, and profile highlighting.
                          </p>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message Icon with Badge */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("messages")}
                  className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer focus:outline-hidden"
                >
                  <MessageSquare className="h-4.5 w-4.5" />
                  {stats.unreadMessagesCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-[#C81D45] text-white rounded-full flex items-center justify-center font-bold text-[8px] animate-pulse">
                      {stats.unreadMessagesCount}
                    </span>
                  )}
                </button>

                {activeDropdown === "messages" && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between px-2 py-1 mb-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#636366]">
                        Recent Chats
                      </span>
                      {stats.unreadMessagesCount > 0 && (
                        <span className="text-[9px] font-bold text-[#C81D45] bg-[#FCE8EC] px-2 py-0.5 rounded-full">
                          {stats.unreadMessagesCount} New
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      <Link
                        href="/chat"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="h-8 w-8 rounded-full bg-[#FCE8EC] text-[#C81D45] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          A
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#0A1F44] flex items-center justify-between">
                            <span>Ananya Nair</span>
                            <span className="text-[9px] font-medium text-slate-400">10m ago</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            Let's connect and get to know each other...
                          </p>
                        </div>
                      </Link>
                      <Link
                        href="/chat"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          D
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#0A1F44] flex items-center justify-between">
                            <span>Dr. Divya Thomas</span>
                            <span className="text-[9px] font-medium text-slate-400">1h ago</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            Accepted your contact unlock request.
                          </p>
                        </div>
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 mt-2 pt-2 text-center">
                      <Link
                        href="/chat"
                        onClick={() => setActiveDropdown(null)}
                        className="text-[10px] font-bold text-[#C81D45] hover:underline"
                      >
                        Go to Messages Page
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Icon with Badge */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("notifications")}
                  className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer focus:outline-hidden"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {stats.unreadNotificationsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-[#C81D45] text-white rounded-full flex items-center justify-center font-bold text-[8px] animate-pulse">
                      {stats.unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {activeDropdown === "notifications" && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between px-2 py-1 mb-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#636366]">
                        Notifications
                      </span>
                      <Link
                        href="/notifications"
                        onClick={() => setActiveDropdown(null)}
                        className="text-[9px] font-bold text-[#C81D45] hover:underline"
                      >
                        Mark all read
                      </Link>
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      <Link
                        href="/notifications"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start space-x-3 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="p-1.5 rounded-full bg-emerald-50 text-emerald-600 mt-0.5 flex-shrink-0">
                          <Crown className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#0A1F44]">Profile Verified ✓</div>
                          <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                            Your Aadhaar validation request has been approved.
                          </p>
                        </div>
                      </Link>
                      <Link
                        href="/notifications"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start space-x-3 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="p-1.5 rounded-full bg-[#FCE8EC] text-[#C81D45] mt-0.5 flex-shrink-0">
                          <Bell className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#0A1F44]">New Connection Request</div>
                          <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                            Meera Krishnan sent you a contact request.
                          </p>
                        </div>
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 mt-2 pt-2 text-center">
                      <Link
                        href="/notifications"
                        onClick={() => setActiveDropdown(null)}
                        className="text-[10px] font-bold text-[#C81D45] hover:underline"
                      >
                        View All Notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Circle Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("profile")}
                  className="flex items-center space-x-1 border-l border-slate-200 pl-3 focus:outline-hidden cursor-pointer"
                >
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover border border-[#C81D45]/30 shadow-xs"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#FCE8EC] text-[#C81D45] flex items-center justify-center font-bold text-xs border border-[#FAD2DA]">
                      {initial}
                    </div>
                  )}
                  <ChevronDown className="h-3 w-3 text-slate-400 transition-transform duration-200" />
                </button>

                {activeDropdown === "profile" && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-slate-50 mb-2 text-left">
                      <div className="text-xs font-extrabold text-[#0A1F44]">
                        {profile?.firstName || "Member"} {profile?.lastName || ""}
                      </div>
                      <div className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-1">
                        {stats?.subscription?.plan?.name || "Free Plan"}
                      </div>
                    </div>
                    {/* Links */}
                    <div className="space-y-0.5 text-xs font-semibold text-left">
                      <Link
                        href={profile?.id ? `/profile/${profile.id}` : "/join"}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-[#FCFBF7] hover:text-[#0A1F44] transition-colors"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        <span>View My Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-[#FCFBF7] hover:text-[#0A1F44] transition-colors"
                      >
                        <Settings className="h-4 w-4 text-slate-400" />
                        <span>Account Settings</span>
                      </Link>
                      <Link
                        href="/trust"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-[#FCFBF7] hover:text-[#0A1F44] transition-colors"
                      >
                        <HelpCircle className="h-4 w-4 text-slate-400" />
                        <span>Help & Support</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors text-left font-semibold cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-slate-400" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
