import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "accent" | "wax";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-craft-sage/15 text-craft-sage border border-craft-sage/30",
    accent: "bg-craft-terracotta/15 text-craft-terracotta border border-craft-terracotta/30",
    secondary: "bg-[#EAE0D2] text-[#4A4036] border border-[#DCD0BE]",
    outline: "text-foreground border border-border",
    wax: "bg-[#962A20] text-amber-100 shadow-sm border border-[#7D221A] font-medium",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
