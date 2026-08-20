"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/shared/logo";
import { Input } from "@/components/ui/input";
import { Lock, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@keralammatch.com");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Execute admin session auth
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      
      // Navigate to admin portal
      router.push("/admin");
    } catch {
      setError("Admin authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FCFBF7] items-center justify-center p-6 text-[#1C1C1E]">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[rgba(28,28,30,0.08)] shadow-xl relative overflow-hidden">
        
        {/* Top Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <Logo variant="default" href="#" />
          <span className="text-xs font-bold text-[#C81D45] uppercase tracking-widest mt-2">Admin Portal</span>
          <p className="text-xs text-[#636366] mt-1">Secure access to KeralamMatch Admin Panel</p>
        </div>

        {/* Traditional Lamp Motif Art */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-[#FCFBF7] border border-[rgba(28,28,30,0.08)] flex items-center justify-center">
            <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-[#D4AF37]">
              <path d="M32 8C32 8 24 20 24 28C24 32.4183 27.5817 36 32 36C36.4183 36 40 32.4183 40 28C40 20 32 8 32 8Z" fill="#D4AF37" />
              <path d="M32 14C32 14 28 22 28 26C28 28.2091 29.7909 30 32 30C36.4183 30 38 28.2091 38 26C38 22 32 14 32 14Z" fill="#F59E0B" />
              <rect x="30" y="36" width="4" height="16" fill="#D4AF37" />
              <path d="M20 52H44L40 56H24L20 52Z" fill="#D4AF37" />
            </svg>
          </div>
        </div>

        {error && (
          <div className="mb-6 text-xs text-red-600 bg-red-50 p-4 rounded-2xl border border-red-200 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#636366] mb-2">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="admin@keralammatch.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-full h-12 text-xs font-medium"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#636366] mb-2">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-full h-12 text-xs font-medium"
              required
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded text-[#C81D45]"
              />
              <span className="text-[#636366]">Remember me</span>
            </label>
            <a href="#" className="text-[#0A369D] hover:underline font-semibold">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Lock className="h-4 w-4" />
            <span>{loading ? "Authenticating..." : "Login"}</span>
          </button>
        </form>

        {/* Security Footer */}
        <div className="mt-8 text-center flex items-center justify-center space-x-1.5 text-[11px] text-[#8E8E93]">
          <ShieldCheck className="h-4 w-4 text-[#C81D45]" />
          <span>Secure Admin Access</span>
        </div>

      </div>
    </div>
  );
}
