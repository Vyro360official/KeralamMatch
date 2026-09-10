import React from "react";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import MatrimonialLogoLoader from "@/components/ui/matrimonial-logo-loader";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] dark:bg-[#07132B] text-[#1C1C1E] dark:text-white transition-colors">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 mb-16 lg:mb-0 flex items-center justify-center">
        <div className="bg-white dark:bg-[#0D1E3D] rounded-3xl p-12 sm:p-16 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center max-w-md w-full">
          <MatrimonialLogoLoader
            size="md"
            text="Loading Your Dashboard..."
            subtext="Preparing your personalized Malayali matches and statistics"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
