import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await db.studioSetting.findUnique({
      where: { id: "default" },
    });

    // Fail-safe: if both payment methods disabled, enforce COD as safe fallback
    const enableUpi = setting?.enableUpi ?? true;
    let enableCod = setting?.enableCod ?? true;
    if (!enableUpi && !enableCod) {
      enableCod = true;
    }

    const payload = {
      settings: {
        storeName: setting?.storeName || "M.E-Commerce",
        tagline: setting?.tagline || "Minimalist, Modular E-Commerce Platform",
        storeLocation: setting?.storeLocation || "Studio • Modern Atelier",
        whatsapp: setting?.whatsapp || "+1234567890",
        instagram: setting?.instagram || "https://instagram.com",
        upiId: setting?.upiId || "merchant@upi",
        upiName: setting?.upiName || "M.E-Commerce Store",
        studioAddress: setting?.studioAddress || "Design District, Atelier Studio",

        // Modular Branding & Logo
        logoUrl: setting?.logoUrl || null,
        logoWidth: Math.min(160, Math.max(60, setting?.logoWidth || 130)),

        // Modular Social, SEO & Favicon / Brand Assets
        ogTitle: setting?.ogTitle || null,
        ogDescription: setting?.ogDescription || null,
        ogImageUrl: setting?.ogImageUrl || null,
        faviconSvg: setting?.faviconSvg || null,
        brandAccentColor: setting?.brandAccentColor || "#181513",

        // Exclusive Theme Preset
        activeTheme: setting?.activeTheme || "warm-terracotta",

        // Currency
        currencyCode: setting?.currencyCode || "INR",
        currencySymbol: setting?.currencySymbol || "₹",

        // Payment Methods (COD is safe fallback)
        enableUpi,
        enableCod,
        codInstructions: setting?.codInstructions || null,

        // Homepage Hero
        heroTitle: setting?.heroTitle || null,
        heroSubtitle: setting?.heroSubtitle || null,
        heroImage: setting?.heroImage || null,
        heroFeaturedCategoryId: setting?.heroFeaturedCategoryId || null,
        heroFeaturedCategoryLabel: setting?.heroFeaturedCategoryLabel || null,

        // Our Story Atelier
        aboutTitle: setting?.aboutTitle || null,
        aboutSlogan: setting?.aboutSlogan || null,
        aboutDescription: setting?.aboutDescription || null,
        aboutImage: setting?.aboutImage || null,
        aboutStoryBadge: setting?.aboutStoryBadge || "The Atelier",
        aboutStoryHeading: setting?.aboutStoryHeading || "Behind M.E-Commerce",

        // Modular Footer
        footerAbout: setting?.footerAbout || null,
        footerDispatchNote: setting?.footerDispatchNote || "Insured Express Dispatch",
        footerCopyrightText: setting?.footerCopyrightText || "Crafted with precision & care.",
        footerSecurityBadges: setting?.footerSecurityBadges || "Secure UPI & Cards • Insured Transit",

        // Modular Navigation & Search
        searchPopularTags: setting?.searchPopularTags || "Explosion Boxes, Pop-up Cards, Linen Scrapbooks, Crochet Tulips",
        curatedSpotlightsConfig: setting?.curatedSpotlightsConfig || null,

        // Modular Craft Principles
        craftPrinciples: setting?.craftPrinciples || null,
        principlesBadge: setting?.principlesBadge || "Craft Principles",
        principlesHeading: setting?.principlesHeading || "What Makes Every Gift Special",
        principlesSubheading: setting?.principlesSubheading || "Core Quality Standards",

        // Modular Instagram Section (Homepage)
        instagramBadge: setting?.instagramBadge || "Design Studio",
        instagramHeading: setting?.instagramHeading || "Watch Creations Unfold Daily",
        instagramDescription: setting?.instagramDescription || "See craft demonstrations, dedications, and unboxings on our official social channel.",
        instagramButtonText: setting?.instagramButtonText || "@mecommerce",

        // Modular Announcement Bar (Storewide Header)
        enableAnnouncement: setting?.enableAnnouncement ?? true,
        announcementText: setting?.announcementText || "Complimentary signature wax-sealed keepsake card with all orders",
        announcementLink: setting?.announcementLink || "/catalog",

        // Modular Commerce & Shipping
        freeShippingThreshold: setting?.freeShippingThreshold ?? 999,
        standardShippingFee: setting?.standardShippingFee ?? 99,

        // Modular Product Detail Page (PDP)
        pdpShowHighlights: setting?.pdpShowHighlights ?? true,
        pdpHighlight1Title: setting?.pdpHighlight1Title || "{craftDays} Days Handcraft",
        pdpHighlight1Subtitle: setting?.pdpHighlight1Subtitle || "Folded individually in our studio",
        pdpHighlight2Title: setting?.pdpHighlight2Title || "Insured Dispatch",
        pdpHighlight2Subtitle: setting?.pdpHighlight2Subtitle || "Delivered safely with care",
        pdpHighlightsConfig: setting?.pdpHighlightsConfig || null,
        pdpShowRelated: setting?.pdpShowRelated ?? true,
        pdpRelatedBadge: setting?.pdpRelatedBadge || "Complementary Pieces",
        pdpRelatedHeading: setting?.pdpRelatedHeading || "Complete Your Gifting Suite",
        enableReviews: setting?.enableReviews ?? true,
        enableWaxSealCustomization: setting?.enableWaxSealCustomization ?? true,
        enableGiftWrapCustomization: setting?.enableGiftWrapCustomization ?? true,
      },
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("Public settings error:", error);
    return NextResponse.json({
      settings: {
        storeName: "M.E-Commerce",
        tagline: "Minimalist, Modular E-Commerce Platform",
        storeLocation: "Studio • Modern Atelier",
        whatsapp: "+1234567890",
        instagram: "https://instagram.com",
        upiId: "merchant@upi",
        upiName: "M.E-Commerce Store",
        studioAddress: "Design District, Atelier Studio",
        logoUrl: null,
        logoWidth: 130,
        ogTitle: null,
        ogDescription: null,
        ogImageUrl: null,
        faviconSvg: null,
        brandAccentColor: "#181513",
        activeTheme: "warm-terracotta",
        currencyCode: "INR",
        currencySymbol: "₹",
        enableUpi: true,
        enableCod: true,
        codInstructions: null,
        heroTitle: null,
        heroSubtitle: null,
        heroImage: null,
        heroFeaturedCategoryId: null,
        heroFeaturedCategoryLabel: null,
        aboutTitle: null,
        aboutSlogan: null,
        aboutDescription: null,
        aboutImage: null,
        aboutStoryBadge: "The Atelier",
        aboutStoryHeading: "Behind M.E-Commerce",
        footerAbout: null,
        footerDispatchNote: "Insured Express Dispatch",
        footerCopyrightText: "Crafted with precision & care.",
        footerSecurityBadges: "Secure UPI & Cards • Insured Transit",
        searchPopularTags: "Explosion Boxes, Pop-up Cards, Linen Scrapbooks, Crochet Tulips",
        curatedSpotlightsConfig: null,
        craftPrinciples: null,
        principlesBadge: "Craft Principles",
        principlesHeading: "What Makes Every Gift Special",
        principlesSubheading: "Core Quality Standards",
        instagramBadge: "Design Studio",
        instagramHeading: "Watch Creations Unfold Daily",
        instagramDescription: "See craft demonstrations, dedications, and unboxings on our official social channel.",
        instagramButtonText: "@mecommerce",
        enableAnnouncement: true,
        announcementText: "Complimentary signature wax-sealed keepsake card with all orders",
        announcementLink: "/catalog",
        freeShippingThreshold: 999,
        standardShippingFee: 99,
        pdpShowHighlights: true,
        pdpHighlight1Title: "{craftDays} Days Handcraft",
        pdpHighlight1Subtitle: "Folded individually in our studio",
        pdpHighlight2Title: "Insured Dispatch",
        pdpHighlight2Subtitle: "Delivered safely with care",
        pdpHighlightsConfig: null,
        pdpShowRelated: true,
        pdpRelatedBadge: "Complementary Pieces",
        pdpRelatedHeading: "Complete Your Gifting Suite",
        enableReviews: true,
        enableWaxSealCustomization: true,
        enableGiftWrapCustomization: true,
      },
    });
  }
}
