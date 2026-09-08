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

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

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
        <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] animate-pulse">
          <div className="h-11 w-11 rounded-full bg-slate-200 flex-shrink-0" />
          <div className="flex-grow space-y-2">
            <div className="h-4 bg-slate-200 rounded-sm w-3/4" />
            <div className="h-3 bg-slate-200 rounded-sm w-1/2" />
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] text-left">
          <div className="relative flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt={`${firstName} ${lastName}`} className="h-11 w-11 rounded-full object-cover border-2 border-[#C81D45]" />
            ) : (
              <div className="h-11 w-11 rounded-full bg-[#FCE8EC] text-[#C81D45] flex items-center justify-center font-extrabold text-base border-2 border-[#FAD2DA]">
                {initial || "M"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-[#0A1F44] truncate">{firstName || "Member"} {lastName}</div>
            <Link href={profileUrl} className="text-[11px] text-[#C81D45] font-semibold hover:underline">
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
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-[#C81D45] text-white shadow-xs font-bold"
                  : "text-[#636366] hover:bg-[#FCFBF7] hover:text-[#0A1F44]"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-white" : "text-[#8E8E93]"}`} />
                <span>{item.label}</span>
              </div>
              
              {/* Badges, checked ticks, balances, or indicators */}
              {item.badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${isActive ? "bg-white text-[#C81D45]" : "bg-[#C81D45] text-white"}`}>
                  {item.badge}
                </span>
              )}
              {item.checked && (
                <CheckCircle className="h-4 w-4 text-emerald-500 fill-emerald-50" />
              )}
              {item.pill && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold">
                  {item.pill}
                </span>
              )}
              {item.balance && (
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {item.balance}
                </span>
              )}
            </Link>
          );
        })}

        {/* Logout action */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-left text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5 text-slate-400" />
          <span>Logout</span>
        </button>
      </nav>

      {/* Become Premium Banner Card */}
      {!isPremium && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
          <div className="flex items-center space-x-1.5 text-amber-800 font-bold text-xs">
            <Crown className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span>Become Premium</span>
          </div>
          <p className="text-[10px] text-amber-700 leading-normal font-medium">
            Unlock unlimited contacts, send direct messages, and find verified matches instantly.
          </p>
          <Link
            href="/pricing"
            className="block text-center py-2 rounded-xl bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold transition-colors shadow-xs"
          >
            Upgrade Now
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:col-span-3 w-full">
        <div className="sticky top-24">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile top floating hamburger button */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden fixed bottom-6 left-4 z-40 flex items-center justify-center w-12 h-12 bg-[#C81D45] text-white rounded-full shadow-lg hover:bg-[#A51436] transition-all cursor-pointer"
        aria-label="Open menu drawer"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile backdrop */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile sliding navigation drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-[#FCFBF7] shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(28,28,30,0.08)] bg-white">
          <span className="font-extrabold text-[#0A1F44] text-base tracking-tight">
            Keral<span className="text-[#C81D45]">am</span>Match
          </span>
          <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-[#636366]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 bg-white">
          <SidebarContent />
        </div>
      </div>

      {/* Persistent Mobile Bottom Navigation Bar (Matching Reference 1 & 2) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[rgba(28,28,30,0.08)] flex items-center justify-around h-16 px-4 shadow-lg pb-safe">
        <Link
          href="/dashboard"
          prefetch={true}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname === "/dashboard" ? "text-[#C81D45]" : "text-slate-400"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[9px] font-bold mt-1">Home</span>
        </Link>

        <Link
          href="/find"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname === "/find" ? "text-[#C81D45]" : "text-slate-400"
          }`}
        >
          <Search className="h-5 w-5" />
          <span className="text-[9px] font-bold mt-1">Matches</span>
        </Link>

        <Link
          href="/chat"
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname.startsWith("/chat") ? "text-[#C81D45]" : "text-slate-400"
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          {stats?.unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-6 bg-[#C81D45] text-white rounded-full h-4 w-4 flex items-center justify-center font-bold text-[8px]">
              {stats.unreadMessagesCount}
            </span>
          )}
          <span className="text-[9px] font-bold mt-1">Chat</span>
        </Link>

        <Link
          href="/requests"
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname === "/requests" ? "text-[#C81D45]" : "text-slate-400"
          }`}
        >
          <UserCheck className="h-5 w-5" />
          {stats?.pendingRequestsCount > 0 && (
            <span className="absolute top-1 right-6 bg-[#C81D45] text-white rounded-full h-4 w-4 flex items-center justify-center font-bold text-[8px]">
              {stats.pendingRequestsCount}
            </span>
          )}
          <span className="text-[9px] font-bold mt-1">Requests</span>
        </Link>

        <Link
          href={profileUrl}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname.startsWith("/profile/") ? "text-[#C81D45]" : "text-slate-400"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[9px] font-bold mt-1">Profile</span>
        </Link>
      </nav>
    </>
  );
}
