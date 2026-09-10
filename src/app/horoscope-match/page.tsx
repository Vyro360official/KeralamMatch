import React from "react";
import Link from "next/link";
export const dynamic = "force-dynamic";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { getProfileDetailsAction, searchProfilesAction } from "@/modules/profile/profile.controller";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import HoroscopeMatchView from "./horoscope-match-view";

export const metadata = {
  title: "Horoscope Compatibility Match | KeralamMatch",
  description: "Calculate authentic Kerala 10-Porutham horoscope compatibility with registered profiles or non-registered candidates.",
};

export default async function HoroscopeMatchPage() {
  const session = await getSessionAction();

  if (!session.isAuthenticated || !session.user) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FCFBF7] items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-[#0A1F44] mb-4">Please log in to check horoscope compatibility</h2>
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
  const profile = profileResult.success ? profileResult.profile : null;

  const targetGender = profile?.gender === "MALE" ? "FEMALE" : "MALE";
  const candidatesResult = await searchProfilesAction(
    {
      gender: targetGender,
    },
    1,
    12
  );

  const candidates =
    candidatesResult.success && (candidatesResult as any).results
      ? (candidatesResult as any).results
      : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] dark:bg-[#07132B] text-[#1C1C1E] dark:text-white transition-colors">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 mb-16 lg:mb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar Navigation */}
          <DashboardSidebar userProfile={profile} />

          {/* Main Content Area */}
          <main className="lg:col-span-9">
            <HoroscopeMatchView
              userProfile={profile}
              initialCandidates={candidates}
            />
          </main>
        </div>
      </div>

      <Footer variant="dashboard" />
    </div>
  );
}
