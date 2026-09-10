"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  Search,
  Bell,
  TrendingUp,
  Key,
  Heart,
  MessageSquare,
  Crown,
  Menu,
  Sparkles,
  UserPlus,
  UserCheck,
  FileSpreadsheet,
  Megaphone,
  ShieldAlert,
  Flag,
  Activity,
  CheckCircle2,
  ExternalLink,
  X,
  Sun,
  Moon,
} from "lucide-react";

interface SubItem {
  href: string;
  label: string;
  badge?: string;
  requiredPermission?: string;
}

interface NavCategory {
  id: string;
  title: string;
  icon: any;
  items: SubItem[];
}

const NAVIGATION_SECTIONS: NavCategory[] = [
  {
    id: "overview",
    title: "Overview",
    icon: LayoutDashboard,
    items: [
      { href: "/admin", label: "Dashboard Overview" },
      { href: "/admin/growth", label: "Live Business Activity" },
    ],
  },
  {
    id: "users",
    title: "User Management",
    icon: Users,
    items: [
      { href: "/admin/users", label: "All Users" },
      { href: "/admin/users/create", label: "Create Profile (Wizard)", badge: "NEW" },
      { href: "/admin/verification", label: "Verification Queue" },
      { href: "/admin/staff", label: "Staff & Roles", requiredPermission: "MANAGE_STAFF" },
    ],
  },
  {
    id: "match",
    title: "Match & Engagement",
    icon: Sparkles,
    items: [
      { href: "/admin/analytics/horoscope", label: "Horoscope Analytics" },
      { href: "/admin/horoscope-leads", label: "Horoscope Leads CRM", badge: "LEADS" },
      { href: "/admin/users", label: "Matches & Compatibility" },
      { href: "/admin/reports", label: "Contact Requests" },
      { href: "/admin/reports", label: "Chat & Moderation" },
    ],
  },
  {
    id: "growth",
    title: "Growth & Marketing",
    icon: TrendingUp,
    items: [
      { href: "/admin/growth", label: "Attribution & Funnels" },
      { href: "/admin/growth", label: "Campaign Performance" },
    ],
  },
  {
    id: "payments",
    title: "Subscriptions & Payments",
    icon: CreditCard,
    items: [
      { href: "/admin/payments", label: "Subscriptions" },
      { href: "/admin/payments", label: "Payments & Revenue" },
      { href: "/admin/payments", label: "Transactions" },
    ],
  },
  {
    id: "reports",
    title: "Reports & Analytics",
    icon: ClipboardList,
    items: [
      { href: "/admin/reports", label: "Reports" },
      { href: "/admin/audit", label: "Audit Logs" },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    items: [
      { href: "/admin/settings", label: "Settings" },
      { href: "/admin/settings/health-checkup", label: "Health Checkup" },
    ],
  },
];

function hasPermission(user: any, requiredPermission?: string): boolean {
  if (!user) return false;
  const role = user.role;
  const permissions = user.permissions || [];
  if (role === "SUPER_ADMIN" || permissions.includes("ACCESS_ALL")) return true;
  if (!requiredPermission) return true;
  if (permissions.includes(requiredPermission)) return true;
  if (role === "ADMIN") return requiredPermission !== "MANAGE_STAFF";
  return false;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Sidebar collapse & local storage persistence
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);

  // Accordion state (which category is expanded)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    overview: true,
    users: true,
    match: true,
  });

  // Global search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notifications dropdown state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [pendingVerifCount, setPendingVerifCount] = useState(0);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);

  // Quick Action menu
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  // Theme state (Light / Dark / System)
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("km_theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      setTheme(savedTheme as "light" | "dark");
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      localStorage.setItem("km_theme", nextTheme);
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  };

  // Load sidebar preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("km_admin_sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("km_admin_sidebar_collapsed", String(next));
    } catch {}
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Auth guard & notifications check
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

    // Fetch live notification counts
    fetch("/api/admin/dashboard/stats?range=today")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setPendingVerifCount(res.kpis?.pendingVerifications || 0);
          setPendingReportsCount(res.smartAlerts?.unresolvedReportsCount || 0);
        }
      })
      .catch(() => {});
  }, [pathname, router]);

  // Global Search debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            setSearchResults(res.results || []);
          }
          setSearchLoading(false);
        })
        .catch(() => setSearchLoading(false));
    }, 280);

    return () => clearTimeout(t);
  }, [searchQuery]);

  // Outside click for search dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Generate dynamic breadcrumb items
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((seg, idx) => {
    const url = "/" + pathSegments.slice(0, idx + 1).join("/");
    const label = seg
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { url, label };
  });

  const totalAlerts = pendingVerifCount + pendingReportsCount;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0A1F44] text-white select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-white/10 flex-shrink-0 bg-[#07152E]">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <Logo variant="admin" href="/admin" />
            <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-[#D4A853]/20 text-[#D4A853] border border-[#D4A853]/30">
              Console
            </span>
          </div>
        ) : (
          <div className="mx-auto">
            <Logo variant="compact" href="/admin" />
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:flex ml-auto h-7 w-7 rounded-lg items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
        </button>
      </div>

      {/* Accordion Categories Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-3 custom-scrollbar">
        {NAVIGATION_SECTIONS.map((sec) => {
          const allowedItems = sec.items.filter((item) => hasPermission(activeUser, item.requiredPermission));
          if (allowedItems.length === 0) return null;

          const isSectionActive = allowedItems.some((item) =>
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
          );
          const isOpen = openSections[sec.id] ?? true;
          const Icon = sec.icon;

          return (
            <div key={sec.id} className="space-y-1">
              {/* Category Header (collapsible accordion) */}
              {!collapsed ? (
                <button
                  type="button"
                  onClick={() => toggleSection(sec.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors ${
                    isSectionActive ? "text-[#D4A853]" : "text-white/50 hover:text-white/80"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 opacity-80" />
                    <span>{sec.title}</span>
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`}
                  />
                </button>
              ) : (
                <div
                  className="w-full flex items-center justify-center py-2 text-white/50 hover:text-white"
                  title={sec.title}
                >
                  <Icon className="h-4 w-4" />
                </div>
              )}

              {/* Sub-items list */}
              {(!collapsed ? isOpen : true) && (
                <div className="space-y-0.5">
                  {allowedItems.map((item) => {
                    const isActive =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-[#FF1475] to-[#C81D45] text-white shadow-md font-bold"
                            : "text-white/70 hover:text-white hover:bg-white/5"
                        } ${collapsed ? "justify-center px-0" : ""}`}
                      >
                        {!collapsed ? (
                          <>
                            <span className="truncate flex-1">{item.label}</span>
                            {item.badge && (
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                                  item.badge === "NEW"
                                    ? "bg-[#D4A853] text-[#0A1F44]"
                                    : item.badge === "PRO"
                                    ? "bg-purple-500 text-white"
                                    : "bg-emerald-500 text-white"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-white/40" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Admin User Badge & Logout */}
      <div className="p-3 border-t border-white/10 flex-shrink-0 bg-[#07152E]">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-[#D4A853] text-[#0A1F44] font-black flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
                {activeUser?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">
                  {activeUser?.designation || "Administrator"}
                </span>
                <span className="text-[10px] text-[#D4A853] font-semibold block uppercase tracking-wider">
                  {activeUser?.role || "SUPER_ADMIN"}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="w-full flex items-center justify-center py-1 text-white/50 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0A1F44] overflow-hidden font-sans">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 shadow-xl z-30 ${
          collapsed ? "w-18" : "w-64"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div
        className={`lg:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0A1F44] transform transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Persistent Enterprise Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 shadow-xs z-20">
          {/* Left: Mobile Toggle & Dynamic Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 font-medium truncate">
              {breadcrumbs.map((b, idx) => (
                <React.Fragment key={b.url}>
                  {idx > 0 && <span className="text-slate-300">/</span>}
                  <Link
                    href={b.url}
                    className={`hover:text-[#FF1475] transition-colors truncate ${
                      idx === breadcrumbs.length - 1 ? "font-bold text-[#0A1F44]" : ""
                    }`}
                  >
                    {b.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Center: Global Multi-Entity Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-md mx-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                placeholder="Search candidates, phone, horoscope, email..."
                className="w-full h-9 rounded-xl bg-slate-50 dark:bg-[#0D1E3D] border border-slate-200 dark:border-slate-700 pl-9 pr-8 text-xs font-medium text-[#0A1F44] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0A1F44] dark:focus:border-white focus:bg-white transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchOpen && (searchLoading || searchResults.length > 0) && (
              <div className="absolute top-11 left-0 right-0 bg-white dark:bg-[#0D1E3D] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in duration-150">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Search Results</span>
                  {searchLoading && <span>Searching...</span>}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                              item.type === "USER"
                                ? "bg-blue-100 text-blue-700"
                                : item.type === "HOROSCOPE"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {item.type}
                          </span>
                          <span className="text-xs font-bold text-[#0A1F44] dark:text-white truncate">{item.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 ml-2" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Notifications, Chat, Theme Toggle & Profile (ADMIN DASHBOARD.png) */}
          <div className="flex items-center gap-2.5 sm:gap-3">

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative h-9 w-9 rounded-xl bg-slate-50 dark:bg-[#0F2248] hover:bg-slate-100 dark:hover:bg-[#172E5E] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#0A1F44] dark:hover:text-white transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-[#FF1475] text-white text-[9px] font-black flex items-center justify-center border-2 border-white dark:border-[#0A1832]">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-11 w-72 bg-white dark:bg-[#0A1832] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-[#0A1F44] dark:text-white">
                    <span>Operational Alerts</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{totalAlerts} pending</span>
                  </div>
                  <div className="py-2 space-y-2 text-xs">
                    <Link
                      href="/admin/verification"
                      onClick={() => setNotificationsOpen(false)}
                      className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-[#0A1F44] dark:text-white block">Pending Verifications</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {pendingVerifCount > 0 ? `${pendingVerifCount} profiles awaiting Aadhaar/selfie check` : "No pending verifications"}
                        </span>
                      </div>
                    </Link>
                    <Link
                      href="/admin/reports"
                      onClick={() => setNotificationsOpen(false)}
                      className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-[#0A1F44] dark:text-white block">Safety Reports</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {pendingReportsCount > 0 ? `${pendingReportsCount} reported profiles require review` : "Zero unhandled reports"}
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Moderation Icon with Badge */}
            <Link
              href="/admin/reports"
              className="relative h-9 w-9 rounded-xl bg-slate-50 dark:bg-[#0F2248] hover:bg-slate-100 dark:hover:bg-[#172E5E] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#0A1F44] dark:hover:text-white transition-colors"
              aria-label="Messages & Moderation"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-[#FF1475] text-white text-[9px] font-black flex items-center justify-center border-2 border-white dark:border-[#0A1832]">
                5
              </span>
            </Link>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-[#0F2248] hover:bg-slate-100 dark:hover:bg-[#172E5E] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#0A1F44] dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>

            {/* Admin Profile & Role Badge */}
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-2 sm:pl-3">
              <div className="h-8 w-8 rounded-full bg-[#0A1F44] dark:bg-[#D4A853] text-white dark:text-[#0A1F44] flex items-center justify-center font-extrabold text-xs shadow-xs">
                {activeUser?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-[#0A1F44] dark:text-white block leading-tight">
                  {activeUser?.designation || "Administrator"}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-semibold">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8FAFC] dark:bg-[#071224] transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
}
