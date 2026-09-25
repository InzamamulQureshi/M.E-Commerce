"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, Check, RotateCcw, ArrowUpDown } from "lucide-react";

interface CategoryWithSubcategories {
  id: string;
  name: string;
  slug: string;
  subcategories: { id: string; name: string; slug: string }[];
  _count: { products: number };
}

interface MobileFiltersDrawerProps {
  categories: CategoryWithSubcategories[];
  activeCategory?: string;
  activeSubcategory?: string;
  activeSort?: string;
  activeSearch?: string;
  totalProducts: number;
}

export function MobileFiltersDrawer({
  categories,
  activeCategory,
  activeSubcategory,
  activeSort = "featured",
  activeSearch = "",
  totalProducts,
}: MobileFiltersDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const [selectedSort, setSelectedSort] = useState(activeSort);
  const [selectedCat, setSelectedCat] = useState(activeCategory || "");
  const [selectedSub, setSelectedSub] = useState(activeSubcategory || "");
  const [searchInput, setSearchInput] = useState(activeSearch || "");

  const sortOptions = [
    { value: "featured", label: "Studio Picks (Featured)" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "craft_days", label: "Fastest Craft Lead Time" },
    { value: "newest", label: "Newest Arrivals" },
  ];

  const hasActiveFilters = Boolean(
    activeCategory || activeSubcategory || (activeSort && activeSort !== "featured") || activeSearch
  );

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selectedCat) params.set("category", selectedCat);
    if (selectedSub) params.set("subcategory", selectedSub);
    if (selectedSort && selectedSort !== "featured") params.set("sort", selectedSort);
    if (searchInput.trim()) params.set("search", searchInput.trim());

    router.push(`/catalog?${params.toString()}`);
    setIsOpen(false);
  };

  const handleReset = () => {
    setSelectedSort("featured");
    setSelectedCat("");
    setSelectedSub("");
    setSearchInput("");
    router.push("/catalog");
    setIsOpen(false);
  };

  const activeCategoryObj = categories.find((c) => c.slug === selectedCat);

  return (
    <>
      {/* Mobile Sticky / Floating Trigger Bar */}
      <div className="lg:hidden flex items-center justify-between gap-2 py-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] text-xs font-semibold uppercase tracking-wider rounded-full shadow-xs hover:bg-[#A64732] dark:hover:bg-[#C85A42] transition-colors"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters & Sort</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-[#A64732] dark:bg-[#181513]" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 h-11 border border-[#DDD5C7] dark:border-[#2E2925] bg-white dark:bg-[#1A1715] rounded-full text-[#786F64] hover:text-[#181513] dark:hover:text-[#FAF8F5] text-xs transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Slide-over Filter Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-sm bg-[#FAF8F5] dark:bg-[#12100E] border-l border-[#E5DFD4] dark:border-[#2E2925] shadow-2xl flex flex-col justify-between">
              {/* Header */}
              <div className="p-5 border-b border-[#E7E0D5] dark:border-[#2E2925] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#A64732] font-semibold block">
                    Catalogue Controls
                  </span>
                  <h3 className="font-bold text-lg text-[#181513] dark:text-[#FAF8F5] mt-0.5">
                    Filter & Sort ({totalProducts} Items)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Form Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
                {/* Search in Drawer */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#786F64] dark:text-[#A89F91] block">
                    Keyword Search
                  </label>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by title or style..."
                    className="w-full h-10 px-3.5 bg-white dark:bg-[#1A1715] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                  />
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#786F64] dark:text-[#A89F91] flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>Sort Order</span>
                  </label>
                  <div className="space-y-1.5">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedSort(opt.value)}
                        className={`w-full text-left px-3.5 py-2 rounded-xl transition-colors flex items-center justify-between ${
                          selectedSort === opt.value
                            ? "bg-[#181513] text-[#FAF8F5] font-semibold dark:bg-[#FAF8F5] dark:text-[#181513]"
                            : "bg-white dark:bg-[#1A1715] text-[#181513] dark:text-[#FAF8F5] border border-[#DDD5C7] dark:border-[#2E2925]"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {selectedSort === opt.value && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Categories */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#786F64] dark:text-[#A89F91] block">
                    Gift Category
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCat("");
                        setSelectedSub("");
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-colors border ${
                        !selectedCat
                          ? "bg-[#181513] text-[#FAF8F5] border-[#181513] dark:bg-[#FAF8F5] dark:text-[#181513]"
                          : "bg-white dark:bg-[#1A1715] border-[#DDD5C7] dark:border-[#2E2925] text-[#181513] dark:text-[#FAF8F5]"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCat(cat.slug);
                          setSelectedSub("");
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-colors border ${
                          selectedCat === cat.slug
                            ? "bg-[#181513] text-[#FAF8F5] border-[#181513] dark:bg-[#FAF8F5] dark:text-[#181513]"
                            : "bg-white dark:bg-[#1A1715] border-[#DDD5C7] dark:border-[#2E2925] text-[#181513] dark:text-[#FAF8F5]"
                        }`}
                      >
                        {cat.name} ({cat._count.products})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subcategories (if active category has them) */}
                {activeCategoryObj && activeCategoryObj.subcategories.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#EAE3D8] dark:border-[#2E2925]">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#A64732] dark:text-[#E07A5F] block">
                      Subcategory
                    </label>
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedSub("")}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          !selectedSub
                            ? "bg-[#181513] text-[#FAF8F5] font-semibold dark:bg-[#FAF8F5] dark:text-[#181513]"
                            : "bg-white dark:bg-[#1A1715] border border-[#DDD5C7] dark:border-[#2E2925] text-[#786F64] dark:text-[#A89F91]"
                        }`}
                      >
                        <span>All {activeCategoryObj.name}</span>
                        {!selectedSub && <Check className="w-3.5 h-3.5" />}
                      </button>
                      {activeCategoryObj.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setSelectedSub(sub.slug)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                            selectedSub === sub.slug
                              ? "bg-[#181513] text-[#FAF8F5] font-semibold dark:bg-[#FAF8F5] dark:text-[#181513]"
                              : "bg-white dark:bg-[#1A1715] border border-[#DDD5C7] dark:border-[#2E2925] text-[#786F64] dark:text-[#A89F91]"
                          }`}
                        >
                          <span>{sub.name}</span>
                          {selectedSub === sub.slug && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-[#E7E0D5] dark:border-[#2E2925] bg-[#F7F4EE] dark:bg-[#1A1715] flex gap-2.5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-3 border border-[#DDD5C7] dark:border-[#2E2925] bg-white dark:bg-[#12100E] text-[#181513] dark:text-[#FAF8F5] rounded-xl text-xs font-semibold uppercase tracking-wider hover:border-[#181513]"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="flex-[2] py-3 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#A64732] dark:hover:bg-[#C85A42] dark:hover:text-white transition-colors shadow-xs"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
