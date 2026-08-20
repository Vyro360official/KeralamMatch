"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/shared/logo";
import {
  LayoutDashboard, Users, ShieldCheck, AlertTriangle, CreditCard,
  BookOpen, HelpCircle, ClipboardList, Settings, LogOut, ChevronRight, Search, Bell
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/verification", label: "Verification", icon: ShieldCheck },
  { href: "/admin/reports", label: "Reports", icon: AlertTriangle },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/blog", label: "Blog CMS", icon: BookOpen },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/audit", label: "Audit Logs", icon: ClipboardList },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // If on admin login page, don't execute full session check guard
    if (pathname === "/admin/login") return;

    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data.isAuthenticated) router.replace("/admin/login");
      })
      .catch(() => router.replace("/admin/login"));
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  // If on login page, render children directly without admin app shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#1C1C1E] overflow-hidden">
      
      {/* ── Dark Navy Sidebar (Matching Reference Image 2) ────────────────── */}
      <aside
        className={`flex flex-col flex-shrink-0 bg-[#0A1F44] text-white transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center px-4 border-b border-white/10 flex-shrink-0">
          {!collapsed ? (
            <Logo variant="admin" href="/admin" />
          ) : (
            <div className="mx-auto">
              <Logo variant="compact" href="/admin" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto h-7 w-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${collapsed ? "" : "rotate-180"}`} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#C81D45] text-white shadow-md font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Logout Footer */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content Canvas ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[rgba(28,28,30,0.08)] flex items-center justify-between px-8 flex-shrink-0 shadow-xs">
          <div className="flex items-center space-x-3 w-72">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93]" />
              <input
                type="text"
                placeholder="Search candidates, reports..."
                className="w-full h-9 rounded-full bg-[#FCFBF7] border border-[rgba(28,28,30,0.08)] pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-[#C81D45]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="h-9 w-9 rounded-full bg-[#FCFBF7] border border-[rgba(28,28,30,0.08)] flex items-center justify-center text-[#636366] hover:text-[#0A1F44]">
              <Bell className="h-4 w-4" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-[#C81D45]/10 text-[#C81D45] flex items-center justify-center font-bold text-xs">
                A
              </div>
              <span className="text-xs font-bold text-[#0A1F44]">Admin</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          {children}
        </main>
      </div>

    </div>
  );
}
