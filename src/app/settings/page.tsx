"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Lock, Bell, Shield, Trash2, LogOut, CheckCircle2, AlertCircle, Eye, EyeOff, FileText, Camera } from "lucide-react";
import { getProfileDetailsAction } from "@/modules/profile/profile.controller";

type Tab = "profile" | "account" | "privacy" | "notifications" | "astro" | "photos" | "danger";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [user, setUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    { id: "account", label: "Account & Password", icon: <Lock className="h-4 w-4" /> },
    { id: "privacy", label: "Privacy Settings", icon: <Eye className="h-4 w-4" /> },
    { id: "notifications", label: "Notification Settings", icon: <Bell className="h-4 w-4" /> },
    { id: "astro", label: "Astro & Horoscope", icon: <FileText className="h-4 w-4" /> },
    { id: "photos", label: "Photos & Media", icon: <Camera className="h-4 w-4" /> },
    { id: "danger", label: "Deactivate Account", icon: <Trash2 className="h-4 w-4 text-red-500" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] text-[#1C1C1E]">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <DashboardSidebar userProfile={currentUserProfile} />

          <main className="lg:col-span-9 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F44]">Settings</h1>
              <p className="text-xs text-[#636366] mt-0.5">Manage your personal profile, security preferences, and account controls</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Settings Subcategory Tabs */}
              <aside className="md:col-span-4">
                <div className="bg-white rounded-3xl p-4 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-1">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setActiveTab(t.id); setSuccess(null); setError(null); }}
                      className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                        activeTab === t.id
                          ? "bg-[#C81D45] text-white shadow-sm"
                          : "text-[#636366] hover:bg-[#FCFBF7] hover:text-[#0A1F44]"
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
                      <div className="bg-white rounded-3xl p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-6">
                        <h2 className="text-base font-bold text-[#0A1F44]">Profile Overview</h2>
                        <div className="space-y-4 text-xs">
                          <div>
                            <span className="text-[#8E8E93] block mb-1">Full Name</span>
                            <span className="font-bold text-[#0A1F44]">{currentUserProfile?.firstName || user?.name || "Member"} {currentUserProfile?.lastName || ""}</span>
                          </div>
                          <div>
                            <span className="text-[#8E8E93] block mb-1">Registered Phone</span>
                            <span className="font-bold text-[#0A1F44]">{user?.phone || "+91 9400 123 456"}</span>
                          </div>
                          <div>
                            <span className="text-[#8E8E93] block mb-1">Community</span>
                            <span className="font-bold text-[#0A1F44]">{currentUserProfile?.religion || "Hindu"} · {currentUserProfile?.caste || "Nair"}</span>
                          </div>
                          <div>
                            <span className="text-[#8E8E93] block mb-1">Native District</span>
                            <span className="font-bold text-[#0A1F44]">{currentUserProfile?.district || "Ernakulam"}, Kerala</span>
                          </div>
                          <div className="pt-4">
                            <Link href="/join" className="px-5 py-2.5 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-sm inline-block">
                              Edit 10-Step Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab: Account & Password */}
                    {activeTab === "account" && (
                      <form onSubmit={handleSavePassword} className="bg-white rounded-3xl p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-6">
                        <h2 className="text-base font-bold text-[#0A1F44]">Change Password</h2>
                        <div className="space-y-4 max-w-md text-xs">
                          <div>
                            <label className="block font-bold uppercase tracking-wider text-[#636366] mb-2">Current Password</label>
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="rounded-full h-11"
                              required
                            />
                          </div>
                          <div>
                            <label className="block font-bold uppercase tracking-wider text-[#636366] mb-2">New Password (Min 8 chars)</label>
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="rounded-full h-11"
                              required
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-[11px] text-[#C81D45] font-semibold flex items-center space-x-1"
                          >
                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            <span>{showPassword ? "Hide Passwords" : "Show Passwords"}</span>
                          </button>
                        </div>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-2.5 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-md"
                        >
                          {saving ? "Updating..." : "Update Password"}
                        </button>
                      </form>
                    )}

                    {/* Tab: Danger / Logout */}
                    {activeTab === "danger" && (
                      <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
                          <h2 className="text-base font-bold text-[#0A1F44]">Sign Out</h2>
                          <p className="text-xs text-[#636366]">Sign out from your active session on this device.</p>
                          <button
                            onClick={handleLogout}
                            className="px-6 py-2.5 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#0A1F44] hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-sm space-y-4">
                          <h2 className="text-lg font-bold text-red-600">Delete Account</h2>
                          <p className="text-xs text-[#636366]">
                            Permanently delete your profile and all associated data. This action cannot be undone.
                          </p>
                          <button
                            onClick={handleDeleteAccount}
                            className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center space-x-2"
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

      <Footer />
    </div>
  );
}
