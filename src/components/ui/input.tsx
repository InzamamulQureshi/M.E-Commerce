import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[#DDD5C7] dark:border-[#2E2925] bg-[#FAF8F5] dark:bg-[#1A1715] px-3.5 py-2 text-xs font-medium text-[#181513] dark:text-[#FAF8F5] placeholder:text-[#9A9185] dark:placeholder:text-[#6E665D] transition-all duration-200 focus-visible:outline-none focus-visible:border-[#181513] dark:focus-visible:border-[#FAF8F5] focus-visible:bg-white dark:focus-visible:bg-[#221E1B] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
