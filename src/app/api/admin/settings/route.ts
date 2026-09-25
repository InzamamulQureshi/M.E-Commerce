import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession, hashPassword, comparePassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Default fallback settings
const DEFAULT_SETTINGS = {
  storeName: process.env.NEXT_PUBLIC_STORE_NAME || "M.E-Commerce",
  tagline: process.env.NEXT_PUBLIC_STORE_TAGLINE || "Minimalist, Modular E-Commerce Platform",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM || "https://instagram.com",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "+1234567890",
  upiId: process.env.NEXT_PUBLIC_UPI_ID || "merchant@upi",
  upiName: process.env.NEXT_PUBLIC_UPI_NAME || "M.E-Commerce Store",
  studioAddress: "Design District, Atelier Studio",
};

// GET studio environment settings & diagnostics
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    let settingRecord = await db.studioSetting.findUnique({
      where: { id: "default" },
    });

    if (!settingRecord) {
      settingRecord = await db.studioSetting.create({
        data: {
          id: "default",
          ...DEFAULT_SETTINGS,
        },
      });
    }

    const categories = await db.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: true } },
      },
      orderBy: { orderIndex: "asc" },
    });

    return NextResponse.json({
      settings: {
        storeName: settingRecord.storeName,
        tagline: settingRecord.tagline,
        storeLocation: settingRecord.storeLocation || "Studio • Modern Atelier",
        instagram: settingRecord.instagram,
        whatsapp: settingRecord.whatsapp,
        upiId: settingRecord.upiId,
        upiName: settingRecord.upiName,
        studioAddress: settingRecord.studioAddress,
        logoUrl: settingRecord.logoUrl || null,
        logoWidth: settingRecord.logoWidth || 130,
        ogTitle: settingRecord.ogTitle || null,
        ogDescription: settingRecord.ogDescription || null,
        ogImageUrl: settingRecord.ogImageUrl || null,
        faviconSvg: settingRecord.faviconSvg || null,
        brandAccentColor: settingRecord.brandAccentColor || "#181513",
        activeTheme: settingRecord.activeTheme || "warm-terracotta",
        currencyCode: settingRecord.currencyCode || "INR",
        currencySymbol: settingRecord.currencySymbol || "₹",
        enableUpi: settingRecord.enableUpi ?? true,
        enableCod: settingRecord.enableCod ?? true,
        codInstructions: settingRecord.codInstructions || null,
        heroTitle: settingRecord.heroTitle || null,
        heroSubtitle: settingRecord.heroSubtitle || null,
        heroImage: settingRecord.heroImage || null,
        heroFeaturedCategoryId: settingRecord.heroFeaturedCategoryId || null,
        heroFeaturedCategoryLabel: settingRecord.heroFeaturedCategoryLabel || null,
        aboutTitle: settingRecord.aboutTitle || null,
        aboutSlogan: settingRecord.aboutSlogan || null,
        aboutDescription: settingRecord.aboutDescription || null,
        aboutImage: settingRecord.aboutImage || null,
        aboutStoryBadge: settingRecord.aboutStoryBadge || "The Atelier",
        aboutStoryHeading: settingRecord.aboutStoryHeading || "Behind M.E-Commerce",
        footerAbout: settingRecord.footerAbout || null,
        footerDispatchNote: settingRecord.footerDispatchNote || "Insured Express Dispatch",
        footerCopyrightText: settingRecord.footerCopyrightText || "Crafted with precision & care.",
        footerSecurityBadges: settingRecord.footerSecurityBadges || "Secure UPI & Cards • Insured Transit",
        searchPopularTags: settingRecord.searchPopularTags || "Explosion Boxes, Pop-up Cards, Linen Scrapbooks, Crochet Tulips",
        curatedSpotlightsConfig: settingRecord.curatedSpotlightsConfig || null,
        craftPrinciples: settingRecord.craftPrinciples || null,
        principlesBadge: settingRecord.principlesBadge || "Craft Principles",
        principlesHeading: settingRecord.principlesHeading || "What Makes Every Gift Special",
        principlesSubheading: settingRecord.principlesSubheading || "Core Quality Standards",
        instagramBadge: settingRecord.instagramBadge || "Design Studio",
        instagramHeading: settingRecord.instagramHeading || "Watch Creations Unfold Daily",
        instagramDescription: settingRecord.instagramDescription || null,
        instagramButtonText: settingRecord.instagramButtonText || "@mecommerce",
        enableAnnouncement: settingRecord.enableAnnouncement ?? true,
        announcementText: settingRecord.announcementText || "Complimentary signature wax-sealed keepsake card with all orders",
        announcementLink: settingRecord.announcementLink || "/catalog",
        freeShippingThreshold: settingRecord.freeShippingThreshold ?? 999,
        standardShippingFee: settingRecord.standardShippingFee ?? 99,
        pdpShowHighlights: settingRecord.pdpShowHighlights ?? true,
        pdpHighlight1Title: settingRecord.pdpHighlight1Title || "{craftDays} Days Handcraft",
        pdpHighlight1Subtitle: settingRecord.pdpHighlight1Subtitle || "Folded individually in our studio",
        pdpHighlight2Title: settingRecord.pdpHighlight2Title || "Insured Dispatch",
        pdpHighlight2Subtitle: settingRecord.pdpHighlight2Subtitle || "Delivered safely with care",
        pdpHighlightsConfig: settingRecord.pdpHighlightsConfig || null,
        pdpShowRelated: settingRecord.pdpShowRelated ?? true,
        pdpRelatedBadge: settingRecord.pdpRelatedBadge || "Complementary Pieces",
        pdpRelatedHeading: settingRecord.pdpRelatedHeading || "Complete Your Gifting Suite",
        enableReviews: settingRecord.enableReviews ?? true,
        enableWaxSealCustomization: settingRecord.enableWaxSealCustomization ?? true,
        enableGiftWrapCustomization: settingRecord.enableGiftWrapCustomization ?? true,
        adminEmail: admin.email,
        adminName: admin.name,
      },
      categories,
      diagnostics: {
        nodeEnv: process.env.NODE_ENV || "development",
        databaseConnected: true,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ error: "Failed to load studio settings" }, { status: 500 });
  }
}

// PUT update studio settings or admin password
export async function PUT(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Mode 1: Update Studio Identity & Operational Settings
    if (body.studioSettings) {
      const {
        storeName,
        tagline,
        storeLocation,
        instagram,
        whatsapp,
        upiId,
        upiName,
        studioAddress,
        logoUrl,
        logoWidth,
        ogTitle,
        ogDescription,
        ogImageUrl,
        faviconSvg,
        brandAccentColor,
        activeTheme,
        currencyCode,
        currencySymbol,
        enableUpi,
        enableCod,
        codInstructions,
        heroTitle,
        heroSubtitle,
        heroImage,
        heroFeaturedCategoryId,
        heroFeaturedCategoryLabel,
        aboutTitle,
        aboutSlogan,
        aboutDescription,
        aboutImage,
        aboutStoryBadge,
        aboutStoryHeading,
        footerAbout,
        footerDispatchNote,
        footerCopyrightText,
        footerSecurityBadges,
        searchPopularTags,
        curatedSpotlightsConfig,
        craftPrinciples,
        principlesBadge,
        principlesHeading,
        principlesSubheading,
        instagramBadge,
        instagramHeading,
        instagramDescription,
        instagramButtonText,
        enableAnnouncement,
        announcementText,
        announcementLink,
        freeShippingThreshold,
        standardShippingFee,
        pdpShowHighlights,
        pdpHighlight1Title,
        pdpHighlight1Subtitle,
        pdpHighlight2Title,
        pdpHighlight2Subtitle,
        pdpHighlightsConfig,
        pdpShowRelated,
        pdpRelatedBadge,
        pdpRelatedHeading,
        enableReviews,
        enableWaxSealCustomization,
        enableGiftWrapCustomization,
      } = body.studioSettings;

      const updateData: any = {};
      if (storeName !== undefined) updateData.storeName = String(storeName).trim() || "M.E-Commerce";
      if (tagline !== undefined) updateData.tagline = String(tagline).trim();
      if (storeLocation !== undefined) updateData.storeLocation = String(storeLocation).trim() || "Studio • Modern Atelier";
      if (instagram !== undefined) updateData.instagram = String(instagram).trim();
      if (whatsapp !== undefined) updateData.whatsapp = String(whatsapp).trim();
      if (upiId !== undefined) updateData.upiId = String(upiId).trim();
      if (upiName !== undefined) updateData.upiName = String(upiName).trim();
      if (studioAddress !== undefined) updateData.studioAddress = String(studioAddress).trim();

      // Logo bounded size
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl ? String(logoUrl).trim() : null;
      if (logoWidth !== undefined) {
        const parsedWidth = parseInt(String(logoWidth), 10);
        updateData.logoWidth = isNaN(parsedWidth) ? 130 : Math.min(160, Math.max(60, parsedWidth));
      }

      // Modular Social, SEO & Favicon / Brand Assets
      if (ogTitle !== undefined) updateData.ogTitle = ogTitle ? String(ogTitle).trim() : null;
      if (ogDescription !== undefined) updateData.ogDescription = ogDescription ? String(ogDescription).trim() : null;
      if (ogImageUrl !== undefined) updateData.ogImageUrl = ogImageUrl ? String(ogImageUrl).trim() : null;
      if (faviconSvg !== undefined) updateData.faviconSvg = faviconSvg ? String(faviconSvg).trim() : null;
      if (brandAccentColor !== undefined) updateData.brandAccentColor = brandAccentColor ? String(brandAccentColor).trim() : "#181513";

      // Theme Preset
      if (activeTheme !== undefined) {
        const allowedThemes = ["warm-terracotta", "botanical-sage", "royal-gold", "noir-monochrome", "rose-blush"];
        updateData.activeTheme = allowedThemes.includes(activeTheme) ? activeTheme : "warm-terracotta";
      }

      // Currency
      if (currencyCode !== undefined) {
        updateData.currencyCode = String(currencyCode).trim().toUpperCase() || "INR";
      }
      if (currencySymbol !== undefined) {
        updateData.currencySymbol = String(currencySymbol).trim() || "₹";
      }

      // Payment Acceptance with user-specified COD safe fallback
      if (enableUpi !== undefined || enableCod !== undefined) {
        const currentSetting = await db.studioSetting.findUnique({ where: { id: "default" } });
        let upiVal = enableUpi !== undefined ? Boolean(enableUpi) : (currentSetting?.enableUpi ?? true);
        let codVal = enableCod !== undefined ? Boolean(enableCod) : (currentSetting?.enableCod ?? true);

        // Fail-safe: if admin attempted to disable both, automatically enforce COD as safe fallback
        if (!upiVal && !codVal) {
          codVal = true;
        }

        updateData.enableUpi = upiVal;
        updateData.enableCod = codVal;
      }
      if (codInstructions !== undefined) {
        updateData.codInstructions = codInstructions ? String(codInstructions).trim() : null;
      }

      // Homepage Hero
      if (heroTitle !== undefined) updateData.heroTitle = heroTitle ? String(heroTitle).trim() : null;
      if (heroSubtitle !== undefined) updateData.heroSubtitle = heroSubtitle ? String(heroSubtitle).trim() : null;
      if (heroImage !== undefined) updateData.heroImage = heroImage ? String(heroImage).trim() : null;
      if (heroFeaturedCategoryId !== undefined) {
        updateData.heroFeaturedCategoryId =
          heroFeaturedCategoryId && heroFeaturedCategoryId !== "AUTO"
            ? String(heroFeaturedCategoryId).trim()
            : null;
      }
      if (heroFeaturedCategoryLabel !== undefined) {
        updateData.heroFeaturedCategoryLabel = heroFeaturedCategoryLabel
          ? String(heroFeaturedCategoryLabel).trim()
          : null;
      }

      // Our Story Atelier
      if (aboutTitle !== undefined) updateData.aboutTitle = aboutTitle ? String(aboutTitle).trim() : null;
      if (aboutSlogan !== undefined) updateData.aboutSlogan = aboutSlogan ? String(aboutSlogan).trim() : null;
      if (aboutDescription !== undefined) updateData.aboutDescription = aboutDescription ? String(aboutDescription).trim() : null;
      if (aboutImage !== undefined) updateData.aboutImage = aboutImage ? String(aboutImage).trim() : null;
      if (aboutStoryBadge !== undefined) updateData.aboutStoryBadge = aboutStoryBadge ? String(aboutStoryBadge).trim() : "The Atelier";
      if (aboutStoryHeading !== undefined) updateData.aboutStoryHeading = aboutStoryHeading ? String(aboutStoryHeading).trim() : "Behind M.E-Commerce";

      // Modular Footer
      if (footerAbout !== undefined) updateData.footerAbout = footerAbout ? String(footerAbout).trim() : null;
      if (footerDispatchNote !== undefined) updateData.footerDispatchNote = footerDispatchNote ? String(footerDispatchNote).trim() : "Insured Express Dispatch";
      if (footerCopyrightText !== undefined) updateData.footerCopyrightText = footerCopyrightText ? String(footerCopyrightText).trim() : "Crafted with precision & care.";
      if (footerSecurityBadges !== undefined) updateData.footerSecurityBadges = footerSecurityBadges ? String(footerSecurityBadges).trim() : "Secure UPI & Cards • Insured Transit";

      // Modular Search Tags
      if (searchPopularTags !== undefined) updateData.searchPopularTags = searchPopularTags ? String(searchPopularTags).trim() : "Explosion Boxes, Pop-up Cards, Linen Scrapbooks, Crochet Tulips";

      // Modular Categories Spotlight
      if (curatedSpotlightsConfig !== undefined) {
        updateData.curatedSpotlightsConfig = curatedSpotlightsConfig ? (typeof curatedSpotlightsConfig === "string" ? curatedSpotlightsConfig : JSON.stringify(curatedSpotlightsConfig)) : null;
      }

      // Modular Craft Principles (Max 5 Limit Enforced)
      if (craftPrinciples !== undefined) {
        if (craftPrinciples) {
          try {
            const parsed = typeof craftPrinciples === "string" ? JSON.parse(craftPrinciples) : craftPrinciples;
            if (Array.isArray(parsed)) {
              updateData.craftPrinciples = JSON.stringify(parsed.slice(0, 5));
            } else {
              updateData.craftPrinciples = String(craftPrinciples).trim();
            }
          } catch {
            updateData.craftPrinciples = String(craftPrinciples).trim();
          }
        } else {
          updateData.craftPrinciples = null;
        }
      }
      if (principlesBadge !== undefined) updateData.principlesBadge = principlesBadge ? String(principlesBadge).trim() : "Craft Principles";
      if (principlesHeading !== undefined) updateData.principlesHeading = principlesHeading ? String(principlesHeading).trim() : "What Makes Every Gift Special";
      if (principlesSubheading !== undefined) updateData.principlesSubheading = principlesSubheading ? String(principlesSubheading).trim() : "Core Quality Standards";

      // Modular Instagram Callout Section (Homepage)
      if (instagramBadge !== undefined) updateData.instagramBadge = instagramBadge ? String(instagramBadge).trim() : "Design Studio";
      if (instagramHeading !== undefined) updateData.instagramHeading = instagramHeading ? String(instagramHeading).trim() : "Watch Creations Unfold Daily";
      if (instagramDescription !== undefined) updateData.instagramDescription = instagramDescription ? String(instagramDescription).trim() : null;
      if (instagramButtonText !== undefined) updateData.instagramButtonText = instagramButtonText ? String(instagramButtonText).trim() : "@mecommerce";

      // Modular Announcement Bar (Header)
      if (enableAnnouncement !== undefined) updateData.enableAnnouncement = Boolean(enableAnnouncement);
      if (announcementText !== undefined) updateData.announcementText = announcementText ? String(announcementText).trim() : null;
      if (announcementLink !== undefined) updateData.announcementLink = announcementLink ? String(announcementLink).trim() : null;

      // Modular Commerce & Shipping
      if (freeShippingThreshold !== undefined) updateData.freeShippingThreshold = Number(freeShippingThreshold) >= 0 ? Number(freeShippingThreshold) : 999;
      if (standardShippingFee !== undefined) updateData.standardShippingFee = Number(standardShippingFee) >= 0 ? Number(standardShippingFee) : 99;

      // Modular Product Detail Page (PDP)
      if (pdpShowHighlights !== undefined) updateData.pdpShowHighlights = Boolean(pdpShowHighlights);
      if (pdpHighlight1Title !== undefined) updateData.pdpHighlight1Title = pdpHighlight1Title ? String(pdpHighlight1Title).trim() : "{craftDays} Days Handcraft";
      if (pdpHighlight1Subtitle !== undefined) updateData.pdpHighlight1Subtitle = pdpHighlight1Subtitle ? String(pdpHighlight1Subtitle).trim() : "Folded individually in our studio";
      if (pdpHighlight2Title !== undefined) updateData.pdpHighlight2Title = pdpHighlight2Title ? String(pdpHighlight2Title).trim() : "Insured Dispatch";
      if (pdpHighlight2Subtitle !== undefined) updateData.pdpHighlight2Subtitle = pdpHighlight2Subtitle ? String(pdpHighlight2Subtitle).trim() : "Delivered safely with care";
      if (pdpHighlightsConfig !== undefined) {
        updateData.pdpHighlightsConfig = pdpHighlightsConfig ? (typeof pdpHighlightsConfig === "string" ? pdpHighlightsConfig : JSON.stringify(pdpHighlightsConfig)) : null;
      }
      if (pdpShowRelated !== undefined) updateData.pdpShowRelated = Boolean(pdpShowRelated);
      if (pdpRelatedBadge !== undefined) updateData.pdpRelatedBadge = pdpRelatedBadge ? String(pdpRelatedBadge).trim() : "Complementary Pieces";
      if (pdpRelatedHeading !== undefined) updateData.pdpRelatedHeading = pdpRelatedHeading ? String(pdpRelatedHeading).trim() : "Complete Your Gifting Suite";
      if (enableReviews !== undefined) updateData.enableReviews = Boolean(enableReviews);
      if (enableWaxSealCustomization !== undefined) updateData.enableWaxSealCustomization = Boolean(enableWaxSealCustomization);
      if (enableGiftWrapCustomization !== undefined) updateData.enableGiftWrapCustomization = Boolean(enableGiftWrapCustomization);

      const updated = await db.studioSetting.upsert({
        where: { id: "default" },
        update: updateData,
        create: {
          id: "default",
          ...DEFAULT_SETTINGS,
          ...updateData,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Studio modular settings successfully saved and published.",
        settings: {
          ...updated,
          adminEmail: admin.email,
          adminName: admin.name,
        },
      });
    }

    // Mode 2: Update Admin Passcode
    const { currentPassword, newPassword } = body;
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New passcode must be at least 6 characters long." },
          { status: 400 }
        );
      }

      const user = await db.user.findUnique({
        where: { id: admin.id },
      });

      if (!user) {
        return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
      }

      // Verify current password if user has passwordHash set
      if (user.passwordHash && user.passwordHash !== "master_passcode_authenticated") {
        if (!currentPassword) {
          return NextResponse.json(
            { error: "Current passcode is required to set a new passcode." },
            { status: 400 }
          );
        }

        const isValid = await comparePassword(currentPassword, user.passwordHash);
        if (!isValid) {
          return NextResponse.json(
            { error: "Current passcode does not match." },
            { status: 400 }
          );
        }
      }

      const newHash = await hashPassword(newPassword);
      await db.user.update({
        where: { id: admin.id },
        data: { passwordHash: newHash },
      });

      return NextResponse.json({
        success: true,
        message: "Admin passcode updated securely.",
      });
    }

    return NextResponse.json(
      { error: "No valid settings payload provided." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to update studio settings" }, { status: 500 });
  }
}
