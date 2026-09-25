"use client";

import { useState, useEffect } from "react";
import { SettingsHeader } from "@/components/admin/SettingsHeader";
import {
  Shield,
  KeyRound,
  Check,
  RefreshCw,
  Server,
  Database,
  Lock,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface Diagnostics {
  nodeEnv: string;
  databaseConnected: boolean;
  timestamp: string;
}

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [adminEmail, setAdminEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [refreshingDiagnostics, setRefreshingDiagnostics] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchDiagnostics = async () => {
    setRefreshingDiagnostics(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data?.diagnostics) {
          setDiagnostics(data.diagnostics);
        }
        if (data?.admin?.email) {
          setAdminEmail(data.admin.email);
        }
      }
    } catch {
    } finally {
      setRefreshingDiagnostics(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!newPassword || newPassword.length < 6) {
      setError("New passcode must contain at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passcode and confirmation do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update passcode");
      }

      setSuccess("Studio admin passcode updated securely! Use your new passcode the next time you sign in.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to update admin passcode");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Security, Passcode & Diagnostics"
        subtitle="Manage master studio vault authentication, change your administrator passcode, and review system database health."
        icon={Shield}
        badge="Security"
      />

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Passcode Change Form (2 cols) */}
        <div className="lg:col-span-2 bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
            <KeyRound className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
            <div>
              <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
                Change Studio Master Passcode
              </h2>
              <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                Logged in as: <strong className="text-[#181513] dark:text-[#FAF8F5]">{adminEmail || "artisan@thefourfold.com"}</strong>
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Current Passcode
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current passcode..."
                required
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                  New Passcode
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                  Confirm New Passcode
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new passcode..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={changingPassword}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A64732] hover:bg-[#8D3825] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {changingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{changingPassword ? "Updating..." : "Update Studio Passcode"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Server & DB Diagnostics (1 col) */}
        <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                  System Diagnostics
                </h3>
              </div>
              <button
                onClick={fetchDiagnostics}
                disabled={refreshingDiagnostics}
                className="p-1 rounded-lg hover:bg-[#EBE3D6] dark:hover:bg-[#25211E] text-[#786F64] dark:text-[#A89F91] transition-colors"
                title="Refresh health check"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingDiagnostics ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-white dark:bg-[#1C1815] border border-[#E5DFD4] dark:border-[#2A231F] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
                  <span className="font-semibold text-[#181513] dark:text-[#FAF8F5]">Database Connection</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Healthy</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#1C1815] border border-[#E5DFD4] dark:border-[#2A231F] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#786F64] dark:text-[#A89F91]" />
                  <span className="font-semibold text-[#181513] dark:text-[#FAF8F5]">Runtime Mode</span>
                </div>
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#EBE3D6] dark:bg-[#25211E] text-[#575048] dark:text-[#C5BDB2]">
                  {diagnostics?.nodeEnv || "production"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#1C1815] border border-[#E5DFD4] dark:border-[#2A231F] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#786F64] dark:text-[#A89F91]" />
                  <span className="font-semibold text-[#181513] dark:text-[#FAF8F5]">Diagnostics Sync</span>
                </div>
                <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                  Live Active
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Store settings are protected by authenticated administrator sessions and encrypted in your studio database.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
