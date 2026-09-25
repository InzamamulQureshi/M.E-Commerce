"use client";

import { useState, useEffect } from "react";
import { SettingsHeader } from "@/components/admin/SettingsHeader";
import {
  Package,
  Check,
  Save,
  RefreshCw,
  Sparkles,
  Info,
  ExternalLink,
  ShieldCheck,
  Gift,
  Star,
  Layers,
  Clock,
  Truck,
  Award,
  Leaf,
  Heart,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export interface HighlightItem {
  id: string;
  icon: "Clock" | "Truck" | "ShieldCheck" | "Sparkles" | "Award" | "Gift" | "Leaf" | "Heart";
  title: string;
  subtitle: string;
  enabled: boolean;
}

const AVAILABLE_ICONS = [
  { value: "Clock", label: "Clock (Turnaround / Time)" },
  { value: "Truck", label: "Truck (Delivery / Transit)" },
  { value: "ShieldCheck", label: "Shield (Insured / Safe)" },
  { value: "Sparkles", label: "Sparkles (Custom / Bespoke)" },
  { value: "Award", label: "Award (Signature / Quality)" },
  { value: "Gift", label: "Gift (Keepsake / Ribbon)" },
  { value: "Leaf", label: "Leaf (Eco / Archival)" },
  { value: "Heart", label: "Heart (Handmade / Care)" },
];

const HIGHLIGHT_ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  Truck,
  ShieldCheck,
  Sparkles,
  Award,
  Gift,
  Leaf,
  Heart,
};

export default function ProductPageSettingsPage() {
  const [pdpShowHighlights, setPdpShowHighlights] = useState(true);
  const [highlights, setHighlights] = useState<HighlightItem[]>([
    {
      id: "hl-1",
      icon: "Clock",
      title: "{craftDays} Days Handcraft",
      subtitle: "Folded individually in our studio",
      enabled: true,
    },
    {
      id: "hl-2",
      icon: "Truck",
      title: "Insured Dispatch",
      subtitle: "Delivered safely with care",
      enabled: true,
    },
  ]);

  const [pdpShowRelated, setPdpShowRelated] = useState(true);
  const [pdpRelatedBadge, setPdpRelatedBadge] = useState("Complementary Pieces");
  const [pdpRelatedHeading, setPdpRelatedHeading] = useState("Complete Your Gifting Suite");

  const [enableReviews, setEnableReviews] = useState(true);
  const [enableWaxSealCustomization, setEnableWaxSealCustomization] = useState(true);
  const [enableGiftWrapCustomization, setEnableGiftWrapCustomization] = useState(true);

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
          setPdpShowHighlights(s.pdpShowHighlights ?? true);

          if (s.pdpHighlightsConfig) {
            try {
              const parsed = JSON.parse(s.pdpHighlightsConfig);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setHighlights(parsed.slice(0, 4));
              }
            } catch {}
          } else {
            setHighlights([
              {
                id: "hl-1",
                icon: "Clock",
                title: s.pdpHighlight1Title || "{craftDays} Days Handcraft",
                subtitle: s.pdpHighlight1Subtitle || "Folded individually in our studio",
                enabled: true,
              },
              {
                id: "hl-2",
                icon: "Truck",
                title: s.pdpHighlight2Title || "Insured Dispatch",
                subtitle: s.pdpHighlight2Subtitle || "Delivered safely with care",
                enabled: true,
              },
            ]);
          }

          setPdpShowRelated(s.pdpShowRelated ?? true);
          setPdpRelatedBadge(s.pdpRelatedBadge || "Complementary Pieces");
          setPdpRelatedHeading(s.pdpRelatedHeading || "Complete Your Gifting Suite");

          setEnableReviews(s.enableReviews ?? true);
          setEnableWaxSealCustomization(s.enableWaxSealCustomization ?? true);
          setEnableGiftWrapCustomization(s.enableGiftWrapCustomization ?? true);
        }
      })
      .catch(() => setError("Failed to load product page layout settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleAddHighlight = () => {
    if (highlights.length >= 4) return;
    setHighlights([
      ...highlights,
      {
        id: `hl-${Date.now()}`,
        icon: "Sparkles",
        title: "Signature Atelier Quality",
        subtitle: "Crafted with archival materials",
        enabled: true,
      },
    ]);
  };

  const handleUpdateHighlight = (index: number, field: keyof HighlightItem, value: any) => {
    const updated = [...highlights];
    updated[index] = { ...updated[index], [field]: value };
    setHighlights(updated);
  };

  const handleRemoveHighlight = (index: number) => {
    if (highlights.length <= 1) {
      alert("At least one highlight should remain configured.");
      return;
    }
    setHighlights(highlights.filter((_, i) => i !== index));
  };

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
            pdpShowHighlights,
            pdpHighlight1Title: highlights[0]?.title || "{craftDays} Days Handcraft",
            pdpHighlight1Subtitle: highlights[0]?.subtitle || "Folded individually in our studio",
            pdpHighlight2Title: highlights[1]?.title || "Insured Dispatch",
            pdpHighlight2Subtitle: highlights[1]?.subtitle || "Delivered safely with care",
            pdpHighlightsConfig: JSON.stringify(highlights),
            pdpShowRelated,
            pdpRelatedBadge,
            pdpRelatedHeading,
            enableReviews,
            enableWaxSealCustomization,
            enableGiftWrapCustomization,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update product page settings");
      }

      setSuccess("Product Page layout & modular customizer settings saved successfully!");
      window.dispatchEvent(new CustomEvent("studio_settings_updated"));
    } catch (err: any) {
      setError(err.message || "Failed to save product page settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Product Page Layout (PDP)"
        subtitle="Configure the presentation of your individual product pages. Control trust highlights, modular wax seal & gift wrap customizers, customer reviews, and related products."
        icon={Package}
        badge="Product Page"
        actions={
          <button
            onClick={() => handleSave()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A64732] hover:bg-[#8D3825] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving..." : "Save Product Layout"}</span>
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
            href="/catalog"
            target="_blank"
            className="underline font-semibold hover:opacity-80 inline-flex items-center gap-1"
          >
            <span>View Catalog</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Modular Studio Customizers */}
        <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
            <Gift className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
            <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
              1. Modular Personalization Customizers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white/60 dark:bg-[#1C1815] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] block">
                  Wax Seal Sealing Option
                </span>
                <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] mt-0.5">
                  Allows customers to request an authentic wax-sealed card with their order.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnableWaxSealCustomization(!enableWaxSealCustomization)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  enableWaxSealCustomization ? "bg-[#A64732] dark:bg-[#E07A5F]" : "bg-[#D0C5B4] dark:bg-[#38302A]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enableWaxSealCustomization ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white/60 dark:bg-[#1C1815] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] block">
                  Luxury Gift Wrapping Option
                </span>
                <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] mt-0.5">
                  Allows customers to request luxury archival wrapping and ribbon styling.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnableGiftWrapCustomization(!enableGiftWrapCustomization)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  enableGiftWrapCustomization ? "bg-[#A64732] dark:bg-[#E07A5F]" : "bg-[#D0C5B4] dark:bg-[#38302A]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enableGiftWrapCustomization ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Trust Highlights Banner */}
        <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
              <div>
                <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
                  2. Studio Trust Highlights (Below Add to Bag)
                </h2>
                <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                  Add, customize, or individually toggle trust highlights (up to 4) that appear right under the Add to Bag button.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddHighlight}
                disabled={highlights.length >= 4}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] hover:border-[#A64732] dark:hover:border-[#E07A5F] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title={highlights.length >= 4 ? "Maximum 4 highlights allowed" : "Add new highlight"}
              >
                <Plus className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                <span>Add Highlight ({highlights.length}/4)</span>
              </button>
              <button
                type="button"
                onClick={() => setPdpShowHighlights(!pdpShowHighlights)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  pdpShowHighlights ? "bg-[#A64732] dark:bg-[#E07A5F]" : "bg-[#D0C5B4] dark:bg-[#38302A]"
                }`}
                title={pdpShowHighlights ? "Highlights section enabled" : "Highlights section disabled"}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    pdpShowHighlights ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlights.map((hl, index) => {
              const IconComp = HIGHLIGHT_ICON_COMPONENTS[hl.icon] || Clock;
              return (
                <div
                  key={hl.id || index}
                  className={`p-4 rounded-xl border transition-all ${
                    hl.enabled
                      ? "border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815]"
                      : "border-dashed border-[#D0C5B4]/60 dark:border-[#38302A]/60 bg-white/40 dark:bg-[#1C1815]/40 opacity-70"
                  } space-y-3`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5DFD4] dark:border-[#2A231F]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] dark:bg-[#25201C] border border-[#E5DFD4] dark:border-[#2A231F] flex items-center justify-center text-[#A64732] dark:text-[#E07A5F]">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <select
                        value={hl.icon}
                        onChange={(e) => handleUpdateHighlight(index, "icon", e.target.value)}
                        className="text-xs font-semibold bg-transparent text-[#181513] dark:text-[#FAF8F5] border-none outline-none cursor-pointer focus:ring-0"
                      >
                        {AVAILABLE_ICONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#181412]">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Individual Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleUpdateHighlight(index, "enabled", !hl.enabled)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          hl.enabled ? "bg-[#A64732] dark:bg-[#E07A5F]" : "bg-[#D0C5B4] dark:bg-[#38302A]"
                        }`}
                        title={hl.enabled ? "Disable this highlight" : "Enable this highlight"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            hl.enabled ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>

                      {highlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(index)}
                          className="p-1 rounded-lg text-[#786F64] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Remove highlight"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#786F64] dark:text-[#A89F91] block mb-1">
                        Highlight Title
                      </label>
                      <input
                        type="text"
                        value={hl.title}
                        onChange={(e) => handleUpdateHighlight(index, "title", e.target.value)}
                        placeholder="e.g. {craftDays} Days Handcraft"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E5DFD4] dark:border-[#2A231F] text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] bg-transparent outline-none focus:border-[#A64732]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#786F64] dark:text-[#A89F91] block mb-1">
                        Subtitle / Detail
                      </label>
                      <input
                        type="text"
                        value={hl.subtitle}
                        onChange={(e) => handleUpdateHighlight(index, "subtitle", e.target.value)}
                        placeholder="e.g. Folded individually in our studio"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E5DFD4] dark:border-[#2A231F] text-[11px] text-[#786F64] dark:text-[#A89F91] bg-transparent outline-none focus:border-[#A64732]"
                      />
                    </div>
                  </div>

                  <p className="text-[9.5px] text-[#786F64] dark:text-[#A89F91]">
                    Tip: <code className="bg-[#EBE3D6] dark:bg-[#25211E] px-1 py-0.5 rounded">{"{craftDays}"}</code> dynamically inserts the product's actual creation days.
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Reviews & Related Products */}
        <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
            <Layers className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
            <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
              3. Reviews & Related Products Showcase
            </h2>
          </div>

          <div className="p-4 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white/60 dark:bg-[#1C1815] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] block">
                  Public Customer Reviews & Ratings
                </span>
                <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] mt-0.5">
                  Display verified ratings and allow visitors to submit reviews on product pages.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEnableReviews(!enableReviews)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                enableReviews ? "bg-[#A64732] dark:bg-[#E07A5F]" : "bg-[#D0C5B4] dark:bg-[#38302A]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  enableReviews ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="p-4 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white/60 dark:bg-[#1C1815] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] block">
                  Complementary Creations (Related Products)
                </span>
                <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] mt-0.5">
                  Displays other pieces from the same collection at the bottom of the page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPdpShowRelated(!pdpShowRelated)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  pdpShowRelated ? "bg-[#A64732] dark:bg-[#E07A5F]" : "bg-[#D0C5B4] dark:bg-[#38302A]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    pdpShowRelated ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {pdpShowRelated && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <input
                  type="text"
                  value={pdpRelatedBadge}
                  onChange={(e) => setPdpRelatedBadge(e.target.value)}
                  placeholder="Badge (e.g. Complementary Pieces)"
                  className="px-3 py-1.5 rounded-lg border border-[#E5DFD4] dark:border-[#2A231F] text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] bg-transparent"
                />
                <input
                  type="text"
                  value={pdpRelatedHeading}
                  onChange={(e) => setPdpRelatedHeading(e.target.value)}
                  placeholder="Heading (e.g. Complete Your Gifting Suite)"
                  className="px-3 py-1.5 rounded-lg border border-[#E5DFD4] dark:border-[#2A231F] text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] bg-transparent"
                />
              </div>
            )}
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
            <span>{saving ? "Saving Changes..." : "Save Product Page Layout"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
