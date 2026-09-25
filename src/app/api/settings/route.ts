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
        storeName: setting?.storeName || "The Fourfold",
        tagline: setting?.tagline || "Handcrafted with Love, Folded to Cherish",
        storeLocation: setting?.storeLocation || "Studio • Mumbai",
        whatsapp: setting?.whatsapp || "+919876543210",
        instagram: setting?.instagram || "https://instagram.com/thefourfold.official",
        upiId: setting?.upiId || "thefourfold@oksbi",
        upiName: setting?.upiName || "The Fourfold Craft Studio",
        studioAddress: setting?.studioAddress || "Bandra West, Mumbai 400050, Maharashtra, India",

        // Modular Branding & Logo
        logoUrl: setting?.logoUrl || null,
        logoWidth: Math.min(160, Math.max(60, setting?.logoWidth || 130)),

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
        aboutStoryHeading: setting?.aboutStoryHeading || "Behind The Fourfold",

        // Modular Footer
        footerAbout: setting?.footerAbout || null,
        footerDispatchNote: setting?.footerDispatchNote || "Pan-India Insured Dispatch",
        footerCopyrightText: setting?.footerCopyrightText || "Handcrafted with care in Mumbai.",
        footerSecurityBadges: setting?.footerSecurityBadges || "Secure UPI & Cards • Insured Transit",

        // Modular Navigation & Search
        searchPopularTags: setting?.searchPopularTags || "Explosion Boxes, Pop-up Cards, Linen Scrapbooks, Crochet Tulips",
        curatedSpotlightsConfig: setting?.curatedSpotlightsConfig || null,

        // Modular Craft Principles
        craftPrinciples: setting?.craftPrinciples || null,
        principlesBadge: setting?.principlesBadge || "Craft Principles",
        principlesHeading: setting?.principlesHeading || "What Makes Every Gift Special",
        principlesSubheading: setting?.principlesSubheading || "Fourfold Standards",

        // Modular Instagram Section (Homepage)
        instagramBadge: setting?.instagramBadge || "Bandra West • Mumbai",
        instagramHeading: setting?.instagramHeading || "Watch Creations Unfold Daily",
        instagramDescription: setting?.instagramDescription || "See folding demonstrations, custom calligraphy dedications, and unboxings on our official studio Instagram.",
        instagramButtonText: setting?.instagramButtonText || "@thefourfold.official",

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
        storeName: "The Fourfold",
        tagline: "Handcrafted with Love, Folded to Cherish",
        storeLocation: "Studio • Mumbai",
        whatsapp: "+919876543210",
        instagram: "https://instagram.com/thefourfold.official",
        upiId: "thefourfold@oksbi",
        upiName: "The Fourfold Craft Studio",
        studioAddress: "Bandra West, Mumbai 400050, Maharashtra, India",
        logoUrl: null,
        logoWidth: 130,
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
        aboutStoryHeading: "Behind The Fourfold",
        footerAbout: null,
        footerDispatchNote: "Pan-India Insured Dispatch",
        footerCopyrightText: "Handcrafted with care in Mumbai.",
        footerSecurityBadges: "Secure UPI & Cards • Insured Transit",
        searchPopularTags: "Explosion Boxes, Pop-up Cards, Linen Scrapbooks, Crochet Tulips",
        curatedSpotlightsConfig: null,
        craftPrinciples: null,
        principlesBadge: "Craft Principles",
        principlesHeading: "What Makes Every Gift Special",
        principlesSubheading: "Fourfold Standards",
        instagramBadge: "Bandra West • Mumbai",
        instagramHeading: "Watch Creations Unfold Daily",
        instagramDescription: "See folding demonstrations, custom calligraphy dedications, and unboxings on our official studio Instagram.",
        instagramButtonText: "@thefourfold.official",
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
