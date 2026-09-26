import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProductCustomizer } from "@/components/store/ProductCustomizer";
import { ProductReviews } from "@/components/store/ProductReviews";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductImageGallery } from "@/components/store/ProductImageGallery";
import { formatCurrency } from "@/lib/utils";
import {
  Star,
  Clock,
  ShieldCheck,
  Truck,
  Sparkles,
  Award,
  Gift,
  Leaf,
  Heart,
  ArrowRight,
} from "lucide-react";

const HIGHLIGHT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  Truck,
  ShieldCheck,
  Sparkles,
  Award,
  Gift,
  Leaf,
  Heart,
};

interface ProductPageProps {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;

  const [product, studioSetting] = await Promise.all([
    db.product.findUnique({
      where: { slug },
      include: {
        category: true,
        subcategory: true,
        reviews: { orderBy: { createdAt: "desc" } },
      },
    }),
    db.studioSetting.findUnique({
      where: { id: "default" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  // Related products
  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 3,
    include: { category: true, subcategory: true },
  });

  let imageList: string[] = [];
  try {
    imageList = JSON.parse(product.images);
  } catch {
    imageList = product.images ? product.images.split(",") : [];
  }
  const mainImage =
    imageList[0] ||
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85";

  const numPrice = Number(product.price);
  const numCompare = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const rawDiscount =
    numCompare && numCompare > numPrice
      ? Math.round(((numCompare - numPrice) / numCompare) * 100)
      : 0;
  const discountPercent = rawDiscount > 0 ? rawDiscount : null;

  const reviewCount = product.reviews?.length || 0;
  const avgRatingNum =
    reviewCount > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;
  const avgRatingDisplay = avgRatingNum.toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Editorial Breadcrumb Navigation */}
      <nav className="text-xs font-medium uppercase tracking-wider text-[#786F64] dark:text-[#8E8478] flex items-center gap-2 flex-wrap pb-4 border-b border-[#E7E0D5] dark:border-[#2E2925]">
        <Link href="/" className="hover:text-[#A64732] dark:hover:text-[#E07A5F] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-[#A64732] dark:hover:text-[#E07A5F] transition-colors">Catalogue</Link>
        <span>/</span>
        <Link
          href={`/catalog?category=${product.category.slug}`}
          className="hover:text-[#A64732] dark:hover:text-[#E07A5F] transition-colors"
        >
          {product.category.name}
        </Link>
        {product.subcategory && (
          <>
            <span>/</span>
            <Link
              href={`/catalog?category=${product.category.slug}&subcategory=${product.subcategory.slug}`}
              className="hover:text-[#A64732] dark:hover:text-[#E07A5F] transition-colors"
            >
              {product.subcategory.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-[#181513] dark:text-[#FAF8F5] font-semibold truncate max-w-[240px]">{product.title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Museum Gallery Framing with Interactive Multi-image Carousel */}
        <div className="lg:col-span-6 space-y-4">
          <ProductImageGallery
            images={imageList}
            title={product.title}
            isBestSeller={product.isBestSeller}
            isFeatured={product.isFeatured}
            discountPercent={discountPercent}
            isOutOfStock={product.stock <= 0}
          />

          {/* Micro Atelier Highlights (Theme-aware modular styling) */}
          {(() => {
            if (studioSetting?.pdpShowHighlights === false) return null;

            let rawHighlights: any[] = [];
            if (studioSetting?.pdpHighlightsConfig) {
              try {
                rawHighlights = JSON.parse(studioSetting.pdpHighlightsConfig);
              } catch {
                rawHighlights = [];
              }
            }

            if (!Array.isArray(rawHighlights) || rawHighlights.length === 0) {
              rawHighlights = [
                {
                  id: "default-1",
                  icon: "Clock",
                  title: studioSetting?.pdpHighlight1Title || "{craftDays} Days Handcraft",
                  subtitle: studioSetting?.pdpHighlight1Subtitle || "Folded individually in our studio",
                  enabled: true,
                },
                {
                  id: "default-2",
                  icon: "Truck",
                  title: studioSetting?.pdpHighlight2Title || "Insured Dispatch",
                  subtitle: studioSetting?.pdpHighlight2Subtitle || "Delivered safely with care",
                  enabled: true,
                },
              ];
            }

            const activeHighlights = rawHighlights.filter((h) => h.enabled !== false).slice(0, 4);
            if (activeHighlights.length === 0) return null;

            const gridCols =
              activeHighlights.length === 1
                ? "grid-cols-1"
                : activeHighlights.length === 2
                ? "grid-cols-2"
                : activeHighlights.length === 3
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-2 sm:grid-cols-4";

            return (
              <div
                className={`p-4 bg-card border border-border rounded-2xl grid ${gridCols} gap-4 text-xs text-muted-foreground shadow-xs`}
              >
                {activeHighlights.map((hl, idx) => {
                  const IconComp = HIGHLIGHT_ICONS[hl.icon] || Clock;
                  const formattedTitle = (hl.title || "").replace(
                    "{craftDays}",
                    String(product.craftDays || 4)
                  );
                  return (
                    <div key={hl.id || idx} className="flex items-start gap-2.5">
                      <IconComp className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground block text-xs uppercase leading-snug">
                          {formattedTitle}
                        </span>
                        {hl.subtitle && (
                          <span className="text-[11px] text-muted-foreground leading-snug block mt-0.5">
                            {hl.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Right Column: Information & Customizer */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3 pb-6 border-b border-[#EAE3D8] dark:border-[#2E2925]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A64732] dark:text-[#E07A5F] block">
              {product.subcategory?.name || product.category.name}
            </span>

            <h1 className="text-3xl sm:text-4xl font-bold text-[#181513] dark:text-[#FAF8F5] leading-tight">
              {product.title}
            </h1>

            {product.tagline && (
              <p className="text-sm text-[#6E665D] dark:text-[#BDB4A8] italic">
                &ldquo;{product.tagline}&rdquo;
              </p>
            )}

            {/* Price & Rating Display */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-[#181513] dark:text-[#FAF8F5]">
                  {formatCurrency(numPrice)}
                </span>
                {numCompare && (
                  <span className="text-sm text-[#9B9287] dark:text-[#8E8478] line-through">
                    {formatCurrency(numCompare)}
                  </span>
                )}
              </div>

              {/* Star Rating - Defaults to 0 stars if no reviews */}
              <div className="flex items-center gap-1.5 text-xs text-[#786F64] dark:text-[#A89F91]">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        reviewCount > 0 && s <= Math.round(avgRatingNum)
                          ? "fill-amber-500 text-amber-500"
                          : "text-[#D5CDBD] dark:text-[#3E3833]"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#181513] dark:text-[#FAF8F5]">
                  {reviewCount > 0 ? avgRatingDisplay : "0.0"}
                </span>
                <span className="text-xs">({reviewCount})</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="text-xs sm:text-sm text-[#575048] dark:text-[#C5BCAD] leading-relaxed space-y-3">
            <p>{product.description}</p>
            {product.materials && (
              <div className="text-xs text-[#786F64] dark:text-[#A89F91] pt-2">
                <strong className="text-[#181513] dark:text-[#FAF8F5] uppercase">Materials:</strong> {product.materials}
              </div>
            )}
            {product.dimensions && (
              <div className="text-xs text-[#786F64] dark:text-[#A89F91]">
                <strong className="text-[#181513] dark:text-[#FAF8F5] uppercase">Dimensions:</strong> {product.dimensions}
              </div>
            )}
          </div>

          {/* Interactive Customizer */}
          <ProductCustomizer
            product={{
              id: product.id,
              title: product.title,
              price: numPrice,
              images: product.images,
              stock: product.stock,
              allowsCustomNote: product.allowsCustomNote,
              allowsWaxSeal: product.allowsWaxSeal,
              craftDays: product.craftDays,
            }}
            enableWaxSeal={Boolean(studioSetting?.enableWaxSealCustomization !== false && product.allowsWaxSeal !== false)}
            enableGiftWrap={Boolean(studioSetting?.enableGiftWrapCustomization !== false && product.allowsGiftWrap !== false)}
          />
        </div>
      </div>

      {/* Verified Customer Reviews Section */}
      {studioSetting?.enableReviews !== false && (
        <ProductReviews slug={product.slug} initialReviews={product.reviews} />
      )}

      {/* Related Creations */}
      {studioSetting?.pdpShowRelated !== false && relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-border space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent block">
                {studioSetting?.pdpRelatedBadge || "Related Works"}
              </span>
              <h3 className="font-bold text-2xl text-foreground mt-1">
                {(studioSetting?.pdpRelatedHeading || "More From {category}").replace(
                  "{category}",
                  product.category.name
                )}
              </h3>
            </div>
            <Link
              href={`/catalog?category=${product.category.slug}`}
              className="text-xs font-semibold uppercase tracking-wider text-foreground hover:text-accent flex items-center gap-1 transition-colors"
            >
              <span>View Category</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
