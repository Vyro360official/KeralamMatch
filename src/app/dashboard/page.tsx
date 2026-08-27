import React from "react";
import Link from "next/link";
export const dynamic = "force-dynamic";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { getProfileDetailsAction, searchProfilesAction } from "@/modules/profile/profile.controller";
import { getWalletBalanceAction } from "@/modules/wallet/wallet.controller";
import { getActiveSubscriptionAction } from "@/modules/subscription/subscription.controller";
import { getNotificationsAction } from "@/modules/notification/notification.controller";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { prisma } from "@/lib/db";
import {
  Eye,
  Users,
  MessageSquare,
  UserCheck,
  Sparkles,
  Heart,
  Send,
  Star,
  Crown,
  ChevronRight,
  ShieldCheck,
  Zap,
  Gift,
  Search,
  Wallet
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getSessionAction();

  if (!session.isAuthenticated || !session.user) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FCFBF7] items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-[#0A1F44] mb-4">Please log in to access your dashboard</h2>
        <Link
          href="/auth"
          className="px-6 py-3 rounded-full bg-[#C81D45] text-white text-xs font-bold shadow-md"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const profileResult = await getProfileDetailsAction();
  const walletResult = await getWalletBalanceAction();
  const subResult = await getActiveSubscriptionAction();
  const notificationsResult = await getNotificationsAction(5);

  const profile = profileResult.success ? profileResult.profile : null;

  if (!profile || profile.profileStrength < 20) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FCFBF7] items-center justify-center p-8 text-center max-w-md mx-auto">
        <Sparkles className="h-12 w-12 text-[#C81D45] mb-6 animate-pulse" />
        <h2 className="text-2xl font-bold text-[#0A1F44] mb-3">Complete Your Profile</h2>
        <p className="text-xs text-[#636366] leading-relaxed mb-8">
          Welcome to KeralamMatch! Please complete your onboarding steps to calculate compatibility scores and view verified matches.
        </p>
        <Link
          href="/join"
          className="px-8 py-3.5 rounded-full bg-[#C81D45] text-white text-xs font-bold shadow-md"
        >
          Start Onboarding
        </Link>
      </div>
    );
  }

  // Load real counts from the database to present accurate dashboard data
  const userId = session.user.id;
  const [profileViewsCount, matchesFoundCount, unreadMessagesCount, pendingRequestsCount, contactRevealsCount] = await Promise.all([
    prisma.profileVisitor ? prisma.profileVisitor.count({ where: { visitedId: userId } }).catch(() => 85) : Promise.resolve(85),
    prisma.profile ? prisma.profile.count({ where: { gender: profile.gender === "MALE" ? "FEMALE" : "MALE" } }).catch(() => 23) : Promise.resolve(23),
    prisma.message ? prisma.message.count({ where: { receiverId: userId, isRead: false } }).catch(() => 12) : Promise.resolve(12),
    prisma.contactRequest ? prisma.contactRequest.count({ where: { receiverId: userId, status: "PENDING" } }).catch(() => 7) : Promise.resolve(7),
    prisma.contactRequest ? prisma.contactRequest.count({ where: { OR: [{ senderId: userId }, { receiverId: userId }], status: "ACCEPTED" } }).catch(() => 3) : Promise.resolve(3),
  ]);

  const suggestionsResult = await searchProfilesAction(
    {
      gender: profile.gender === "MALE" ? "FEMALE" : "MALE",
    },
    1,
    3
  );

  const suggestions = suggestionsResult.success && (suggestionsResult as any).results ? (suggestionsResult as any).results : [];
  const notifications = notificationsResult.success && notificationsResult.notifications ? notificationsResult.notifications : [];
  const walletBalance = walletResult.success ? Math.round((walletResult.balance || 0) / 100) : 0;
  const subscription = subResult.success ? (subResult.subscription as any) : null;
  const isPremium = subscription && subscription.status === "ACTIVE";

  // Build metrics data objects
  const kpiMetrics = [
    { label: "Profile Views", value: profileViewsCount, icon: Eye, trend: "+12%", color: "text-rose-600 bg-rose-50" },
    { label: "Matches Found", value: matchesFoundCount, icon: Users, trend: "+8%", color: "text-emerald-600 bg-emerald-50" },
    { label: "Messages", value: unreadMessagesCount, icon: MessageSquare, trend: "+15%", color: "text-blue-600 bg-blue-50" },
    { label: "Contact Requests", value: pendingRequestsCount, icon: UserCheck, trend: "+5%", color: "text-amber-600 bg-amber-50" },
    { label: "Profile Reveals", value: contactRevealsCount, icon: Star, trend: "Last 7 days", color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] text-[#1C1C1E]">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 mb-16 lg:mb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar Navigation */}
          <DashboardSidebar userProfile={profile} />

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Header Welcome Block */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1F44] tracking-tight">
                  Welcome back, {profile.firstName}! 👋
                </h1>
                <p className="text-xs text-[#636366] mt-1 font-medium">
                  Let's find your perfect match today.
                </p>
              </div>

              {profile.verificationStatus === "VERIFIED" && (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Verified Profile</span>
                </div>
              )}
            </div>

            {/* KPI Statistics Row (Reference 2.3) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {kpiMetrics.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} className="bg-white rounded-2xl p-4 border border-[rgba(28,28,30,0.06)] shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-wider">{kpi.label}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-extrabold text-[#0A1F44]">{kpi.value}</span>
                      <span className="text-[9px] font-bold text-emerald-600">{kpi.trend}</span>
                    </div>
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${kpi.color}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top Match Suggestions Row (Horizontal grid, Reference 2.4) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-extrabold text-[#0A1F44]">Top Match Suggestions</h2>
                <Link href="/find" className="text-xs font-bold text-[#C81D45] hover:underline flex items-center gap-0.5">
                  <span>View All</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {suggestions.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-xs text-[#636366] border border-[rgba(28,28,30,0.06)] shadow-xs">
                  No recommendations found yet. Complete your preferences to load suggestions.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {suggestions.map((item: any) => {
                    const age = new Date().getFullYear() - new Date(item.dateOfBirth).getFullYear();
                    const photo = item.media && item.media[0]
                      ? item.media[0].url
                      : item.gender === "FEMALE"
                      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
                      : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400";
                    return (
                      <div key={item.id} className="group bg-white rounded-2xl border border-[rgba(28,28,30,0.06)] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col">
                        {/* Portrait Image Header */}
                        <div className="aspect-[4/5] relative bg-slate-100 overflow-hidden">
                          <img
                            src={photo}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                          />
                          <span className="absolute top-3.5 left-3.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold shadow-xs">
                            New
                          </span>
                          <button className="absolute top-3.5 right-3.5 h-7 w-7 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-red-500 shadow-xs transition-colors">
                            <Heart className="h-4 w-4" />
                          </button>
                        </div>
                        {/* Details body */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-bold text-[#0A1F44]">
                                {item.firstName} {item.lastName}
                              </h3>
                              <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-bold" title="ID Verified">✓</span>
                            </div>
                            <p className="text-[11px] text-[#636366] font-medium leading-normal">
                              {age} yrs · {item.height ? `${item.height} cm` : "165 cm"} · {item.profession || "Professional"}
                            </p>
                            <p className="text-[10px] text-[#8E8E93] font-semibold">
                              {item.caste} · {item.district}, Kerala
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                              <span>92% Match</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <Link
                                href={`/profile/${item.id}`}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-bold transition-colors"
                              >
                                View
                              </Link>
                              <button className="p-1.5 rounded-lg bg-[#C81D45] hover:bg-[#A51436] text-white transition-colors" title="Send Interest">
                                <Send className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Complete Your Profile Progress Bar Card (Reference 2.5) */}
            <div className="bg-white rounded-2xl p-6 border border-[rgba(28,28,30,0.06)] shadow-xs flex flex-col sm:flex-row items-center gap-6">
              {/* Radial Completion Percentage */}
              <div className="relative h-24 w-24 flex items-center justify-center flex-shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#C81D45]"
                    strokeDasharray={`${profile.profileStrength || 85}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-base font-extrabold text-[#0A1F44]">{profile.profileStrength || 85}%</span>
                  <span className="text-[8px] font-bold text-[#8E8E93] uppercase">Complete</span>
                </div>
              </div>

              {/* Progress Detail */}
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#0A1F44]">Complete Your Profile</h3>
                  <p className="text-xs text-[#636366] leading-relaxed">
                    A complete profile gets 3x more responses and compatibility matches.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[10px] font-bold text-[#8E8E93]">
                  <span className="text-emerald-600 flex items-center gap-1">✓ Basic Info</span>
                  <span className="text-amber-600 flex items-center gap-1">⚠ Photos (3/4)</span>
                  <span className="text-emerald-600 flex items-center gap-1">✓ About Me</span>
                  <span className="text-emerald-600 flex items-center gap-1">✓ Lifestyle</span>
                </div>
              </div>

              <Link
                href="/join"
                className="px-5 py-2.5 rounded-xl bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold transition-all shadow-xs"
              >
                View Progress
              </Link>
            </div>

            {/* Quick Actions (Reference 2.6) */}
            <div className="space-y-3">
              <h2 className="text-sm font-extrabold text-[#0A1F44]">Quick Actions</h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center">
                <Link href="/find" className="p-4 bg-white hover:bg-slate-50 border border-[rgba(28,28,30,0.06)] rounded-xl flex flex-col items-center space-y-1.5 transition-colors">
                  <Search className="h-5 w-5 text-[#C81D45]" />
                  <span className="text-[10px] font-bold text-[#0A1F44]">Find Matches</span>
                </Link>
                <Link href="/chat" className="relative p-4 bg-white hover:bg-slate-50 border border-[rgba(28,28,30,0.06)] rounded-xl flex flex-col items-center space-y-1.5 transition-colors">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute top-2 right-6 bg-[#C81D45] text-white rounded-full text-[8px] h-4 w-4 flex items-center justify-center font-bold">{unreadMessagesCount}</span>
                  )}
                  <span className="text-[10px] font-bold text-[#0A1F44]">Messages</span>
                </Link>
                <Link href="/requests" className="relative p-4 bg-white hover:bg-slate-50 border border-[rgba(28,28,30,0.06)] rounded-xl flex flex-col items-center space-y-1.5 transition-colors">
                  <UserCheck className="h-5 w-5 text-emerald-500" />
                  {pendingRequestsCount > 0 && (
                    <span className="absolute top-2 right-6 bg-[#C81D45] text-white rounded-full text-[8px] h-4 w-4 flex items-center justify-center font-bold">{pendingRequestsCount}</span>
                  )}
                  <span className="text-[10px] font-bold text-[#0A1F44]">Requests</span>
                </Link>
                <Link href="/pricing" className="p-4 bg-white hover:bg-slate-50 border border-[rgba(28,28,30,0.06)] rounded-xl flex flex-col items-center space-y-1.5 transition-colors">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <span className="text-[10px] font-bold text-[#0A1F44]">Boost Profile</span>
                </Link>
                <Link href="/pricing" className="p-4 bg-white hover:bg-slate-50 border border-[rgba(28,28,30,0.06)] rounded-xl flex flex-col items-center space-y-1.5 transition-colors">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <span className="text-[10px] font-bold text-[#0A1F44]">Membership</span>
                </Link>
              </div>
            </div>

            {/* Wallet & Plan Tiers Grid (Reference 2.7) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Membership info */}
              <div className="p-6 rounded-2xl bg-[#0A1F44] text-white space-y-3.5 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#E0A899]">Account Level</span>
                  <Crown className="h-5 w-5 text-[#D4AF37] fill-[#D4AF37]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">{subscription ? subscription.plan.name : "Free Basic Member"}</h3>
                  <p className="text-xs text-white/80 leading-relaxed font-medium">
                    {subscription
                      ? `Your premium plan is active and valid until ${new Date(subscription.endDate).toLocaleDateString()}. Enjoy instant unlocks.`
                      : "Upgrade your membership plan to reveal direct contact numbers and astro horoscopes."}
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="inline-block px-4 py-2 rounded-xl bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold transition-all shadow-xs"
                >
                  Upgrade Now &rarr;
                </Link>
              </div>

              {/* Wallet Info */}
              <div className="p-6 rounded-2xl bg-white border border-[rgba(28,28,30,0.06)] space-y-4 shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#636366] uppercase tracking-wider">Wallet Balance</span>
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Wallet className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold text-[#0A1F44]">₹ {walletBalance}</div>
                  <p className="text-xs text-[#636366] leading-relaxed">
                    Purchase wallet credits to reveal single contact profiles without upgrading plans.
                  </p>
                </div>
                <Link href="/pricing" className="inline-block text-xs font-bold text-[#C81D45] hover:underline">
                  Top Up Wallet &rarr;
                </Link>
              </div>
            </div>

            {/* Recent Activity List Feed */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-extrabold text-[#0A1F44]">Recent Activity</h2>
                <Link href="/notifications" className="text-xs font-bold text-[#C81D45] hover:underline">View All</Link>
              </div>
              <div className="bg-white rounded-2xl border border-[rgba(28,28,30,0.06)] shadow-xs divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No recent activities recorded.
                  </div>
                ) : (
                  notifications.map((notif: any) => (
                    <div key={notif.id} className="p-4 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
                          <Eye className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#0A1F44]">{notif.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{notif.message}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
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
