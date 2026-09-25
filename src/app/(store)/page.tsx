import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/ProductCard";
import { ArrowRight, ArrowUpRight, Instagram } from "lucide-react";
import { CraftPillarsCarousel } from "@/components/store/CraftPillarsCarousel";

export const revalidate = 60;

export default async function HomePage() {
  const [featuredProducts, categories, studioSetting] = await Promise.all([
    db.product.findMany({
      where: { OR: [{ isFeatured: true }, { isBestSeller: true }] },
      take: 6,
      orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }],
      include: { category: true, subcategory: true },
    }),
    db.category.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    }),
    db.studioSetting.findUnique({
      where: { id: "default" },
    }),
  ]);

  // Determine Hero Featured Category dynamically
  let heroCategory = studioSetting?.heroFeaturedCategoryId
    ? categories.find((c) => c.id === studioSetting.heroFeaturedCategoryId)
    : null;

  // Safe Fallback: if configured category was deleted or not selected, fallback to explosion-boxes if present, or first category
  if (!heroCategory && categories.length > 0) {
    heroCategory = categories.find((c) => c.slug === "explosion-boxes") || categories[0];
  }

  const heroButtonLabel =
    studioSetting?.heroFeaturedCategoryLabel?.trim() ||
    heroCategory?.name ||
    "Explosion Boxes";

  const heroButtonHref = heroCategory
    ? `/catalog?category=${heroCategory.slug}`
    : "/catalog";

  // Modular Craft Principles
  let craftPrinciples: { id: string; badge: string; title: string; description: string }[] = [
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
  ];

  if (studioSetting?.craftPrinciples) {
    try {
      const parsed = JSON.parse(studioSetting.craftPrinciples);
      if (Array.isArray(parsed) && parsed.length > 0) {
        craftPrinciples = parsed;
      }
    } catch (e) {
      console.error("Failed to parse studio craft principles:", e);
    }
  }

  return (
    <div className="space-y-16 sm:space-y-24 pb-24">
      {/* 1. High-End Editorial Hero */}
      <section className="pt-8 sm:pt-14 pb-14 sm:pb-20 border-b border-[#E7E0D5] dark:border-[#2E2925]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#A64732] dark:bg-[#E07A5F]" />
                <span className="text-xs font-medium tracking-wider uppercase text-[#786F64] dark:text-[#A89F91]">
                  {studioSetting?.tagline?.trim() || `${studioSetting?.storeName || "M.E-Commerce"} • ${studioSetting?.storeLocation || "Mumbai, India"}`}
                </span>
              </div>

              {studioSetting?.heroTitle ? (
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[#181513] dark:text-[#FAF8F5] tracking-tight leading-[1.08] whitespace-pre-line">
                  {studioSetting.heroTitle}
                </h1>
              ) : (
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[#181513] dark:text-[#FAF8F5] tracking-tight leading-[1.08]">
                  Cherished memories <br />
                  <span className="text-[#A64732] dark:text-[#E07A5F] font-normal">folded by hand.</span>
                </h1>
              )}

              <p className="text-sm sm:text-base text-[#575048] dark:text-[#B5ACA1] max-w-xl leading-relaxed">
                {studioSetting?.heroSubtitle?.trim() ||
                  "Personalized explosion boxes, handmade cards, keepsake scrapbooks, and everlasting crochet flowers. Each creation is precision-scored, folded, and sealed by hand in our Bandra studio."}
              </p>

              {/* Editorial CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white transition-colors duration-300 shadow-xs"
                >
                  <span>Explore All Gifts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href={heroButtonHref}
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 border border-[#DDD5C7] dark:border-[#38322D] rounded-full text-[#181513] dark:text-[#FAF8F5] text-xs font-semibold tracking-widest uppercase hover:border-[#181513] dark:hover:border-[#FAF8F5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-300"
                >
                  <span>{heroButtonLabel}</span>
                </Link>
              </div>
            </div>

            {/* Right Museum Visual Framing */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] bg-[#F2EDE4] dark:bg-[#1A1715] border border-[#DDD5C7] dark:border-[#2E2925] p-3 rounded-2xl shadow-xs">
                <div className="relative w-full h-full overflow-hidden rounded-xl">
                  <Image
                    src={
                      studioSetting?.heroImage?.trim() ||
                      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85"
                    }
                    alt={studioSetting?.storeName ? `Gift item by ${studioSetting.storeName}` : "Gift item by M.E-Commerce"}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CREATIONS (Right after Hero for fast mobile shopping) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#E7E0D5] dark:border-[#2E2925] gap-2">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#A64732] dark:text-[#E07A5F]">
              Selected Works
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#181513] dark:text-[#FAF8F5] tracking-tight mt-1">
              Featured Studio Gifts
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F] flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All ({featuredProducts.length}+)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 3. MAGAZINE-STYLE INDEXED CATEGORIES */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-border gap-2">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-accent">
              Categories
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-semibold uppercase tracking-wider text-foreground hover:text-accent flex items-center gap-1 self-start sm:self-auto transition-colors"
          >
            <span>Complete Catalogue</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.slug}`}
              className="group relative overflow-hidden p-6 sm:p-8 bg-card border border-border rounded-2xl hover:border-accent transition-all duration-300 flex flex-col justify-between min-h-[190px] shadow-2xs hover:shadow-md"
            >
              {/* Category Showcase Corner Image (Adapts gracefully on hover) */}
              {cat.image && (
                <div className="absolute right-0 bottom-0 w-32 h-32 sm:w-36 sm:h-36 opacity-15 dark:opacity-20 group-hover:opacity-35 dark:group-hover:opacity-40 transition-opacity duration-300 pointer-events-none overflow-hidden rounded-tl-3xl">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
                </div>
              )}

              {/* Top Row: Clean Category Number + Item Count */}
              <div className="flex items-center justify-between relative z-10">
                <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase group-hover:text-accent transition-colors">
                  0{idx + 1}
                </span>
                <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
                  {cat._count.products} {cat._count.products === 1 ? "Item" : "Items"}
                </span>
              </div>

              {/* Title & Description */}
              <div className="my-4 relative z-10">
                <h3 className="font-bold text-xl sm:text-2xl text-foreground group-hover:text-accent transition-colors leading-snug">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed max-w-[85%]">
                    {cat.description}
                  </p>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-foreground group-hover:text-accent transition-colors relative z-10">
                <span>View Collection</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Refined Accent Colour Bottom Strip (Adapts to Active Theme) */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-accent transition-colors duration-200" />
            </Link>
          ))}
        </div>
      </section>

      {/* 4. ATELIER CRAFT PILLARS WITH CAROUSEL */}
      <section className="border-y border-border bg-card/60 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CraftPillarsCarousel
            pillars={craftPrinciples}
            badge={studioSetting?.principlesBadge || "Craft Principles"}
            heading={studioSetting?.principlesHeading || "What Makes Every Gift Special"}
            subheading={studioSetting?.principlesSubheading || "Quality Standards"}
          />
        </div>
      </section>

      {/* 5. MODULAR STUDIO INSTAGRAM CALLOUT */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
          {studioSetting?.instagramBadge || "Bandra West • Mumbai"}
        </span>
        <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
          {studioSetting?.instagramHeading || "Watch Creations Unfold Daily"}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          {studioSetting?.instagramDescription || "See folding demonstrations, custom calligraphy dedications, and unboxings on our official studio Instagram."}
        </p>
        <div className="pt-2">
          <a
            href={studioSetting?.instagram || "https://instagram.com/mecommerce.official"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent hover:text-accent-foreground text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>{studioSetting?.instagramButtonText || "@mecommerce.official"}</span>
          </a>
        </div>
      </section>
    </div>
  );
}
