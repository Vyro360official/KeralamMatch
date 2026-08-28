"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { 
  checkoutSubscriptionAction, 
  checkoutWalletTopUpAction 
} from "@/modules/payments/payments.controller";
import { getMembershipPlansAction } from "@/modules/subscription/subscription.controller";
import { Check, Crown, Shield, Star, Coins, AlertCircle, ShieldCheck } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlans() {
      const result = await getMembershipPlansAction();
      if (result.success && result.plans) {
        setPlans(result.plans);
      }
    }
    loadPlans();
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckoutPlan = async (planId: string) => {
    setLoading(true);
    setPayingPlanId(planId);
    setError(null);

    const result = await checkoutSubscriptionAction(planId);
    if (!result.success || !result.order) {
      setError(result.error || "Failed to initiate payment checkout.");
      setLoading(false);
      setPayingPlanId(null);
      return;
    }

    const order = result.order;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
      amount: order.amount,
      currency: order.currency,
      name: "KeralamMatch",
      description: "Premium Membership Upgrade",
      order_id: order.id,
      handler: function () {
        router.push("/pricing/success");
      },
      theme: { color: "#C81D45" },
    };

    if (order.id.startsWith("order_mock_")) {
      setTimeout(() => {
        router.push("/pricing/success");
      }, 1500);
      return;
    }

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function () {
        setError("Payment authorization failed on Razorpay servers.");
      });
      rzp.open();
    } catch {
      setError("Razorpay integration script failed to execute.");
    } finally {
      setLoading(false);
      setPayingPlanId(null);
    }
  };

  const handleBuyCredits = async (amountPaise: number) => {
    setLoading(true);
    setError(null);

    const result = await checkoutWalletTopUpAction(amountPaise);
    if (!result.success || !result.order) {
      setError(result.error || "Failed to initiate top-up.");
      setLoading(false);
      return;
    }

    const order = result.order;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
      amount: order.amount,
      currency: order.currency,
      name: "KeralamMatch",
      description: "Wallet Credits Recharge",
      order_id: order.id,
      handler: function () {
        router.push("/pricing/success");
      },
      theme: { color: "#C81D45" },
    };

    if (order.id.startsWith("order_mock_")) {
      setTimeout(() => {
        router.push("/pricing/success");
      }, 1500);
      return;
    }

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] text-[#1C1C1E]">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 mb-16 lg:mb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar Navigation */}
          <DashboardSidebar />

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-12">
            
            {/* Page Header (Matching Reference 1.10) */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C81D45]">Membership Upgrade</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#0A1F44]">Choose Your Plan</h1>
              <p className="text-xs text-[#636366]">
                Upgrade to unlock unlimited contact reveals, direct encrypted chat, and priority verifications.
              </p>
            </div>

            {error && (
              <div className="max-w-md mx-auto text-xs text-red-600 bg-red-50 p-4 rounded-2xl border border-red-200 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Pricing Cards Grid (Matching Reference 1.10) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {plans.map((p) => {
                const isGold = p.name === "Premium Gold" || p.name.toLowerCase().includes("gold");
                const priceRupees = Math.round(p.price / 100);
                const features = p.features || {};

                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-3xl p-6 border flex flex-col justify-between relative shadow-sm transition-all ${
                      isGold
                        ? "border-[#D4AF37] shadow-xl scale-[1.02] ring-2 ring-[#D4AF37]/20"
                        : "border-[rgba(28,28,30,0.08)]"
                    }`}
                  >
                    <div>
                      {isGold && (
                        <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-amber-500 text-white text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                          <Crown className="h-3 w-3 fill-white" /> Popular
                        </span>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-[#0A1F44]">{p.name}</h3>
                          <span className="text-[10px] text-[#8E8E93] font-semibold">{p.durationDays} Days Duration</span>
                        </div>
                        <div className="h-9 w-9 rounded-xl bg-[#C81D45]/10 flex items-center justify-center text-[#C81D45]">
                          <Crown className="h-5 w-5 fill-current" />
                        </div>
                      </div>

                      <div className="mt-4 flex items-baseline">
                        <span className="text-2xl font-extrabold text-[#0A1F44]">₹{priceRupees}</span>
                        <span className="text-[10px] text-[#8E8E93] font-semibold ml-1">/ one-time</span>
                      </div>

                      <ul className="mt-6 space-y-2.5 text-[11px] font-medium text-[#636366]">
                        <li className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <span><strong>{features.contactLimit === 9999 ? "Unlimited" : features.contactLimit}</strong> contact reveals</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <span><strong>{features.profileViewsLimit || 100}</strong> profile visits/day</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <span>{features.chatEnabled ? "Direct Messaging active" : "Messaging disabled"}</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <span>{features.verifiedOnlySearch ? "Filter by verified profiles" : "Standard search filters"}</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <span>Encrypted in-app chat</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={() => handleCheckoutPlan(p.id)}
                        disabled={loading}
                        className={`w-full h-11 rounded-full text-xs font-bold shadow-md transition-all ${
                          isGold
                            ? "bg-[#C81D45] hover:bg-[#A51436] text-white"
                            : "border border-[rgba(28,28,30,0.12)] text-[#0A1F44] hover:bg-gray-50"
                        }`}
                      >
                        {loading && payingPlanId === p.id ? "Processing..." : "Choose Plan"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Security & Guarantee Trust Bar */}
            <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="flex items-center space-x-4">
                <ShieldCheck className="h-8 w-8 text-[#C81D45] flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-[#0A1F44]">100% Secure Payment Guarantee</h4>
                  <p className="text-xs text-[#636366]">Encrypted via Razorpay SSL. Cancel anytime from profile settings.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleBuyCredits(9900)}
                  className="px-5 py-2.5 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#0A1F44] hover:bg-gray-50"
                >
                  Buy 1 Reveal (₹99)
                </button>
                <button
                  onClick={() => handleBuyCredits(49900)}
                  className="px-5 py-2.5 rounded-full bg-[#0A369D] text-white text-xs font-bold shadow-sm"
                >
                  Buy 5 Reveals (₹499)
                </button>
              </div>
            </div>

          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
