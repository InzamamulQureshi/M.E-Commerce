"use client";

import { useState, useEffect } from "react";
import { SettingsHeader } from "@/components/admin/SettingsHeader";
import {
  BookOpen,
  Check,
  Save,
  RefreshCw,
  Sparkles,
  Info,
  ExternalLink,
  MapPin,
  MessageCircle,
  Instagram,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function StorySettingsPage() {
  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutSlogan, setAboutSlogan] = useState("");
  const [aboutDescription, setAboutDescription] = useState("");
  const [aboutImage, setAboutImage] = useState("");
  const [aboutStoryBadge, setAboutStoryBadge] = useState("The Atelier");
  const [aboutStoryHeading, setAboutStoryHeading] = useState("Behind M.E-Commerce");

  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [studioAddress, setStudioAddress] = useState("");
  const [footerAbout, setFooterAbout] = useState("");
  const [footerDispatchNote, setFooterDispatchNote] = useState("Pan-India Insured Dispatch");
  const [footerCopyrightText, setFooterCopyrightText] = useState("Handcrafted with care in Mumbai.");
  const [footerSecurityBadges, setFooterSecurityBadges] = useState("Secure UPI & Cards • Insured Transit");

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
          setAboutTitle(s.aboutTitle || "");
          setAboutSlogan(s.aboutSlogan || "");
          setAboutDescription(s.aboutDescription || "");
          setAboutImage(s.aboutImage || "");
          setAboutStoryBadge(s.aboutStoryBadge || "The Atelier");
          setAboutStoryHeading(s.aboutStoryHeading || "Behind M.E-Commerce");

          setWhatsapp(s.whatsapp || "");
          setInstagram(s.instagram || "");
          setStudioAddress(s.studioAddress || "");
          setFooterAbout(s.footerAbout || "");
          setFooterDispatchNote(s.footerDispatchNote || "Pan-India Insured Dispatch");
          setFooterCopyrightText(s.footerCopyrightText || "Handcrafted with care in Mumbai.");
          setFooterSecurityBadges(s.footerSecurityBadges || "Secure UPI & Cards • Insured Transit");
        }
      })
      .catch(() => setError("Failed to load atelier story settings"))
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
            aboutTitle,
            aboutSlogan,
            aboutDescription,
            aboutImage,
            aboutStoryBadge,
            aboutStoryHeading,
            whatsapp,
            instagram,
            studioAddress,
            footerAbout,
            footerDispatchNote,
            footerCopyrightText,
            footerSecurityBadges,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update story settings");
      }

      setSuccess("Atelier story, contact details, and footer notes saved successfully!");
      window.dispatchEvent(new CustomEvent("studio_settings_updated"));
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Story, Contact & Hotlines"
        subtitle="Manage your brand heritage narrative, studio workshop address, WhatsApp customer care hotline, Instagram handle, and global footer dispatches."
        icon={BookOpen}
        badge="Story & Contact"
        actions={
          <button
            onClick={() => handleSave()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A64732] hover:bg-[#8D3825] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving..." : "Save Story & Contact"}</span>
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
            href="/story"
            target="_blank"
            className="underline font-semibold hover:opacity-80 inline-flex items-center gap-1"
          >
            <span>View Story Page</span>
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
        {/* Section 1: The Atelier Narrative */}
        <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
            <BookOpen className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
            <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
              1. Our Story & Craft Narrative (/story page)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Section Pre-Heading / Slogan
              </label>
              <input
                type="text"
                value={aboutSlogan}
                onChange={(e) => setAboutSlogan(e.target.value)}
                placeholder="e.g. HANDCRAFTED WITH ARCHIVAL CARE"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Main Headline
              </label>
              <input
                type="text"
                value={aboutTitle}
                onChange={(e) => setAboutTitle(e.target.value)}
                placeholder="e.g. The Atelier Behind Every Fold"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Story Badge
              </label>
              <input
                type="text"
                value={aboutStoryBadge}
                onChange={(e) => setAboutStoryBadge(e.target.value)}
                placeholder="e.g. The Atelier"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Story Subheading
              </label>
              <input
                type="text"
                value={aboutStoryHeading}
                onChange={(e) => setAboutStoryHeading(e.target.value)}
                placeholder="e.g. Behind M.E-Commerce"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
              Atelier Narrative Description
            </label>
            <textarea
              rows={4}
              value={aboutDescription}
              onChange={(e) => setAboutDescription(e.target.value)}
              placeholder="Tell your customers about the artisans, why each gift is handcrafted, and your commitment to keepsake quality..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
              Studio Workshop Photo URL
            </label>
            <input
              type="text"
              value={aboutImage}
              onChange={(e) => setAboutImage(e.target.value)}
              placeholder="e.g. https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
            />
          </div>
        </div>

        {/* Section 2: Contact, Address & Social */}
        <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
            <MapPin className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
            <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
              2. Studio Address & Customer Hotlines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Customer Care Hotline</span>
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. +919876543210"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
              <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                Connected directly to the floating WhatsApp inquiry button across your store.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Official Instagram Profile Link</span>
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="e.g. https://instagram.com/mecommerce.official"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
              Studio Workshop Physical Address
            </label>
            <input
              type="text"
              value={studioAddress}
              onChange={(e) => setStudioAddress(e.target.value)}
              placeholder="e.g. Bandra West, Mumbai 400050, Maharashtra, India"
              className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
            />
            <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
              Appears in order invoices, email confirmations, and contact footers.
            </p>
          </div>
        </div>

        {/* Section 3: Footer Notes */}
        <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
            <FileText className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
            <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
              3. Footer Notes & Dispatch Guarantee
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Footer Dispatch Guarantee Note
              </label>
              <input
                type="text"
                value={footerDispatchNote}
                onChange={(e) => setFooterDispatchNote(e.target.value)}
                placeholder="e.g. Pan-India Insured Dispatch"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Footer Tagline / Short Summary
              </label>
              <input
                type="text"
                value={footerAbout}
                onChange={(e) => setFooterAbout(e.target.value)}
                placeholder="e.g. Handmade bespoke gifts folded with love in Mumbai."
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Footer Copyright Atelier Note
              </label>
              <input
                type="text"
                value={footerCopyrightText}
                onChange={(e) => setFooterCopyrightText(e.target.value)}
                placeholder="e.g. Handcrafted with care in Mumbai."
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
              <p className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                Appends right after <code className="bg-[#EBE3D6] dark:bg-[#25211E] px-1 py-0.5 rounded text-[9.5px]">{"© {year} {storeName}."}</code> in the bottom copyright bar.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Footer Payment & Trust Badges
              </label>
              <input
                type="text"
                value={footerSecurityBadges}
                onChange={(e) => setFooterSecurityBadges(e.target.value)}
                placeholder="e.g. Secure UPI & Cards • Insured Transit"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
              <p className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                Use <code className="bg-[#EBE3D6] dark:bg-[#25211E] px-1 py-0.5 rounded text-[9.5px]">•</code> to separate trust badges (e.g. Secure UPI & Cards • Insured Transit).
              </p>
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
            <span>{saving ? "Saving Changes..." : "Save Story & Contact"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
