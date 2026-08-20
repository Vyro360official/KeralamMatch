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
import Logo from "@/components/shared/logo";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import {
  LayoutDashboard,
  Search,
  Users,
  MessageSquare,
  Eye,
  Heart,
  Settings,
  ShieldCheck,
  Sparkles,
  Crown,
  Bell,
  Coins,
  ChevronRight,
  UserCheck
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

  const suggestionsResult = await searchProfilesAction(
    {
      gender: profile.gender === "MALE" ? "FEMALE" : "MALE",
    },
    1,
    4
  );

  const suggestions = suggestionsResult.success && (suggestionsResult as any).results ? (suggestionsResult as any).results : [];
  const notifications = notificationsResult.success && notificationsResult.notifications ? notificationsResult.notifications : [];
  const balanceRupees = walletResult.success ? Math.round((walletResult.balance || 0) / 100) : 0;
  const subscription = subResult.success ? (subResult.subscription as any) : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] text-[#1C1C1E]">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── Left Sidebar Navigation (Unified & Frozen) ──────────────────── */}
          <DashboardSidebar userProfile={profile} />

          {/* ── Main Dashboard Content Area ──────────────────────────────── */}
          <main className="lg:col-span-9 space-y-8">
            
            {/* Top Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F44]">
                  Welcome back, {profile.firstName} 👋
                </h1>
                <p className="text-xs text-[#636366] mt-1">
                  Here are your verified matching recommendations for today.
                </p>
              </div>

              {profile.verifiedSelfie && (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Verified Profile</span>
                </div>
              )}
            </div>

            {/* Profile Completion & Profile Views Metric Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile Completion Ring / Progress Card */}
              <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#636366] uppercase tracking-wider">Complete Your Profile</span>
                  <div className="text-2xl font-extrabold text-[#0A1F44]">{profile.profileStrength}%</div>
                  <p className="text-[11px] text-[#8E8E93]">Add more details to get better matches</p>
                  <Link
                    href="/join"
                    className="inline-block mt-2 px-4 py-1.5 rounded-full bg-[#C81D45] text-white text-xs font-bold hover:bg-[#A51436] transition-all"
                  >
                    Update Now
                  </Link>
                </div>

                {/* Circular Percentage Ring */}
                <div className="relative h-24 w-24 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#C81D45]"
                      strokeDasharray={`${profile.profileStrength}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-bold text-[#0A1F44]">{profile.profileStrength}%</span>
                </div>
              </div>

              {/* Profile Views Metric Card */}
              <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm flex items-center justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#636366] uppercase tracking-wider">Profile Views</span>
                  <div className="text-2xl font-extrabold text-[#0A1F44]">240</div>
                  <div className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +18% this week
                  </div>
                </div>

                <div className="h-16 w-16 rounded-2xl bg-[#0A369D]/10 flex items-center justify-center text-[#0A369D]">
                  <Eye className="h-8 w-8" />
                </div>
              </div>

            </div>

            {/* ── Recommended Matches Section (Grid Cards matching Reference 1.4) ── */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-[#0A1F44]">Recommended Matches</h2>
                <Link href="/find" className="text-xs font-bold text-[#C81D45] hover:underline flex items-center">
                  <span>View All</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {suggestions.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-xs text-[#636366] border border-[rgba(28,28,30,0.08)]">
                  No match recommendations found yet. Update your partner preferences to explore matches.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {suggestions.map((item: any) => {
                    const age = new Date().getFullYear() - new Date(item.dateOfBirth).getFullYear();
                    const photo = item.media && item.media[0]
                      ? item.media[0].url
                      : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400";
                    return (
                      <Link href={`/profile/${item.id}`} key={item.id} className="group">
                        <div className="bg-white rounded-2xl border border-[rgba(28,28,30,0.08)] overflow-hidden shadow-sm hover:shadow-md transition-all">
                          {/* Portrait Photo */}
                          <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden">
                            <img
                              src={photo}
                              alt={`${item.firstName}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-[#C81D45]">
                              94% Match
                            </div>
                          </div>
                          {/* Details */}
                          <div className="p-4">
                            <h3 className="text-sm font-bold text-[#0A1F44] truncate">
                              {item.firstName}, {age}
                            </h3>
                            <p className="text-[11px] text-[#636366] truncate mt-0.5">
                              {item.district}, Kerala
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Wallet & Plan Overview Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Plan Card */}
              <div className="bg-[#0A1F44] text-white rounded-3xl p-6 space-y-4 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#E0A899]">Active Tier</span>
                  <Crown className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold">{subscription ? subscription.plan.name : "Free Account"}</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  {subscription
                    ? `Plan active until ${new Date(subscription.endDate).toLocaleDateString()}. Enjoy direct contact reveals.`
                    : "Upgrade to Gold or Platinum to reveal verified contact details and chat instantly."}
                </p>
                <Link
                  href="/pricing"
                  className="inline-block px-5 py-2 rounded-full bg-[#C81D45] text-white text-xs font-bold hover:bg-[#A51436] transition-all"
                >
                  Upgrade Plan
                </Link>
              </div>

              {/* Wallet Card */}
              <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#636366] uppercase tracking-wider">Wallet Balance</span>
                  <Coins className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div className="text-3xl font-extrabold text-[#0A1F44]">₹{balanceRupees}</div>
                <p className="text-xs text-[#636366]">
                  Credits used to reveal 24-hour contact access for verified profiles on demand.
                </p>
              </div>

            </div>

          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
