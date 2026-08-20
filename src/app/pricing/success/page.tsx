"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-bg-primary px-6 text-center">
      <div className="max-w-md w-full premium-card p-12 bg-bg-secondary space-y-6">
        
        {/* Animated green icon */}
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />

        <h1 className="text-2xl font-bold text-text-primary">Payment Successful</h1>
        
        <p className="text-sm text-text-secondary leading-relaxed">
          Thank you for your purchase! Your transactions have been captured and verified. Tier adjustments and credit boosts have been applied to your account.
        </p>

        <div className="pt-4 flex flex-col space-y-3">
          <Link href="/dashboard" className="w-full">
            <Button variant="primary" className="w-full justify-center">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/find" className="w-full">
            <Button variant="outline" className="w-full justify-center">
              Explore Matches
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center space-x-2 text-[10px] text-text-tertiary">
          <ShieldCheck className="h-3.5 w-3.5 text-accent-rose" />
          <span>Fulfillment verified and active.</span>
        </div>

      </div>
    </div>
  );
}
