"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/shared/logo";

export default function Header() {
  const [session, setSession] = useState<{ isAuthenticated: boolean; user: any | null }>({
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        setSession(data);
      } catch (err) {
        console.warn("Could not retrieve active session:", err);
      }
    }
    checkSession();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(28,28,30,0.08)] bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo href={session.isAuthenticated ? "/dashboard" : "/"} />

        {/* Navigation Middle Links */}
        <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold uppercase tracking-wider text-[#636366]">
          <Link href={session.isAuthenticated ? "/dashboard" : "/"} className="hover:text-[#0A1F44] transition-colors">
            {session.isAuthenticated ? "Dashboard" : "Home"}
          </Link>
          <Link href="/find" className="hover:text-[#0A1F44] transition-colors">Find Matches</Link>
          <Link href="/trust#how-it-works" className="hover:text-[#0A1F44] transition-colors">How It Works</Link>
          <Link href="/pricing" className="hover:text-[#0A1F44] transition-colors">Pricing</Link>
          <Link href="/trust" className="hover:text-[#0A1F44] transition-colors">Trust & Safety</Link>
          <Link href="/blog" className="hover:text-[#0A1F44] transition-colors">Blog</Link>
        </nav>

        {/* Auth CTAs */}
        <div className="flex items-center space-x-3">
          {session.isAuthenticated && session.user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-5 py-2 text-xs font-bold text-white bg-[#C81D45] hover:bg-[#A51436] rounded-full shadow-sm transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth"
                className="text-xs font-semibold text-[#1C1C1E] hover:text-[#C81D45] px-3 py-2 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth?register=true"
                className="inline-flex items-center justify-center px-5 py-2 text-xs font-bold text-white bg-[#C81D45] hover:bg-[#A51436] rounded-full shadow-sm transition-all"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
