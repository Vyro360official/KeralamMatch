import React from "react";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import MatrimonialLogoLoader from "@/components/ui/matrimonial-logo-loader";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] text-[#1C1C1E]">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 mb-16 lg:mb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar Skeleton */}
          <aside className="hidden lg:block lg:col-span-3 w-full">
            <div className="space-y-4">
              {/* User Mini Profile Header Skeleton */}
              <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-white border border-[rgba(28,28,30,0.06)] animate-pulse">
                <div className="h-11 w-11 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="flex-grow space-y-2">
                  <div className="h-4 bg-slate-200 rounded-sm w-3/4" />
                  <div className="h-3 bg-slate-200 rounded-sm w-1/2" />
                </div>
              </div>

              {/* Navigation Items Skeleton */}
              <div className="space-y-1.5 p-2 bg-white rounded-2xl border border-[rgba(28,28,30,0.06)] animate-pulse">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-9 bg-slate-100 rounded-xl" />
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content Area Skeleton */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Branded Loading Card */}
            <div className="bg-white rounded-3xl p-8 border border-[rgba(28,28,30,0.06)] shadow-xs flex flex-col items-center justify-center text-center">
              <MatrimonialLogoLoader
                size="md"
                text="Loading Your Dashboard..."
                subtext="Preparing your personalized Malayali matches and statistics"
              />
            </div>

            {/* KPI Statistics Row (5 cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 border border-[rgba(28,28,30,0.06)] shadow-xs space-y-2 animate-pulse"
                >
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                  <div className="h-6 w-10 bg-slate-200 rounded" />
                  <div className="h-8 w-8 rounded-lg bg-slate-100" />
                </div>
              ))}
            </div>

            {/* Top Match Suggestions Row (3 cards) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 w-44 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-[rgba(28,28,30,0.06)] overflow-hidden shadow-xs animate-pulse flex flex-col"
                  >
                    <div className="aspect-[4/5] bg-slate-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 w-3/4 bg-slate-200 rounded" />
                      <div className="h-3 w-1/2 bg-slate-100 rounded" />
                      <div className="h-8 bg-slate-100 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Profile Progress Bar Skeleton */}
            <div className="bg-white rounded-2xl p-6 border border-[rgba(28,28,30,0.06)] shadow-xs flex flex-col sm:flex-row items-center gap-6 animate-pulse">
              <div className="h-20 w-20 rounded-full bg-slate-200 flex-shrink-0" />
              <div className="flex-1 space-y-2 w-full">
                <div className="h-4 w-1/3 bg-slate-200 rounded" />
                <div className="h-3 w-2/3 bg-slate-100 rounded" />
              </div>
            </div>

          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
