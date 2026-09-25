import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/ProductCard";
import { MobileFiltersDrawer } from "@/components/store/MobileFiltersDrawer";
import Link from "next/link";
import { Search, Filter, RotateCcw, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface CatalogPageProps {
  searchParams: {
    category?: string;
    subcategory?: string;
    search?: string;
    sort?: string;
    page?: string;
    limit?: string;
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { category, subcategory, search, sort = "featured" } = searchParams;
  const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const pageSize = Math.max(1, parseInt(searchParams.limit || "12", 10) || 12);
  const skip = (currentPage - 1) * pageSize;

  // Build query
  const where: any = {};
  const andClauses: any[] = [];

  if (category) {
    andClauses.push({
      OR: [
        { category: { slug: category } },
        { categories: { some: { category: { slug: category } } } },
      ],
    });
  }
  if (subcategory) {
    where.subcategory = { slug: subcategory };
  }
  if (search) {
    andClauses.push({
      OR: [
        { title: { contains: search } },
        { description: { contains: search } },
        { tagline: { contains: search } },
      ],
    });
  }
  if (andClauses.length > 0) {
    where.AND = andClauses;
  }

  let orderBy: any = [{ isBestSeller: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }];
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "craft_days") orderBy = { craftDays: "asc" };
  if (sort === "newest") orderBy = { createdAt: "desc" };

  const [totalCount, products, categories] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        category: true,
        subcategory: true,
        categories: { include: { category: true } },
      },
    }),
    db.category.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        subcategories: { orderBy: { orderIndex: "asc" } },
        _count: { select: { products: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = totalCount === 0 ? 0 : skip + 1;
  const endIndex = Math.min(skip + products.length, totalCount);

  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (subcategory) params.set("subcategory", subcategory);
    if (search) params.set("search", search);
    if (sort && sort !== "featured") params.set("sort", sort);
    if (pageSize !== 12) params.set("limit", String(pageSize));
    params.set("page", String(targetPage));
    return `/catalog?${params.toString()}`;
  };

  const activeCategory = categories.find((c) => c.slug === category);
  const activeSubcategory = activeCategory?.subcategories.find((s) => s.slug === subcategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8">
      {/* Editorial Header Banner */}
      <div className="pb-8 border-b border-[#E7E0D5] dark:border-[#2E2925] flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#A64732] dark:text-[#E07A5F] flex items-center gap-2">
            <Link href="/catalog" className="hover:underline">CATALOGUE</Link>
            {activeCategory && (
              <>
                <span>/</span>
                <Link href={`/catalog?category=${activeCategory.slug}`} className="hover:underline">
                  {activeCategory.name}
                </Link>
              </>
            )}
            {activeSubcategory && (
              <>
                <span>/</span>
                <span>{activeSubcategory.name}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#181513] dark:text-[#FAF8F5] tracking-tight">
            {activeSubcategory?.name || activeCategory?.name || "All Handcrafted Gifts"}
          </h1>
          <p className="text-xs sm:text-sm text-[#665E54] dark:text-[#A89F91] max-w-xl leading-relaxed">
            {activeSubcategory?.description ||
              activeCategory?.description ||
              "Personalized explosion boxes, cards, scrapbooks, and everlasting crochet flowers folded with care in Mumbai."}
          </p>
        </div>

        {/* Search Input */}
        <form method="GET" action="/catalog" className="relative w-full md:w-72">
          {category && <input type="hidden" name="category" value={category} />}
          {subcategory && <input type="hidden" name="subcategory" value={subcategory} />}
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search gifts..."
            className="w-full h-11 pl-10 pr-4 text-xs bg-[#F2EDE4] dark:bg-[#1A1715] border border-[#DDD5C7] dark:border-[#2E2925] rounded-full text-[#181513] dark:text-[#FAF8F5] placeholder:text-[#9A9185] dark:placeholder:text-[#665E54] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5] focus:bg-white dark:focus:bg-[#221E1B] transition-colors"
          />
          <Search className="w-4 h-4 text-[#736B62] dark:text-[#A89F91] absolute left-3.5 top-3.5 pointer-events-none" />
        </form>
      </div>

      {/* Mobile Horizontal Category Scroller & Mobile Filter Bar */}
      <div className="lg:hidden space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Link
            href="/catalog"
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-xs ${
              !category
                ? "bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513]"
                : "bg-[#F2EDE4] dark:bg-[#1A1715] text-[#181513] dark:text-[#FAF8F5] border border-[#DDD5C7] dark:border-[#2E2925]"
            }`}
          >
            All ({products.length})
          </Link>
          {categories.map((cat) => {
            const isCatActive = category === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/catalog?category=${cat.slug}`}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-xs ${
                  isCatActive
                    ? "bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513]"
                    : "bg-[#F2EDE4] dark:bg-[#1A1715] text-[#181513] dark:text-[#FAF8F5] border border-[#DDD5C7] dark:border-[#2E2925]"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Mobile Filter Drawer Launcher Button & Count */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <MobileFiltersDrawer
            categories={categories}
            activeCategory={category}
            activeSubcategory={subcategory}
            activeSort={sort}
            activeSearch={search}
            totalProducts={products.length}
          />
          <span className="text-xs uppercase tracking-wider text-[#786F64] dark:text-[#A89F91]">
            [{products.length}] Gifts
          </span>
        </div>
      </div>

      {/* Main Grid & Filters Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 space-y-8 bg-[#FAF8F5] dark:bg-[#1A1715] p-6 border border-[#E5DFD4] dark:border-[#2E2925] rounded-2xl shadow-sm sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D8] dark:border-[#2E2925]">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] font-bold">
              <Filter className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
              <span>Categories</span>
            </div>
            {(category || subcategory || search) && (
              <Link
                href="/catalog"
                className="text-xs uppercase tracking-wider text-[#A64732] dark:text-[#E07A5F] hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </Link>
            )}
          </div>

          {/* Categories & Subcategories */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7E7060] dark:text-[#A89F91]">
              Collections
            </h4>
            <div className="space-y-1 text-xs">
              <Link
                href="/catalog"
                className={`block py-1.5 px-2.5 rounded-lg transition-colors uppercase tracking-wider ${
                  !category
                    ? "bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] font-bold"
                    : "text-[#181513] dark:text-[#FAF8F5] hover:bg-[#F2EDE4] dark:hover:bg-[#26221F] font-medium"
                }`}
              >
                All Gifts ({products.length})
              </Link>

              {categories.map((cat, idx) => {
                const isCatActive = category === cat.slug;
                return (
                  <div key={cat.id} className="space-y-1">
                    <Link
                      href={`/catalog?category=${cat.slug}`}
                      className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors uppercase tracking-wider ${
                        isCatActive && !subcategory
                          ? "bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] font-bold"
                          : "text-[#181513] dark:text-[#FAF8F5] hover:bg-[#F2EDE4] dark:hover:bg-[#26221F] font-medium"
                      }`}
                    >
                      <span>0{idx + 1} / {cat.name}</span>
                      <span className="text-[10px] opacity-75">
                        {cat._count.products}
                      </span>
                    </Link>

                    {/* Subcategories */}
                    {isCatActive && cat.subcategories.length > 0 && (
                      <div className="pl-3 space-y-1 border-l border-[#DDD5C7] dark:border-[#2E2925] ml-2 my-1">
                        {cat.subcategories.map((sub) => {
                          const isSubActive = subcategory === sub.slug;
                          return (
                            <Link
                              key={sub.id}
                              href={`/catalog?category=${cat.slug}&subcategory=${sub.slug}`}
                              className={`block py-1 px-2 text-[10px] uppercase tracking-wider rounded-md transition-colors ${
                                isSubActive
                                  ? "bg-[#A64732] text-white font-bold"
                                  : "text-[#665E54] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5] hover:bg-[#F2EDE4] dark:hover:bg-[#26221F]"
                              }`}
                            >
                              — {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sorting */}
          <div className="pt-4 border-t border-[#EAE3D8] dark:border-[#2E2925] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7E7060] dark:text-[#A89F91]">
              Sort Order
            </h4>
            <div className="grid grid-cols-1 gap-1 text-xs uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
              {[
                { label: "Featured & Bestsellers", value: "featured" },
                { label: "Price: Low to High", value: "price_asc" },
                { label: "Price: High to Low", value: "price_desc" },
                { label: "Fastest Craft Lead", value: "craft_days" },
                { label: "Latest Additions", value: "newest" },
              ].map((s) => {
                const isSortActive = sort === s.value;
                const params = new URLSearchParams();
                if (category) params.set("category", category);
                if (subcategory) params.set("subcategory", subcategory);
                if (search) params.set("search", search);
                params.set("sort", s.value);

                return (
                  <Link
                    key={s.value}
                    href={`/catalog?${params.toString()}`}
                    className={`py-1.5 px-2.5 rounded-lg block transition-colors ${
                      isSortActive
                        ? "bg-[#E8E1D5] dark:bg-[#2E2925] font-bold text-[#181513] dark:text-[#FAF8F5]"
                        : "hover:bg-[#F2EDE4] dark:hover:bg-[#26221F] font-medium"
                    }`}
                  >
                    {s.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-[#786F64] dark:text-[#A89F91] pb-2 border-b border-[#EAE3D8] dark:border-[#2E2925]">
            <span>Showing {startIndex} - {endIndex} of {totalCount} Gifts</span>
            {search && <span>Query: &ldquo;{search}&rdquo;</span>}
          </div>

          {products.length === 0 ? (
            <div className="p-16 bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#E5DFD4] dark:border-[#2E2925] rounded-2xl text-center space-y-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#A64732] dark:text-[#E07A5F] block">
                No Results
              </span>
              <h3 className="font-bold text-xl sm:text-2xl text-[#181513] dark:text-[#FAF8F5]">
                No Handcrafted Gifts Found
              </h3>
              <p className="text-xs text-[#786F64] dark:text-[#A89F91] max-w-sm mx-auto leading-relaxed">
                We couldn&apos;t find any items matching your active search. Reset filters to view all creations.
              </p>
              <div className="pt-2">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white transition-colors shadow-sm"
                >
                  <span>Reset Filters</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Catalog Pagination Controls */}
          {totalCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EAE3D8] dark:border-[#2E2925] text-xs">
              <div className="text-[#665E54] dark:text-[#A89F91] font-medium">
                Showing <strong className="text-[#181513] dark:text-[#FAF8F5]">{startIndex}</strong> to{" "}
                <strong className="text-[#181513] dark:text-[#FAF8F5]">{endIndex}</strong> of{" "}
                <strong className="text-[#181513] dark:text-[#FAF8F5]">{totalCount}</strong> gifts
              </div>

              <div className="flex items-center gap-1.5">
                {currentPage > 1 ? (
                  <Link
                    href={createPageUrl(currentPage - 1)}
                    className="px-3 py-1.5 rounded-lg border border-[#DDD5C7] dark:border-[#2E2925] bg-white dark:bg-[#1A1715] text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-colors flex items-center gap-1 font-semibold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </Link>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg border border-[#DDD5C7] dark:border-[#2E2925] bg-[#F2EDE4]/50 dark:bg-[#1A1715]/50 text-[#9A9185] dark:text-[#665E54] opacity-40 cursor-not-allowed flex items-center gap-1 font-semibold">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      return (
                        <div key={p} className="flex items-center gap-1">
                          {prev && p - prev > 1 && (
                            <span className="text-[#786F64] px-1 select-none">...</span>
                          )}
                          <Link
                            href={createPageUrl(p)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors flex items-center justify-center ${
                              currentPage === p
                                ? "bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] shadow-xs"
                                : "border border-[#DDD5C7] dark:border-[#2E2925] bg-white dark:bg-[#1A1715] text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5]"
                            }`}
                          >
                            {p}
                          </Link>
                        </div>
                      );
                    })}
                </div>

                {currentPage < totalPages ? (
                  <Link
                    href={createPageUrl(currentPage + 1)}
                    className="px-3 py-1.5 rounded-lg border border-[#DDD5C7] dark:border-[#2E2925] bg-white dark:bg-[#1A1715] text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-colors flex items-center gap-1 font-semibold"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg border border-[#DDD5C7] dark:border-[#2E2925] bg-[#F2EDE4]/50 dark:bg-[#1A1715]/50 text-[#9A9185] dark:text-[#665E54] opacity-40 cursor-not-allowed flex items-center gap-1 font-semibold">
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
