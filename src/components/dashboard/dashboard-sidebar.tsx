"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  UserCheck,
  User,
  ShieldCheck,
  Crown,
  Wallet,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  PhoneCall,
  CheckCircle,
  Sparkles
} from "lucide-react";

interface SidebarProps {
  userProfile?: any;
}

export default function DashboardSidebar({ userProfile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const res = await fetch("/api/auth/session-stats");
      const data = await res.json();
      if (data.isAuthenticated) {
        setStats(data);
      }
    } catch (err) {
      console.warn("Could not retrieve session stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Poll stats every 30 seconds to keep badges synced
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close drawer on route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Open & toggle sidebar events
  useEffect(() => {
    const handleOpenSidebar = () => setDrawerOpen(true);
    const handleToggleSidebar = () => setDrawerOpen((prev) => !prev);
    window.addEventListener("km:open-sidebar", handleOpenSidebar);
    window.addEventListener("km:toggle-sidebar", handleToggleSidebar);
    return () => {
      window.removeEventListener("km:open-sidebar", handleOpenSidebar);
      window.removeEventListener("km:toggle-sidebar", handleToggleSidebar);
    };
  }, []);

  // Close drawer on Escape key and lock background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawerOpen) {
        setDrawerOpen(false);
      }
    };
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/auth");
  };

  const profile = stats?.profile || userProfile;
  const firstName = profile?.firstName || "";
  const lastName = profile?.lastName || "";
  const initial = firstName ? firstName.charAt(0).toUpperCase() : "";
  const avatar = profile?.avatarUrl;
  const walletBalance = stats?.walletBalance ? Math.round(stats.walletBalance / 100) : 0;
  const planName = stats?.subscription?.plan?.name || "Free Plan";
  const isPremium = stats?.subscription?.plan?.name === "Gold" || stats?.subscription?.plan?.name === "Platinum";

  const profileUrl = profile?.id ? `/profile/${profile.id}` : "/join";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: 0 },
    { href: "/find", label: "Find Matches", icon: Search, badge: 0 },
    { href: "/chat", label: "Messages", icon: MessageSquare, badge: stats?.unreadMessagesCount || 0 },
    { href: "/requests", label: "Contact Requests", icon: UserCheck, badge: stats?.pendingRequestsCount || 0 },
    { href: profileUrl, label: "My Profile", icon: User, badge: 0 },
    { href: "/horoscope-match", label: "Horoscope Match", icon: Sparkles, badge: 0 },
    { href: "/trust", label: "Trust & Verify", icon: ShieldCheck, badge: 0, checked: profile?.verificationStatus === "VERIFIED" },
    { href: "/pricing", label: "Membership", icon: Crown, badge: 0, pill: planName },
    { href: "/pricing", label: "Wallet", icon: Wallet, badge: 0, balance: `₹ ${walletBalance}` },
    { href: "/notifications", label: "Notifications", icon: Bell, badge: stats?.unreadNotificationsCount || 0 },
    { href: "/settings", label: "Settings", icon: Settings, badge: 0 },
    { href: "/trust", label: "Help & Support", icon: HelpCircle, badge: 0 },
  ];

  const SidebarContent = () => (
    <div className="space-y-4">
      {/* User Mini Profile Header / Loading Skeleton */}
      {loading && !userProfile ? (
        <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#FCFBF7] dark:bg-[#0D1E3D] border border-[rgba(28,28,30,0.06)] dark:border-slate-800 animate-pulse">
          <div className="h-11 w-11 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
          <div className="flex-grow space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-sm w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-sm w-1/2" />
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#FCFBF7] dark:bg-[#0D1E3D] border border-[rgba(28,28,30,0.06)] dark:border-slate-800 text-left">
          <div className="relative flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt={`${firstName} ${lastName}`} className="h-11 w-11 rounded-full object-cover border-2 border-[#FF1475]" />
            ) : (
              <div className="h-11 w-11 rounded-full bg-[#FCE8EC] text-[#FF1475] flex items-center justify-center font-extrabold text-base border-2 border-[#FAD2DA]">
                {initial || "M"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-[#0A1F44] dark:text-white truncate">{firstName || "Member"} {lastName}</div>
            <Link href={profileUrl} className="text-[11px] text-[#FF1475] font-semibold hover:underline">
              View Profile &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="space-y-1 text-xs font-semibold">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href) && !item.href.includes("tab="));
          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                isActive
                  ? "bg-[#FDF2F4] dark:bg-[#FF1475]/15 text-[#FF1475] font-extrabold shadow-2xs"
                  : "text-[#636366] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-[#0A1F44] dark:hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-[#FF1475]" : "text-slate-400 dark:text-slate-500"}`} />
                <span>{item.label}</span>
              </div>
              
              {/* Badges, checked ticks, balances, or indicators */}
              {item.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#FF1475] text-white">
                  {item.badge}
                </span>
              )}
              {item.checked && (
                <CheckCircle className="h-4 w-4 text-emerald-500 fill-emerald-50" />
              )}
              {item.pill && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[9px] font-bold">
                  {item.pill}
                </span>
              )}
              {item.balance && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  {item.balance}
                </span>
              )}
            </Link>
          );
        })}

        {/* Logout action */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-[#FF1475] hover:bg-pink-50 dark:hover:bg-pink-950/20 transition-colors font-bold cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 text-[#FF1475]" />
          <span>Logout</span>
        </button>
      </nav>

      {/* Become Premium Banner Card (MEMBER DASHBOARD.png) */}
      {!isPremium && (
        <div className="p-4 rounded-2xl bg-[#FFF5F7] dark:bg-[#FF1475]/5 border border-[#FFE4E9] dark:border-[#FF1475]/20 space-y-2.5">
          <div className="flex items-center space-x-1.5 text-[#0A1F44] dark:text-white font-extrabold text-xs">
            <Crown className="h-4 w-4 text-[#D4A853] fill-[#D4A853]" />
            <span>Become Premium</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-medium">
            Unlock unlimited contacts, send direct messages, and find verified matches instantly.
          </p>
          <Link
            href="/pricing"
            className="block text-center py-2 px-3 rounded-xl bg-[#FF1475] hover:bg-[#E60067] text-white text-xs font-bold transition-all shadow-xs"
          >
            Upgrade Now →
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar - Strictly on LEFT on desktop */}
      <aside className="hidden lg:block lg:col-span-3 w-full">
        <div className="sticky top-24">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile backdrop */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sliding navigation drawer — ANCHORED ON THE RIGHT (RIGHT -> LEFT) */}
      <div
        className={`lg:hidden fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-white dark:bg-[#07132B] border-l border-slate-200/80 dark:border-slate-800 shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(28,28,30,0.08)] dark:border-slate-800 bg-white dark:bg-[#07132B] sticky top-0 z-10">
          <span className="font-extrabold text-[#0A1F44] dark:text-white text-base tracking-tight">
            Keral<span className="text-[#FF1475]">am</span>Match
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#636366] dark:text-slate-300 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 bg-white dark:bg-[#07132B]">
          <SidebarContent />
        </div>
      </div>

      {/* Persistent Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#07132B]/95 border-t border-[rgba(28,28,30,0.08)] dark:border-slate-800 backdrop-blur-md flex items-center justify-around h-16 px-4 shadow-lg pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
        <Link
          href="/dashboard"
          prefetch={true}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname === "/dashboard" ? "text-[#FF1475]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[9px] font-bold mt-1">Home</span>
        </Link>

        <Link
          href="/find"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname === "/find" ? "text-[#FF1475]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <Search className="h-5 w-5" />
          <span className="text-[9px] font-bold mt-1">Matches</span>
        </Link>

        <Link
          href="/chat"
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname.startsWith("/chat") ? "text-[#FF1475]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          {stats?.unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-6 bg-[#FF1475] text-white rounded-full h-4 w-4 flex items-center justify-center font-bold text-[8px]">
              {stats.unreadMessagesCount}
            </span>
          )}
          <span className="text-[9px] font-bold mt-1">Chat</span>
        </Link>

        <Link
          href="/requests"
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname === "/requests" ? "text-[#FF1475]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <UserCheck className="h-5 w-5" />
          {stats?.pendingRequestsCount > 0 && (
            <span className="absolute top-1 right-6 bg-[#FF1475] text-white rounded-full h-4 w-4 flex items-center justify-center font-bold text-[8px]">
              {stats.pendingRequestsCount}
            </span>
          )}
          <span className="text-[9px] font-bold mt-1">Requests</span>
        </Link>

        <Link
          href={profileUrl}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname.startsWith("/profile/") ? "text-[#FF1475]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[9px] font-bold mt-1">Profile</span>
        </Link>
      </nav>
    </>
  );
}
