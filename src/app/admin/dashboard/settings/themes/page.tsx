"use client";

import { useState, useEffect } from "react";
import { SettingsHeader } from "@/components/admin/SettingsHeader";
import {
  Palette,
  Check,
  Save,
  RefreshCw,
  Sparkles,
  Info,
  Sun,
  Moon,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const THEME_PRESETS = [
  {
    id: "warm-terracotta",
    name: "Warm Terracotta",
    badge: "Atelier Signature",
    description: "Museum warm bone, high-fashion charcoal, and refined terracotta sealing wax.",
    light: { bg: "#FAF8F5", primary: "#181513", accent: "#A64732" },
    dark: { bg: "#12100E", primary: "#FAF8F5", accent: "#C85A42" },
  },
  {
    id: "botanical-sage",
    name: "Botanical Sage",
    badge: "Forest Flora",
    description: "Pressed botanical parchment, rich spruce forest green, and calming sage.",
    light: { bg: "#F5F8F5", primary: "#131914", accent: "#3D6643" },
    dark: { bg: "#0D130E", primary: "#F4F7F4", accent: "#53A15D" },
  },
  {
    id: "royal-gold",
    name: "Royal Antique Gold",
    badge: "Heritage Luxury",
    description: "Champagne parchment, antique burnished gold, and deep midnight espresso.",
    light: { bg: "#FAF8F3", primary: "#1A1612", accent: "#AB802B" },
    dark: { bg: "#14110E", primary: "#F9F6F0", accent: "#E5B242" },
  },
  {
    id: "noir-monochrome",
    name: "Noir Monochrome",
    badge: "Minimalist Studio",
    description: "Architectural stark whites, deep obsidian blacks, and timeless slate stone.",
    light: { bg: "#FFFFFF", primary: "#0A0A0A", accent: "#404040" },
    dark: { bg: "#080808", primary: "#F5F5F5", accent: "#A3A3A3" },
  },
  {
    id: "rose-blush",
    name: "Rose Blush",
    badge: "Romantic Keepsake",
    description: "Delicate pressed petal cream, soft dusky rose, and vintage burgundy.",
    light: { bg: "#FDF8F8", primary: "#1D1416", accent: "#B2536A" },
    dark: { bg: "#140D0F", primary: "#FBF3F5", accent: "#CF6A82" },
  },
];

export default function ThemeSettingsPage() {
  const [activeTheme, setActiveTheme] = useState("warm-terracotta");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings?.activeTheme) {
          setActiveTheme(data.settings.activeTheme);
        }
      })
      .catch(() => setError("Failed to load current studio theme"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (themeToSave = activeTheme) => {
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioSettings: { activeTheme: themeToSave },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update theme");
      }

      setActiveTheme(themeToSave);
      setSuccess("Color theme updated successfully! Refresh your storefront to see the new palette.");
      window.dispatchEvent(
        new CustomEvent("studio_settings_updated", {
          detail: { activeTheme: themeToSave },
        })
      );
    } catch (err: any) {
      setError(err.message || "Failed to save theme preset");
    } finally {
      setSaving(false);
    }
  };

  const currentPreset = THEME_PRESETS.find((t) => t.id === activeTheme) || THEME_PRESETS[0];

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Color Themes & Atmosphere"
        subtitle="Choose a curated color palette for your studio storefront. All buttons, backgrounds, and wax accents update across both light and dark mode automatically."
        icon={Palette}
        badge="Themes"
        actions={
          <button
            onClick={() => handleSave()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A64732] hover:bg-[#8D3825] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Applying..." : "Save Palette"}</span>
          </button>
        }
      />

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="underline font-semibold hover:opacity-80 inline-flex items-center gap-1"
          >
            <span>View Store</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Active Theme Highlight Banner */}
      <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#A64732]/10 text-[#A64732] dark:bg-[#E07A5F]/15 dark:text-[#E07A5F] text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Currently Active Theme</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#181513] dark:text-[#FAF8F5]">
              {currentPreset.name}
            </h2>
            <p className="text-xs text-[#786F64] dark:text-[#A89F91]">
              {currentPreset.description}
            </p>
          </div>

          {/* Quick Swatch Preview */}
          <div className="flex items-center gap-4 bg-[#EBE3D6]/50 dark:bg-[#1C1815] p-3 rounded-xl border border-[#D0C5B4] dark:border-[#2E2822]">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#786F64] dark:text-[#A89F91] mb-1.5">
                <Sun className="w-3 h-3" />
                <span>Light</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: currentPreset.light.bg }}
                  title="Light Canvas Background"
                />
                <span
                  className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: currentPreset.light.primary }}
                  title="Light Text Color"
                />
                <span
                  className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: currentPreset.light.accent }}
                  title="Light Accent Color"
                />
              </div>
            </div>

            <div className="h-8 w-px bg-[#D0C5B4] dark:border-[#38302A]" />

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#786F64] dark:text-[#A89F91] mb-1.5">
                <Moon className="w-3 h-3" />
                <span>Dark</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="w-5 h-5 rounded-full border border-white/10 shadow-xs"
                  style={{ backgroundColor: currentPreset.dark.bg }}
                  title="Dark Canvas Background"
                />
                <span
                  className="w-5 h-5 rounded-full border border-white/10 shadow-xs"
                  style={{ backgroundColor: currentPreset.dark.primary }}
                  title="Dark Text Color"
                />
                <span
                  className="w-5 h-5 rounded-full border border-white/10 shadow-xs"
                  style={{ backgroundColor: currentPreset.dark.accent }}
                  title="Dark Accent Color"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Palettes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {THEME_PRESETS.map((preset) => {
          const isSelected = activeTheme === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => setActiveTheme(preset.id)}
              className={`group relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-[#A64732] dark:border-[#E07A5F] bg-white dark:bg-[#1A1614] shadow-md"
                  : "border-[#E5DFD4] dark:border-[#2A231F] bg-[#FAF8F5]/80 dark:bg-[#151210]/80 hover:border-[#C5B9A6] dark:hover:border-[#3A322C]"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A64732] dark:text-[#E07A5F]">
                    {preset.badge}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A64732] text-white dark:bg-[#E07A5F] dark:text-[#181513]">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-lg font-bold text-[#181513] dark:text-[#FAF8F5]">
                  {preset.name}
                </h3>
                <p className="text-xs text-[#786F64] dark:text-[#A89F91] mt-1 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              {/* Swatches display */}
              <div className="mt-4 pt-3 border-t border-[#E5DFD4] dark:border-[#2A231F] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#A89F91]">Light:</span>
                  <div className="flex items-center -space-x-1">
                    <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: preset.light.bg }} />
                    <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: preset.light.primary }} />
                    <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: preset.light.accent }} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#A89F91]">Dark:</span>
                  <div className="flex items-center -space-x-1">
                    <span className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: preset.dark.bg }} />
                    <span className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: preset.dark.primary }} />
                    <span className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: preset.dark.accent }} />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave(preset.id);
                  }}
                  disabled={saving}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#A64732] text-white hover:bg-[#8D3825] dark:bg-[#E07A5F] dark:hover:bg-[#D46548] dark:text-[#181513]"
                      : "bg-[#EBE3D6] dark:bg-[#25211E] text-[#181513] dark:text-[#FAF8F5] hover:bg-[#DDD5C7] dark:hover:bg-[#302B27]"
                  }`}
                >
                  {isSelected ? "Saved as Active" : "Apply This Theme"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-[#EBE3D6]/50 dark:bg-[#1A1614] border border-[#D0C5B4] dark:border-[#2A231F] text-xs text-[#786F64] dark:text-[#A89F91] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#181513] dark:text-[#FAF8F5] block mb-0.5">
            Non-Technical Guidance:
          </span>
          Clicking "Apply This Theme" instantly updates your live storefront for all customers. If you have another tab open with your store, simply refresh it to preview the changes.
        </div>
      </div>
    </div>
  );
}
