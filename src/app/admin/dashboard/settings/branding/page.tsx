"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { SettingsHeader } from "@/components/admin/SettingsHeader";
import {
  Sparkles,
  Share2,
  Image as ImageIcon,
  Save,
  RefreshCw,
  Check,
  ExternalLink,
  Code2,
  Palette,
  Eye,
  Globe,
  Monitor,
  Smartphone,
  Trash2,
  Layers,
  Layout,
  Sliders,
  CheckSquare,
  Square,
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [svgPreviewError, setSvgPreviewError] = useState(false);

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
            brandAccentColor: brandAccentColor ? brandAccentColor.trim() : "#181513",
            ogDesignConfig: JSON.stringify(ogConfig),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save branding assets");
      }

      setSuccess("OpenGraph metadata, billboard design & brand assets updated!");
    } catch (err: any) {
      setError(err.message || "Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  const previewTitle = ogTitle || `${storeName} | Minimalist, Modular E-Commerce`;
  const previewDescription =
    ogDescription || tagline || "Minimalist, modular, open-source e-commerce platform crafted with precision & care.";

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

  return (
    <div className="space-y-6 sm:space-y-8">
      <SettingsHeader
        title="SEO, OpenGraph & SVG Favicon"
        subtitle="Customize your store's social share cards (Facebook, Twitter, WhatsApp, Discord), dynamic OpenGraph billboard design, and SVG favicon icon with live real-time preview."
        icon={Share2}
        badge="SEO & Brand Assets"
        actions={
          <button
            onClick={() => handleSave()}
            disabled={saving || loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-[#A64732] hover:bg-[#8D3825] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving..." : "Save Brand Assets"}</span>
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
              <span>Preview Live OG Card</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <span className="text-[#A89F91] hidden sm:inline">•</span>
            <Link
              href="/api/branding/favicon.svg"
              target="_blank"
              className="underline font-semibold hover:opacity-80 inline-flex items-center gap-1"
            >
              <span>Inspect Favicon SVG</span>
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

      {/* Main Grid: Form Controls (Left) & Real-Time Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Form Inputs (7 Cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          {/* Section 1: Social OpenGraph Card Configuration */}
          <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
              <Share2 className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
              <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5] uppercase tracking-wider">
                Social Share & OpenGraph (OG) Metadata
              </h2>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                  OpenGraph Share Title
                </label>
                <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                  {ogTitle.length}/60 recommended
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
                Appears as the prominent headline on Twitter/X, Facebook, WhatsApp, and LinkedIn link cards.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                  OpenGraph Description
                </label>
                <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                  {ogDescription.length}/155 recommended
                </span>
              </div>
              <textarea
                rows={3}
                value={ogDescription}
                onChange={(e) => setOgDescription(e.target.value)}
                placeholder="e.g. Modern handcrafted gifts, modular architecture, and instant checkout. Designed for high performance."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732] resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                  Custom OpenGraph Image URL (Optional Bypass)
                </label>
                {ogImageUrl && (
                  <button
                    type="button"
                    onClick={() => setOgImageUrl("")}
                    className="text-[10px] text-red-600 hover:underline cursor-pointer"
                  >
                    Clear Custom URL & Use Modular Billboard
                  </button>
                )}
              </div>
              <input
                type="url"
                value={ogImageUrl}
                onChange={(e) => setOgImageUrl(e.target.value)}
                placeholder="https://yourdomain.com/og-image.jpg"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
              <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                Leave empty to automatically generate and serve the high-performance dynamic OpenGraph PNG billboard configured below.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Brand Accent Color
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={brandAccentColor}
                    onChange={(e) => setBrandAccentColor(e.target.value)}
                    className="w-10 h-10 shrink-0 rounded-xl cursor-pointer border border-[#D0C5B4] dark:border-[#38302A] bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={brandAccentColor}
                    onChange={(e) => setBrandAccentColor(e.target.value)}
                    placeholder="#E07A5F"
                    className="w-28 sm:w-32 px-3 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs font-mono outline-hidden focus:ring-1 focus:ring-[#A64732]"
                  />
                </div>
                <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] basis-full sm:basis-auto">
                  Used for dynamic OG badges, icon borders, glow aura, and social card highlights.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Modular OpenGraph Billboard Designer */}
          <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
              <div className="flex items-center gap-2.5">
                <Layout className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
                <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5] uppercase tracking-wider">
                  Modular Billboard Studio & Designer
                </h2>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#A64732]/10 text-[#A64732] dark:text-[#E07A5F] dark:bg-[#E07A5F]/10">
                Live Dynamic Engine
              </span>
            </div>

            {/* 1. Layout Preset Selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] flex items-center justify-between">
                <span>1. Composition Layout Preset</span>
                <span className="text-[10px] font-normal text-[#786F64] dark:text-[#A89F91]">
                  Choose architectural structure
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {OG_LAYOUT_PRESETS.map((preset) => {
                  const isActive = ogConfig.layoutPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setOgConfig((prev) => ({ ...prev, layoutPreset: preset.id }))}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? "border-[#A64732] bg-[#A64732]/5 dark:bg-[#E07A5F]/10 dark:border-[#E07A5F] shadow-xs"
                          : "border-[#E5DFD4] dark:border-[#2A231F] bg-white dark:bg-[#1C1815] hover:border-[#D0C5B4] dark:hover:border-[#38302A]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                          {preset.label}
                        </span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-[#A64732] dark:bg-[#E07A5F]" />
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

            {/* 2. Theme Backdrop Selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] flex items-center justify-between">
                <span>2. Atmosphere & Backdrop Palette</span>
                <span className="text-[10px] font-normal text-[#786F64] dark:text-[#A89F91]">
                  Background gradient mood
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(OG_THEME_PALETTES) as OgThemeBackdrop[]).map((themeKey) => {
                  const theme = OG_THEME_PALETTES[themeKey];
                  const isActive = ogConfig.themeBackdrop === themeKey;
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => setOgConfig((prev) => ({ ...prev, themeBackdrop: themeKey }))}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                        isActive
                          ? "border-[#A64732] dark:border-[#E07A5F] bg-[#FAF8F5] dark:bg-[#201B18] ring-1 ring-[#A64732]"
                          : "border-[#E5DFD4] dark:border-[#2A231F] bg-white dark:bg-[#1C1815] hover:border-[#D0C5B4]"
                      }`}
                    >
                      <div
                        style={{
                          background: `linear-gradient(135deg, ${theme.bgStart} 0%, ${theme.bgEnd} 100%)`,
                          borderColor: theme.borderStart,
                        }}
                        className="w-5 h-5 rounded-lg border shrink-0 shadow-2xs"
                      />
                      <span className="text-[11px] font-semibold text-[#181513] dark:text-[#FAF8F5] truncate">
                        {theme.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Text & Badges Content Customization */}
            <div className="space-y-3 pt-2 border-t border-[#E5DFD4] dark:border-[#2A231F]">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                3. Eyebrow, Badges & Watermark Text
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#786F64] dark:text-[#A89F91]">
                    Top Eyebrow Badge Text
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
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#786F64] dark:text-[#A89F91]">
                    Domain Watermark (Optional)
                  </label>
                  <input
                    type="text"
                    value={ogConfig.domainWatermark || ""}
                    onChange={(e) =>
                      setOgConfig((prev) => ({ ...prev, domainWatermark: e.target.value }))
                    }
                    placeholder="e.g. thefourfold.com"
                    className="w-full px-3 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#786F64] dark:text-[#A89F91]">
                  Bottom 3 Craft Highlight Badges
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={ogConfig.badge1}
                    onChange={(e) =>
                      setOgConfig((prev) => ({ ...prev, badge1: e.target.value }))
                    }
                    placeholder="Badge 1 (e.g. MODULAR ARCHITECTURE)"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-[11px] outline-hidden focus:ring-1 focus:ring-[#A64732]"
                  />
                  <input
                    type="text"
                    value={ogConfig.badge2}
                    onChange={(e) =>
                      setOgConfig((prev) => ({ ...prev, badge2: e.target.value }))
                    }
                    placeholder="Badge 2 (e.g. MINIMALIST STOREFRONT)"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-[11px] outline-hidden focus:ring-1 focus:ring-[#A64732]"
                  />
                  <input
                    type="text"
                    value={ogConfig.badge3}
                    onChange={(e) =>
                      setOgConfig((prev) => ({ ...prev, badge3: e.target.value }))
                    }
                    placeholder="Badge 3 (e.g. HANDCRAFTED ATELIER)"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-[11px] outline-hidden focus:ring-1 focus:ring-[#A64732]"
                  />
                </div>
              </div>
            </div>

            {/* 4. Visual Element Toggles */}
            <div className="space-y-2 pt-2 border-t border-[#E5DFD4] dark:border-[#2A231F]">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                4. Visual Element Toggles
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: "showMonogram", label: "Studio Monogram" },
                  { key: "showAccentGlow", label: "Accent Glow Aura" },
                  { key: "showOuterBorder", label: "Outer Frame Border" },
                  { key: "showBadges", label: "Craft Badges Row" },
                  { key: "showWatermark", label: "Domain Watermark" },
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
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                        isChecked
                          ? "border-[#A64732] bg-[#A64732]/5 dark:border-[#E07A5F] dark:bg-[#E07A5F]/10 text-[#181513] dark:text-[#FAF8F5]"
                          : "border-[#E5DFD4] dark:border-[#2A231F] bg-white dark:bg-[#1C1815] text-[#786F64] dark:text-[#A89F91]"
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F] shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-[#A89F91] shrink-0" />
                      )}
                      <span className="text-[11px] font-semibold truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: SVG Favicon & Tab Icon Configuration */}
          <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
                <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5] uppercase tracking-wider">
                  Custom SVG Favicon & Tab Icon
                </h2>
              </div>
              {faviconSvg && (
                <button
                  type="button"
                  onClick={() => setFaviconSvg("")}
                  className="text-[11px] text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Reset to Default Monogram</span>
                </button>
              )}
            </div>

            <p className="text-xs text-[#786F64] dark:text-[#A89F91] leading-relaxed">
              Browser tab icons in modern SVG format scale infinitely from high-DPI desktop Retina screens down to phone tabs without blurring. Choose from crafted studio presets or paste your own raw SVG below.
            </p>

            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                <span>Quick-Apply Curated Studio Presets</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SVG_PRESETS.map((preset) => {
                  const isCurrent = faviconSvg === preset.svg;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setFaviconSvg(preset.svg);
                        setSvgPreviewError(false);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isCurrent
                          ? "border-[#A64732] bg-[#A64732]/5 dark:bg-[#E07A5F]/10 dark:border-[#E07A5F] shadow-xs"
                          : "border-[#E5DFD4] dark:border-[#2A231F] bg-white dark:bg-[#1C1815] hover:border-[#D0C5B4] dark:hover:border-[#38302A]"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center p-1 bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: preset.svg }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] truncate">
                            {preset.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] text-[#A64732] dark:text-[#E07A5F] font-semibold">
                              Active
                            </span>
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

            {/* Raw SVG Code Editor */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Raw SVG Code Markup
              </label>
              <textarea
                rows={5}
                value={faviconSvg}
                onChange={(e) => {
                  setFaviconSvg(e.target.value);
                  setSvgPreviewError(false);
                }}
                placeholder={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">\n  <rect width="32" height="32" rx="8" fill="#181513"/>\n  ...\n</svg>`}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] font-mono text-[11px] outline-hidden focus:ring-1 focus:ring-[#A64732] resize-y"
              />
              <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                Paste your own raw `&lt;svg&gt;...&lt;/svg&gt;` markup here. It is served instantly via <code>/api/branding/favicon.svg</code> with correct <code>image/svg+xml</code> headers.
              </p>
            </div>
          </div>
        </form>

        {/* Live Visual Simulation (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Browser Tab Simulation Preview */}
          <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                <span>Browser Tab Preview</span>
              </span>
              <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">SVG Favicon</span>
            </div>

            <div className="bg-[#EBE3D6] dark:bg-[#1D1917] p-2.5 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] space-y-2">
              <div className="bg-white dark:bg-[#2A2420] rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-xs border border-[#E5DFD4] dark:border-[#332C28] max-w-[240px]">
                {/* Favicon container */}
                <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                  {faviconSvg && !svgPreviewError ? (
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
          </div>

          {/* 2. Social Card (OpenGraph) Real-Time Preview */}
          <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                <span>Live Billboard Card Preview</span>
              </span>
              <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">1200 × 630 PNG</span>
            </div>

            <div className="rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] overflow-hidden shadow-sm">
              {/* Actual Live SVG Billboard Rendering matching what scrapers receive */}
              <div
                className="relative aspect-[1200/630] w-full overflow-hidden [&>svg]:w-full [&>svg]:h-full shadow-inner select-none"
                dangerouslySetInnerHTML={{ __html: liveSvg }}
              />

              {/* Card Meta Footer (Discord / WhatsApp / Twitter feed simulation) */}
              <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#171412] border-t border-[#E5DFD4] dark:border-[#2A231F] space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#786F64] dark:text-[#A89F91]">
                  {(ogConfig.domainWatermark || storeName.toLowerCase().replace(/[^a-z0-9]/g, "") || "mecommerce") + ".com"}
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
              <span className="text-[#786F64] dark:text-[#A89F91]">Format: Raster PNG (Discord/WhatsApp ready)</span>
              <Link
                href="/api/branding/og-image.png"
                target="_blank"
                className="text-[#A64732] dark:text-[#E07A5F] hover:underline font-semibold inline-flex items-center gap-1"
              >
                <span>Inspect Server PNG</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
