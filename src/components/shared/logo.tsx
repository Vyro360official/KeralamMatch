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
      {/* Official Matrimonial Emblem */}
      <div className="relative flex items-center justify-center h-9 w-9 flex-shrink-0">
        <Image
          src="/brand/emblem.png"
          alt="KeralamMatch Emblem"
          width={36}
          height={36}
          className="object-contain h-full w-full drop-shadow-xs"
          priority
        />
      </div>

      {/* Brand Logotype */}
      {variant !== "compact" && (
        <div className="flex items-center gap-1.5">
          <Image
            src="/brand/logotype.png"
            alt="Keralam Match"
            width={160}
            height={24}
            className={`h-6 w-auto object-contain ${isDarkBg ? "brightness-110 drop-shadow-xs" : ""}`}
            priority
          />
          {variant === "admin" && (
            <span className="text-[10px] uppercase font-semibold tracking-widest text-[#D4AF37] px-1.5 py-0.5 rounded-sm bg-amber-950/60 border border-amber-500/30">
              Admin
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
