import Link from "next/link";
import { Instagram, ArrowUpRight } from "lucide-react";

export interface FooterProps {
  settings?: {
    storeName?: string;
    tagline?: string;
    storeLocation?: string;
    footerAbout?: string | null;
    instagram?: string;
    studioAddress?: string;
    footerDispatchNote?: string;
    footerCopyrightText?: string;
    footerSecurityBadges?: string;
  };
  categories?: { name: string; slug: string }[];
}

export function Footer({ settings, categories }: FooterProps) {
  const storeName = settings?.storeName || "The Fourfold";
  const tagline = settings?.tagline || "Handcrafted Gifting Studio • Mumbai, India";
  const footerAbout =
    settings?.footerAbout?.trim() ||
    "Personalized explosion boxes, handmade cards, keepsake albums, and everlasting crochet flowers. Hand-folded with precision in our Bandra studio.";
  const instagramUrl = settings?.instagram || "https://instagram.com/thefourfold.official";
  
  // Extract Instagram handle for clean label
  let instagramHandle = "@thefourfold.official";
  if (instagramUrl) {
    const cleaned = instagramUrl.replace(/\/$/, "");
    const parts = cleaned.split("/");
    const lastPart = parts[parts.length - 1];
    if (lastPart && !lastPart.includes("instagram.com")) {
      instagramHandle = lastPart.startsWith("@") ? lastPart : `@${lastPart}`;
    }
  }

  // Parse studio address lines
  let addressLines = ["Bandra West", "Mumbai, Maharashtra", "400050, India"];
  if (settings?.studioAddress?.trim()) {
    const raw = settings.studioAddress.trim();
    const parts = (raw.includes("\n") ? raw.split("\n") : raw.split(","))
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      if (parts.length === 1) {
        addressLines = parts;
      } else if (parts.length === 2) {
        addressLines = parts;
      } else {
        addressLines = [parts[0], parts[1], parts.slice(2).join(", ")];
      }
    }
  }

  const dispatchNote = settings?.footerDispatchNote?.trim() || "Pan-India Insured Dispatch";
  const copyrightText =
    settings?.footerCopyrightText !== undefined && settings?.footerCopyrightText !== null
      ? settings.footerCopyrightText
      : "Handcrafted with care in Mumbai.";
  const securityBadges =
    settings?.footerSecurityBadges !== undefined && settings?.footerSecurityBadges !== null
      ? settings.footerSecurityBadges
      : "Secure UPI & Cards • Insured Transit";

  // Fallback categories if none supplied from DB
  const displayCategories =
    categories && categories.length > 0
      ? categories.slice(0, 5)
      : [
          { name: "Explosion & Surprise Boxes", slug: "explosion-boxes" },
          { name: "Handmade Cards & Letters", slug: "cards-letters" },
          { name: "Scrapbooks & Keepsake Albums", slug: "scrapbooks-albums" },
          { name: "Crochet Flowers & Bouquets", slug: "floral-crafts" },
        ];

  return (
    <footer className="bg-[#181513] text-[#FAF8F5] border-t border-[#181513] pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 pb-14 border-b border-white/10">
          {/* Brand & Studio info */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-block group">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF8F5] group-hover:text-[#A64732] transition-colors uppercase">
                {storeName}
              </span>
              <span className="text-xs tracking-wider uppercase text-[#A8A196] font-medium block mt-1">
                {tagline}
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-[#A8A196] leading-relaxed max-w-sm pt-1">
              {footerAbout}
            </p>

            <div className="pt-2">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#FAF8F5] hover:text-[#A64732] transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span>{instagramHandle}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </a>
            </div>
          </div>

          {/* Quick links: Categories */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A64732] block">
              Gift Collections
            </span>
            <ul className="space-y-2.5 text-xs text-[#C4BCB0]">
              {displayCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/catalog?category=${cat.slug}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/catalog"
                  className="hover:text-white transition-colors text-[11px] font-medium uppercase tracking-wider text-[#A8A196] inline-flex items-center gap-1 mt-1"
                >
                  <span>Explore Complete Catalogue</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="md:col-span-2 space-y-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A64732] block">
              Client Care
            </span>
            <ul className="space-y-2.5 text-xs text-[#C4BCB0]">
              <li>
                <Link href="/account?tab=track" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Client Portal
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Story & Craft
                </Link>
              </li>
              <li>
                <a href="mailto:studio@thefourfold.com" className="hover:text-white transition-colors">
                  Custom Orders
                </a>
              </li>
            </ul>
          </div>

          {/* Studio Location */}
          <div className="md:col-span-2 space-y-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A64732] block">
              Studio Workshop
            </span>
            <div className="text-xs text-[#C4BCB0] space-y-1 leading-relaxed">
              {addressLines.map((line, idx) => (
                <p key={idx} className={idx === 0 ? "text-white font-medium" : ""}>
                  {line}
                </p>
              ))}
            </div>
            <p className="text-[11px] font-medium text-[#8C8478] pt-1">
              {dispatchNote}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C8478] gap-4 font-medium">
          <p>
            © {new Date().getFullYear()} {storeName}
            {copyrightText ? `. ${copyrightText}` : "."}
          </p>
          {securityBadges && (
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider">
              {securityBadges.includes("•") ? (
                securityBadges.split("•").map((badge, idx, arr) => (
                  <span key={idx} className="flex items-center gap-3">
                    <span>{badge.trim()}</span>
                    {idx < arr.length - 1 && <span className="text-[#A64732]">•</span>}
                  </span>
                ))
              ) : (
                <span>{securityBadges}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
