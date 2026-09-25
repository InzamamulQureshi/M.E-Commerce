"use client";

import { useState, useEffect } from "react";
import { SettingsHeader } from "@/components/admin/SettingsHeader";
import {
  LayoutGrid,
  Check,
  Save,
  RefreshCw,
  Sparkles,
  Info,
  ExternalLink,
  Plus,
  Trash2,
  Image as ImageIcon,
  Instagram,
  Award,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CraftPrinciple {
  id: string;
  badge: string;
  title: string;
  description: string;
}

const DEFAULT_CRAFT_PRINCIPLES: CraftPrinciple[] = [
  {
    id: "p-1",
    badge: "01 / CRAFT PURITY",
    title: "100% Handcrafted",
    description:
      "Every explosion box, petal, and card is hand-scored and assembled in our Mumbai studio using archival cardstocks that don't fade or yellow.",
  },
  {
    id: "p-2",
    badge: "02 / BESPOKE PERSONALIZATION",
    title: "Custom Photos & Messages",
    description:
      "Add personal photos and heartfelt messages. Finished with real melted wax seals and custom calligraphy tags for your recipient.",
  },
  {
    id: "p-3",
    badge: "03 / SAFE DELIVERY",
    title: "Insured Pan-India Transit",
    description:
      "Shipped across India in reinforced double-walled protective packaging so your surprise gift arrives in immaculate condition.",
  },
  {
    id: "p-4",
    badge: "04 / ARCHIVAL MATERIALS",
    title: "Keepsakes Built to Last",
    description:
      "Crafted from premium weight papers and ribbons that resist creasing and yellowing, keeping keepsakes intact for years.",
  },
];

export default function HomepageSettingsPage() {
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [heroFeaturedCategoryId, setHeroFeaturedCategoryId] = useState("AUTO");
  const [heroFeaturedCategoryLabel, setHeroFeaturedCategoryLabel] = useState("");

  const [instagramBadge, setInstagramBadge] = useState("Bandra West • Mumbai");
  const [instagramHeading, setInstagramHeading] = useState("Watch Creations Unfold Daily");
  const [instagramDescription, setInstagramDescription] = useState(
    "See folding demonstrations, custom calligraphy dedications, and unboxings on our official studio Instagram."
  );
  const [instagramButtonText, setInstagramButtonText] = useState("@mecommerce.official");

  const [principlesBadge, setPrinciplesBadge] = useState("Craft Principles");
  const [principlesHeading, setPrinciplesHeading] = useState("What Makes Every Gift Special");
  const [principlesSubheading, setPrinciplesSubheading] = useState("Quality Standards");
  const [craftPrinciplesList, setCraftPrinciplesList] = useState<CraftPrinciple[]>(DEFAULT_CRAFT_PRINCIPLES);

  const [categoriesList, setCategoriesList] = useState<Array<{ id: string; name: string }>>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.categories) {
          setCategoriesList(data.categories);
        }
        if (data?.settings) {
          const s = data.settings;
          setHeroTitle(s.heroTitle || "");
          setHeroSubtitle(s.heroSubtitle || "");
          setHeroImage(s.heroImage || "");
          setHeroFeaturedCategoryId(s.heroFeaturedCategoryId || "AUTO");
          setHeroFeaturedCategoryLabel(s.heroFeaturedCategoryLabel || "");

          setInstagramBadge(s.instagramBadge || "Bandra West • Mumbai");
          setInstagramHeading(s.instagramHeading || "Watch Creations Unfold Daily");
          setInstagramDescription(
            s.instagramDescription ||
              "See folding demonstrations, custom calligraphy dedications, and unboxings on our official studio Instagram."
          );
          setInstagramButtonText(s.instagramButtonText || "@mecommerce.official");

          setPrinciplesBadge(s.principlesBadge || "Craft Principles");
          setPrinciplesHeading(s.principlesHeading || "What Makes Every Gift Special");
          setPrinciplesSubheading(s.principlesSubheading || "Quality Standards");

          if (s.craftPrinciples) {
            try {
              const parsed = JSON.parse(s.craftPrinciples);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setCraftPrinciplesList(parsed.slice(0, 5));
              }
            } catch {}
          }
        }
      })
      .catch(() => setError("Failed to load homepage settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleAddPrinciple = () => {
    if (craftPrinciplesList.length >= 5) {
      alert("A maximum of 5 craft pillars is allowed to maintain clean layout proportions.");
      return;
    }
    const nextNum = craftPrinciplesList.length + 1;
    const pad = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    setCraftPrinciplesList([
      ...craftPrinciplesList,
      {
        id: `p-${Date.now()}`,
        badge: `${pad} / NEW PRINCIPLE`,
        title: "Pillar Headline",
        description: "Describe this craft pillar, material guarantee, or delivery promise.",
      },
    ]);
  };

  const handleRemovePrinciple = (id: string) => {
    if (craftPrinciplesList.length <= 1) {
      alert("At least one craft principle must remain configured.");
      return;
    }
    setCraftPrinciplesList(craftPrinciplesList.filter((p) => p.id !== id));
  };

  const handlePrincipleChange = (id: string, field: keyof CraftPrinciple, value: string) => {
    setCraftPrinciplesList(
      craftPrinciplesList.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
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
            heroTitle,
            heroSubtitle,
            heroImage,
            heroFeaturedCategoryId: heroFeaturedCategoryId === "AUTO" ? null : heroFeaturedCategoryId,
            heroFeaturedCategoryLabel,
            instagramBadge,
            instagramHeading,
            instagramDescription,
            instagramButtonText,
            principlesBadge,
            principlesHeading,
            principlesSubheading,
            craftPrinciples: JSON.stringify(craftPrinciplesList),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update homepage settings");
      }

      setSuccess("Homepage & Hero visual settings saved successfully!");
      window.dispatchEvent(new CustomEvent("studio_settings_updated"));
    } catch (err: any) {
      setError(err.message || "Failed to save homepage settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Homepage & Hero Showcase"
        subtitle="Control your primary storefront entrance. Customize the hero billboard, featured collection showcase, Instagram community spotlight, and your studio's craft quality principles."
        icon={LayoutGrid}
        badge="Homepage"
        actions={
          <button
            onClick={() => handleSave()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A64732] hover:bg-[#8D3825] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving..." : "Save Homepage"}</span>
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
            <span>View Live Homepage</span>
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
        {/* Section 1: Hero Billboard */}
        <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
            <Sparkles className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
            <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
              1. Hero Billboard & Welcome Headline
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Hero Main Headline
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="e.g. Handcrafted with Love, Folded to Cherish"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
              <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                Leave empty to display default studio tagline.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Hero Background Image URL
              </label>
              <input
                type="text"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
              <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                High-resolution landscape image (1920x1080 recommended).
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
              Hero Subtitle / Atelier Narrative
            </label>
            <textarea
              rows={2}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="e.g. Bespoke explosion boxes, memory albums, and wax-sealed keepsakes handcrafted in Mumbai."
              className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Featured Collection Shortcut
              </label>
              <select
                value={heroFeaturedCategoryId}
                onChange={(e) => setHeroFeaturedCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              >
                <option value="AUTO">Automatic (First Active Category)</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Button CTA Label
              </label>
              <input
                type="text"
                value={heroFeaturedCategoryLabel}
                onChange={(e) => setHeroFeaturedCategoryLabel(e.target.value)}
                placeholder="e.g. Explore Explosion Boxes"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Instagram Spotlight */}
        <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
            <Instagram className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
            <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
              2. Instagram Community Spotlight
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Section Badge
              </label>
              <input
                type="text"
                value={instagramBadge}
                onChange={(e) => setInstagramBadge(e.target.value)}
                placeholder="e.g. Bandra West • Mumbai"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Section Heading
              </label>
              <input
                type="text"
                value={instagramHeading}
                onChange={(e) => setInstagramHeading(e.target.value)}
                placeholder="e.g. Watch Creations Unfold Daily"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Section Description
              </label>
              <input
                type="text"
                value={instagramDescription}
                onChange={(e) => setInstagramDescription(e.target.value)}
                placeholder="e.g. Behind the scenes videos, packaging rituals, and customer unboxings."
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Button Handle
              </label>
              <input
                type="text"
                value={instagramButtonText}
                onChange={(e) => setInstagramButtonText(e.target.value)}
                placeholder="e.g. @mecommerce.official"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Craft Principles */}
        <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
              <div>
                <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
                  3. Craft Quality Principles
                </h2>
                <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                  Highlight your studio guarantees (e.g. 100% handcrafted, archival paper, safe transit).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddPrinciple}
              disabled={craftPrinciplesList.length >= 5}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D0C5B4] dark:border-[#38302A] text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-colors disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Pillar ({craftPrinciplesList.length}/5)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#786F64] dark:text-[#A89F91]">
                Section Badge
              </label>
              <input
                type="text"
                value={principlesBadge}
                onChange={(e) => setPrinciplesBadge(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#786F64] dark:text-[#A89F91]">
                Main Heading
              </label>
              <input
                type="text"
                value={principlesHeading}
                onChange={(e) => setPrinciplesHeading(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#786F64] dark:text-[#A89F91]">
                Subheading / Tagline
              </label>
              <input
                type="text"
                value={principlesSubheading}
                onChange={(e) => setPrinciplesSubheading(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden"
              />
            </div>
          </div>

          {/* Pillars List */}
          <div className="space-y-3 pt-2">
            {craftPrinciplesList.map((pillar, idx) => (
              <div
                key={pillar.id}
                className="p-3.5 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white/70 dark:bg-[#1A1614] space-y-2.5 relative group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                      <span className="text-[11px] font-bold text-[#A64732] dark:text-[#E07A5F] shrink-0">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={pillar.badge}
                        onChange={(e) => handlePrincipleChange(pillar.id, "badge", e.target.value)}
                        placeholder="e.g. 01 / CRAFT PURITY"
                        className="w-full sm:w-44 px-2 py-1 rounded-md border border-[#E5DFD4] dark:border-[#2A231F] text-[11px] font-bold text-[#181513] dark:text-[#FAF8F5] bg-white dark:bg-[#1C1815]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePrinciple(pillar.id)}
                      className="sm:hidden p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Remove Pillar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={pillar.title}
                      onChange={(e) => handlePrincipleChange(pillar.id, "title", e.target.value)}
                      placeholder="Pillar Title (e.g. 100% Handcrafted)"
                      className="w-full px-2 py-1 rounded-md border border-[#E5DFD4] dark:border-[#2A231F] text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] bg-white dark:bg-[#1C1815]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePrinciple(pillar.id)}
                      className="hidden sm:block p-1 rounded text-[#786F64] hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0"
                      title="Remove Pillar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={pillar.description}
                  onChange={(e) => handlePrincipleChange(pillar.id, "description", e.target.value)}
                  placeholder="Explain the guarantee, archival materials, or handcraft process..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5DFD4] dark:border-[#2A231F] text-[11px] text-[#575048] dark:text-[#C5BDB2] bg-transparent outline-hidden"
                />
              </div>
            ))}
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
            <span>{saving ? "Saving Changes..." : "Save Homepage & Showcase"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
