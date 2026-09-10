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
  ChevronDown,
  Menu,
  Search,
  Moon,
  Sun,
} from "lucide-react";
import { logoutAction } from "@/modules/auth/auth.controller";
import { useTheme } from "@/components/providers/theme-provider";

export default function Header() {
  const [stats, setStats] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<
    "upgrade" | "messages" | "notifications" | "profile" | null
  >(null);

  // Global Theme Hook (Light / Dark / System)
  const { resolvedTheme, toggleTheme } = useTheme();

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
      className="sticky top-0 z-40 w-full border-b border-[rgba(28,28,30,0.08)] bg-white/95 dark:bg-[#07132B]/95 dark:border-slate-800 backdrop-blur-md transition-all shadow-xs"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <Logo href={stats ? "/dashboard" : "/"} />
        </div>

        {/* Desktop Navigation Links (Unauthenticated) */}
        {!stats && (
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-[#636366] dark:text-slate-400">
            <Link href="/" className="hover:text-[#FF1475] transition-colors">
              Home
            </Link>
            <Link
              href="/trust#how-it-works"
              className="hover:text-[#FF1475] transition-colors"
            >
              How It Works
            </Link>
            <Link href="/pricing" className="hover:text-[#FF1475] transition-colors">
              Pricing
            </Link>
            <Link href="/trust" className="hover:text-[#FF1475] transition-colors">
              Trust & Safety
            </Link>
            <Link href="/blog" className="hover:text-[#FF1475] transition-colors">
              Blog
            </Link>
          </nav>
        )}

        {/* Center: Search Bar for Authenticated Member (matching MEMBER DASHBOARD.png) */}
        {stats && (
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, location, profession, or community..."
                className="w-full h-9 pl-9 pr-4 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs text-[#0A1F44] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF1475] transition-all shadow-inner"
              />
            </div>
          </div>
        )}

        {/* Authenticated Icons vs Guest Action Buttons */}
        <div className="flex items-center space-x-3 sm:space-x-3.5">
          {/* Mobile dropdown backdrop */}
          {activeDropdown && (
            <div
              className="sm:hidden fixed inset-0 top-16 bg-black/25 backdrop-blur-2xs z-40"
              onClick={() => setActiveDropdown(null)}
            />
          )}

          {stats ? (
            <>
              {/* Upgrade Button matching MEMBER DASHBOARD.png (amber pill with crown) */}
              <Link
                href="/pricing"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FEF9C3] hover:bg-[#FEF08A] border border-amber-300 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800 text-xs font-bold transition-all shadow-2xs"
              >
                <Crown className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
                <span>Upgrade</span>
              </Link>

              {/* Message Icon with Badge */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("messages")}
                  className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer focus:outline-hidden"
                  title="Messages"
                >
                  <MessageSquare className="h-4.5 w-4.5" />
                  {(stats?.unreadMessagesCount ?? 0) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 bg-[#FF1475] text-white rounded-full flex items-center justify-center font-bold text-[9px] shadow-xs">
                      {stats!.unreadMessagesCount}
                    </span>
                  )}
                </button>

                {activeDropdown === "messages" && (
                  <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 max-w-sm mx-auto sm:max-w-none rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0D1E3D] p-3 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between px-2 py-1 mb-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#636366] dark:text-slate-400">
                        Recent Chats
                      </span>
                      {(stats?.unreadMessagesCount ?? 0) > 0 && (
                        <span className="text-[9px] font-bold text-[#FF1475] bg-[#FCE8EC] dark:bg-pink-950/40 px-2 py-0.5 rounded-full">
                          {stats!.unreadMessagesCount} New
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      <Link
                        href="/chat"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="h-8 w-8 rounded-full bg-[#FCE8EC] text-[#FF1475] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          A
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#0A1F44] dark:text-white flex items-center justify-between">
                            <span>Ananya Nair</span>
                            <span className="text-[9px] font-medium text-slate-400">10m ago</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            Let's connect and get to know each other...
                          </p>
                        </div>
                      </Link>
                      <Link
                        href="/chat"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          D
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#0A1F44] dark:text-white flex items-center justify-between">
                            <span>Dr. Divya Thomas</span>
                            <span className="text-[9px] font-medium text-slate-400">1h ago</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            Accepted your contact unlock request.
                          </p>
                        </div>
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2 text-center">
                      <Link
                        href="/chat"
                        onClick={() => setActiveDropdown(null)}
                        className="text-[10px] font-bold text-[#FF1475] hover:underline"
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
                  className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer focus:outline-hidden"
                  title="Notifications"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {(stats?.unreadNotificationsCount ?? 0) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 bg-[#FF1475] text-white rounded-full flex items-center justify-center font-bold text-[9px] shadow-xs">
                      {stats!.unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {activeDropdown === "notifications" && (
                  <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 max-w-sm mx-auto sm:max-w-none rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0D1E3D] p-3 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between px-2 py-1 mb-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#636366] dark:text-slate-400">
                        Notifications
                      </span>
                      <Link
                        href="/notifications"
                        onClick={() => setActiveDropdown(null)}
                        className="text-[9px] font-bold text-[#FF1475] hover:underline"
                      >
                        Mark all read
                      </Link>
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      <Link
                        href="/notifications"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start space-x-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="p-1.5 rounded-full bg-emerald-50 text-emerald-600 mt-0.5 flex-shrink-0">
                          <Crown className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#0A1F44] dark:text-white">Profile Verified ✓</div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                            Your Aadhaar validation request has been approved.
                          </p>
                        </div>
                      </Link>
                      <Link
                        href="/notifications"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start space-x-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="p-1.5 rounded-full bg-[#FCE8EC] text-[#FF1475] mt-0.5 flex-shrink-0">
                          <Bell className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#0A1F44] dark:text-white">New Connection Request</div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                            Meera Krishnan sent you a contact request.
                          </p>
                        </div>
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2 text-center">
                      <Link
                        href="/notifications"
                        onClick={() => setActiveDropdown(null)}
                        className="text-[10px] font-bold text-[#FF1475] hover:underline"
                      >
                        View All Notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle (Moon / Sun) */}
              <button
                onClick={toggleTheme}
                className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle dark mode"
              >
                {resolvedTheme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
              </button>

              {/* User Avatar Circle + Name Dropdown (MEMBER DASHBOARD.png) */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("profile")}
                  className="flex items-center gap-2 pl-1.5 border-l border-slate-200 dark:border-slate-700 focus:outline-hidden cursor-pointer"
                >
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover border border-[#FF1475]/30 shadow-xs"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#FCE8EC] text-[#FF1475] flex items-center justify-center font-bold text-xs border border-[#FAD2DA]">
                      {initial}
                    </div>
                  )}
                  <span className="hidden md:inline text-xs font-bold text-[#0A1F44] dark:text-white truncate max-w-[120px]">
                    {profile?.firstName ? `${profile.firstName} ${profile.lastName || ""}`.trim() : "Member"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200" />
                </button>

                {activeDropdown === "profile" && (
                  <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-64 max-w-xs ml-auto sm:max-w-none rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0D1E3D] p-3 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-slate-50 dark:border-slate-800 mb-2 text-left">
                      <div className="text-xs font-extrabold text-[#0A1F44] dark:text-white">
                        {profile?.firstName || "Member"} {profile?.lastName || ""}
                      </div>
                      <div className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full inline-block mt-1">
                        {stats?.subscription?.plan?.name || "Free Plan"}
                      </div>
                    </div>
                    {/* Links */}
                    <div className="space-y-0.5 text-xs font-semibold text-left">
                      <Link
                        href={profile?.id ? `/profile/${profile.id}` : "/join"}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-[#FCFBF7] dark:hover:bg-white/5 hover:text-[#0A1F44] dark:hover:text-white transition-colors"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        <span>View My Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-[#FCFBF7] dark:hover:bg-white/5 hover:text-[#0A1F44] dark:hover:text-white transition-colors"
                      >
                        <Settings className="h-4 w-4 text-slate-400" />
                        <span>Account Settings</span>
                      </Link>
                      <Link
                        href="/trust"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-[#FCFBF7] dark:hover:bg-white/5 hover:text-[#0A1F44] dark:hover:text-white transition-colors"
                      >
                        <HelpCircle className="h-4 w-4 text-slate-400" />
                        <span>Help & Support</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-colors text-left font-semibold cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-slate-400" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Navigation Drawer Toggle (Matching Image 4) */}
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("km:open-sidebar"));
                }}
                className="lg:hidden flex items-center justify-center h-8 px-3 rounded-full bg-[#1C1C1E] hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-[#0A1F44] shadow-sm transition-all cursor-pointer focus:outline-hidden ml-1"
                aria-label="Open navigation menu"
              >
                <Menu className="h-4.5 w-4.5 text-white" />
              </button>
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
