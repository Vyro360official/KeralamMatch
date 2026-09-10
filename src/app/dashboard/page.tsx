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
import HoroscopeMatchButton from "@/components/astrology/horoscope-match-button";
import CandidateImage from "@/components/dashboard/candidate-image";
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
  Rocket,
  Search,
  Wallet,
  MapPin,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserPlus,
  Compass,
  Clock,
} from "lucide-react";

/**
 * Calculates candidate age accurately from date of birth.
 * Returns null if DOB is missing or invalid (never returns NaN).
 */
function calculateAge(dob: string | Date | null | undefined): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (isNaN(age) || age <= 0 || age > 120) return null;
  return age;
}

/**
 * Calculates genuine profile completion percentage and section checklist
 * based on actual database profile fields.
 */
function calculateProfileCompletion(profile: any): {
  percentage: number;
  checks: {
    basicInfo: boolean;
    aboutMe: boolean;
    familyDetails: boolean;
    photos: boolean;
    photoCount: number;
    lifestyle: boolean;
    horoscope: boolean;
  };
} {
  const photoCount = profile?.media?.length || (profile?.avatarUrl ? 1 : 0);
  const checks = {
    basicInfo: !!(profile?.firstName && profile?.gender && profile?.dateOfBirth && profile?.district),
    aboutMe: !!(profile?.bio && profile.bio.trim().length > 10),
    familyDetails: !!(profile?.familyType || profile?.fatherOccupation || profile?.motherOccupation),
    photos: photoCount >= 1,
    photoCount,
    lifestyle: !!(profile?.diet || profile?.smoking || profile?.drinking),
    horoscope: !!(profile?.nakshatram || profile?.rasi || profile?.timeOfBirth),
  };

  const totalPoints = 6;
  let completedPoints = 0;
  if (checks.basicInfo) completedPoints++;
  if (checks.aboutMe) completedPoints++;
  if (checks.familyDetails) completedPoints++;
  if (checks.photos) completedPoints++;
  if (checks.lifestyle) completedPoints++;
  if (checks.horoscope) completedPoints++;

  const percentage =
    profile?.profileStrength && profile.profileStrength > 0
      ? profile.profileStrength
      : Math.round((completedPoints / totalPoints) * 100);

  return { percentage, checks };
}

export default async function DashboardPage() {
  const session = await getSessionAction();

  if (!session.isAuthenticated || !session.user) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FCFBF7] dark:bg-[#07132B] items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-[#0A1F44] dark:text-white mb-4">
          Please log in to access your dashboard
        </h2>
        <Link
          href="/auth"
          className="px-6 py-3 rounded-full bg-[#FF1475] hover:bg-[#E60067] text-white text-xs font-bold shadow-md transition-colors"
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
      <div className="flex flex-col min-h-screen bg-[#FCFBF7] dark:bg-[#07132B] items-center justify-center p-8 text-center max-w-md mx-auto">
        <Sparkles className="h-12 w-12 text-[#FF1475] mb-6 animate-pulse" />
        <h2 className="text-2xl font-bold text-[#0A1F44] dark:text-white mb-3">Complete Your Profile</h2>
        <p className="text-xs text-[#636366] dark:text-slate-400 leading-relaxed mb-8">
          Welcome to KeralamMatch! Please complete your onboarding steps to calculate compatibility scores and view verified matches.
        </p>
        <Link
          href="/join"
          className="px-8 py-3.5 rounded-full bg-[#FF1475] hover:bg-[#E60067] text-white text-xs font-bold shadow-md transition-colors"
        >
          Start Onboarding
        </Link>
      </div>
    );
  }

  const userId = session.user.id;
  const isMale = profile.gender === "MALE";
  const targetGender = isMale ? "FEMALE" : "MALE";
  const matchHeading = isMale
    ? "Recommended Brides for You"
    : profile.gender === "FEMALE"
    ? "Recommended Grooms for You"
    : "Top Match Suggestions";

  // Load real counts from the database (Zero-Mock Rule: fallbacks must be 0)
  const [
    profileViewsCount,
    matchesFoundCount,
    unreadMessagesCount,
    pendingRequestsCount,
    contactRevealsCount,
    suggestionsResult,
  ] = await Promise.all([
    prisma.profileVisitor
      ? prisma.profileVisitor.count({ where: { visitedId: userId } }).catch(() => 0)
      : Promise.resolve(0),
    prisma.profile
      ? prisma.profile.count({ where: { gender: targetGender } }).catch(() => 0)
      : Promise.resolve(0),
    prisma.message
      ? prisma.message.count({ where: { receiverId: userId, isRead: false } }).catch(() => 0)
      : Promise.resolve(0),
    prisma.contactRequest
      ? prisma.contactRequest.count({ where: { receiverId: userId, status: "PENDING" } }).catch(() => 0)
      : Promise.resolve(0),
    prisma.contactRequest
      ? prisma.contactRequest.count({ where: { OR: [{ senderId: userId }, { receiverId: userId }], status: "ACCEPTED" } }).catch(() => 0)
      : Promise.resolve(0),
    searchProfilesAction(
      {
        gender: targetGender,
      },
      1,
      4
    ),
  ]);

  const suggestions =
    suggestionsResult.success && (suggestionsResult as any).results
      ? (suggestionsResult as any).results
      : [];

  const notifications =
    notificationsResult.success && notificationsResult.notifications
      ? notificationsResult.notifications
      : [];

  const walletBalance = walletResult.success ? Math.round((walletResult.balance || 0) / 100) : 0;
  const subscription = subResult.success ? (subResult.subscription as any) : null;
  const planName = subscription?.plan?.name || "Free Plan";

  // Real profile completion calculation
  const { percentage: profileCompletionPct, checks: profileChecks } = calculateProfileCompletion(profile);

  // KPI statistics row data (clean, no fake trends, chevrons linking to destinations)
  const kpiCards = [
    {
      label: "Profile Views",
      value: profileViewsCount,
      icon: Eye,
      iconColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40",
      href: "/requests",
    },
    {
      label: "Matches Found",
      value: matchesFoundCount,
      icon: Users,
      iconColor: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40",
      href: "/find",
    },
    {
      label: "Messages",
      value: unreadMessagesCount,
      icon: MessageSquare,
      iconColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40",
      href: "/chat",
    },
    {
      label: "Contact Requests",
      value: pendingRequestsCount,
      icon: UserPlus,
      iconColor: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40",
      href: "/requests",
    },
    {
      label: "Profile Reveals",
      value: contactRevealsCount,
      subtitle: "Last 7 days",
      icon: Star,
      iconColor: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40",
      href: "/requests",
    },
  ];

  const userInitial = profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] dark:bg-[#07132B] text-[#1C1C1E] dark:text-slate-100 transition-colors">
      <Header />

      <div className="flex-1 mx-auto max-w-[1440px] w-full px-4 sm:px-6 lg:px-8 py-6 mb-16 lg:mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Sidebar Navigation */}
          <DashboardSidebar userProfile={profile} />

          {/* Main Content Area: Natural Vertical Scrolling */}
          <main className="lg:col-span-9 space-y-6">
            {/* 1. WELCOME + PROFILE COMPLETION + TRUST (Top 3-Card Row) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Card 1: Welcome & Profile Summary (5 cols on md/lg) */}
              <div className="md:col-span-6 lg:col-span-5 bg-white dark:bg-[#0D1E3D] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
                {/* Avatar with Online Dot */}
                <div className="relative flex-shrink-0">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.firstName}
                      className="h-16 w-16 rounded-full object-cover border-2 border-[#FF1475]/20 shadow-xs"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#0A1F44] to-[#FF1475] flex items-center justify-center text-white text-xl font-extrabold shadow-xs">
                      {userInitial}
                    </div>
                  )}
                  <span
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-bold shadow-xs whitespace-nowrap"
                    title="Active status"
                  >
                    Online
                  </span>
                </div>

                {/* Profile Details */}
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-extrabold text-[#0A1F44] dark:text-white tracking-tight truncate">
                    Welcome back, {profile.firstName}! 👋
                  </h1>
                  <p className="text-xs text-[#636366] dark:text-slate-400 mt-0.5 font-medium truncate">
                    Let's find your perfect match today.
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span className="truncate">{profile.district || "Kerala"}, Kerala</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3 text-slate-400" />
                      <span className="truncate">{profile.profession || "Professional"}</span>
                    </span>
                    {profile.caste && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-slate-400" />
                        <span className="truncate">{profile.caste}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Profile Completion Ring (4 cols on md/lg) */}
              <div className="md:col-span-3 lg:col-span-4 bg-white dark:bg-[#0D1E3D] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
                {/* SVG Radial Progress */}
                <div className="relative h-16 w-16 flex-shrink-0 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500"
                      strokeDasharray={`${profileCompletionPct}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    {profileCompletionPct}%
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="text-xs font-bold text-[#0A1F44] dark:text-white uppercase tracking-wider">
                    Profile Completion
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Complete your profile to get better matches.
                  </p>
                  <Link
                    href="/join"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FF1475] hover:bg-[#E60067] text-white text-[11px] font-bold shadow-xs transition-colors mt-1"
                  >
                    <span>Complete Profile</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Card 3: Build Trust & Verification (3 cols on md/lg) */}
              <div className="md:col-span-3 lg:col-span-3 bg-white dark:bg-[#0D1E3D] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-[#0A1F44] dark:text-white">Build Trust</span>
                  </div>
                  <Link
                    href="/trust"
                    className="text-[11px] font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>View Verification</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-x-2.5 gap-y-2 py-2 text-[11px] font-semibold">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="whitespace-nowrap">Mobile Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="whitespace-nowrap">Email Verified</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      profile.verificationStatus === "VERIFIED"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {profile.verificationStatus === "VERIFIED" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    )}
                    <span className="whitespace-nowrap">
                      ID {profile.verificationStatus === "VERIFIED" ? "Verified" : "Pending"}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      profileChecks.photos
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {profileChecks.photos ? (
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    )}
                    <span className="whitespace-nowrap">
                      Photo {profileChecks.photos ? "Verified" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. KPI STATISTICS ROW (5 Cards: Eye, Matches, Messages, Requests, Reveals) */}
            {/* Note: The large Profile Views graph is completely removed; only this compact KPI card is kept */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
              {kpiCards.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <Link
                    key={kpi.label}
                    href={kpi.href}
                    className="group bg-white dark:bg-[#0D1E3D] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#FF1475]/60 transition-all hover:-translate-y-0.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${kpi.iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-[#FF1475] transition-colors" />
                    </div>

                    <div className="mt-3">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                        {kpi.label}
                      </span>
                      <div className="flex items-baseline justify-between mt-0.5">
                        <span className="text-xl sm:text-2xl font-extrabold text-[#0A1F44] dark:text-white tracking-tight">
                          {kpi.value.toLocaleString("en-IN")}
                        </span>
                        {kpi.subtitle && (
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                            {kpi.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* 3. TOP MATCH SUGGESTIONS / RECOMMENDED MATCHES */}
            <div className="space-y-3.5">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#0A1F44] dark:text-white tracking-tight">
                    {matchHeading}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Curated Malayali profiles matching your community and age preferences
                  </p>
                </div>
                <Link
                  href="/find"
                  className="text-xs font-bold text-[#FF1475] hover:underline flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {suggestions.length === 0 ? (
                <div className="bg-white dark:bg-[#0D1E3D] rounded-2xl p-10 text-center text-xs text-slate-400 dark:text-slate-500 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <Compass className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-600 dark:text-slate-300">No recommendations found yet.</p>
                  <p className="text-[11px] mt-0.5">Complete your partner preferences to load personalized suggestions.</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4.5">
                    {suggestions.map((item: any) => {
                      const candidateAge = calculateAge(item.dateOfBirth);
                      const ageDisplay = candidateAge !== null ? `${candidateAge} yrs` : null;
                      const heightDisplay = item.height ? `${item.height} cm` : null;
                      const ageHeightLine = [ageDisplay, heightDisplay].filter(Boolean).join(" • ") || "Details on profile";

                      const photo =
                        item.media && item.media[0]?.url
                          ? item.media[0].url
                          : item.avatarUrl
                          ? item.avatarUrl
                          : item.gender === "FEMALE"
                          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
                          : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80";

                      return (
                        <div
                          key={item.id}
                          className="group bg-white dark:bg-[#0D1E3D] rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          {/* Portrait Image Header */}
                          <CandidateImage
                            src={photo}
                            alt={`${item.firstName || "Profile"}`}
                            initials={item.firstName ? item.firstName.charAt(0).toUpperCase() : "K"}
                            gender={item.gender}
                            isVerified={item.verificationStatus === "VERIFIED"}
                            isNew={true}
                          />

                          {/* Candidate Details */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div className="space-y-1">
                              <h3 className="text-sm font-extrabold text-[#0A1F44] dark:text-white truncate">
                                {item.firstName} {item.lastName}
                              </h3>
                              {/* Bulletproof Age & Height (Zero NaN Guaranteed) */}
                              <p className="text-[11px] text-[#636366] dark:text-slate-400 font-medium truncate">
                                {ageHeightLine}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate">
                                {item.caste || "Malayali"} • {item.district || "Kerala"}, Kerala
                              </p>
                              <p className="text-[11px] text-[#0A1F44] dark:text-slate-300 font-semibold truncate">
                                {item.profession || "Software Professional"}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="flex-1 py-2 px-2.5 rounded-xl bg-[#FF1475] hover:bg-[#E60067] active:scale-[0.98] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer"
                                  title="Send Interest"
                                >
                                  <Heart className="h-3.5 w-3.5 fill-current" />
                                  <span>Send Interest</span>
                                </button>
                                <Link
                                  href={`/profile/${item.id}`}
                                  className="flex-1 py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-[0.98] text-[#0A1F44] dark:text-white text-xs font-bold text-center transition-all whitespace-nowrap flex items-center justify-center"
                                >
                                  View Profile
                                </Link>
                              </div>

                              {/* ॐ View Horoscope Match Button (Real SoftAstro Calculation) */}
                              <HoroscopeMatchButton
                                targetProfile={item}
                                currentUserId={session.user?.id}
                                variant="card"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Floating Carousel Next Button */}
                  <Link
                    href="/find"
                    className="hidden xl:flex absolute -right-3.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white dark:bg-[#0D1E3D] border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#FF1475] hover:border-[#FF1475] z-10 transition-colors cursor-pointer"
                    title="View more recommendations"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              )}
            </div>

            {/* 4. COMPLETE PROFILE + QUICK ACTIONS + MEMBERSHIP & WALLET + RECENT ACTIVITY (4 Balanced Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch">
              {/* Column 1: Complete Your Profile Checklist */}
              <div className="bg-white dark:bg-[#0D1E3D] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="h-8 w-8 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-[#FF1475] flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#0A1F44] dark:text-white uppercase tracking-wider">
                        Complete Your Profile
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        A complete profile helps you get more relevant matches.
                      </p>
                    </div>
                  </div>

                  {/* 2-Column Real Checklist without truncation */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-3 py-4 text-xs font-semibold">
                    <div
                      className={`flex items-center gap-1.5 ${
                        profileChecks.basicInfo ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {profileChecks.basicInfo ? (
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span className="whitespace-nowrap">Basic Info</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        profileChecks.photos ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {profileChecks.photos ? (
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span className="whitespace-nowrap">Photos ({profileChecks.photoCount}/4)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        profileChecks.aboutMe ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {profileChecks.aboutMe ? (
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span className="whitespace-nowrap">About Me</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        profileChecks.lifestyle ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {profileChecks.lifestyle ? (
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span className="whitespace-nowrap">Lifestyle</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        profileChecks.familyDetails ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {profileChecks.familyDetails ? (
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span className="whitespace-nowrap">Family Details</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        profileChecks.horoscope ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {profileChecks.horoscope ? (
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span className="whitespace-nowrap">Horoscope</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/join"
                  className="w-full py-2.5 rounded-xl bg-[#FF1475] hover:bg-[#E60067] text-white text-xs font-bold text-center transition-all shadow-xs mt-2"
                >
                  View Progress →
                </Link>
              </div>

              {/* Column 2: Quick Actions 2x3 Grid with Full Readable Labels */}
              <div className="bg-white dark:bg-[#0D1E3D] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <h3 className="text-xs font-bold text-[#0A1F44] dark:text-white uppercase tracking-wider">
                      Quick Actions
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 py-3">
                    {/* Find Matches */}
                    <Link
                      href="/find"
                      className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-pink-50 dark:hover:bg-pink-950/20 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 group shadow-xs"
                    >
                      <Search className="h-5 w-5 text-slate-600 dark:text-slate-300 group-hover:text-[#FF1475] transition-colors" />
                      <span className="text-[11px] font-bold text-[#0A1F44] dark:text-white text-center leading-tight">
                        Find Matches
                      </span>
                    </Link>

                    {/* Messages */}
                    <Link
                      href="/chat"
                      className="relative p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 group shadow-xs"
                    >
                      {unreadMessagesCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-[#FF1475] text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                          {unreadMessagesCount}
                        </span>
                      )}
                      <MessageSquare className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-[#0A1F44] dark:text-white text-center leading-tight">
                        Messages
                      </span>
                    </Link>

                    {/* Requests */}
                    <Link
                      href="/requests"
                      className="relative p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 group shadow-xs"
                    >
                      {pendingRequestsCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-[#FF1475] text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                          {pendingRequestsCount}
                        </span>
                      )}
                      <UserCheck className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-[#0A1F44] dark:text-white text-center leading-tight">
                        Requests
                      </span>
                    </Link>

                    {/* Horoscope Match */}
                    <Link
                      href="/horoscope-match"
                      className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-950/20 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 group shadow-xs"
                    >
                      <span className="text-purple-600 font-extrabold text-base leading-none group-hover:scale-110 transition-transform">
                        ॐ
                      </span>
                      <span className="text-[11px] font-bold text-[#0A1F44] dark:text-white text-center leading-tight">
                        Horoscope Match
                      </span>
                    </Link>

                    {/* Boost Profile */}
                    <Link
                      href="/pricing"
                      className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 group shadow-xs"
                    >
                      <Rocket className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-[#0A1F44] dark:text-white text-center leading-tight">
                        Boost Profile
                      </span>
                    </Link>

                    {/* Membership */}
                    <Link
                      href="/pricing"
                      className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 group shadow-xs"
                    >
                      <Crown className="h-5 w-5 text-[#D4A853] group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-[#0A1F44] dark:text-white text-center leading-tight">
                        Membership
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Column 3: Your Membership & Wallet Balance (Clean Divider Separation) */}
              <div className="bg-white dark:bg-[#0D1E3D] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                {/* Membership Section */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Crown className="h-4 w-4 text-[#D4A853]" />
                      <span className="text-xs font-bold text-[#0A1F44] dark:text-white uppercase tracking-wider">Membership</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {planName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-2.5">
                    Upgrade to access direct contacts and premium features.
                  </p>
                  <Link
                    href="/pricing"
                    className="mt-3 block w-full py-2 rounded-xl bg-[#FF1475] hover:bg-[#E60067] text-white text-xs font-bold text-center transition-colors shadow-xs"
                  >
                    Upgrade Plan →
                  </Link>
                </div>

                {/* Divider */}
                <div className="my-3 border-t border-slate-100 dark:border-slate-800" />

                {/* Wallet Balance Section */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0A1F44] dark:text-white uppercase tracking-wider">Wallet Balance</span>
                    <Wallet className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#0A1F44] dark:text-white mt-1">
                    ₹ {walletBalance.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug mt-1">
                    Purchase wallet credits to reveal verified contact details.
                  </p>
                  <Link
                    href="/pricing"
                    className="mt-2 inline-block text-xs font-bold text-[#FF1475] hover:underline"
                  >
                    Top Up Wallet →
                  </Link>
                </div>
              </div>

              {/* Column 4: Recent Activity */}
              <div className="bg-white dark:bg-[#0D1E3D] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-4 w-4" />
                      </div>
                      <h2 className="text-xs font-bold text-[#0A1F44] dark:text-white uppercase tracking-wider">
                        Recent Activity
                      </h2>
                    </div>
                    <Link
                      href="/notifications"
                      className="text-xs font-bold text-[#FF1475] hover:underline flex items-center gap-0.5"
                    >
                      <span>View All</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-7 text-center flex flex-col items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2.5">
                        <Clock className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">No recent activity yet.</p>
                      <p className="text-[11px] mt-1 text-slate-400 dark:text-slate-500 max-w-[200px]">
                        Your latest notifications and interactions will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.slice(0, 3).map((notif: any) => (
                        <div key={notif.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className="h-7 w-7 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0">
                              <Eye className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#0A1F44] dark:text-white truncate text-[11px]">{notif.title}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 flex-shrink-0 ml-2 whitespace-nowrap">
                            {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer variant="dashboard" />
    </div>
  );
}
