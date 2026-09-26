"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SettingsHeader } from "@/components/admin/SettingsHeader";
import {
  Settings,
  Palette,
  Megaphone,
  LayoutGrid,
  Package,
  Truck,
  BookOpen,
  Shield,
  ArrowRight,
  Check,
  Save,
  RefreshCw,
  ExternalLink,
  Store,
  Sliders,
  Sparkles,
  Info,
} from "lucide-react";

const SETTINGS_SECTIONS = [
  {
    title: "SEO, Social OG & SVG Favicon",
    description: "Manage OpenGraph social share cards, Twitter metadata, custom SVG favicon, and brand accent colors.",
    href: "/admin/dashboard/settings/branding",
    icon: Sparkles,
    badge: "Brand Assets",
    color: "from-fuchsia-500/10 to-pink-500/10 border-fuchsia-200 dark:border-fuchsia-900/40",
    iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
  },
  {
    title: "Color Themes & Palette",
    description: "Switch your store's atmosphere between Warm Terracotta, Botanical Sage, Royal Antique Gold, and more.",
    href: "/admin/dashboard/settings/themes",
    icon: Palette,
    badge: "5 Presets",
    color: "from-amber-500/10 to-orange-500/10 border-orange-200 dark:border-orange-900/40",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    title: "Announcement Bar",
    description: "Display an elegant promotion banner or notice at the very top of your storefront.",
    href: "/admin/dashboard/settings/announcement",
    icon: Megaphone,
    badge: "Live Banner",
    color: "from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Homepage & Hero",
    description: "Configure your hero billboard, featured collection showcase, and Instagram community spotlight.",
    href: "/admin/dashboard/settings/homepage",
    icon: LayoutGrid,
    badge: "Showcase",
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Product Page Layout (PDP)",
    description: "Manage handcrafted trust badges, wax seal customizer, gift wrap options, and customer reviews.",
    href: "/admin/dashboard/settings/product-page",
    icon: Package,
    badge: "PDP Modular",
    color: "from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-900/40",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    title: "Shipping & Payments",
    description: "Set free shipping cart thresholds, delivery fees, currency format, UPI QR code, and Cash on Delivery.",
    href: "/admin/dashboard/settings/shipping",
    icon: Truck,
    badge: "Rates & QR",
    color: "from-amber-500/10 to-yellow-500/10 border-amber-200 dark:border-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    title: "Story, Contact & Hotlines",
    description: "Share your brand heritage narrative, studio workshop address, and WhatsApp customer care.",
    href: "/admin/dashboard/settings/story",
    icon: BookOpen,
    badge: "Brand Story",
    color: "from-rose-500/10 to-red-500/10 border-rose-200 dark:border-rose-900/40",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    title: "Security & Passcode",
    description: "Update your master administrator password, check studio database connectivity, and view diagnostics.",
    href: "/admin/dashboard/settings/security",
    icon: Shield,
    badge: "Vault Security",
    color: "from-zinc-500/10 to-slate-500/10 border-zinc-200 dark:border-zinc-800",
    iconColor: "text-zinc-700 dark:text-zinc-300",
  },
];

export default function AdminSettingsHubPage() {
  const [storeName, setStoreName] = useState("M.E-Commerce");
  const [tagline, setTagline] = useState("");
  const [storeLocation, setStoreLocation] = useState("Studio • Modern Atelier");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoWidth, setLogoWidth] = useState(130);
  const [logoPreviewError, setLogoPreviewError] = useState(false);

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
          setTagline(s.tagline || "");
          setStoreLocation(s.storeLocation || "Studio • Modern Atelier");
          setLogoUrl(s.logoUrl || "");
          setLogoWidth(s.logoWidth || 130);
        }
      })
      .catch(() => setError("Failed to load studio branding settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveBranding = async (e?: React.FormEvent) => {
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
            storeName,
            tagline,
            storeLocation,
            logoUrl: logoUrl ? logoUrl.trim() : null,
            logoWidth: Number(logoWidth),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update branding");
      }

      setSuccess("Studio branding settings saved successfully!");
      window.dispatchEvent(
        new CustomEvent("studio_settings_updated", {
          detail: { storeName, tagline, storeLocation, logoUrl, logoWidth },
        })
      );
    } catch (err: any) {
      setError(err.message || "Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Breadcrumb and Navigation Pills */}
      <SettingsHeader
        title="Studio Settings Hub"
        subtitle="Manage your boutique's visual atmosphere, operational policies, and storefront appearance with dedicated subpages organized for quick and easy customization."
        icon={Settings}
        badge="Settings Hub"
        actions={
          <button
            onClick={() => handleSaveBranding()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A64732] hover:bg-[#8D3825] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving..." : "Save Branding"}</span>
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
            <span>Preview Storefront</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Settings Navigation Cards Grid (Friendly for non-technical users) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#786F64] dark:text-[#A89F91]">
            Dedicated Studio Subpages
          </h2>
          <span className="text-[11px] text-[#A89F91]">
            Click any section below to manage specific details
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="group relative p-4 rounded-2xl border border-[#E5DFD4] dark:border-[#2A231F] bg-[#FAF8F5] dark:bg-[#151210] hover:border-[#181513] dark:hover:border-[#FAF8F5] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border ${section.color}`}
                    >
                      <Icon className={`w-4 h-4 ${section.iconColor}`} />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBE3D6]/70 dark:bg-[#25211E] text-[#575048] dark:text-[#C5BDB2]">
                      {section.badge}
                    </span>
                  </div>

                  <h3 className="font-serif text-sm font-bold text-[#181513] dark:text-[#FAF8F5] group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F] transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] mt-1 leading-relaxed line-clamp-2">
                    {section.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5DFD4]/70 dark:border-[#2A231F] flex items-center justify-between text-[11px] font-semibold text-[#A64732] dark:text-[#E07A5F]">
                  <span>Open Settings</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Page Content: Store Identity & Branding */}
      <form
        onSubmit={handleSaveBranding}
        className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DFD4] dark:border-[#2A231F]">
          <div className="flex items-center gap-2.5">
            <Store className="w-5 h-5 text-[#A64732] dark:text-[#E07A5F]" />
            <div>
              <h2 className="text-base font-bold text-[#181513] dark:text-[#FAF8F5]">
                General Store Identity & Logo
              </h2>
              <p className="text-xs text-[#786F64] dark:text-[#A89F91]">
                Your studio&apos;s primary name, tagline, location badge, and header logo image.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#A64732] hover:bg-[#8D3825] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving..." : "Save Identity"}</span>
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
              Store Name
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. M.E-Commerce"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
            />
            <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
              Displayed in the store header, tab title, and admin sidebar.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
              Studio Location Badge
            </label>
            <input
              type="text"
              value={storeLocation}
              onChange={(e) => setStoreLocation(e.target.value)}
              placeholder="e.g. Studio • Modern Atelier"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
            />
            <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
              Shown next to your logo in the header and footer badges.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
            Studio Tagline
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Handcrafted with Love, Folded to Cherish"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
          />
          <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
            Used across the hero section, social meta tags, and invoice headers.
          </p>
        </div>

        {/* Logo Configuration with Live Width Slider & Preview */}
        <div className="p-4 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white/60 dark:bg-[#1C1815] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] block">
                Custom Header Logo Image
              </span>
              <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] mt-0.5">
                Provide an image URL (PNG with transparent background or SVG recommended).
              </p>
            </div>
            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl("")}
                className="text-[10px] font-semibold text-red-600 hover:underline"
              >
                Clear Logo
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => {
                  setLogoUrl(e.target.value);
                  setLogoPreviewError(false);
                }}
                placeholder="e.g. https://yourdomain.com/logo.png"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#181513] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
              <p className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                Leave empty to display the stylized text logo.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                  Logo Display Width: {logoWidth}px
                </span>
                <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                  (60px – 160px max)
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="160"
                value={logoWidth}
                onChange={(e) => setLogoWidth(Number(e.target.value))}
                className="w-full accent-[#A64732] cursor-pointer"
              />
            </div>
          </div>

          {/* Logo Live Visual Check */}
          <div className="pt-2 border-t border-[#E5DFD4] dark:border-[#2A231F] flex items-center justify-between gap-4">
            <span className="text-[11px] font-semibold text-[#786F64] dark:text-[#A89F91]">
              Header Appearance:
            </span>
            <div className="p-3 rounded-lg border border-[#D0C5B4] dark:border-[#38302A] bg-[#FAF8F5] dark:bg-[#12100E] min-w-[200px] flex items-center justify-center">
              {logoUrl && !logoPreviewError ? (
                <div style={{ width: `${logoWidth}px` }} className="relative h-9 flex items-center justify-center">
                  <Image
                    src={logoUrl}
                    alt="Logo Preview"
                    fill
                    sizes="160px"
                    className="object-contain"
                    onError={() => setLogoPreviewError(true)}
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex items-center gap-1.5 font-serif font-bold text-sm tracking-tight text-[#181513] dark:text-[#FAF8F5] uppercase">
                  <span>{storeName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#A64732] hover:bg-[#8D3825] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving Changes..." : "Save Identity & Logo"}</span>
          </button>
        </div>
      </form>

      <div className="p-4 rounded-xl bg-[#EBE3D6]/50 dark:bg-[#1A1614] border border-[#D0C5B4] dark:border-[#2A231F] text-xs text-[#786F64] dark:text-[#A89F91] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#181513] dark:text-[#FAF8F5] block mb-0.5">
            Non-Technical User Friendly Design:
          </span>
          Instead of scrolling through hundreds of fields in one massive page, each area of your studio now has its own dedicated page with live previews and straightforward plain-English settings. You can switch between them anytime from the navigation pills above or the sidebar.
        </div>
      </div>
    </div>
  );
}
