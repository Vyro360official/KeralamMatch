import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  variant?: "default" | "admin" | "light" | "compact";
  className?: string;
  href?: string;
}

export default function Logo({ variant = "default", className = "", href = "/" }: LogoProps) {
  const isDarkBg = variant === "admin" || variant === "light";

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official 3D Nilavilakku & Lotus Emblem */}
      <div className="relative flex items-center justify-center h-9 w-9 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-[#0A1F44]">
        <Image
          src="/KM LOGO.png"
          alt="KeralamMatch Emblem"
          width={36}
          height={36}
          className="object-cover h-full w-full"
          priority
        />
      </div>

      {/* Brand Logotype */}
      {variant !== "compact" && (
        <div className="flex flex-col leading-none">
          <span className={`text-lg font-bold tracking-tight ${isDarkBg ? "text-white" : "text-[#0A1F44]"}`}>
            Keralam<span className="text-[#C81D45]">Match</span>
          </span>
          {variant === "admin" && (
            <span className="text-[10px] uppercase font-semibold tracking-widest text-[#D4AF37] mt-0.5">
              Admin Portal
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
