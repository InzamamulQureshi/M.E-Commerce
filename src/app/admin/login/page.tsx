"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@mecommerce.dev");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          secretPasscode: password.trim(), // Supports master key in password field as well
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Access Denied. Invalid admin credentials.");
      } else {
        router.push("/admin/dashboard");
      }
    } catch {
      setError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#12100E] flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#E5DFD4] dark:border-[#2E2925] rounded-3xl shadow-xl p-8 sm:p-10 space-y-6">
        {/* Header - Clean editorial styling without lock box */}
        <div className="text-center space-y-1.5">
          <span className="text-[10px] font-semibold text-[#A64732] dark:text-[#E07A5F] uppercase tracking-[0.24em] block">
            M.E-Commerce • Administration
          </span>
          <h1 className="font-bold tracking-tight text-2xl sm:text-3xl text-[#181513] dark:text-[#FAF8F5]">
            Admin Portal
          </h1>
          <p className="text-xs text-[#6E665D] dark:text-[#A89F91] max-w-xs mx-auto">
            Sign in to manage catalog items, customer orders, reviews, and store fulfillment.
          </p>
        </div>

        {/* Clean Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#786F64] dark:text-[#A89F91] mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mecommerce.dev"
              className="w-full h-12 px-4 rounded-xl border border-[#DDD5C7] dark:border-[#38322D] bg-white dark:bg-[#12100E] text-sm text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#786F64] dark:text-[#A89F91] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password or master key..."
              className="w-full h-12 px-4 rounded-xl border border-[#DDD5C7] dark:border-[#38322D] bg-white dark:bg-[#12100E] text-sm text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
            />
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#181513] dark:bg-[#FAF8F5] hover:bg-[#A64732] dark:hover:bg-[#E07A5F] text-[#FAF8F5] dark:text-[#181513] dark:hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <span>{loading ? "Signing In..." : "Sign In to Studio Portal"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => router.push("/")}
            className="text-xs font-medium uppercase tracking-wider text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5] transition-colors"
          >
            ← Return to Public Storefront
          </button>
        </div>
      </div>
    </div>
  );
}
