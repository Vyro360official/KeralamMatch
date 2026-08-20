"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Users,
  MessageSquare,
  UserCheck,
  Heart,
  Bell,
  Settings,
  Camera,
  X,
  CheckCircle2,
  Edit3,
  Sparkles,
  ShieldCheck,
  Eye,
} from "lucide-react";

interface SidebarProps {
  userProfile?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    district?: string;
    city?: string;
    avatarUrl?: string;
    education?: string;
    profession?: string;
    religion?: string;
    caste?: string;
    profileStrength?: number;
  } | null;
}

export default function DashboardSidebar({ userProfile }: SidebarProps) {
  const pathname = usePathname();
  const [currentTab, setCurrentTab] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profile, setProfile] = useState<any>(userProfile || null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setCurrentTab(params.get("tab"));
    }
  }, [pathname]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname, currentTab]);

  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
    } else {
      // Lazy load profile details action on client side
      import("@/modules/profile/profile.controller").then(({ getProfileDetailsAction }) => {
        getProfileDetailsAction().then((res) => {
          if (res.success && res.profile) {
            setProfile(res.profile);
          }
        });
      });
    }
  }, [userProfile]);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(userProfile?.avatarUrl || null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (profile?.avatarUrl) {
      setAvatar(profile.avatarUrl);
    }
  }, [profile]);

  const firstName = profile?.firstName || "Nagarajan";
  const lastName = profile?.lastName || "P";
  const district = profile?.district || "Ernakulam";
  const state = "Kerala";
  const initial = firstName.charAt(0).toUpperCase();

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatar(base64);
      setUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    };
    reader.readAsDataURL(file);
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, isActive: pathname === "/dashboard" && !currentTab },
    { href: "/find", label: "Find Matches", icon: Search, isActive: pathname === "/find" && (!currentTab || currentTab === "find") },
    { href: "/find?tab=matches", label: "My Matches", icon: Users, isActive: pathname === "/find" && currentTab === "matches" },
    { href: "/chat", label: "Messages", icon: MessageSquare, isActive: pathname.startsWith("/chat") },
    { href: "/requests", label: "Contact Requests", icon: UserCheck, isActive: pathname === "/requests" },
    { href: "/find?tab=saved", label: "Shortlisted", icon: Heart, isActive: pathname === "/find" && currentTab === "saved" },
    { href: "/notifications", label: "Notifications", icon: Bell, isActive: pathname === "/notifications" },
    { href: "/settings", label: "Settings", icon: Settings, isActive: pathname === "/settings" },
  ];

  /* ── Shared sidebar content ───────────────────────────────────────── */
  const SidebarContent = () => (
    <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-3">
      {/* User Mini Profile Card */}
      <button
        type="button"
        onClick={() => { setIsProfileModalOpen(true); setDrawerOpen(false); }}
        className="w-full text-left flex items-center space-x-3.5 p-3 rounded-2xl bg-[#FCFBF7] hover:bg-[#F4F1EA] border border-[rgba(28,28,30,0.06)] transition-all group focus:outline-none focus:ring-2 focus:ring-[#C81D45]/30 cursor-pointer"
        title="Click to view/edit profile & change photo"
      >
        <div className="relative flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt={`${firstName} ${lastName}`} className="h-11 w-11 rounded-full object-cover border-2 border-[#C81D45]" />
          ) : (
            <div className="h-11 w-11 rounded-full bg-[#FCE8EC] text-[#C81D45] flex items-center justify-center font-extrabold text-base border-2 border-[#FAD2DA]">
              {initial}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-[#C81D45] text-white p-1 rounded-full shadow-sm group-hover:scale-110 transition-transform">
            <Camera className="h-2.5 w-2.5" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[#0A1F44] truncate group-hover:text-[#C81D45] transition-colors flex items-center gap-1.5">
            <span>{firstName} {lastName}</span>
            <Edit3 className="h-3 w-3 text-[#8E8E93] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-xs text-[#636366] truncate font-medium">{district}, {state}</div>
        </div>
      </button>

      <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#8E8E93] px-3 pt-3">Menu</div>

      <nav className="space-y-1.5 text-xs font-semibold">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3.5 px-3.5 py-3 rounded-2xl transition-all ${
                item.isActive
                  ? "bg-[#C81D45] text-white shadow-sm font-bold"
                  : "text-[#636366] hover:bg-[#FCFBF7] hover:text-[#0A1F44]"
              }`}
            >
              <Icon className={`h-4 w-4 ${item.isActive ? "text-white" : "text-[#8E8E93]"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block lg:col-span-3 w-full">
        <div className="sticky top-24">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile/PWA hamburger button (3 lines) */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden fixed bottom-6 left-4 z-40 flex flex-col items-center justify-center gap-[5px] w-12 h-12 bg-[#C81D45] rounded-2xl shadow-lg hover:bg-[#A51436] transition-colors"
        aria-label="Open menu"
      >
        <span className="block w-5 h-0.5 bg-white rounded-full" />
        <span className="block w-5 h-0.5 bg-white rounded-full" />
        <span className="block w-5 h-0.5 bg-white rounded-full" />
      </button>

      {/* Backdrop */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Slide-in drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-[#FCFBF7] shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(28,28,30,0.08)]">
          <span className="font-extrabold text-[#0A1F44] text-base tracking-tight">
            Keral<span className="text-[#C81D45]">am</span>Match
          </span>
          <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-[#636366] hover:text-[#0A1F44] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <SidebarContent />
        </div>
      </div>

      {/* Profile & Photo Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[rgba(28,28,30,0.1)] relative space-y-6">
            <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-5 right-5 p-2 text-[#8E8E93] hover:text-[#0A1F44] hover:bg-[#FCFBF7] rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#FCE8EC] text-[#C81D45] flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0A1F44]">My Profile & Photo</h3>
                <p className="text-xs text-[#636366]">Manage your matrimonial profile details and photo</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.06)]">
              <div className="relative">
                {avatar ? (
                  <img src={avatar} alt="Profile Avatar" className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-[#C81D45] text-white flex items-center justify-center font-extrabold text-2xl shadow-md">{initial}</div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="text-xs font-bold text-[#0A1F44]">Profile Avatar Photo</div>
                <p className="text-[11px] text-[#636366] leading-snug">Upload a clear portrait photo. Supported formats: JPG, PNG, WebP (Max 5MB).</p>
                <div className="flex gap-2 justify-center sm:justify-start">
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-4 py-1.5 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5" />
                    <span>{uploading ? "Updating..." : "Change Photo"}</span>
                  </button>
                  {avatar && (
                    <button type="button" onClick={() => setAvatar(null)} className="px-3 py-1.5 rounded-full border border-[rgba(28,28,30,0.12)] text-[#636366] hover:bg-gray-100 text-xs font-semibold">Remove</button>
                  )}
                </div>
                {uploadSuccess && (
                  <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Photo updated successfully!</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#FCFBF7] rounded-xl border border-[rgba(28,28,30,0.06)]">
                <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Full Name</span>
                <span className="font-bold text-[#0A1F44]">{firstName} {lastName}</span>
              </div>
              <div className="p-3 bg-[#FCFBF7] rounded-xl border border-[rgba(28,28,30,0.06)]">
                <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Location</span>
                <span className="font-bold text-[#0A1F44]">{district}, {state}</span>
              </div>
              <div className="p-3 bg-[#FCFBF7] rounded-xl border border-[rgba(28,28,30,0.06)]">
                <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Community</span>
                <span className="font-bold text-[#0A1F44]">{userProfile?.religion || "Hindu"} - {userProfile?.caste || "Nair"}</span>
              </div>
              <div className="p-3 bg-[#FCFBF7] rounded-xl border border-[rgba(28,28,30,0.06)]">
                <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">Profession</span>
                <span className="font-bold text-[#0A1F44]">{userProfile?.profession || "Software Engineer"}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[rgba(28,28,30,0.08)]">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold self-start sm:self-center">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Verified Member</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Link href={userProfile?.id ? `/profile/${userProfile.id}` : "/profile/me"} onClick={() => setIsProfileModalOpen(false)} className="flex-1 sm:flex-initial px-4 py-2 rounded-full bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 shadow-sm">
                  <Eye className="h-3.5 w-3.5 text-amber-400" />
                  <span>View How Your Profile Appears to Others</span>
                </Link>
                <Link href="/join" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 rounded-full border border-[#C81D45] text-[#C81D45] hover:bg-[#FCE8EC] text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5">
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
