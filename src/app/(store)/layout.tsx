import { db } from "@/lib/db";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let brandSettings = {
    storeName: "M.E-Commerce",
    storeLocation: "Studio • Mumbai",
    logoUrl: null as string | null,
    logoWidth: 130,
    enableAnnouncement: false,
    announcementText: "",
    announcementLink: "",
    searchPopularTags: "Explosion Boxes, Pop-up Cards, Linen Scrapbooks, Crochet Tulips" as string | null,
    curatedSpotlightsConfig: null as string | null,
  };

  let footerSettings = {
    storeName: "M.E-Commerce",
    tagline: "Modern, Minimalist & Modular E-Commerce",
    storeLocation: "Studio • Mumbai",
    footerAbout: null as string | null,
    instagram: "https://instagram.com/mecommerce.official",
    studioAddress: "Bandra West, Mumbai 400050, Maharashtra, India",
    footerDispatchNote: "Pan-India Insured Dispatch",
    footerCopyrightText: "Handcrafted with care in Mumbai.",
    footerSecurityBadges: "Secure UPI & Cards • Insured Transit",
  };

  let categories: { name: string; slug: string }[] = [];

  try {
    const [setting, fetchedCategories] = await Promise.all([
      db.studioSetting.findUnique({
        where: { id: "default" },
        select: {
          storeName: true,
          tagline: true,
          storeLocation: true,
          logoUrl: true,
          logoWidth: true,
          footerAbout: true,
          instagram: true,
          studioAddress: true,
          footerDispatchNote: true,
          footerCopyrightText: true,
          footerSecurityBadges: true,
          searchPopularTags: true,
          curatedSpotlightsConfig: true,
          enableAnnouncement: true,
          announcementText: true,
          announcementLink: true,
        },
      }),
      db.category.findMany({
        select: { name: true, slug: true },
        orderBy: { orderIndex: "asc" },
        take: 6,
      }),
    ]);

    if (setting) {
      brandSettings = {
        storeName: setting.storeName || "M.E-Commerce",
        storeLocation: setting.storeLocation || "Studio • Mumbai",
        logoUrl: setting.logoUrl || null,
        logoWidth: Math.min(160, Math.max(60, setting.logoWidth || 130)),
        enableAnnouncement: setting.enableAnnouncement ?? false,
        announcementText: setting.announcementText || "",
        announcementLink: setting.announcementLink || "",
        searchPopularTags:
          setting.searchPopularTags ||
          "Explosion Boxes, Pop-up Cards, Linen Scrapbooks, Crochet Tulips",
        curatedSpotlightsConfig: setting.curatedSpotlightsConfig || null,
      };
      footerSettings = {
        storeName: setting.storeName || "M.E-Commerce",
        tagline: setting.tagline || "Modern, Minimalist & Modular E-Commerce",
        storeLocation: setting.storeLocation || "Studio • Mumbai",
        footerAbout: setting.footerAbout || null,
        instagram: setting.instagram || "https://instagram.com/mecommerce.official",
        studioAddress: setting.studioAddress || "Bandra West, Mumbai 400050, Maharashtra, India",
        footerDispatchNote: setting.footerDispatchNote || "Pan-India Insured Dispatch",
        footerCopyrightText: setting.footerCopyrightText || "Handcrafted with care in Mumbai.",
        footerSecurityBadges: setting.footerSecurityBadges || "Secure UPI & Cards • Insured Transit",
      };
    }

    if (fetchedCategories && fetchedCategories.length > 0) {
      categories = fetchedCategories;
    }
  } catch {}

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#12100E] text-[#181513] dark:text-[#FAF8F5]">
      <Header initialSettings={brandSettings} />
      <main className="flex-grow">{children}</main>
      <Footer settings={footerSettings} categories={categories} />
      <CartDrawer />
    </div>
  );
}
