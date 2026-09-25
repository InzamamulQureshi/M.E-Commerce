import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    tagline?: string | null;
    price: number | string | any;
    compareAtPrice?: number | string | null | any;
    images: string;
    category?: { name: string; slug: string } | null;
    subcategory?: { name: string; slug: string } | null;
    craftDays?: number;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    stock?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  let imageList: string[] = [];
  try {
    imageList = JSON.parse(product.images);
  } catch {
    imageList = product.images ? product.images.split(",") : [];
  }
  const mainImage =
    imageList[0] ||
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80";

  const numPrice = Number(product.price);
  const numCompare = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const isOutOfStock =
    product.stock !== undefined && product.stock !== null && product.stock <= 0;

  return (
    <article className="group flex flex-col bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#E5DFD4] dark:border-[#2E2925] rounded-2xl overflow-hidden hover:border-[#181513] dark:hover:border-[#FAF8F5] hover:shadow-md transition-all duration-300">
      {/* Museum Gallery Image Framing (4:5 Aspect Ratio) */}
      <Link
        href={`/catalog/${product.slug}`}
        className="relative aspect-[4/5] overflow-hidden bg-[#F0EBE2] dark:bg-[#24201D] block"
      >
        <Image
          src={mainImage}
          alt={product.title}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Status Tag */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 items-start z-10">
          {isOutOfStock ? (
            <span className="text-[8px] sm:text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 sm:px-2.5 sm:py-0.5 bg-neutral-900/90 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 rounded-full shadow-xs">
              Sold Out
            </span>
          ) : product.isBestSeller ? (
            <span className="text-[8px] sm:text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 sm:px-2.5 sm:py-0.5 bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] rounded-full shadow-xs">
              Bestseller
            </span>
          ) : product.isFeatured ? (
            <span className="text-[8px] sm:text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 sm:px-2.5 sm:py-0.5 bg-[#FAF8F5] text-[#181513] dark:bg-[#1A1715] dark:text-[#FAF8F5] border border-[#DDD5C7] dark:border-[#2E2925] rounded-full shadow-xs">
              Featured
            </span>
          ) : null}
        </div>

        {/* Lead time badge */}
        {product.craftDays && (
          <div className="absolute bottom-2 right-2 text-[8px] sm:text-[9px] font-medium tracking-wider text-[#FAF8F5] bg-[#181513]/85 backdrop-blur-xs px-2 py-0.5 sm:px-2.5 sm:py-0.5 uppercase rounded-full">
            {product.craftDays}d craft
          </div>
        )}
      </Link>

      {/* Information Block */}
      <div className="p-3 sm:p-5 flex flex-col flex-grow justify-between border-t border-[#EAE3D8] dark:border-[#2E2925]">
        <div>
          {/* Category Index Line */}
          <div className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase text-[#786F64] dark:text-[#A89F91] mb-1 line-clamp-1">
            {product.subcategory?.name || product.category?.name || "Handcrafted"}
          </div>

          {/* Creation Title */}
          <Link href={`/catalog/${product.slug}`}>
            <h3 className="font-semibold text-xs sm:text-sm text-[#181513] dark:text-[#FAF8F5] group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F] transition-colors line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Tagline */}
          {product.tagline && (
            <p className="hidden md:block text-[11px] text-[#736B62] dark:text-[#BDB4A8] mt-1 line-clamp-1 leading-relaxed">
              {product.tagline}
            </p>
          )}
        </div>

        {/* Price & Action: Responsive Stacking prevents squishing on small screens */}
        <div className="mt-2.5 sm:mt-3.5 pt-2.5 sm:pt-3 border-t border-[#EFE9DF] dark:border-[#2E2925] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
              {formatCurrency(numPrice)}
            </span>
            {numCompare && (
              <span className="text-[9px] sm:text-[10px] font-normal text-[#9A9185] line-through">
                {formatCurrency(numCompare)}
              </span>
            )}
          </div>

          <Link
            href={`/catalog/${product.slug}`}
            className={`text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full flex items-center justify-center gap-1 transition-colors shadow-xs ${
              isOutOfStock
                ? "bg-[#DDD5C7] dark:bg-[#2E2925] text-[#786F64] dark:text-[#A89F91]"
                : "text-[#FAF8F5] dark:text-[#181513] bg-[#181513] dark:bg-[#FAF8F5] hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white"
            }`}
          >
            <span>{isOutOfStock ? "Sold Out" : "View Product"}</span>
            <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
