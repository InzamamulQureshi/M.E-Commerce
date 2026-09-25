"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({
  className = "",
  variant = "switch",
}: {
  className?: string;
  variant?: "switch" | "circle";
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    if (stored) {
      setTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    if (variant === "circle") {
      return (
        <div
          className={`w-8 h-8 rounded-full border border-[#DDD5C7] dark:border-[#2E2925] bg-white/60 dark:bg-[#1A1715]/60 opacity-60 shrink-0 ${className}`}
        />
      );
    }
    return (
      <div
        className={`w-[48px] h-[26px] rounded-full bg-[#EDE7DE] dark:bg-[#141821] border border-[#DDD5C7] dark:border-[#262E3D] opacity-60 shrink-0 ${className}`}
      />
    );
  }

  const isDark = theme === "dark";

  // Circular toggle button for phone header and compact placements
  if (variant === "circle") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`p-1.5 sm:p-2 rounded-full border border-[#DDD5C7] dark:border-[#2E2925] bg-white dark:bg-[#1A1715] text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F] hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-all shadow-xs flex items-center justify-center shrink-0 ${className}`}
        title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
        aria-label="Toggle Theme"
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-amber-400 transition-transform hover:-rotate-12 stroke-[2.2]" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform hover:rotate-45 stroke-[2.2]" />
        )}
      </button>
    );
  }

  // Sliding switch pill for desktop header - smooth sliding circle with bold visible icons matching reference image
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      aria-label="Toggle theme"
      className={`relative inline-flex items-center w-[48px] h-[26px] rounded-full p-[2px] transition-colors duration-300 ease-in-out cursor-pointer select-none shrink-0 border ${
        isDark
          ? "bg-[#141821] border-[#262E3D]"
          : "bg-[#EDE7DE] border-[#DDD5C7]"
      } ${className}`}
    >
      {/* Sliding Circular Thumb */}
      <span
        className={`pointer-events-none flex items-center justify-center w-[20px] h-[20px] rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
          isDark
            ? "translate-x-[24px] bg-[#0C0F15] text-white"
            : "translate-x-0 bg-white text-amber-500"
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-white stroke-[2.2]" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500 stroke-[2.2]" />
        )}
      </span>
    </button>
  );
}
