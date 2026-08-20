import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, AlertTriangle, Heart, PhoneCall, HelpCircle, UserX, FileText } from "lucide-react";

export const metadata = {
  title: "Trust & Safety | KeralamMatch",
  description: "How KeralamMatch protects your privacy, prevents fraud, and keeps our community safe.",
};

export default function TrustPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] text-[#1C1C1E]">
      <Header />

      <main className="flex-1">
        {/* Hero Section (Matching Reference 1.12) */}
        <section className="py-16 sm:py-20 bg-white border-b border-[rgba(28,28,30,0.08)]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-[#C81D45]/10 text-[#C81D45] flex items-center justify-center mx-auto">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0A1F44]">Your Safety Comes First</h1>
            <p className="text-xs sm:text-sm text-[#636366] leading-relaxed">
              KeralamMatch is built on privacy, mutual consent, and genuine human connections. Discover how our multi-layer verification and 24-hour ephemeral reveal system protect you.
            </p>
          </div>
        </section>

        {/* Safety Cards Grid (Matching Reference 1.12) */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white rounded-3xl p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-3">
                <div className="flex items-center space-x-3 text-[#C81D45]">
                  <ShieldCheck className="h-6 w-6" />
                  <h3 className="text-sm font-bold text-[#0A1F44]">Verified Profiles</h3>
                </div>
                <p className="text-xs text-[#636366] leading-relaxed">
                  Every account undergoes Mobile OTP verification, selfie liveness detection, and optional Aadhaar ID checks before receiving a verified badge.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-3">
                <div className="flex items-center space-x-3 text-[#C81D45]">
                  <Lock className="h-6 w-6" />
                  <h3 className="text-sm font-bold text-[#0A1F44]">Contact Reveal Protection</h3>
                </div>
                <p className="text-xs text-[#636366] leading-relaxed">
                  Your phone number and email are encrypted at rest. They are only decrypted for 24 hours after mutual consent is granted.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-3">
                <div className="flex items-center space-x-3 text-[#C81D45]">
                  <AlertTriangle className="h-6 w-6" />
                  <h3 className="text-sm font-bold text-[#0A1F44]">Report & Moderation</h3>
                </div>
                <p className="text-xs text-[#636366] leading-relaxed">
                  Flag suspicious behavior or fake profiles using our in-app Report tool. Our safety team reviews all reports within 24 hours.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-3">
                <div className="flex items-center space-x-3 text-[#C81D45]">
                  <UserX className="h-6 w-6" />
                  <h3 className="text-sm font-bold text-[#0A1F44]">Instant Blocking</h3>
                </div>
                <p className="text-xs text-[#636366] leading-relaxed">
                  Block any user with a single click. Blocked members can no longer view your profile, send requests, or message you.
                </p>
              </div>

            </div>

            {/* Need Help / Contact Support CTA Banner (Matching Reference 1.12) */}
            <div className="mt-12 bg-white rounded-3xl p-8 border border-[rgba(28,28,30,0.08)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <HelpCircle className="h-8 w-8 text-[#C81D45] flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-[#0A1F44]">Need Assistance?</h4>
                  <p className="text-xs text-[#636366]">Our dedicated customer support team is available 24/7 to assist you.</p>
                </div>
              </div>

              <Link
                href="/faq"
                className="px-6 py-3 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-md transition-all whitespace-nowrap"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
