"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Lock, Bell, Shield, Trash2, LogOut, CheckCircle2, AlertCircle, Eye, EyeOff, FileText, Camera, Sun, Moon, Laptop } from "lucide-react";
import { getProfileDetailsAction } from "@/modules/profile/profile.controller";
import { useTheme } from "@/components/providers/theme-provider";

type Tab = "profile" | "account" | "appearance" | "privacy" | "notifications" | "astro" | "photos" | "danger";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [user, setUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { theme, setTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.isAuthenticated && data.user) setUser(data.user);

        const profRes = await getProfileDetailsAction();
        if (profRes.success && profRes.profile) setCurrentUserProfile(profRes.profile);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setError(result.error || "Password change failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure? This will permanently delete your profile and all data.")) return;
    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        window.location.href = "/";
      } else {
        setError(result.error || "Account deletion failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile Settings", icon: <User className="h-4 w-4" /> },
    { id: "appearance", label: "Appearance & Theme", icon: <Sun className="h-4 w-4" /> },
    { id: "account", label: "Account & Password", icon: <Lock className="h-4 w-4" /> },
    { id: "privacy", label: "Privacy Settings", icon: <Eye className="h-4 w-4" /> },
    { id: "notifications", label: "Notification Settings", icon: <Bell className="h-4 w-4" /> },
    { id: "astro", label: "Astro & Horoscope", icon: <FileText className="h-4 w-4" /> },
    { id: "photos", label: "Photos & Media", icon: <Camera className="h-4 w-4" /> },
    { id: "danger", label: "Deactivate Account", icon: <Trash2 className="h-4 w-4 text-red-500" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] dark:bg-[#07132B] text-[#1C1C1E] dark:text-white transition-colors">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 mb-16 lg:mb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <DashboardSidebar userProfile={currentUserProfile} />

          <main className="lg:col-span-9 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F44] dark:text-white">Settings</h1>
              <p className="text-xs text-[#636366] dark:text-slate-400 mt-0.5">Manage your personal profile, display preferences, and account controls</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Settings Subcategory Tabs */}
              <aside className="md:col-span-4">
                <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-4 border border-[rgba(28,28,30,0.08)] dark:border-slate-800 shadow-sm space-y-1">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setActiveTab(t.id); setSuccess(null); setError(null); }}
                      className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === t.id
                          ? "bg-[#FF1475] text-white shadow-sm"
                          : "text-[#636366] dark:text-slate-400 hover:bg-[#FCFBF7] dark:hover:bg-white/5 hover:text-[#0A1F44] dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {t.icon}
                        <span>{t.label}</span>
                      </div>
                      <span>›</span>
                    </button>
                  ))}
                </div>
              </aside>

              {/* Right Content Panel */}
              <div className="md:col-span-8 space-y-6">
                {loading ? (
                  <div className="bg-white rounded-3xl p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    {success && (
                      <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <span>{success}</span>
                      </div>
                    )}

                    {/* Tab: Profile */}
                    {activeTab === "profile" && (
                      <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-6 sm:p-8 border border-[rgba(28,28,30,0.08)] dark:border-slate-800 shadow-sm space-y-6">
                        <h2 className="text-base font-bold text-[#0A1F44] dark:text-white">Profile Overview</h2>
                        <div className="space-y-4 text-xs">
                          <div>
                            <span className="text-[#8E8E93] dark:text-slate-400 block mb-1">Full Name</span>
                            <span className="font-bold text-[#0A1F44] dark:text-white">{currentUserProfile?.firstName || user?.name || "Member"} {currentUserProfile?.lastName || ""}</span>
                          </div>
                          <div>
                            <span className="text-[#8E8E93] dark:text-slate-400 block mb-1">Registered Phone</span>
                            <span className="font-bold text-[#0A1F44] dark:text-white">{user?.phone || "+91 9400 123 456"}</span>
                          </div>
                          <div>
                            <span className="text-[#8E8E93] dark:text-slate-400 block mb-1">Community</span>
                            <span className="font-bold text-[#0A1F44] dark:text-white">{currentUserProfile?.religion || "Hindu"} · {currentUserProfile?.caste || "Nair"}</span>
                          </div>
                          <div>
                            <span className="text-[#8E8E93] dark:text-slate-400 block mb-1">Native District</span>
                            <span className="font-bold text-[#0A1F44] dark:text-white">{currentUserProfile?.district || "Ernakulam"}, Kerala</span>
                          </div>
                          <div className="pt-4">
                            <Link href="/join" className="px-5 py-2.5 rounded-full bg-[#FF1475] hover:bg-[#E01853] text-white text-xs font-bold shadow-sm inline-block">
                              Edit 10-Step Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab: Appearance & Theme */}
                    {activeTab === "appearance" && (
                      <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-6 sm:p-8 border border-[rgba(28,28,30,0.08)] dark:border-slate-800 shadow-sm space-y-6">
                        <div>
                          <h2 className="text-base font-bold text-[#0A1F44] dark:text-white">Appearance & Display Theme</h2>
                          <p className="text-xs text-[#636366] dark:text-slate-400 mt-1">
                            Choose how KeralamMatch looks to you. Select a light or dark theme, or sync with your system.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* Light Mode Card */}
                          <button
                            type="button"
                            onClick={() => setTheme("light")}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                              theme === "light"
                                ? "border-[#FF1475] bg-[#FDF2F4] dark:bg-[#FF1475]/10 shadow-xs ring-2 ring-[#FF1475]/30"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#07132B]"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                                <Sun className="h-5 w-5" />
                              </div>
                              {theme === "light" && <CheckCircle2 className="h-4 w-4 text-[#FF1475]" />}
                            </div>
                            <h3 className="text-xs font-bold text-[#0A1F44] dark:text-white">Light Mode</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Crisp light background with warm ivory accents.
                            </p>
                          </button>

                          {/* Dark Mode Card */}
                          <button
                            type="button"
                            onClick={() => setTheme("dark")}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                              theme === "dark"
                                ? "border-[#FF1475] bg-[#FDF2F4] dark:bg-[#FF1475]/10 shadow-xs ring-2 ring-[#FF1475]/30"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#07132B]"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                                <Moon className="h-5 w-5" />
                              </div>
                              {theme === "dark" && <CheckCircle2 className="h-4 w-4 text-[#FF1475]" />}
                            </div>
                            <h3 className="text-xs font-bold text-[#0A1F44] dark:text-white">Dark Mode</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Deep navy night theme designed for low-light comfort.
                            </p>
                          </button>

                          {/* System Card */}
                          <button
                            type="button"
                            onClick={() => setTheme("system")}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                              theme === "system"
                                ? "border-[#FF1475] bg-[#FDF2F4] dark:bg-[#FF1475]/10 shadow-xs ring-2 ring-[#FF1475]/30"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#07132B]"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                <Laptop className="h-5 w-5" />
                              </div>
                              {theme === "system" && <CheckCircle2 className="h-4 w-4 text-[#FF1475]" />}
                            </div>
                            <h3 className="text-xs font-bold text-[#0A1F44] dark:text-white">System Sync</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Automatically follows your device operating system.
                            </p>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tab: Account & Password */}
                    {activeTab === "account" && (
                      <form onSubmit={handleSavePassword} className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-6 sm:p-8 border border-[rgba(28,28,30,0.08)] dark:border-slate-800 shadow-sm space-y-6">
                        <h2 className="text-base font-bold text-[#0A1F44] dark:text-white">Change Password</h2>
                        <div className="space-y-4 max-w-md text-xs">
                          <div>
                            <label className="block font-bold uppercase tracking-wider text-[#636366] dark:text-slate-400 mb-2">Current Password</label>
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="rounded-full h-11 dark:bg-slate-800/80 dark:border-slate-700 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block font-bold uppercase tracking-wider text-[#636366] dark:text-slate-400 mb-2">New Password (Min 8 chars)</label>
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="rounded-full h-11 dark:bg-slate-800/80 dark:border-slate-700 dark:text-white"
                              required
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-[11px] text-[#FF1475] font-semibold flex items-center space-x-1 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            <span>{showPassword ? "Hide Passwords" : "Show Passwords"}</span>
                          </button>
                        </div>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-2.5 rounded-full bg-[#FF1475] hover:bg-[#E01853] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                        >
                          {saving ? "Updating..." : "Update Password"}
                        </button>
                      </form>
                    )}

                    {/* Tab: Danger / Logout */}
                    {activeTab === "danger" && (
                      <div className="space-y-6">
                        <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-6 sm:p-8 border border-[rgba(28,28,30,0.08)] dark:border-slate-800 shadow-sm space-y-4">
                          <h2 className="text-base font-bold text-[#0A1F44] dark:text-white">Sign Out</h2>
                          <p className="text-xs text-[#636366] dark:text-slate-400">Sign out from your active session on this device.</p>
                          <button
                            onClick={handleLogout}
                            className="px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#0A1F44] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>

                        <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-6 sm:p-8 border border-red-200 dark:border-red-900/40 shadow-sm space-y-4">
                          <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Delete Account</h2>
                          <p className="text-xs text-[#636366] dark:text-slate-400">
                            Permanently delete your profile and all associated data. This action cannot be undone.
                          </p>
                          <button
                            onClick={handleDeleteAccount}
                            className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center space-x-2 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete My Account</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer variant="dashboard" />
    </div>
  );
}
