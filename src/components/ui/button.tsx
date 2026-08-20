"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

// Create cn helper if not present
export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "type"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  type?: "button" | "submit" | "reset";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, type = "button", children, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center rounded-full font-medium tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
    
    const variants = {
      primary: "bg-brand-primary text-white hover:bg-brand-primary-hover shadow-premium",
      secondary: "bg-bg-tertiary text-text-primary hover:bg-border-subtle",
      outline: "border border-border-subtle text-text-primary hover:border-text-primary/20",
      ghost: "text-text-secondary hover:text-text-primary hover:bg-border-subtle",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
    };

    return (
      <motion.button
        ref={ref as any}
        type={type}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading}
        {...props as any}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
