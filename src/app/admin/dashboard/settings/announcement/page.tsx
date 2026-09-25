"use client";

import { useState, useEffect } from "react";
import { SettingsHeader } from "@/components/admin/SettingsHeader";
import {
  Megaphone,
  Check,
  Save,
  RefreshCw,
  Sparkles,
  Info,
  ExternalLink,
  Eye,
  ArrowRight,
  Search,
  LayoutGrid,
  Image as ImageIcon,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function HeaderNavigationSettingsPage() {
  const [enableAnnouncement, setEnableAnnouncement] = useState(true);
  const [announcementText, setAnnouncementText] = useState(
    "Complimentary signature wax-sealed keepsake card with all orders"
  );
  const [announcementLink, setAnnouncementLink] = useState("/catalog");

  const [searchPopularTags, setSearchPopularTags] = useState(
    "Explosion Boxes, Pop-up Cards, Linen Scrapbooks, Crochet Tulips"
  );

  const [spotlight1, setSpotlight1] = useState({
    enabled: true,
    badge: "Spotlight Edition",
    title: "Explosion & Surprise Boxes",
    description:
      "Intricate multi-layered folded surprise boxes that blossom open to reveal heartfelt memories, photo slots, and hidden compartments.",
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    link: "/catalog?category=explosion-boxes",
  });

  const [spotlight2, setSpotlight2] = useState({
    enabled: true,
    badge: "Archival Keepsake",
    title: "Handmade Cards & Letters",
    description:
      "Heavyweight deckled cotton papers, satin ribbon closures, and custom hot wax seals.",
    image:
      "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80",
    link: "/catalog?category=cards-letters",
  });

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
          setEnableAnnouncement(s.enableAnnouncement ?? true);
          setAnnouncementText(
            s.announcementText ||
              "Complimentary signature wax-sealed keepsake card with all orders"
          );
          setAnnouncementLink(s.announcementLink || "/catalog");
          setSearchPopularTags(
            s.searchPopularTags ||
              "Explosion Boxes, Pop-up Cards, Linen Scrapbooks, Crochet Tulips"
          );

          if (s.curatedSpotlightsConfig) {
            try {
              const parsed = JSON.parse(s.curatedSpotlightsConfig);
              if (parsed.spotlight1) {
                setSpotlight1((prev) => ({ ...prev, ...parsed.spotlight1 }));
              }
              if (parsed.spotlight2) {
                setSpotlight2((prev) => ({ ...prev, ...parsed.spotlight2 }));
              }
            } catch {}
          }
        }
      })
      .catch(() => setError("Failed to load header navigation settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    const spotlightsPayload = JSON.stringify({
      spotlight1,
      spotlight2,
    });

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioSettings: {
            enableAnnouncement,
            announcementText,
            announcementLink,
            searchPopularTags,
            curatedSpotlightsConfig: spotlightsPayload,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update header settings");
      }

      setSuccess("Header, Search tags & Curated Spotlights saved successfully!");
      window.dispatchEvent(
        new CustomEvent("studio_settings_updated", {
          detail: {
            enableAnnouncement,
            announcementText,
            announcementLink,
            searchPopularTags,
            curatedSpotlightsConfig: spotlightsPayload,
          },
        })
      );
    } catch (err: any) {
      setError(err.message || "Failed to save header settings");
    } finally {
      setSaving(false);
    }
  };

  const parsedPopularList = searchPopularTags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Header, Search & Navigation"
        subtitle="Manage your storewide announcement banner, header search bar quick-tags, and the Curated Spotlight cards shown inside the Categories mega-menu."
        icon={Megaphone}
        badge="Header & Nav"
        actions={
          <button
            onClick={() => handleSave()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A64732] hover:bg-[#8D3825] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving..." : "Save Navigation"}</span>
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
            <span>Preview On Store</span>
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
        {/* ================= SECTION 1: ANNOUNCEMENT BAR ================= */}
        <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD4] dark:border-[#2A231F]">
            <div>
              <label className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5] block">
                1. Storewide Top Announcement Banner
              </label>
              <p className="text-xs text-[#786F64] dark:text-[#A89F91] mt-0.5">
                Turn on to show an announcement strip at the very top of the store above the header.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnableAnnouncement(!enableAnnouncement)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                enableAnnouncement ? "bg-[#A64732] dark:bg-[#E07A5F]" : "bg-[#D0C5B4] dark:bg-[#38302A]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  enableAnnouncement ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Live Mini Preview */}
          <div className="rounded-xl overflow-hidden border border-[#D0C5B4] dark:border-[#38302A] shadow-inner">
            {enableAnnouncement ? (
              <div className="bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] py-2 px-4 text-center text-xs tracking-wide flex items-center justify-center gap-2 transition-colors">
                <span className="truncate">{announcementText || "Your announcement message..."}</span>
                {announcementLink && (
                  <span className="text-[10px] uppercase font-bold tracking-widest underline opacity-80 shrink-0 inline-flex items-center gap-0.5">
                    <span>Explore</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            ) : (
              <div className="bg-[#EBE3D6]/40 dark:bg-[#1C1815] py-3 text-center text-xs text-[#786F64] dark:text-[#A89F91] italic">
                Announcement bar is turned off.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                Announcement Text
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g. Free pan-India delivery on orders above ₹999 ✨"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs focus:ring-1 focus:ring-[#A64732] outline-hidden transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                Click Destination URL (Optional)
              </label>
              <input
                type="text"
                value={announcementLink}
                onChange={(e) => setAnnouncementLink(e.target.value)}
                placeholder="e.g. /catalog or /catalog?category=explosion-boxes"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs focus:ring-1 focus:ring-[#A64732] outline-hidden transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: SEARCH POPULAR TAGS ================= */}
        <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
            <Search className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
            <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
              2. Search Bar Popular Quick-Tags
            </h2>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] block">
              Popular Search Terms (Comma-Separated)
            </label>
            <input
              type="text"
              value={searchPopularTags}
              onChange={(e) => setSearchPopularTags(e.target.value)}
              placeholder="e.g. Explosion Boxes, Pop-up Cards, Linen Scrapbooks, Crochet Tulips"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs focus:ring-1 focus:ring-[#A64732] outline-hidden transition-colors"
            />
            <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
              Enter search keywords or category names separated by commas. If a tag matches a category name, it automatically links to that category; otherwise it triggers a search query.
            </p>
          </div>

          {/* Live Preview of Search Bar & Tags */}
          <div className="p-4 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] space-y-2.5">
            <span className="text-[10px] uppercase font-bold text-[#786F64] dark:text-[#A89F91] tracking-wider block">
              Live Search Overlay Preview
            </span>
            <div className="h-10 px-3.5 rounded-full border border-[#DDD5C7] dark:border-[#2E2925] bg-[#FAF8F5] dark:bg-[#151210] flex items-center text-xs text-[#9A9185] dark:text-[#665E54]">
              <Search className="w-4 h-4 mr-2 text-[#736B62]" />
              <span>Search for explosion boxes, handmade cards, crochet flowers...</span>
            </div>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#736B62] dark:text-[#A89F91]">
                POPULAR:
              </span>
              {parsedPopularList.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full bg-[#EFE9DF] dark:bg-[#262220] text-[#181513] dark:text-[#FAF8F5] text-[11px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ================= SECTION 3: CATEGORIES MEGA-MENU SPOTLIGHTS ================= */}
        <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
            <LayoutGrid className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
            <div>
              <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
                3. Product Categories Mega-Menu: Curated Spotlights
              </h2>
              <p className="text-xs text-[#786F64] dark:text-[#A89F91] mt-0.5">
                Customize the 2 editorial spotlight cards that appear on the right side of the Product Categories dropdown.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Spotlight 1 */}
            <div className="p-4 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5DFD4] dark:border-[#2A231F]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A64732] dark:text-[#E07A5F]">
                  Curated Spotlight 1
                </span>
                <button
                  type="button"
                  onClick={() => setSpotlight1({ ...spotlight1, enabled: !spotlight1.enabled })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    spotlight1.enabled ? "bg-[#A64732] dark:bg-[#E07A5F]" : "bg-[#D0C5B4] dark:bg-[#38302A]"
                  }`}
                  title={spotlight1.enabled ? "Spotlight 1 Enabled" : "Spotlight 1 Disabled"}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      spotlight1.enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#786F64] dark:text-[#A89F91] block mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={spotlight1.badge}
                    onChange={(e) => setSpotlight1({ ...spotlight1, badge: e.target.value })}
                    placeholder="e.g. Spotlight Edition"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DFD4] dark:border-[#2A231F] text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] bg-transparent"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#786F64] dark:text-[#A89F91] block mb-1">
                    Spotlight Title
                  </label>
                  <input
                    type="text"
                    value={spotlight1.title}
                    onChange={(e) => setSpotlight1({ ...spotlight1, title: e.target.value })}
                    placeholder="e.g. Explosion & Surprise Boxes"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DFD4] dark:border-[#2A231F] text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] bg-transparent"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#786F64] dark:text-[#A89F91] block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={spotlight1.description}
                    onChange={(e) => setSpotlight1({ ...spotlight1, description: e.target.value })}
                    placeholder="Description / tagline..."
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DFD4] dark:border-[#2A231F] text-[11px] text-[#786F64] dark:text-[#A89F91] bg-transparent"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#786F64] dark:text-[#A89F91] block mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={spotlight1.image}
                    onChange={(e) => setSpotlight1({ ...spotlight1, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DFD4] dark:border-[#2A231F] text-[11px] text-[#786F64] dark:text-[#A89F91] bg-transparent"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#786F64] dark:text-[#A89F91] block mb-1">
                    Destination Link
                  </label>
                  <input
                    type="text"
                    value={spotlight1.link}
                    onChange={(e) => setSpotlight1({ ...spotlight1, link: e.target.value })}
                    placeholder="/catalog?category=explosion-boxes"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DFD4] dark:border-[#2A231F] text-[11px] text-[#786F64] dark:text-[#A89F91] bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Spotlight 2 */}
            <div className="p-4 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5DFD4] dark:border-[#2A231F]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A64732] dark:text-[#E07A5F]">
                  Curated Spotlight 2
                </span>
                <button
                  type="button"
                  onClick={() => setSpotlight2({ ...spotlight2, enabled: !spotlight2.enabled })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    spotlight2.enabled ? "bg-[#A64732] dark:bg-[#E07A5F]" : "bg-[#D0C5B4] dark:bg-[#38302A]"
                  }`}
                  title={spotlight2.enabled ? "Spotlight 2 Enabled" : "Spotlight 2 Disabled"}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      spotlight2.enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#786F64] dark:text-[#A89F91] block mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={spotlight2.badge}
                    onChange={(e) => setSpotlight2({ ...spotlight2, badge: e.target.value })}
                    placeholder="e.g. Archival Keepsake"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DFD4] dark:border-[#2A231F] text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] bg-transparent"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#786F64] dark:text-[#A89F91] block mb-1">
                    Spotlight Title
                  </label>
                  <input
                    type="text"
                    value={spotlight2.title}
                    onChange={(e) => setSpotlight2({ ...spotlight2, title: e.target.value })}
                    placeholder="e.g. Handmade Cards & Letters"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DFD4] dark:border-[#2A231F] text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] bg-transparent"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#786F64] dark:text-[#A89F91] block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={spotlight2.description}
                    onChange={(e) => setSpotlight2({ ...spotlight2, description: e.target.value })}
                    placeholder="Description / tagline..."
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DFD4] dark:border-[#2A231F] text-[11px] text-[#786F64] dark:text-[#A89F91] bg-transparent"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#786F64] dark:text-[#A89F91] block mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={spotlight2.image}
                    onChange={(e) => setSpotlight2({ ...spotlight2, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DFD4] dark:border-[#2A231F] text-[11px] text-[#786F64] dark:text-[#A89F91] bg-transparent"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#786F64] dark:text-[#A89F91] block mb-1">
                    Destination Link
                  </label>
                  <input
                    type="text"
                    value={spotlight2.link}
                    onChange={(e) => setSpotlight2({ ...spotlight2, link: e.target.value })}
                    placeholder="/catalog?category=cards-letters"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DFD4] dark:border-[#2A231F] text-[11px] text-[#786F64] dark:text-[#A89F91] bg-transparent"
                  />
                </div>
              </div>
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
            <span>{saving ? "Saving Changes..." : "Save Navigation & Spotlights"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
