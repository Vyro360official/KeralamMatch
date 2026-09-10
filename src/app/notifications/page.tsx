"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, BellOff, Check, AlertCircle, Coins, Heart, MessageCircle, UserCheck } from "lucide-react";
import Link from "next/link";
import { getProfileDetailsAction } from "@/modules/profile/profile.controller";
import HoroscopeMatchButton from "@/components/astrology/horoscope-match-button";

const ICON_MAP: Record<string, React.ReactNode> = {
  CONTACT_REQUEST: <Heart className="h-4 w-4 text-[#C81D45]" />,
  MESSAGE: <MessageCircle className="h-4 w-4 text-[#0A369D]" />,
  VERIFICATION: <UserCheck className="h-4 w-4 text-emerald-600" />,
  WALLET: <Coins className="h-4 w-4 text-[#D4AF37]" />,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null);

  useEffect(() => {
    async function loadMe() {
      const res = await getProfileDetailsAction();
      if (res.success && res.profile) setCurrentUserProfile(res.profile);
    }
    loadMe();
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) setNotifications(data.notifications);
    } catch {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] dark:bg-[#07132B] text-[#1C1C1E] dark:text-white transition-colors">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 mb-16 lg:mb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Frozen Left Menu */}
          <DashboardSidebar userProfile={currentUserProfile} />

          {/* Main Notifications Content */}
          <main className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1F44] dark:text-white tracking-tight">Notifications</h1>
                <p className="text-xs text-[#636366] dark:text-slate-400 font-medium mt-0.5">
                  Real-time updates on contact reveals, chats & profile verification
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#0A1F44] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60 flex items-center space-x-1.5 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Mark All Read</span>
                </button>
              )}
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-3xl" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-16 text-center space-y-3 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <BellOff className="h-10 w-10 text-[#8E8E93] mx-auto" />
                <p className="text-xs text-[#636366] dark:text-slate-400">No notifications yet. You will receive updates here when other members interact with your profile.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => {
                  const icon = ICON_MAP[n.type] || <Bell className="h-4 w-4 text-[#636366]" />;
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && markRead(n.id)}
                      className={`bg-white dark:bg-[#0D1E3D] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start space-x-4 transition-all cursor-pointer hover:shadow-md ${
                        !n.isRead ? "border-l-4 border-l-[#FF1475]" : "opacity-80"
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-[#FCFBF7] dark:bg-[#07132B] border border-slate-200/80 dark:border-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-xs ${!n.isRead ? "font-bold text-[#0A1F44] dark:text-white" : "font-semibold text-[#636366] dark:text-slate-400"}`}>
                            {n.title}
                          </h3>
                          <span className="text-[10px] text-[#8E8E93] dark:text-slate-400">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#636366] dark:text-slate-400 mt-1">{n.body || n.message}</p>
                        {(() => {
                          const profileMatch = n.link ? n.link.match(/\/profile\/([a-zA-Z0-9_-]+)/) : null;
                          const userMatch = n.link ? n.link.match(/[?&]userId=([a-zA-Z0-9_-]+)/) : null;
                          const candidateId = profileMatch ? profileMatch[1] : (userMatch ? userMatch[1] : null);

                          if (!n.link && !candidateId) return null;

                          return (
                            <div className="mt-3 flex items-center gap-3 pt-1">
                              {n.link && (
                                <Link
                                  href={n.link}
                                  className="text-[11px] font-bold text-[#0A369D] dark:text-blue-400 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View Details →
                                </Link>
                              )}
                              {candidateId && (
                                <div onClick={(e) => e.stopPropagation()}>
                                  <HoroscopeMatchButton
                                    targetProfile={{
                                      id: candidateId,
                                      firstName: n.title?.split(" ")[0] || "Candidate",
                                    }}
                                    currentUserId={currentUserProfile?.userId}
                                    variant="compact"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer variant="dashboard" />
    </div>
  );
}
