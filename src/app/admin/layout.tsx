"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/shared/logo";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  BookOpen,
  HelpCircle,
  ClipboardList,
  Settings,
  LogOut,
  ChevronRight,
  Search,
  Bell,
  TrendingUp,
  Key,
  Heart,
  PhoneCall,
  MessageSquare,
  Crown,
  Menu
} from "lucide-react";

interface SidebarItem {
  href: string;
  label: string;
  icon: any;
  requiredPermission?: string;
}

interface SidebarCategory {
  title: string;
  items: SidebarItem[];
}

const sidebarCategories: SidebarCategory[] = [
  {
    title: "USER MANAGEMENT",
    items: [
      { href: "/admin/users", label: "Users", icon: Users, requiredPermission: "MANAGE_USERS" },
      { href: "/admin/verification", label: "Profile Verification", icon: ShieldCheck, requiredPermission: "VERIFY_PROFILES" },
      { href: "/admin/staff", label: "Permissions & Roles", icon: Key, requiredPermission: "MANAGE_STAFF" },
    ]
  },
  {
    title: "MATCH & ENGAGEMENT",
    items: [
      { href: "/admin/users", label: "Matches", icon: Heart, requiredPermission: "MANAGE_USERS" },
      { href: "/admin/reports", label: "Safety & Moderation", icon: AlertTriangle, requiredPermission: "MANAGE_REPORTS" },
    ]
  },
  {
    title: "SUBSCRIPTIONS & PAYMENTS",
    items: [
      { href: "/admin/payments", label: "Subscriptions", icon: Crown, requiredPermission: "VIEW_PAYMENTS" },
      { href: "/admin/payments", label: "Payments", icon: CreditCard, requiredPermission: "VIEW_PAYMENTS" },
      { href: "/admin/payments", label: "Transactions", icon: ClipboardList, requiredPermission: "VIEW_PAYMENTS" },
    ]
  },
  {
    title: "CONTENT MANAGEMENT",
    items: [
      { href: "/admin/blog", label: "Blog CMS", icon: BookOpen, requiredPermission: "MANAGE_CMS" },
      { href: "/admin/faq", label: "FAQs", icon: HelpCircle, requiredPermission: "MANAGE_CMS" },
    ]
  },
  {
    title: "SYSTEM & SETTINGS",
    items: [
      { href: "/admin/growth", label: "Reports & Analytics", icon: TrendingUp, requiredPermission: "VIEW_GROWTH" },
      { href: "/admin/audit", label: "Audit Logs", icon: ClipboardList, requiredPermission: "VIEW_AUDIT_LOGS" },
      { href: "/admin/settings", label: "Settings", icon: Settings, requiredPermission: "MANAGE_SETTINGS" },
    ]
  }
];

function hasPermission(user: any, requiredPermission?: string): boolean {
  if (!user) return false;
  
  const role = user.role;
  const permissions = user.permissions || [];
  
  if (role === "SUPER_ADMIN" || permissions.includes("ACCESS_ALL")) return true;
  
  if (!requiredPermission) return true;
  if (permissions.includes(requiredPermission)) return true;

  if (role === "ADMIN") {
    return requiredPermission !== "MANAGE_STAFF";
  }
  if (role === "STAFF" || role === "PROFILE_MANAGER") {
    return ["MANAGE_USERS", "VERIFY_PROFILES", "EDIT_PROFILE", "CREATE_PROFILE"].includes(requiredPermission);
  }
  if (role === "SUPPORT_STAFF") {
    return ["VERIFY_PROFILES", "MANAGE_REPORTS"].includes(requiredPermission);
  }
  
  return false;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;

    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data.isAuthenticated) {
          router.replace("/admin/login");
        } else {
          setActiveUser(data.user);
        }
      })
      .catch(() => router.replace("/admin/login"));
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#07152E]">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-white/5 flex-shrink-0">
        {!collapsed ? (
          <Logo variant="admin" href="/admin" />
        ) : (
          <div className="mx-auto">
            <Logo variant="compact" href="/admin" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex ml-auto h-7 w-7 rounded-lg items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronRight className={`h-4 w-4 transition-transform ${collapsed ? "" : "rotate-180"}`} />
        </button>
      </div>

      {/* Main dashboard navigation shortcut */}
      <div className="p-3">
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
            pathname === "/admin"
              ? "bg-[#C81D45] text-white shadow-md"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <LayoutDashboard className="h-4.5 w-4.5 flex-shrink-0" />
          {!collapsed && <span>Dashboard Overview</span>}
        </Link>
      </div>

      {/* Categorized menu body */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 select-none">
        {sidebarCategories.map((cat) => {
          const allowedItems = cat.items.filter(item => hasPermission(activeUser, item.requiredPermission));
          if (allowedItems.length === 0) return null;

          return (
            <div key={cat.title} className="space-y-1.5">
              {!collapsed && (
                <span className="block text-[9px] font-extrabold tracking-widest text-slate-500 px-3.5">
                  {cat.title}
                </span>
              )}
              <div className="space-y-1">
                {allowedItems.map((item) => {
                  const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? "bg-[#C81D45] text-white shadow-sm font-bold"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Logout control */}
      <div className="p-3 border-t border-white/5 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#1C1C1E] overflow-hidden">
      
      {/* Desktop Sidebar Panel */}
      <aside className={`hidden lg:flex flex-col flex-shrink-0 bg-[#07152E] text-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}>
        <SidebarContent />
      </aside>

      {/* Mobile Drawer menu backdrop */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile menu panel slider */}
      <div className={`lg:hidden fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#07152E] transform transition-transform duration-300 ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <SidebarContent />
      </div>

      {/* Main Content canvas body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Admin Header Bar */}
        <header className="h-16 bg-white border-b border-[rgba(28,28,30,0.06)] flex items-center justify-between px-6 flex-shrink-0 shadow-xs">
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative w-56 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8E8E93]" />
              <input
                type="text"
                placeholder="Search candidates, reports..."
                className="w-full h-8 rounded-lg bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] pl-9 pr-3 text-[11px] font-semibold focus:outline-none focus:border-[#C81D45]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="h-8 w-8 rounded-lg bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)] flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
              <Bell className="h-4 w-4" />
            </button>
            
            <div className="flex items-center space-x-2 border-l border-slate-100 pl-3">
              <div className="h-8 w-8 rounded-lg bg-[#C81D45] text-white flex items-center justify-center font-extrabold text-xs">
                A
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-[11px] font-bold text-[#0A1F44] block">Administrator</span>
                <span className="text-[9px] text-[#8E8E93] block font-semibold">Super User</span>
              </div>
            </div>
          </div>

        </header>

        {/* Dynamic page container */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
          {children}
        </main>
      </div>

    </div>
  );
}
