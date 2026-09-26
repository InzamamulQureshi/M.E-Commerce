"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { SettingsHeader } from "@/components/admin/SettingsHeader";
import {
  Sparkles,
  Share2,
  Save,
  RefreshCw,
  Check,
  ExternalLink,
  Code2,
  Palette,
  Eye,
  Globe,
  Monitor,
  Trash2,
  Layout,
  Type,
  CheckSquare,
  Square,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import {
  generateOgBillboardSvg,
  DEFAULT_OG_CONFIG,
  OgDesignConfig,
  OG_LAYOUT_PRESETS,
  OG_THEME_PALETTES,
  OgLayoutPreset,
  OgThemeBackdrop,
} from "@/lib/og-generator";

const SVG_PRESETS = [
  {
    name: "Minimalist Monogram",
    description: "Modern dark square badge with crisp rounded corners",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="8" fill="#181513" stroke="#E07A5F" stroke-width="1.5"/>
  <text x="16" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="800" text-anchor="middle" fill="#E07A5F">M</text>
</svg>`,
  },
  {
    name: "Geometric Diamond",
    description: "Sleek faceted geometric diamond silhouette",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="8" fill="#181513"/>
  <path d="M16 4 L28 16 L16 28 L4 16 Z" fill="none" stroke="#E07A5F" stroke-width="2"/>
  <path d="M16 10 L22 16 L16 22 L10 16 Z" fill="#E07A5F"/>
</svg>`,
  },
  {
    name: "Boutique Shopping Tote",
    description: "Elegant minimalist luxury store shopping bag",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="8" fill="#181513"/>
  <path d="M8 12 L24 12 L22 26 L10 26 Z" fill="none" stroke="#E07A5F" stroke-width="1.8"/>
  <path d="M12 12 C12 8, 20 8, 20 12" fill="none" stroke="#E07A5F" stroke-width="1.8"/>
</svg>`,
  },
  {
    name: "Solar Burst Minimal",
    description: "Radiant geometric craft starburst",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="8" fill="#181513"/>
  <circle cx="16" cy="16" r="5" fill="#E07A5F"/>
  <line x1="16" y1="4" x2="16" y2="8" stroke="#E07A5F" stroke-width="2" stroke-linecap="round"/>
  <line x1="16" y1="24" x2="16" y2="28" stroke="#E07A5F" stroke-width="2" stroke-linecap="round"/>
  <line x1="4" y1="16" x2="8" y2="16" stroke="#E07A5F" stroke-width="2" stroke-linecap="round"/>
  <line x1="24" y1="16" x2="28" y2="16" stroke="#E07A5F" stroke-width="2" stroke-linecap="round"/>
</svg>`,
  },
];

const ACCENT_PRESETS = [
  { name: "Terracotta", value: "#E07A5F" },
  { name: "Artisan Gold", value: "#D4AF37" },
  { name: "Emerald", value: "#10B981" },
  { name: "Sapphire", value: "#3B82F6" },
  { name: "Amethyst", value: "#8B5CF6" },
  { name: "Rose", value: "#EC4899" },
];

export default function BrandingSettingsPage() {
  const [storeName, setStoreName] = useState("M.E-Commerce");
  const [tagline, setTagline] = useState("Minimalist, Modular E-Commerce Platform");
  const [storeLocation, setStoreLocation] = useState("Studio • Modern Atelier");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [faviconSvg, setFaviconSvg] = useState("");
  const [brandAccentColor, setBrandAccentColor] = useState("#E07A5F");
  const [ogConfig, setOgConfig] = useState<OgDesignConfig>(DEFAULT_OG_CONFIG);

  const [activeTab, setActiveTab] = useState<"style" | "content" | "favicon" | "advanced">("style");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          const s = data.settings;
          setStoreName(s.storeName || "M.E-Commerce");
          setTagline(s.tagline || "Minimalist, Modular E-Commerce Platform");
          setStoreLocation(s.storeLocation || "Studio • Modern Atelier");
          setOgTitle(s.ogTitle || "");
          setOgDescription(s.ogDescription || "");
          setOgImageUrl(s.ogImageUrl || "");
          setFaviconSvg(s.faviconSvg || "");
          setBrandAccentColor(s.brandAccentColor || "#E07A5F");
          if (s.ogDesignConfig) {
            try {
              const parsed =
                typeof s.ogDesignConfig === "string"
                  ? JSON.parse(s.ogDesignConfig)
                  : s.ogDesignConfig;
              setOgConfig({ ...DEFAULT_OG_CONFIG, ...parsed });
            } catch {}
          }
        }
      })
      .catch(() => setError("Failed to load branding assets"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioSettings: {
            ogTitle: ogTitle ? ogTitle.trim() : null,
            ogDescription: ogDescription ? ogDescription.trim() : null,
            ogImageUrl: ogImageUrl ? ogImageUrl.trim() : null,
            faviconSvg: faviconSvg ? faviconSvg.trim() : null,
            brandAccentColor: brandAccentColor ? brandAccentColor.trim() : "#E07A5F",
            ogDesignConfig: JSON.stringify(ogConfig),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save branding assets");
      }

      setSuccess("Brand card design & social share settings saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  const previewTitle = ogTitle.trim() || storeName || "M.E-Commerce";
  const previewDescription =
    ogDescription.trim() || tagline || "Minimalist, modular e-commerce platform crafted with precision & care.";

  // Generate live billboard SVG on every change in real-time
  const liveSvg = useMemo(() => {
    return generateOgBillboardSvg({
      config: ogConfig,
      storeName,
      tagline,
      storeLocation,
      accentColor: brandAccentColor,
      title: previewTitle,
      subtitle: previewDescription,
    });
  }, [ogConfig, storeName, tagline, storeLocation, brandAccentColor, previewTitle, previewDescription]);

  const domainDisplay = useMemo(() => {
    return (
      ogConfig.domainWatermark?.trim() ||
      (storeName.toLowerCase().replace(/[^a-z0-9]/g, "") || "mecommerce") + ".com"
    );
  }, [ogConfig.domainWatermark, storeName]);

  // Reusable Live Preview Card Component
  const LivePreviewCard = () => (
    <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] flex items-center gap-1.5">
          <Monitor className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
          <span>Live Share Card Preview</span>
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          WhatsApp • Discord • X
        </span>
      </div>

      <div className="rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-black overflow-hidden shadow-sm">
        {/* Actual Live SVG Billboard Rendering matching raster scraper output */}
        <div
          className="relative w-full aspect-[1200/630] overflow-hidden select-none [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
          dangerouslySetInnerHTML={{ __html: liveSvg }}
        />

        {/* Social Card Feed Simulation Footer */}
        <div className="p-3 bg-[#FAF8F5] dark:bg-[#171412] border-t border-[#E5DFD4] dark:border-[#2A231F] space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#786F64] dark:text-[#A89F91]">
            {domainDisplay}
          </span>
          <p className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] line-clamp-1">
            {previewTitle}
          </p>
          <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] line-clamp-2 leading-relaxed">
            {previewDescription}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 text-[11px]">
        <span className="text-[#786F64] dark:text-[#A89F91] text-[10px]">
          Vector SVG & Native 1200×630 PNG
        </span>
        <Link
          href="/api/branding/og-image.png"
          target="_blank"
          className="text-[#A64732] dark:text-[#E07A5F] hover:underline font-semibold inline-flex items-center gap-1"
        >
          <span>Open PNG in New Tab</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      <SettingsHeader
        title="Social Share & Brand Studio"
        subtitle="Design the preview card people see when your store link is shared on WhatsApp, Facebook, Twitter/X, and Discord. Everything updates live as you edit."
        icon={Share2}
        badge="Brand Studio"
        actions={
          <button
            onClick={() => handleSave()}
            disabled={saving || loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-[#A64732] hover:bg-[#8D3825] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving Changes..." : "Save Brand Card"}</span>
          </button>
        }
      />

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              href="/api/branding/og-image.png"
              target="_blank"
              className="underline font-semibold hover:opacity-80 inline-flex items-center gap-1"
            >
              <span>View Generated PNG</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <span className="text-[#A89F91] hidden sm:inline">•</span>
            <Link
              href="/api/branding/favicon.svg"
              target="_blank"
              className="underline font-semibold hover:opacity-80 inline-flex items-center gap-1"
            >
              <span>Inspect Favicon</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* MOBILE-ONLY LIVE PREVIEW AT THE TOP: Immediately visible on phones! */}
      <div className="block lg:hidden">
        <LivePreviewCard />
      </div>

      {/* Main Grid: Designer Controls (Left) & Sticky Live Preview (Right for Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Designer Form Section (7 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Simple, Non-Technical Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("style")}
              className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "style"
                  ? "bg-[#A64732] text-white shadow-xs"
                  : "text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Card Style</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "content"
                  ? "bg-[#A64732] text-white shadow-xs"
                  : "text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text & Tags</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("favicon")}
              className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "favicon"
                  ? "bg-[#A64732] text-white shadow-xs"
                  : "text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Browser Icon</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("advanced")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "advanced"
                  ? "bg-[#A64732] text-white shadow-xs"
                  : "text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Advanced</span>
            </button>
          </div>

          {/* TAB 1: CARD STYLE & APPEARANCE */}
          {activeTab === "style" && (
            <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
              {/* 1. Layout Style Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] uppercase tracking-wider flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                    <span>1. Choose a Card Style</span>
                  </label>
                  <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                    5 layout designs
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {OG_LAYOUT_PRESETS.map((preset) => {
                    const isActive = ogConfig.layoutPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          setOgConfig((prev) => ({ ...prev, layoutPreset: preset.id }))
                        }
                        className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isActive
                            ? "border-[#A64732] bg-[#A64732]/5 dark:bg-[#E07A5F]/10 dark:border-[#E07A5F] shadow-xs ring-1 ring-[#A64732]"
                            : "border-[#E5DFD4] dark:border-[#2A231F] bg-white dark:bg-[#1C1815] hover:border-[#D0C5B4] dark:hover:border-[#38302A]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                            {preset.label}
                          </span>
                          {isActive ? (
                            <CheckCircle2 className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-[#D0C5B4] dark:border-[#38302A]" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] leading-relaxed">
                          {preset.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Background Theme Selection */}
              <div className="space-y-3 pt-4 border-t border-[#E5DFD4] dark:border-[#2A231F]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                    <span>2. Background Color Theme</span>
                  </label>
                  <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                    Subtle luxury gradients
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(Object.keys(OG_THEME_PALETTES) as OgThemeBackdrop[]).map((themeKey) => {
                    const theme = OG_THEME_PALETTES[themeKey];
                    const isActive = ogConfig.themeBackdrop === themeKey;
                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() =>
                          setOgConfig((prev) => ({ ...prev, themeBackdrop: themeKey }))
                        }
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isActive
                            ? "border-[#A64732] dark:border-[#E07A5F] bg-[#FAF8F5] dark:bg-[#201B18] ring-1 ring-[#A64732] shadow-xs"
                            : "border-[#E5DFD4] dark:border-[#2A231F] bg-white dark:bg-[#1C1815] hover:border-[#D0C5B4]"
                        }`}
                      >
                        <div
                          style={{
                            background: `linear-gradient(135deg, ${theme.bgStart} 0%, ${theme.bgEnd} 100%)`,
                            borderColor: theme.borderStart,
                          }}
                          className="w-6 h-6 rounded-lg border shrink-0 shadow-2xs"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-[#181513] dark:text-[#FAF8F5] truncate">
                            {theme.label}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Highlight Accent Color */}
              <div className="space-y-3 pt-4 border-t border-[#E5DFD4] dark:border-[#2A231F]">
                <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                  <span>3. Highlight Accent Color</span>
                </label>

                <div className="flex flex-wrap items-center gap-2.5">
                  {ACCENT_PRESETS.map((preset) => {
                    const isSelected = brandAccentColor.toLowerCase() === preset.value.toLowerCase();
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setBrandAccentColor(preset.value)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#A64732] dark:border-[#E07A5F] bg-white dark:bg-[#1C1815] shadow-xs ring-1 ring-[#A64732]"
                            : "border-[#E5DFD4] dark:border-[#2A231F] bg-white dark:bg-[#1C1815] text-[#786F64] dark:text-[#A89F91] hover:border-[#D0C5B4]"
                        }`}
                      >
                        <div
                          style={{ backgroundColor: preset.value }}
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                        />
                        <span>{preset.name}</span>
                      </button>
                    );
                  })}

                  {/* Custom color picker */}
                  <div className="flex items-center gap-2 ml-auto">
                    <input
                      type="color"
                      value={brandAccentColor}
                      onChange={(e) => setBrandAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[#D0C5B4] dark:border-[#38302A] bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={brandAccentColor}
                      onChange={(e) => setBrandAccentColor(e.target.value)}
                      className="w-24 px-2 py-1.5 rounded-lg border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs font-mono outline-hidden focus:ring-1 focus:ring-[#A64732]"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Display Toggles (What to show) */}
              <div className="space-y-3 pt-4 border-t border-[#E5DFD4] dark:border-[#2A231F]">
                <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                  <span>4. What to Show on the Card</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { key: "showMonogram", label: "Store Monogram Icon", desc: "Show your initial logo badge" },
                    { key: "showAccentGlow", label: "Accent Glowing Aura", desc: "Atmospheric ambient lighting" },
                    { key: "showOuterBorder", label: "Card Frame Border", desc: "Double or gradient frame line" },
                    { key: "showBadges", label: "Highlight Tags Row", desc: "Tags at the bottom of the card" },
                    { key: "showWatermark", label: "Website Address", desc: "Show your domain name" },
                  ].map((item) => {
                    const isChecked = ogConfig[item.key as keyof OgDesignConfig] as boolean;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          setOgConfig((prev) => ({
                            ...prev,
                            [item.key]: !isChecked,
                          }))
                        }
                        className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isChecked
                            ? "border-[#A64732] bg-[#A64732]/5 dark:border-[#E07A5F] dark:bg-[#E07A5F]/10 text-[#181513] dark:text-[#FAF8F5]"
                            : "border-[#E5DFD4] dark:border-[#2A231F] bg-white dark:bg-[#1C1815] text-[#786F64] dark:text-[#A89F91]"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F] shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-[#A89F91] shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold">{item.label}</p>
                          <p className="text-[10px] text-[#786F64] dark:text-[#A89F91]">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEXT & CONTENT */}
          {activeTab === "content" && (
            <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
                <Type className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
                <h3 className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] uppercase tracking-wider">
                  Card Words & Headlines
                </h3>
              </div>

              {/* Headline */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                    Main Headline (Title)
                  </label>
                  <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                    {ogTitle.length > 0 ? `${ogTitle.length} chars` : "Defaulting to store name"}
                  </span>
                </div>
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  placeholder={`e.g. ${storeName} | Minimalist, Modular E-Commerce`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
                />
                <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                  The bold title across your card. Automatically wraps neatly into two lines if long. Leave blank to use your store name.
                </p>
              </div>

              {/* Subtitle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                    Subtitle & Description
                  </label>
                  <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                    {ogDescription.length > 0 ? `${ogDescription.length} chars` : "Defaulting to tagline"}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  placeholder={`e.g. ${tagline || "Handcrafted artisan goods, modular design, and express checkout."}`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732] resize-y"
                />
                <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                  A 1–2 sentence summary explaining your store. Also used when links are shared on social media.
                </p>
              </div>

              {/* Top Eyebrow Badge & Website URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5DFD4] dark:border-[#2A231F]">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                    Top Eyebrow Badge
                  </label>
                  <input
                    type="text"
                    value={ogConfig.eyebrowText}
                    onChange={(e) =>
                      setOgConfig((prev) => ({ ...prev, eyebrowText: e.target.value }))
                    }
                    placeholder="e.g. HANDCRAFTED ATELIER"
                    className="w-full px-3 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
                  />
                  <p className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                    Small category label shown above the title.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                    Website Address Watermark
                  </label>
                  <input
                    type="text"
                    value={ogConfig.domainWatermark || ""}
                    onChange={(e) =>
                      setOgConfig((prev) => ({ ...prev, domainWatermark: e.target.value }))
                    }
                    placeholder={`e.g. ${domainDisplay}`}
                    className="w-full px-3 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
                  />
                  <p className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                    Shown at the bottom corner of your card.
                  </p>
                </div>
              </div>

              {/* 3 Highlight Badges */}
              <div className="space-y-2 pt-2 border-t border-[#E5DFD4] dark:border-[#2A231F]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                    Bottom Highlight Tags (3 Features)
                  </label>
                  <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                    Shown along bottom
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-[#786F64] dark:text-[#A89F91]">Tag 1</span>
                    <input
                      type="text"
                      value={ogConfig.badge1}
                      onChange={(e) =>
                        setOgConfig((prev) => ({ ...prev, badge1: e.target.value }))
                      }
                      placeholder="e.g. MODULAR ARCHITECTURE"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-[#786F64] dark:text-[#A89F91]">Tag 2</span>
                    <input
                      type="text"
                      value={ogConfig.badge2}
                      onChange={(e) =>
                        setOgConfig((prev) => ({ ...prev, badge2: e.target.value }))
                      }
                      placeholder="e.g. MINIMALIST STOREFRONT"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-[#786F64] dark:text-[#A89F91]">Tag 3</span>
                    <input
                      type="text"
                      value={ogConfig.badge3}
                      onChange={(e) =>
                        setOgConfig((prev) => ({ ...prev, badge3: e.target.value }))
                      }
                      placeholder="e.g. HANDCRAFTED ATELIER"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BROWSER TAB ICON (FAVICON) */}
          {activeTab === "favicon" && (
            <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
                  <h3 className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] uppercase tracking-wider">
                    Browser Tab Icon (SVG Favicon)
                  </h3>
                </div>
                {faviconSvg && (
                  <button
                    type="button"
                    onClick={() => setFaviconSvg("")}
                    className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset to Store Initial</span>
                  </button>
                )}
              </div>

              {/* Tab Simulation Preview */}
              <div className="bg-[#EBE3D6] dark:bg-[#1D1917] p-3 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#786F64] dark:text-[#A89F91]">
                  Live Browser Tab Simulation
                </span>
                <div className="bg-white dark:bg-[#2A2420] rounded-lg px-3 py-1.5 flex items-center gap-2.5 shadow-xs border border-[#E5DFD4] dark:border-[#332C28] max-w-[280px]">
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                    {faviconSvg ? (
                      <div
                        className="w-4 h-4 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: faviconSvg }}
                      />
                    ) : (
                      <div
                        style={{ borderColor: brandAccentColor }}
                        className="w-4 h-4 rounded bg-[#181513] border flex items-center justify-center text-[9px] font-black"
                      >
                        <span style={{ color: brandAccentColor }}>
                          {(storeName || "M").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-[#181513] dark:text-[#FAF8F5] truncate">
                    {storeName} • Storefront
                  </span>
                </div>
              </div>

              {/* Curated Presets Grid */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                  <span>Choose a Studio Icon</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SVG_PRESETS.map((preset) => {
                    const isCurrent = faviconSvg === preset.svg;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setFaviconSvg(preset.svg)}
                        className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                          isCurrent
                            ? "border-[#A64732] bg-[#A64732]/5 dark:bg-[#E07A5F]/10 dark:border-[#E07A5F] shadow-xs ring-1 ring-[#A64732]"
                            : "border-[#E5DFD4] dark:border-[#2A231F] bg-white dark:bg-[#1C1815] hover:border-[#D0C5B4] dark:hover:border-[#38302A]"
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center p-1.5 bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] [&>svg]:w-full [&>svg]:h-full"
                          dangerouslySetInnerHTML={{ __html: preset.svg }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                              {preset.name}
                            </span>
                            {isCurrent && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] line-clamp-1 mt-0.5">
                            {preset.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADVANCED / DEVELOPER OPTIONS */}
          {activeTab === "advanced" && (
            <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
                <Code2 className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
                <h3 className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] uppercase tracking-wider">
                  Advanced Overrides & Developer Options
                </h3>
              </div>

              {/* Custom Image URL Bypass */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                    Custom Image URL (Optional Bypass)
                  </label>
                  {ogImageUrl && (
                    <button
                      type="button"
                      onClick={() => setOgImageUrl("")}
                      className="text-xs text-red-600 hover:underline cursor-pointer"
                    >
                      Clear & Use Generated Card
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={ogImageUrl}
                  onChange={(e) => setOgImageUrl(e.target.value)}
                  placeholder="https://yourdomain.com/custom-og-banner.png"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
                />
                <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                  If you have your own graphic design banner hosted elsewhere, enter its URL here. Leaving this empty automatically generates and serves your dynamic 1200×630 billboard.
                </p>
              </div>

              {/* Raw SVG Favicon Code */}
              <div className="space-y-1.5 pt-3 border-t border-[#E5DFD4] dark:border-[#2A231F]">
                <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                  Custom Raw SVG Markup for Favicon
                </label>
                <textarea
                  rows={4}
                  value={faviconSvg}
                  onChange={(e) => setFaviconSvg(e.target.value)}
                  placeholder={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">\n  <rect width="32" height="32" rx="8" fill="#181513"/>\n  ...\n</svg>`}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] font-mono text-[11px] outline-hidden focus:ring-1 focus:ring-[#A64732] resize-y"
                />
                <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                  Developers can paste custom raw <code>&lt;svg&gt;</code> code here for the browser favicon. Served at <code>/api/branding/favicon.svg</code>.
                </p>
              </div>
            </div>
          )}

          {/* Bottom Save Action Button */}
          <div className="pt-2 flex items-center justify-between">
            <p className="text-xs text-[#786F64] dark:text-[#A89F91]">
              Saved changes are applied immediately across all social media scrapers.
            </p>
            <button
              onClick={() => handleSave()}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A64732] hover:bg-[#8D3825] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? "Saving Changes..." : "Save Brand Card"}</span>
            </button>
          </div>
        </div>

        {/* DESKTOP-ONLY STICKY LIVE PREVIEW COLUMN (5 Cols on desktop) */}
        <div className="hidden lg:block lg:col-span-5 space-y-5 lg:sticky lg:top-6">
          <LivePreviewCard />

          {/* Quick Tips Box */}
          <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
              <Sparkles className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
              <span>How Social Cards Work</span>
            </div>
            <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] leading-relaxed">
              When a link to your store is posted in WhatsApp, iMessage, Twitter/X, or Discord, scrapers fetch your card at 1200×630. Your card is generated instantly and cached for super-fast loading.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
