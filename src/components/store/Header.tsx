"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useCart, cartStore } from "@/lib/cart-store";
import { useAuthSession } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/store/ThemeToggle";
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  LayoutGrid,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  TicketPercent,
  LogOut,
} from "lucide-react";

const defaultProductCategories = [
  {
    name: "Explosion & Surprise Boxes",
    slug: "explosion-boxes",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    href: "/catalog?category=explosion-boxes",
    description: "Multi-layered photo flaps, waterfall tags & secret compartments.",
    tags: ["Photo Flaps", "Waterfall Tags", "Hexagon"],
  },
  {
    name: "Handmade Cards & Letters",
    slug: "cards-letters",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80",
    href: "/catalog?category=cards-letters",
    description: "Cotton cardstock greeting cards with wax seals and pop-up florals.",
    tags: ["Wax Seals", "Accordion Fold", "3D Pop-Up"],
  },
  {
    name: "Scrapbooks & Albums",
    slug: "scrapbooks-albums",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    href: "/catalog?category=scrapbooks-albums",
    description: "Heirloom albums hand-bound with natural linen and deckled papers.",
    tags: ["Raw Linen", "Memory Folios", "Journals"],
  },
  {
    name: "Preserved Floral & Crochet",
    slug: "floral-crafts",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    href: "/catalog?category=floral-crafts",
    description: "Everlasting plush milk cotton crochet tulips and botanical frames.",
    tags: ["Crochet Tulips", "Pressed Frames", "Resin"],
  },
  {
    name: "Curated Bespoke Hampers",
    slug: "gift-hampers",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
    href: "/catalog?category=gift-hampers",
    description: "Luxe gift suites with soy candles, wax-sealed stationery, and keepsakes.",
    tags: ["Anniversary", "Celebrations", "Custom Suite"],
  },
  {
    name: "Wax-Sealed Letters & Vows",
    slug: "letters-vows",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80",
    href: "/catalog?category=cards-letters",
    description: "Calligraphy love letters with custom wax seals and botanical envelopes.",
    tags: ["Calligraphy", "Wax Seal", "Vintage Paper"],
  },
  {
    name: "Memory Keepsake Folios",
    slug: "keepsake-folios",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    href: "/catalog?category=scrapbooks-albums",
    description: "Accordion-style photo folios with pocket tags and satin pull ribbons.",
    tags: ["Accordion", "Photo Folio", "Satin Ribbons"],
  },
  {
    name: "Miniature Gift Keepsakes",
    slug: "mini-gifts",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    href: "/catalog?category=explosion-boxes",
    description: "Pocket-sized handmade explosion cubes and secret scroll message capsules.",
    tags: ["Mini Cube", "Secret Scroll", "Desk Keepsake"],
  },
];

export interface HeaderProps {
  initialSettings?: {
    storeName?: string;
    storeLocation?: string;
    logoUrl?: string | null;
    logoWidth?: number;
    enableAnnouncement?: boolean;
    announcementText?: string;
    announcementLink?: string | null;
    searchPopularTags?: string | null;
    curatedSpotlightsConfig?: string | null;
  };
}

let cachedHeaderCategories: any[] | null = null;

export function Header({ initialSettings }: HeaderProps = {}) {
  const { count, openCart } = useCart();
  const { user, logout } = useAuthSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [categoryStartIndex, setCategoryStartIndex] = useState(0);

  const [brandSettings, setBrandSettings] = useState({
    storeName: initialSettings?.storeName || "The Fourfold",
    storeLocation: initialSettings?.storeLocation || "Studio • Mumbai",
    logoUrl: initialSettings?.logoUrl ?? null,
    logoWidth: initialSettings?.logoWidth || 130,
    enableAnnouncement: initialSettings?.enableAnnouncement ?? false,
    announcementText: initialSettings?.announcementText || "",
    announcementLink: initialSettings?.announcementLink || "",
    searchPopularTags:
      initialSettings?.searchPopularTags ||
      "Explosion Boxes, Pop-up Cards, Linen Scrapbooks, Crochet Tulips",
    curatedSpotlightsConfig: initialSettings?.curatedSpotlightsConfig || null,
  });
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [logoImgFailed, setLogoImgFailed] = useState(false);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const categoriesButtonRef = useRef<HTMLButtonElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const desktopSearchButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.settings) {
          setBrandSettings({
            storeName: data.settings.storeName || "The Fourfold",
            storeLocation: data.settings.storeLocation || "Studio • Mumbai",
            logoUrl: data.settings.logoUrl || null,
            logoWidth: Math.min(160, Math.max(60, data.settings.logoWidth || 130)),
            enableAnnouncement: data.settings.enableAnnouncement ?? false,
            announcementText: data.settings.announcementText || "",
            announcementLink: data.settings.announcementLink || "",
            searchPopularTags:
              data.settings.searchPopularTags ||
              "Explosion Boxes, Pop-up Cards, Linen Scrapbooks, Crochet Tulips",
            curatedSpotlightsConfig: data.settings.curatedSpotlightsConfig || null,
          });
          if (
            data.settings.freeShippingThreshold !== undefined ||
            data.settings.standardShippingFee !== undefined
          ) {
            cartStore.setShippingConfig({
              freeShippingThreshold: data.settings.freeShippingThreshold,
              standardShippingFee: data.settings.standardShippingFee,
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  // Dismiss popup immediately when a scroll is attempted
  useEffect(() => {
    if (!categoriesOpen && !desktopSearchOpen) return;

    const handleScrollDismiss = () => {
      setCategoriesOpen(false);
      setDesktopSearchOpen(false);
    };

    const handleWheelDismiss = (e: WheelEvent) => {
      // If wheel scroll happens inside the popup and the popup has scrollable overflow, allow it
      if (
        categoriesRef.current &&
        categoriesRef.current.contains(e.target as Node)
      ) {
        const el = categoriesRef.current;
        const isScrollable = el.scrollHeight > el.clientHeight;
        if (isScrollable) {
          const atTop = el.scrollTop <= 0 && e.deltaY < 0;
          const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight && e.deltaY > 0;
          if (!atTop && !atBottom) return;
        }
      }
      setCategoriesOpen(false);
      setDesktopSearchOpen(false);
    };

    const handleTouchMoveDismiss = (e: TouchEvent) => {
      if (
        categoriesRef.current &&
        categoriesRef.current.contains(e.target as Node)
      ) {
        return;
      }
      setCategoriesOpen(false);
      setDesktopSearchOpen(false);
    };

    window.addEventListener("scroll", handleScrollDismiss, { passive: true });
    window.addEventListener("wheel", handleWheelDismiss, { passive: true });
    window.addEventListener("touchmove", handleTouchMoveDismiss, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScrollDismiss);
      window.removeEventListener("wheel", handleWheelDismiss);
      window.removeEventListener("touchmove", handleTouchMoveDismiss);
    };
  }, [categoriesOpen, desktopSearchOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCategoriesOpen(false);
        setDesktopSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close categories, search, or user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;

      if (
        categoriesOpen &&
        categoriesRef.current &&
        !categoriesRef.current.contains(target) &&
        categoriesButtonRef.current &&
        !categoriesButtonRef.current.contains(target)
      ) {
        setCategoriesOpen(false);
      }

      if (
        desktopSearchOpen &&
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(target) &&
        desktopSearchButtonRef.current &&
        !desktopSearchButtonRef.current.contains(target)
      ) {
        setDesktopSearchOpen(false);
      }

      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [categoriesOpen, desktopSearchOpen, userMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalog?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const [categoriesList, setCategoriesList] = useState(cachedHeaderCategories || defaultProductCategories);
  const [hoveredCategorySlug, setHoveredCategorySlug] = useState<string | null>(null);

  useEffect(() => {
    if (cachedHeaderCategories) {
      setCategoriesList(cachedHeaderCategories);
      return;
    }
    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.categories && data.categories.length > 0) {
          const merged = data.categories.map((c: any) => ({
            name: c.name,
            slug: c.slug,
            image: c.image || null,
            href: `/catalog?category=${c.slug}`,
            description: c.description || "Handcrafted creation folded with intent in Bandra.",
            tags: c.subcategories?.slice(0, 3).map((s: any) => s.name) || ["Handcrafted", "Studio"],
          }));
          const finalCategories = merged.length >= 5 ? merged : [...merged, ...defaultProductCategories.slice(merged.length)];
          cachedHeaderCategories = finalCategories;
          setCategoriesList(finalCategories);
        }
      })
      .catch(() => {});
  }, []);

  const popularTags = useMemo(() => {
    if (brandSettings.searchPopularTags && brandSettings.searchPopularTags.trim()) {
      return brandSettings.searchPopularTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .map((tag) => {
          const matchedCategory = categoriesList.find(
            (c) =>
              c.name.toLowerCase() === tag.toLowerCase() ||
              c.slug.toLowerCase() === tag.toLowerCase()
          );
          return {
            label: tag,
            href: matchedCategory
              ? `/catalog?category=${matchedCategory.slug}`
              : `/catalog?search=${encodeURIComponent(tag)}`,
          };
        });
    }
    return categoriesList.slice(0, 4).map((c) => ({
      label: c.name,
      href: `/catalog?category=${c.slug}`,
    }));
  }, [brandSettings.searchPopularTags, categoriesList]);

  const customSpotlights = useMemo(() => {
    if (!brandSettings.curatedSpotlightsConfig) return null;
    try {
      return JSON.parse(brandSettings.curatedSpotlightsConfig);
    } catch {
      return null;
    }
  }, [brandSettings.curatedSpotlightsConfig]);

  const totalCategories = categoriesList.length;
  const visibleCategories = Array.from(
    { length: Math.min(5, totalCategories) },
    (_, i) => categoriesList[(categoryStartIndex + i) % totalCategories]
  );

  const handlePrevCategories = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryStartIndex((prev) => (prev - 1 + totalCategories) % totalCategories);
  };

  const handleNextCategories = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryStartIndex((prev) => (prev + 1) % totalCategories);
  };

  const mobileNavLinks = [
    { label: "All Gifts", href: "/catalog" },
    { label: "Product Categories", href: "/#categories" },
    { label: "Our Story", href: "/about" },
  ];

  const handleMobileNavClick = (href: string, e: React.MouseEvent) => {
    setMobileMenuOpen(false);
    if (href.includes("#categories")) {
      if (typeof window !== "undefined" && window.location.pathname === "/") {
        e.preventDefault();
        const el = document.getElementById("categories");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          window.location.hash = "categories";
        }
      }
    }
  };


  return (
    <header
      className={`sticky top-0 z-50 relative transition-all duration-300 ${
        isScrolled && !categoriesOpen && !desktopSearchOpen
          ? "bg-[#FAF8F5]/95 dark:bg-[#12100E]/95 backdrop-blur-md shadow-xs border-b border-[#E5DFD4] dark:border-[#2E2925]"
          : "bg-[#FAF8F5] dark:bg-[#12100E] border-b border-[#EAE3D8] dark:border-[#2E2925]"
      }`}
    >
      {/* Top Announcement Bar (Theme-aware styling matching active preset) */}
      {brandSettings.enableAnnouncement && !announcementDismissed && brandSettings.announcementText && (
        <div className="bg-primary text-primary-foreground px-3 sm:px-6 py-2 text-[11px] sm:text-xs font-medium tracking-wide transition-all border-b border-border/40 relative z-20 shadow-xs">
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex-1 flex items-center justify-center text-center">
              {brandSettings.announcementLink ? (
                <Link
                  href={brandSettings.announcementLink}
                  className="hover:underline inline-flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90 font-medium"
                >
                  <span>{brandSettings.announcementText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
                </Link>
              ) : (
                <span>{brandSettings.announcementText}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setAnnouncementDismissed(true)}
              className="text-primary-foreground/70 hover:text-primary-foreground p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              aria-label="Dismiss Announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Full-width container extending from screen edge to screen edge with adaptive margins */}
      <div className="w-full px-3 sm:px-5 lg:px-6 xl:px-10 2xl:px-14">
        {/* ================= DESKTOP HEADER (>= 1024px) ================= */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] items-center h-18 sm:h-20 w-full gap-2 xl:gap-4">
          {/* Left Column: Theme Toggle Switch Pill on the far left edge + Product Categories Pill */}
          <div className="flex items-center justify-start gap-2.5 xl:gap-3.5 min-w-0">
            {/* Theme Toggle Switch Pill (Left-most edge) */}
            <ThemeToggle />

            <div className="h-4 w-px bg-[#E2DACD] dark:bg-[#2E2925] shrink-0" />

            {/* Product Categories Pill Button */}
            <button
              ref={categoriesButtonRef}
              type="button"
              onClick={() => {
                setCategoriesOpen(!categoriesOpen);
                if (desktopSearchOpen) setDesktopSearchOpen(false);
              }}
              className={`flex items-center gap-2 px-3 xl:px-3.5 py-1.5 rounded-full border transition-all duration-200 shadow-xs cursor-pointer shrink-0 select-none group ${
                categoriesOpen
                  ? "bg-[#181513] text-[#FAF8F5] border-[#181513] dark:bg-[#FAF8F5] dark:text-[#181513] dark:border-[#FAF8F5]"
                  : "bg-white dark:bg-[#1A1715] text-[#181513] dark:text-[#FAF8F5] border-[#DDD5C7] dark:border-[#2E2925] hover:border-[#181513] dark:hover:border-[#FAF8F5]"
              }`}
              aria-expanded={categoriesOpen}
              aria-label="Toggle Product Categories Menu"
            >
              <LayoutGrid
                className={`w-3.5 h-3.5 transition-colors ${
                  categoriesOpen
                    ? "text-[#FAF8F5] dark:text-[#181513]"
                    : "text-[#A64732] dark:text-[#E07A5F]"
                }`}
              />
              <span className="text-[11px] xl:text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                Product Categories
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  categoriesOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Center Column: Brand Logo or Typography Wordmark (Bounded strictly to header bounds) */}
          <div className="flex items-center justify-center px-4 shrink-0 max-h-[48px] overflow-hidden">
            <Link
              href="/"
              className="flex flex-col items-center justify-center text-center select-none group"
            >
              {brandSettings.logoUrl && !logoImgFailed ? (
                <div
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    width: `${Math.min(160, Math.max(60, brandSettings.logoWidth || 130))}px`,
                    maxWidth: "160px",
                  }}
                >
                  <img
                    src={brandSettings.logoUrl}
                    alt={brandSettings.storeName || "The Fourfold"}
                    onError={() => setLogoImgFailed(true)}
                    className="max-h-[42px] w-auto max-w-full object-contain select-none"
                  />
                </div>
              ) : (
                <>
                  <span className="text-base lg:text-lg xl:text-2xl font-bold tracking-[0.14em] text-[#181513] dark:text-[#FAF8F5] group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F] transition-colors uppercase whitespace-nowrap">
                    {brandSettings.storeName || "The Fourfold"}
                  </span>
                  <span className="text-[7.5px] lg:text-[8.5px] xl:text-[9.5px] tracking-[0.22em] uppercase text-[#736B62] dark:text-[#B5ACA1] font-medium -mt-0.5 whitespace-nowrap">
                    {brandSettings.storeLocation || "Studio • Mumbai"}
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* Right Column: Our Story + Search + Cart Pill + User Pill on the far right edge */}
          <div className="flex items-center justify-end gap-2 xl:gap-3 2xl:gap-4 min-w-0">
            {/* Our Story Link */}
            <Link
              href="/about"
              className="relative py-1.5 px-2 text-[10.5px] xl:text-[11.5px] 2xl:text-xs uppercase tracking-[0.1em] font-medium text-[#2E2925] dark:text-[#D1C9BE] hover:text-[#A64732] dark:hover:text-[#E07A5F] transition-colors whitespace-nowrap group shrink-0"
            >
              <span>Our Story</span>
              <span className="absolute bottom-0 left-2 right-2 h-[1.5px] bg-[#A64732] dark:bg-[#E07A5F] transition-all duration-300 w-0 group-hover:w-[calc(100%-16px)]" />
            </Link>

            <div className="h-4 w-px bg-[#E2DACD] dark:bg-[#2E2925] shrink-0" />

            {/* Search Trigger Button */}
            <button
              ref={desktopSearchButtonRef}
              type="button"
              onClick={() => {
                setDesktopSearchOpen(!desktopSearchOpen);
                if (categoriesOpen) setCategoriesOpen(false);
              }}
              className="p-1.5 xl:p-2 text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F] transition-colors rounded-full hover:bg-[#F2EDE4] dark:hover:bg-[#1A1715] shrink-0"
              aria-label="Search"
              title="Search handcrafted gifts"
            >
              <Search className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
            </button>

            {/* Cart Button Pill */}
            <button
              onClick={openCart}
              className="flex items-center gap-1.5 px-2.5 py-1 xl:px-3 xl:py-1.5 text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F] transition-colors border border-[#DDD5C7] dark:border-[#2E2925] rounded-full hover:border-[#181513] dark:hover:border-[#FAF8F5] bg-white dark:bg-[#1A1715] shadow-xs shrink-0"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
              <span className="text-[11px] font-bold tracking-wider" suppressHydrationWarning>
                {mounted ? count : 0}
              </span>
            </button>

            {/* User Pill Button with Dropdown (Visible across all desktop display sizes) */}
            {mounted && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 xl:pr-3 rounded-full border border-[#DDD5C7] dark:border-[#2E2925] bg-white dark:bg-[#1A1715] hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-all duration-200 shadow-xs shrink-0 cursor-pointer group select-none"
                  title={`Signed in as ${user.name}`}
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-6 h-6 min-w-[24px] min-h-[24px] rounded-full aspect-square bg-[#181513] text-white dark:bg-[#FAF8F5] dark:text-[#181513] text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="inline text-[11px] xl:text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] max-w-[65px] xl:max-w-[85px] truncate capitalize">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-[#786F64] dark:text-[#A89F91] transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#DDD5C7] dark:border-[#2E2925] bg-white dark:bg-[#181412] shadow-xl p-2 z-50 text-xs animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-[#EAE3D8] dark:border-[#282320]">
                      <p className="font-bold text-[#181513] dark:text-[#FAF8F5] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] truncate">{user.email}</p>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        href="/account?tab=orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#181513] dark:text-[#FAF8F5] hover:bg-[#F2EDE4] dark:hover:bg-[#24201D] font-medium transition-colors"
                      >
                        <Package className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
                        <span>My Orders & Tracking</span>
                      </Link>
                      <Link
                        href="/account?tab=profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#181513] dark:text-[#FAF8F5] hover:bg-[#F2EDE4] dark:hover:bg-[#24201D] font-medium transition-colors"
                      >
                        <User className="w-4 h-4 text-[#786F64]" />
                        <span>Profile & Settings</span>
                      </Link>
                      <Link
                        href="/account?tab=addresses"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#181513] dark:text-[#FAF8F5] hover:bg-[#F2EDE4] dark:hover:bg-[#24201D] font-medium transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-[#786F64]" />
                        <span>Saved Addresses</span>
                      </Link>
                      <Link
                        href="/account?tab=wallet"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#181513] dark:text-[#FAF8F5] hover:bg-[#F2EDE4] dark:hover:bg-[#24201D] font-medium transition-colors"
                      >
                        <TicketPercent className="w-4 h-4 text-[#786F64]" />
                        <span>Coupons & Wallet</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-[#EAE3D8] dark:border-[#282320]">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/account"
                className="flex items-center gap-1.5 px-2.5 py-1 xl:px-3.5 xl:py-1.5 rounded-full border border-[#DDD5C7] dark:border-[#2E2925] bg-white dark:bg-[#1A1715] hover:border-[#181513] dark:hover:border-[#FAF8F5] text-[#181513] dark:text-[#FAF8F5] transition-all duration-200 shadow-xs shrink-0 group"
                title="Sign In / Account"
              >
                <User className="w-3.5 h-3.5 text-[#181513] dark:text-[#FAF8F5] group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F] transition-colors" />
                <span className="inline text-[10px] xl:text-xs font-semibold uppercase tracking-wider group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F] transition-colors">
                  Sign In
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* ================= MOBILE HEADER (< 1024px) ================= */}
        <div className="flex lg:hidden items-center justify-between h-16 sm:h-18">
          {/* Left: Reserved exclusively for the dropdown menu (Hamburger) */}
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              if (mobileSearchOpen) setMobileSearchOpen(false);
            }}
            className="p-2 text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F] transition-colors rounded-full"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Center: Brand Logo or Wordmark */}
          <Link
            href="/"
            className="flex flex-col items-start text-left select-none px-1 group max-w-[140px] sm:max-w-[170px] max-h-[44px] overflow-hidden"
          >
            {brandSettings.logoUrl && !logoImgFailed ? (
              <div
                className="flex items-center justify-start"
                style={{
                  width: `${Math.min(130, Math.max(60, brandSettings.logoWidth || 130))}px`,
                  maxWidth: "130px",
                }}
              >
                <img
                  src={brandSettings.logoUrl}
                  alt={brandSettings.storeName || "The Fourfold"}
                  onError={() => setLogoImgFailed(true)}
                  className="max-h-[36px] w-auto max-w-full object-contain select-none"
                />
              </div>
            ) : (
              <>
                <span className="text-sm sm:text-base font-bold tracking-[0.12em] uppercase text-[#181513] dark:text-[#FAF8F5] whitespace-nowrap text-left">
                  {brandSettings.storeName || "The Fourfold"}
                </span>
                <span className="text-[7.5px] sm:text-[8.5px] tracking-[0.12em] uppercase text-[#736B62] dark:text-[#B5ACA1] font-medium -mt-0.5 whitespace-nowrap text-left">
                  {brandSettings.storeLocation || "Studio • Mumbai"}
                </span>
              </>
            )}
          </Link>

          {/* Right: Search + Circular Theme Toggle + Cart + User Button */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className="p-1.5 text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F] transition-colors rounded-full"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Circular Theme Toggle Button like before on phone */}
            <ThemeToggle variant="circle" />

            <button
              onClick={openCart}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F] transition-colors border border-[#DDD5C7] dark:border-[#2E2925] rounded-full bg-white dark:bg-[#1A1715] shadow-xs"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold" suppressHydrationWarning>
                {mounted ? count : 0}
              </span>
            </button>

            {mounted && user ? (
              <Link
                href="/account"
                className="w-7 h-7 min-w-[28px] min-h-[28px] rounded-full aspect-square bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs"
                title={`Signed in as ${user.name}`}
              >
                {user.name.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <Link
                href="/account"
                className="p-1.5 text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F] transition-colors rounded-full"
                title="Account"
              >
                <User className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ================= PORTALED FULL-SCREEN BACKDROP OVERLAY ================= */}
      {mounted && (categoriesOpen || desktopSearchOpen) && createPortal(
        <div
          className="fixed inset-0 z-40 bg-black/70 dark:bg-black/85 backdrop-blur-md transition-opacity duration-200 cursor-pointer"
          onClick={() => {
            setCategoriesOpen(false);
            setDesktopSearchOpen(false);
          }}
          aria-hidden="true"
        />,
        document.body
      )}

      {/* ================= PRODUCT CATEGORIES OVERLAY POPUP (EXPLORA JOURNEYS EDITORIAL MEGA-MENU) ================= */}
      {categoriesOpen && (
        <div
          ref={categoriesRef}
          className="absolute top-full left-0 right-0 z-50 hidden lg:block border-t border-border bg-card/98 backdrop-blur-xl px-6 xl:px-14 py-8 animate-in slide-in-from-top-2 duration-200 shadow-2xl max-h-[85vh] overflow-y-auto"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-8 xl:gap-12 items-start">
              {/* Left Column: Studio Collections Directory */}
              <div className="col-span-4 xl:col-span-4 border-r border-border pr-8 xl:pr-10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                    Exclusive Collections
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    0{categoriesList.length} Editions
                  </span>
                </div>

                <ul className="space-y-1">
                  {categoriesList.map((cat) => {
                    const isHovered =
                      (hoveredCategorySlug && hoveredCategorySlug === cat.slug) ||
                      (!hoveredCategorySlug && categoriesList[0]?.slug === cat.slug);

                    return (
                      <li key={cat.slug} onMouseEnter={() => setHoveredCategorySlug(cat.slug)}>
                        <Link
                          href={cat.href}
                          onClick={() => setCategoriesOpen(false)}
                          className={`group flex items-center justify-between py-1.5 px-2 rounded-lg text-xs xl:text-[13px] font-medium transition-all ${
                            isHovered
                              ? "text-accent bg-accent/8 font-semibold"
                              : "text-foreground/90 hover:text-accent hover:bg-secondary/40"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {cat.image ? (
                              <span className="w-5 h-5 rounded-md overflow-hidden bg-secondary shrink-0 border border-border inline-block shadow-2xs">
                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                              </span>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-accent/40 group-hover:bg-accent shrink-0 transition-colors" />
                            )}
                            <span className="truncate group-hover:translate-x-1 transition-transform duration-200">
                              {cat.name}
                            </span>
                          </div>
                          <ArrowUpRight
                            className={`w-3.5 h-3.5 text-accent transition-all duration-200 shrink-0 ml-2 ${
                              isHovered
                                ? "opacity-100 translate-x-0.5 -translate-y-0.5"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="pt-4 border-t border-border">
                  <Link
                    href="/catalog"
                    onClick={() => setCategoriesOpen(false)}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent hover:text-foreground transition-colors group"
                  >
                    <span>View Complete Studio Catalogue</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Editorial Spotlight Visual Cards */}
              {(() => {
                const isHovered = Boolean(hoveredCategorySlug);
                const activeHoveredCategory = hoveredCategorySlug
                  ? categoriesList.find((c) => c.slug === hoveredCategorySlug)
                  : null;

                const s1Config = customSpotlights?.spotlight1;
                const s2Config = customSpotlights?.spotlight2;

                const defaultCat1 =
                  categoriesList.find((c) => c.image) || categoriesList[0];
                const defaultCat2 =
                  categoriesList.find((c) => c.slug !== (activeHoveredCategory?.slug || defaultCat1?.slug) && c.image) ||
                  categoriesList.find((c) => c.slug !== (activeHoveredCategory?.slug || defaultCat1?.slug)) ||
                  categoriesList[1] ||
                  categoriesList[0];

                const card1 = {
                  enabled: s1Config?.enabled !== false,
                  badge: isHovered
                    ? (activeHoveredCategory?.slug === "explosion-boxes" ? "Atelier Signature" : "Spotlight Edition")
                    : (s1Config?.badge || "Spotlight Edition"),
                  title: isHovered
                    ? activeHoveredCategory?.name
                    : (s1Config?.title || defaultCat1?.name || "Curated Creation"),
                  description: isHovered
                    ? (activeHoveredCategory?.description || "Handcrafted creation folded with intent and archival care in Bandra.")
                    : (s1Config?.description || defaultCat1?.description || "Handcrafted creation folded with intent and archival care in Bandra."),
                  image: isHovered
                    ? (activeHoveredCategory?.image || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80")
                    : (s1Config?.image || defaultCat1?.image || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"),
                  link: isHovered
                    ? (activeHoveredCategory?.href || `/catalog?category=${activeHoveredCategory?.slug}`)
                    : (s1Config?.link || defaultCat1?.href || `/catalog?category=${defaultCat1?.slug}`),
                };

                const card2 = {
                  enabled: s2Config?.enabled !== false,
                  badge: s2Config?.badge || "Archival Keepsake",
                  title: s2Config?.title || defaultCat2?.name || "Artisan Keepsakes",
                  description: s2Config?.description || defaultCat2?.description || "Heavyweight deckled cotton papers, satin ribbon closures, and custom hot wax seals.",
                  image: s2Config?.image || defaultCat2?.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
                  link: s2Config?.link || defaultCat2?.href || `/catalog?category=${defaultCat2?.slug}`,
                };

                const showCard1 = card1.enabled;
                const showCard2 = !isHovered && card2.enabled;

                if (!showCard1 && !showCard2) return null;

                return (
                  <div className="col-span-8 xl:col-span-8 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                        Curated Spotlight
                      </span>
                      <button
                        type="button"
                        onClick={() => setCategoriesOpen(false)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors cursor-pointer"
                        aria-label="Close menu"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className={`grid ${showCard1 && showCard2 ? "grid-cols-2 gap-5 xl:gap-6" : "grid-cols-1 gap-5 max-w-md mx-auto"}`}>
                      {/* Spotlight 1: Dynamic Selected / Configured Category */}
                      {showCard1 && (
                        <Link
                          href={card1.link}
                          onClick={() => setCategoriesOpen(false)}
                          className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card hover:border-accent transition-all duration-300 shadow-xs"
                        >
                          <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                            <img
                              src={card1.image}
                              alt={card1.title || "Spotlight 1"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold bg-card/90 text-foreground backdrop-blur-xs shadow-xs border border-border">
                              {card1.badge}
                            </span>
                          </div>
                          <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-foreground group-hover:text-accent transition-colors leading-snug">
                                {card1.title}
                              </h4>
                              <p className="text-[11.5px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                {card1.description}
                              </p>
                            </div>
                            <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-accent uppercase tracking-wider">
                              <span>Explore Collection</span>
                              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      )}

                      {/* Spotlight 2: Secondary Configured Category */}
                      {showCard2 && (
                        <Link
                          href={card2.link}
                          onClick={() => setCategoriesOpen(false)}
                          className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card hover:border-accent transition-all duration-300 shadow-xs"
                        >
                          <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                            <img
                              src={card2.image}
                              alt={card2.title || "Spotlight 2"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold bg-card/90 text-foreground backdrop-blur-xs shadow-xs border border-border">
                              {card2.badge}
                            </span>
                          </div>
                          <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-foreground group-hover:text-accent transition-colors leading-snug">
                                {card2.title}
                              </h4>
                              <p className="text-[11.5px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                {card2.description}
                              </p>
                            </div>
                            <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-accent uppercase tracking-wider">
                              <span>Explore Collection</span>
                              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ================= EDITORIAL SEARCH OVERLAY (DESKTOP) ================= */}
      {desktopSearchOpen && (
        <div
          ref={desktopSearchRef}
          className="absolute top-full left-0 right-0 z-50 hidden lg:block border-t border-[#E5DFD4] dark:border-[#2E2925] bg-[#FAF8F5]/98 dark:bg-[#12100E]/98 backdrop-blur-md px-6 py-4 animate-in slide-in-from-top-2 duration-200 shadow-xl"
        >
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-5 h-5 text-[#736B62] dark:text-[#A89F91] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for explosion boxes, handmade cards, crochet flowers, scrapbooks..."
                className="w-full h-11 pl-11 pr-10 text-sm bg-white dark:bg-[#1A1715] border border-[#DDD5C7] dark:border-[#2E2925] rounded-full text-[#181513] dark:text-[#FAF8F5] placeholder:text-[#9A9185] dark:placeholder:text-[#665E54] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5] shadow-xs"
              />
              <button
                type="button"
                onClick={() => setDesktopSearchOpen(false)}
                className="absolute right-3 p-1 text-[#736B62] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5] rounded-full"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center gap-2 mt-2.5 text-xs text-[#736B62] dark:text-[#A89F91] pl-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider font-semibold">Popular:</span>
              {popularTags.map((tag) => (
                <Link
                  key={tag.label}
                  href={tag.href}
                  onClick={() => setDesktopSearchOpen(false)}
                  className="px-2.5 py-0.5 rounded-full bg-[#EFE9DF] dark:bg-[#262220] text-[#181513] dark:text-[#FAF8F5] hover:bg-[#A64732] hover:text-white dark:hover:bg-[#E07A5F] text-[11px] transition-colors"
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE INLINE SEARCH BAR ================= */}
      {mobileSearchOpen && (
        <div className="lg:hidden border-t border-[#E5DFD4] dark:border-[#2E2925] bg-[#FAF8F5] dark:bg-[#12100E] p-3 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gifts, explosion boxes..."
              className="w-full h-10 pl-9 pr-10 text-xs bg-white dark:bg-[#1A1715] border border-[#DDD5C7] dark:border-[#2E2925] rounded-full text-[#181513] dark:text-[#FAF8F5] placeholder:text-[#9A9185] dark:placeholder:text-[#665E54] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
            />
            <Search className="w-4 h-4 text-[#736B62] dark:text-[#A89F91] absolute left-3 pointer-events-none" />
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="absolute right-3 p-1 text-[#736B62] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
          {popularTags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-[#736B62] dark:text-[#A89F91] flex-wrap">
              <span className="text-[10px] uppercase tracking-wider font-semibold">Popular:</span>
              {popularTags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.label}
                  href={tag.href}
                  onClick={() => setMobileSearchOpen(false)}
                  className="px-2 py-0.5 rounded-full bg-[#EFE9DF] dark:bg-[#262220] text-[#181513] dark:text-[#FAF8F5] hover:bg-[#A64732] hover:text-white dark:hover:bg-[#E07A5F] text-[10px] transition-colors"
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= MOBILE NAVIGATION DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5DFD4] dark:border-[#2E2925] bg-[#FAF8F5] dark:bg-[#12100E] p-5 space-y-5 animate-in fade-in duration-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gifts, explosion boxes..."
              className="w-full h-10 pl-9 pr-3 text-xs bg-white dark:bg-[#1A1715] border border-[#DDD5C7] dark:border-[#2E2925] rounded-full text-[#181513] dark:text-[#FAF8F5] placeholder:text-[#9A9185] dark:placeholder:text-[#665E54] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
            />
            <Search className="w-4 h-4 text-[#736B62] dark:text-[#A89F91] absolute left-3 top-3 pointer-events-none" />
          </form>

          <div className="space-y-1">
            {mobileNavLinks.map((item, idx) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleMobileNavClick(item.href, e)}
                className="flex items-baseline justify-between py-2.5 border-b border-[#EFE9DF] dark:border-[#2E2925] text-xs uppercase tracking-[0.14em] font-medium text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F]"
              >
                <span>{item.label}</span>
                <span className="text-[10px] font-medium text-[#9B9287] dark:text-[#A89F91]">0{idx + 1}</span>
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 text-xs font-semibold uppercase tracking-widest text-[#A64732] dark:text-[#E07A5F]"
            >
              <span>Account & Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
