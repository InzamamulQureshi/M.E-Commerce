import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181513] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variants = {
      default:
        "bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white shadow-sm hover:shadow",
      accent:
        "bg-[#A64732] text-white hover:bg-[#8E3B29] dark:bg-[#E07A5F] dark:hover:bg-[#C85A42] shadow-sm hover:shadow",
      secondary:
        "bg-[#EFEAE1] text-[#181513] hover:bg-[#E4DCD0] border border-[#DDD5C7] dark:bg-[#25211E] dark:text-[#FAF8F5] dark:border-[#38322D] dark:hover:bg-[#2E2925]",
      outline:
        "border border-[#DDD5C7] bg-transparent text-[#181513] hover:border-[#181513] hover:bg-[#FAF8F5] dark:border-[#38322D] dark:text-[#FAF8F5] dark:hover:border-[#FAF8F5] dark:hover:bg-[#1A1715]",
      ghost:
        "hover:bg-[#EFEAE1] text-[#181513] dark:text-[#FAF8F5] dark:hover:bg-[#25211E]",
      link: "text-[#A64732] dark:text-[#E07A5F] underline-offset-4 hover:underline p-0 h-auto normal-case tracking-normal",
    };

    const sizes = {
      default: "h-10 px-5 py-2",
      sm: "h-8 rounded-lg px-3.5 text-xs tracking-normal normal-case font-medium",
      lg: "h-12 rounded-xl px-7 text-sm font-semibold",
      icon: "h-10 w-10 rounded-xl p-0",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
