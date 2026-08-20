"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { auth as clientAuth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { loginAction } from "@/modules/auth/auth.controller";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegisterParam = searchParams.get("register") === "true";

  const [isRegister, setIsRegister] = useState(isRegisterParam);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  // Auth Steps: "phone" | "otp"
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<any>(null);

  useEffect(() => {
    setIsRegister(isRegisterParam);
  }, [isRegisterParam]);

  // Initialize Recaptcha Verifier on component mount
  useEffect(() => {
    if (typeof window !== "undefined" && !recaptchaVerifier) {
      try {
        const verifier = new RecaptchaVerifier(clientAuth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            console.log("Recaptcha verifier successfully initialized.");
          },
        });
        setRecaptchaVerifier(verifier);
      } catch (err) {
        console.warn("Could not initialize Recaptcha verifier:", err);
      }
    }
  }, [recaptchaVerifier]);

  // Request SMS OTP code
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+91${formattedPhone}`;
    }

    if (formattedPhone.length < 12) {
      setError("Please enter a valid 10-digit mobile number.");
      setLoading(false);
      return;
    }

    const isPlaceholderKey =
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "AIzaSyA-dummy-key" ||
      !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("dummy");

    if (isPlaceholderKey) {
      console.log("Sandbox environment detected. Simulating OTP code delivery to:", formattedPhone);
      setTimeout(() => {
        setStep("otp");
        setLoading(false);
      }, 800);
      return;
    }

    try {
      if (!recaptchaVerifier) {
        throw new Error("Recaptcha verifier has not been loaded yet.");
      }
      const confirmation = await signInWithPhoneNumber(clientAuth, formattedPhone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep("otp");
    } catch (err: any) {
      console.error("SMS OTP delivery failed:", err);
      setError(err.message || "Failed to deliver SMS verification code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and invoke Session cookie
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (otpCode.length !== 6) {
      setError("Verification code must be exactly 6 digits.");
      setLoading(false);
      return;
    }

    const isPlaceholderKey =
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "AIzaSyA-dummy-key" ||
      !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("dummy");

    if (isPlaceholderKey) {
      const mockToken = "mock-id-token-12345";
      const result = await loginAction(mockToken);
      if (result.success) {
        router.push(isRegister ? "/join" : "/dashboard");
      } else {
        setError(result.error || "Failed to establish secure session.");
      }
      setLoading(false);
      return;
    }

    try {
      if (!confirmationResult) {
        throw new Error("No active authentication transaction found.");
      }

      const credential = await confirmationResult.confirm(otpCode);
      const user = credential.user;
      const idToken = await user.getIdToken();

      const result = await loginAction(idToken);
      if (result.success) {
        router.push(isRegister ? "/join" : "/dashboard");
      } else {
        setError(result.error || "Failed to create secure session.");
      }
    } catch (err: any) {
      console.error("OTP verification failed:", err);
      setError("Incorrect verification code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Social Google login link
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(clientAuth, provider);
      const idToken = await credential.user.getIdToken();

      const result = await loginAction(idToken);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Failed to establish secure session.");
      }
    } catch (err: any) {
      console.error("Google Auth failed:", err);
      setError("Google authentication was cancelled or failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FCFBF7]">
      {/* Invisible verification wrapper for recaptcha */}
      <div id="recaptcha-container"></div>

      {/* ── Left Split Screen: Deep Maroon Branding Side ────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#5C0A1E] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#C81D45]/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#D4AF37]/20 rounded-full blur-3xl" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Logo variant="light" href="/" />
        </div>

        {/* Center Content Motif */}
        <div className="relative z-10 my-auto text-center flex flex-col items-center max-w-md mx-auto">
          {/* Traditional Nilavilakku / Lamp Vector Art */}
          <div className="h-28 w-28 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-8 shadow-inner">
            <svg viewBox="0 0 64 64" fill="none" className="w-16 h-16 text-[#D4AF37]">
              <path d="M32 8C32 8 24 20 24 28C24 32.4183 27.5817 36 32 36C36.4183 36 40 32.4183 40 28C40 20 32 8 32 8Z" fill="#D4AF37" />
              <path d="M32 14C32 14 28 22 28 26C28 28.2091 29.7909 30 32 30C34.2091 30 36 28.2091 36 26C36 22 32 14 32 14Z" fill="#F59E0B" />
              <rect x="30" y="36" width="4" height="16" fill="#D4AF37" />
              <path d="M20 52H44L40 56H24L20 52Z" fill="#D4AF37" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold font-serif mb-3 tracking-wide">
            Privacy First. Always. Forever.
          </h2>
          <p className="text-sm text-white/80 leading-relaxed max-w-sm">
            Join Kerala's most trusted, verified matrimonial platform with 24-hour consent-based contact reveals.
          </p>

          <div className="mt-8 flex items-center space-x-6 text-xs text-[#E0A899]">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
              <span>100% Verified</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Lock className="h-4 w-4 text-[#D4AF37]" />
              <span>Encrypted Data</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="relative z-10 text-xs text-white/50 text-center">
          © 2026 KeralamMatch Technologies Pvt. Ltd.
        </div>
      </div>

      {/* ── Right Split Screen: Authentication Card Side ────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[rgba(28,28,30,0.08)] shadow-lg">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="lg:hidden mb-6 flex justify-center">
              <Logo href="/" />
            </div>
            <h1 className="text-2xl font-bold text-[#0A1F44]">
              {isRegister ? "Create Your Account" : "Welcome Back!"}
            </h1>
            <p className="text-xs text-[#636366] mt-1">
              {isRegister
                ? "Join the most trusted, premium Malayali matchmaking community."
                : "Please login using your mobile number or Google account."}
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex rounded-full bg-[#FCFBF7] p-1 border border-[rgba(28,28,30,0.08)] mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
                setStep("phone");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                !isRegister ? "bg-[#C81D45] text-white shadow-sm" : "text-[#636366] hover:text-[#0A1F44]"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
                setStep("phone");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                isRegister ? "bg-[#C81D45] text-white shadow-sm" : "text-[#636366] hover:text-[#0A1F44]"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message Box */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center space-x-2 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs text-red-700 mb-6"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phone Step */}
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#636366] mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#0A1F44]">
                    +91
                  </span>
                  <Input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").substring(0, 10))}
                    className="pl-14 rounded-full border-[rgba(28,28,30,0.12)] h-12 text-sm font-medium focus:border-[#C81D45]"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center"
              >
                {loading ? "Sending OTP..." : "Continue with Mobile OTP"}
              </button>
            </form>
          ) : (
            /* OTP Verification Step */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#636366] mb-2 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <Input
                  type="text"
                  placeholder="------"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").substring(0, 6))}
                  className="text-center tracking-widest text-xl font-bold h-12 rounded-full border-[rgba(28,28,30,0.12)] focus:border-[#C81D45]"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-[#636366] text-center mt-2">
                  Code sent to +91 {phoneNumber}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  disabled={loading}
                  className="w-1/2 h-11 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#0A1F44] hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 h-11 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-md"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </div>
            </form>
          )}

          {/* Separator */}
          <div className="relative flex items-center py-5">
            <div className="flex-grow border-t border-[rgba(28,28,30,0.08)]" />
            <span className="flex-shrink mx-4 text-[10px] uppercase font-bold tracking-widest text-[#8E8E93]">
              or continue with
            </span>
            <div className="flex-grow border-t border-[rgba(28,28,30,0.08)]" />
          </div>

          {/* Social Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-11 rounded-full border border-[rgba(28,28,30,0.12)] bg-white hover:bg-gray-50 text-xs font-semibold text-[#1C1C1E] flex items-center justify-center space-x-2 transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span>Google Account</span>
          </button>

          {/* Privacy Note Footer */}
          <div className="mt-8 text-center flex items-center justify-center space-x-1.5 text-[11px] text-[#8E8E93]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#C81D45]" />
            <span>Encrypted Session & Privacy Compliant</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#FCFBF7]">
        <div className="animate-spin rounded-full border-2 border-[#C81D45] border-t-transparent h-8 w-8" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
