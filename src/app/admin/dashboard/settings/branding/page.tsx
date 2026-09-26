"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

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
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [faviconSvg, setFaviconSvg] = useState("");
  const [brandAccentColor, setBrandAccentColor] = useState("#E07A5F");

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
          setOgTitle(s.ogTitle || "");
          setOgDescription(s.ogDescription || "");
          setOgImageUrl(s.ogImageUrl || "");
          setFaviconSvg(s.faviconSvg || "");
          setBrandAccentColor(s.brandAccentColor || "#E07A5F");
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
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save branding assets");
      }

      setSuccess("OpenGraph metadata, SVG favicon and brand assets updated!");
    } catch (err: any) {
      setError(err.message || "Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  const previewTitle = ogTitle || `${storeName} | Minimalist, Modular E-Commerce`;
  const previewDescription =
    ogDescription || "Minimalist, modular, open-source e-commerce platform crafted with precision & care.";

  return (
    <div className="space-y-6 sm:space-y-8">
      <SettingsHeader
        title="SEO, OpenGraph & SVG Favicon"
        subtitle="Customize your store's social share cards (Facebook, Twitter, iMessage, LinkedIn), dynamic OpenGraph billboards, and SVG favicon icon without touching code."
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
                  Custom OpenGraph Image URL (Optional)
                </label>
                {ogImageUrl && (
                  <button
                    type="button"
                    onClick={() => setOgImageUrl("")}
                    className="text-[10px] text-red-600 hover:underline"
                  >
                    Use Dynamic Generated Card
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
                Leave empty to automatically use the high-performance Next.js dynamic OpenGraph billboard with your store name and live styling.
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
                  Used for dynamic OG badges, icon borders, and social card highlights.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: SVG Favicon & Tab Icon Configuration */}
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

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] block">
                Quick Apply Preset SVG Icons
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SVG_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setFaviconSvg(preset.svg)}
                    className="p-2.5 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] hover:border-[#A64732] dark:hover:border-[#E07A5F] transition-all flex flex-col items-center text-center gap-2 cursor-pointer group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform"
                      dangerouslySetInnerHTML={{ __html: preset.svg }}
                    />
                    <span className="text-[10px] font-semibold text-[#181513] dark:text-[#FAF8F5] leading-tight">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Raw SVG Code Editor */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Raw SVG Code Markup
              </label>
              <textarea
                rows={6}
                value={faviconSvg}
                onChange={(e) => {
                  setFaviconSvg(e.target.value);
                  setSvgPreviewError(false);
                }}
                placeholder="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>...</svg>"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] font-mono text-[11px] leading-relaxed outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
              <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                Paste your own raw `<svg>...</svg>` markup here. It is served instantly via <code>/api/branding/favicon.svg</code> with correct <code>image/svg+xml</code> headers.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#A64732] hover:bg-[#8D3825] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? "Saving Changes..." : "Save Branding & Favicon"}</span>
            </button>
          </div>
        </form>

        {/* Live Visual Previews (5 Cols) */}
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

          {/* 2. Social Card (OpenGraph) Preview */}
          <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                <span>Social Feed Card Preview</span>
              </span>
              <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">1200 × 630</span>
            </div>

            <div className="rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] overflow-hidden shadow-sm">
              {/* Image banner */}
              <div className="relative aspect-[1200/630] w-full bg-[#181513] p-3.5 sm:p-5 flex flex-col justify-between overflow-hidden">
                <div
                  style={{
                    position: "absolute",
                    top: "-40px",
                    right: "-40px",
                    width: "160px",
                    height: "160px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${brandAccentColor}44 0%, rgba(24,21,19,0) 70%)`,
                  }}
                />

                <div className="flex items-center gap-1.5 z-10">
                  <div style={{ backgroundColor: brandAccentColor }} className="w-2 h-2 rounded-full" />
                  <span
                    style={{ color: brandAccentColor }}
                    className="text-[9px] uppercase font-bold tracking-widest"
                  >
                    MODULAR E-COMMERCE
                  </span>
                </div>

                <div className="space-y-1 z-10">
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight line-clamp-1">
                    {previewTitle}
                  </h3>
                  <p className="text-[10px] text-stone-300 line-clamp-2 leading-relaxed">
                    {previewDescription}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-stone-800 pt-2 text-[8px] text-stone-400 uppercase tracking-wider z-10">
                  <span>Open Source Platform</span>
                  <span style={{ color: brandAccentColor }} className="font-bold">
                    {storeName.toLowerCase().replace(/[^a-z0-9]/g, "") || "mecommerce"}.com
                  </span>
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="p-3 bg-[#FAF8F5] dark:bg-[#171412] border-t border-[#E5DFD4] dark:border-[#2A231F] space-y-0.5">
                <span className="text-[9px] uppercase tracking-wider font-semibold text-[#786F64] dark:text-[#A89F91]">
                  {storeName.toLowerCase().replace(/[^a-z0-9]/g, "") || "mecommerce"}.com
                </span>
                <p className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] line-clamp-1">
                  {previewTitle}
                </p>
                <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] line-clamp-1">
                  {previewDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
