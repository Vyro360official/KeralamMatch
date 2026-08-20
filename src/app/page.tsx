import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionAction } from "@/modules/auth/auth.controller";
import { ShieldCheck, Lock, Sparkles, MessageCircle, Heart, Users, CheckCircle2, PhoneCall } from "lucide-react";

export default async function Home() {
  const session = await getSessionAction();
  if (session.isAuthenticated && session.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7]">
      {/* Navigation Header */}
      <Header />

      <main className="flex-1">
        {/* ── Hero Section ────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Headlines & Action CTAs */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                
                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0A1F44] leading-[1.15] mb-6 font-serif">
                  Find Your Perfect Match, <br />
                  <span className="text-[#C81D45]">the Malayali Way.</span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-[#636366] max-w-xl leading-relaxed mb-8">
                  A privacy-first matrimonial platform for Malayalis who value trust, safety and meaningful connections.
                </p>

                {/* Trust Badges Row */}
                <div className="flex flex-wrap items-center gap-3 mb-10 text-xs font-semibold text-[#1C1C1E]">
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-[rgba(28,28,30,0.08)] shadow-sm">
                    <ShieldCheck className="h-4 w-4 text-[#C81D45]" />
                    <span>Privacy First</span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-[rgba(28,28,30,0.08)] shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
                    <span>Verified Profiles</span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-[rgba(28,28,30,0.08)] shadow-sm">
                    <PhoneCall className="h-4 w-4 text-[#0A369D]" />
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-[rgba(28,28,30,0.08)] shadow-sm">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span>100% Secure</span>
                  </div>
                </div>

                {/* Primary & Secondary CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <Link
                    href="/auth?register=true"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white bg-[#C81D45] hover:bg-[#A51436] rounded-full shadow-md hover:shadow-lg transition-all"
                  >
                    Create Your Profile
                  </Link>
                  <Link
                    href="/trust#how-it-works"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-[#0A1F44] bg-white border border-[rgba(28,28,30,0.12)] hover:border-[#0A1F44] rounded-full transition-all"
                  >
                    How It Works
                  </Link>
                </div>

              </div>

              {/* Right Column: Authentic Kerala Couple Portrait */}
              <div className="lg:col-span-5 relative flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  {/* Realistic Kerala Matrimonial Couple Image */}
                  <img
                    src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800"
                    alt="Kerala Matrimonial Couple in Kasavu Attire"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Floating Trust Pill Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-white/50 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#0A1F44]">Verified Malayali Matches</div>
                      <div className="text-[10px] text-[#636366]">Kerala & Global NRI Community</div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-[#C81D45]/10 flex items-center justify-center text-[#C81D45]">
                      <Heart className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Dark Maroon / Deep Navy Stat Bar ────────────────────────── */}
        <section className="bg-[#5C0A1E] text-white py-8 border-y border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-2 text-2xl sm:text-3xl font-extrabold text-[#E0A899]">
                  <Users className="h-6 w-6 text-[#D4AF37]" />
                  <span>50,000+</span>
                </div>
                <span className="text-xs text-white/80 font-medium mt-1 uppercase tracking-wider">Happy Members</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-2 text-2xl sm:text-3xl font-extrabold text-[#E0A899]">
                  <Heart className="h-6 w-6 text-[#D4AF37]" />
                  <span>100+</span>
                </div>
                <span className="text-xs text-white/80 font-medium mt-1 uppercase tracking-wider">Communities</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-2 text-2xl sm:text-3xl font-extrabold text-[#E0A899]">
                  <ShieldCheck className="h-6 w-6 text-[#D4AF37]" />
                  <span>98%</span>
                </div>
                <span className="text-xs text-white/80 font-medium mt-1 uppercase tracking-wider">Verified Profiles</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-2 text-2xl sm:text-3xl font-extrabold text-[#E0A899]">
                  <PhoneCall className="h-6 w-6 text-[#D4AF37]" />
                  <span>24/7</span>
                </div>
                <span className="text-xs text-white/80 font-medium mt-1 uppercase tracking-wider">Customer Support</span>
              </div>

            </div>
          </div>
        </section>

        {/* ── Feature Highlights Section ──────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C81D45]">Why KeralamMatch</span>
              <h2 className="text-3xl font-bold tracking-tight text-[#0A1F44] mt-2">
                Built for Trust, Privacy & Elegance
              </h2>
              <p className="text-sm text-[#636366] mt-3">
                No public spam boards. No unrequested calls. Total control over who sees your profile and contact details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="p-8 rounded-3xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.08)] flex flex-col items-start space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-[#C81D45]/10 flex items-center justify-center text-[#C81D45]">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0A1F44]">24h Ephemeral Reveal</h3>
                <p className="text-xs text-[#636366] leading-relaxed">
                  Your mobile number is hidden until you accept a contact request. Access automatically expires after 24 hours.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.08)] flex flex-col items-start space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0A1F44]">Multi-Layer Verification</h3>
                <p className="text-xs text-[#636366] leading-relaxed">
                  Every account goes through Mobile OTP, Selfie Liveness detection, and optional Aadhaar verification.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-[#FCFBF7] border border-[rgba(28,28,30,0.08)] flex flex-col items-start space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-[#0A369D]/10 flex items-center justify-center text-[#0A369D]">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0A1F44]">Encrypted In-App Chat</h3>
                <p className="text-xs text-[#636366] leading-relaxed">
                  Chat safely inside KeralamMatch before deciding to exchange phone numbers or meet in person.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Structured Footer */}
      <Footer />
    </div>
  );
}
