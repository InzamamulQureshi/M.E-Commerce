"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import {
  PlusCircle,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  Star,
  Sparkles,
  RefreshCw,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [categories, setCategories] = useState<any[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Delete modal state
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {
      console.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleStockUpdate = async (id: string, currentStock: number, change: number) => {
    const newStock = Math.max(0, currentStock + change);
    setProducts(products.map((p) => (p.id === id ? { ...p, stock: newStock } : p)));

    try {
      await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, stock: newStock }),
      });
    } catch {
      fetchProducts();
    }
  };

  const handleToggle = async (id: string, field: "isFeatured" | "isBestSeller", currentValue: boolean) => {
    const newValue = !currentValue;
    setProducts(products.map((p) => (p.id === id ? { ...p, [field]: newValue } : p)));

    try {
      await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: newValue }),
      });
    } catch {
      fetchProducts();
    }
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/admin/products?id=${deletingProduct.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== deletingProduct.id));
        setDeletingProduct(null);
      }
    } catch {
      console.error("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      categoryFilter === "ALL" ||
      p.categoryId === categoryFilter ||
      p.categories?.some((c: any) => c.categoryId === categoryFilter || c.category?.id === categoryFilter);
    return matchesSearch && matchesCat;
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startIndex = totalProducts === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalProducts);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header & New Creation CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D0C5B4] dark:border-[#2E2723] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#A64732] dark:text-[#E07A5F]">
            Inventory Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5] mt-0.5">
            Catalog Creations
          </h1>
          <p className="text-xs text-[#786F64] dark:text-[#A89F91] mt-0.5">
            Manage your online gift listings, update live stock counts, and showcase bestsellers.
          </p>
        </div>

        <Link href="/admin/dashboard/products/new" className="w-full sm:w-auto">
          <button
            type="button"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#A64732] hover:bg-[#8D3825] dark:bg-[#E07A5F] dark:hover:bg-[#D46548] text-white dark:text-[#181513] text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Gift</span>
          </button>
        </Link>
      </div>

      {/* Inventory & Catalog Guide for Non-Technical Staff */}
      <div className="bg-[#FAF7F2] dark:bg-[#181412] p-4 sm:p-5 rounded-2xl border border-[#D0C5B4] dark:border-[#2E2723] space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#A64732] dark:bg-[#E07A5F] text-white flex items-center justify-center text-[11px] font-bold">
            i
          </span>
          <h2 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-[#181513] dark:text-[#FAF8F5]">
            Inventory & Catalog Guide
          </h2>
          <span className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
            How to manage listings and stock counts
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#786F64] dark:text-[#A89F91]">
          <div className="p-3 bg-white dark:bg-[#201B18] rounded-xl border border-[#E8E1D5] dark:border-[#2E2723]">
            <p className="font-bold text-[#181513] dark:text-[#FAF8F5] mb-1 flex items-center gap-1.5">
              <span>📦</span> Live Stock Counts
            </p>
            <p className="leading-relaxed">
              Use the + and - buttons to adjust physical stock count. When stock reaches 0, the item displays as &apos;Out of Stock&apos; on the website.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-[#201B18] rounded-xl border border-[#E8E1D5] dark:border-[#2E2723]">
            <p className="font-bold text-[#181513] dark:text-[#FAF8F5] mb-1 flex items-center gap-1.5">
              <span>⭐</span> Badges & Visibility
            </p>
            <p className="leading-relaxed">
              Toggle the Star icon to feature a gift on the homepage, or the Sparkle icon to highlight it as a customer bestseller.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-[#201B18] rounded-xl border border-[#E8E1D5] dark:border-[#2E2723]">
            <p className="font-bold text-[#181513] dark:text-[#FAF8F5] mb-1 flex items-center gap-1.5">
              <span>✏️</span> Adding & Editing
            </p>
            <p className="leading-relaxed">
              Click &apos;+ Add New Gift&apos; at the top to publish new handcrafted gifts, or click the pencil icon on any item to update prices or photos.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => handleCategoryChange("ALL")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
              categoryFilter === "ALL"
                ? "bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] shadow-xs"
                : "bg-white dark:bg-[#181412] text-[#786F64] dark:text-[#A89F91] border border-[#D0C5B4] dark:border-[#2E2723] hover:border-[#181513] dark:hover:border-[#FAF8F5]"
            }`}
          >
            All ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter(
              (p) =>
                p.categoryId === cat.id ||
                p.categories?.some((c: any) => c.categoryId === cat.id || c.category?.id === cat.id)
            ).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                  categoryFilter === cat.id
                    ? "bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] shadow-xs"
                    : "bg-white dark:bg-[#181412] text-[#786F64] dark:text-[#A89F91] border border-[#D0C5B4] dark:border-[#2E2723] hover:border-[#181513] dark:hover:border-[#FAF8F5]"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#786F64] dark:text-[#A89F91] absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search gifts in catalog..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] rounded-full text-[#181513] dark:text-[#FAF8F5] placeholder:text-[#9A9185] dark:placeholder:text-[#6E665D] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5] shadow-xs"
          />
        </div>
      </div>

      {/* Products Grid & Table */}
      {loading ? (
        <div className="p-16 text-center text-xs text-[#786F64] dark:text-[#A89F91] bg-white dark:bg-[#181412] rounded-xl border border-[#D0C5B4] dark:border-[#2E2723]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#A64732] dark:text-[#E07A5F]" />
          Loading studio catalog...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#181412] rounded-xl border border-[#D0C5B4] dark:border-[#2E2925] space-y-2">
          <p className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">No creations match criteria</p>
          <p className="text-xs text-[#786F64] dark:text-[#A89F91]">
            Try changing search keywords or category filters.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#181412] rounded-xl border border-[#D0C5B4] dark:border-[#2E2723] shadow-2xs overflow-hidden">
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D0C5B4] dark:border-[#2E2723] bg-[#FAF7F2] dark:bg-[#1E1916] text-[#786F64] dark:text-[#A89F91] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Creation Details</th>
                  <th className="py-3 px-4">Collection</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Available Stock</th>
                  <th className="py-3 px-4 text-center">Badges</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DF] dark:divide-[#282320]">
                {paginatedProducts.map((p) => {
                  let img = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80";
                  try {
                    const parsed = JSON.parse(p.images);
                    if (Array.isArray(parsed) && parsed[0]) img = parsed[0];
                  } catch {}

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-white dark:hover:bg-[#201D1A] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#EAE3D8] border border-[#DDD5C7] dark:border-[#38322D]">
                            <Image src={img} alt={p.title} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#181513] dark:text-[#FAF8F5] line-clamp-1">
                              {p.title}
                            </p>
                            <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                              {p.craftDays} days lead time
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-[#181513] dark:text-[#FAF8F5]">
                        <div className="flex flex-wrap gap-1 items-center max-w-[200px]">
                          <span className="px-2 py-0.5 rounded-md bg-[#F2EDE4] dark:bg-[#24201D] text-[10px] font-bold text-[#181513] dark:text-[#FAF8F5] border border-[#DDD5C7] dark:border-[#38322D]">
                            {p.category?.name || "Uncategorized"}
                          </span>
                          {p.categories
                            ?.filter((pc: any) => pc.categoryId !== p.categoryId && pc.category?.id !== p.categoryId)
                            .map((pc: any) => (
                              <span
                                key={pc.id || pc.categoryId}
                                className="px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/40 text-[9px] font-medium"
                              >
                                {pc.category?.name}
                              </span>
                            ))}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-sm text-[#181513] dark:text-[#FAF8F5]">
                          {formatCurrency(p.price)}
                        </div>
                        {p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price) && (
                          <div className="text-[10px] text-[#786F64] dark:text-[#A89F91] line-through">
                            {formatCurrency(p.compareAtPrice)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStockUpdate(p.id, p.stock, -1)}
                            className="w-6 h-6 rounded-md border border-[#DDD5C7] dark:border-[#38322D] flex items-center justify-center font-bold text-xs hover:bg-[#EAE3D8] dark:hover:bg-[#282320]"
                          >
                            -
                          </button>
                          <span
                            className={`font-mono font-bold text-xs min-w-[24px] text-center ${
                              p.stock <= 5
                                ? "text-red-600 dark:text-red-400 font-black"
                                : "text-[#181513] dark:text-[#FAF8F5]"
                            }`}
                          >
                            {p.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStockUpdate(p.id, p.stock, 1)}
                            className="w-6 h-6 rounded-md border border-[#DDD5C7] dark:border-[#38322D] flex items-center justify-center font-bold text-xs hover:bg-[#EAE3D8] dark:hover:bg-[#282320]"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStockUpdate(p.id, p.stock, 5)}
                            className="px-1.5 py-0.5 rounded-md text-[10px] border border-[#DDD5C7] dark:border-[#38322D] text-[#786F64] dark:text-[#A89F91] hover:bg-[#EAE3D8] dark:hover:bg-[#282320]"
                            title="Add 5 units"
                          >
                            +5
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggle(p.id, "isBestSeller", p.isBestSeller)}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              p.isBestSeller
                                ? "border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold"
                                : "border-[#DDD5C7] dark:border-[#2E2925] text-[#A89F91] hover:text-[#181513]"
                            }`}
                            title={p.isBestSeller ? "Bestseller (Click to unset)" : "Set as Bestseller"}
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggle(p.id, "isFeatured", p.isFeatured)}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              p.isFeatured
                                ? "border-[#A64732] bg-rose-50 dark:bg-rose-950/40 text-[#A64732] dark:text-[#E07A5F] font-bold"
                                : "border-[#DDD5C7] dark:border-[#2E2925] text-[#A89F91] hover:text-[#181513]"
                            }`}
                            title={p.isFeatured ? "Featured (Click to unset)" : "Set as Featured"}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/catalog/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-[#DDD5C7] dark:border-[#38322D] text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
                            title="View on Store"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/admin/dashboard/products/${p.id}`}
                            className="p-1.5 rounded-lg border border-[#DDD5C7] dark:border-[#38322D] text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
                            title="Edit Creation"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeletingProduct(p)}
                            className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                            title="Delete Creation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (< 768px) */}
          <div className="md:hidden divide-y divide-[#EFE9DF] dark:divide-[#282320]">
            {paginatedProducts.map((p) => {
              let img = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80";
              try {
                const parsed = JSON.parse(p.images);
                if (Array.isArray(parsed) && parsed[0]) img = parsed[0];
              } catch {}

              return (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#EAE3D8]">
                      <Image src={img} alt={p.title} fill className="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-[#181513] dark:text-[#FAF8F5] truncate">
                          {p.title}
                        </h4>
                        <span className="font-bold text-sm text-[#181513] dark:text-[#FAF8F5] shrink-0">
                          {formatCurrency(p.price)}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#786F64] dark:text-[#A89F91] mt-0.5">
                        {p.category?.name || "Handcrafted"} • {p.craftDays}d craft
                      </p>

                      {/* Badges */}
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-[9.5px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                            p.stock <= 5
                              ? "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                              : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                          }`}
                        >
                          {p.stock === 0 ? "Out of Stock" : `${p.stock} in stock`}
                        </span>
                        {p.isFeatured && (
                          <span className="text-[9.5px] px-1.5 py-0.5 rounded-md font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                            ★ Featured
                          </span>
                        )}
                        {p.isBestSeller && (
                          <span className="text-[9.5px] px-1.5 py-0.5 rounded-md font-bold bg-primary/10 text-primary">
                            ✦ Bestseller
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Stock adjuster */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-[#EFE9DF] dark:border-[#282320]">
                    <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#786F64] dark:text-[#A89F91]">Stock:</span>
                        <button
                          type="button"
                          onClick={() => handleStockUpdate(p.id, p.stock, -1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#DDD5C7] dark:border-[#38322D] text-xs font-bold hover:bg-[#EAE3D8] dark:hover:bg-[#282320]"
                        >
                          -
                        </button>
                        <span className={`w-8 text-center text-xs font-mono font-bold ${
                          p.stock <= 5 ? "text-red-600 dark:text-red-400" : ""
                        }`}>
                          {p.stock}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStockUpdate(p.id, p.stock, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#DDD5C7] dark:border-[#38322D] text-xs font-bold hover:bg-[#EAE3D8] dark:hover:bg-[#282320]"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStockUpdate(p.id, p.stock, 5)}
                          className="px-1.5 py-1 rounded-md text-[10px] border border-[#DDD5C7] dark:border-[#38322D] text-[#786F64] dark:text-[#A89F91] hover:bg-[#EAE3D8] dark:hover:bg-[#282320]"
                          title="Add 5 units"
                        >
                          +5
                        </button>
                      </div>

                      {/* Mobile Quick Bestseller & Featured toggles */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggle(p.id, "isBestSeller", p.isBestSeller)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            p.isBestSeller
                              ? "border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold"
                              : "border-[#DDD5C7] dark:border-[#2E2925] text-[#A89F91]"
                          }`}
                          title={p.isBestSeller ? "Bestseller (active)" : "Set as Bestseller"}
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(p.id, "isFeatured", p.isFeatured)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            p.isFeatured
                              ? "border-[#A64732] bg-rose-50 dark:bg-rose-950/40 text-[#A64732] dark:text-[#E07A5F] font-bold"
                              : "border-[#DDD5C7] dark:border-[#2E2925] text-[#A89F91]"
                          }`}
                          title={p.isFeatured ? "Featured (active)" : "Set as Featured"}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#F0EBE1] dark:border-[#241F1C]">
                      <Link
                        href={`/catalog/${p.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg border border-[#DDD5C7] dark:border-[#38322D] text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
                        title="View on storefront"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href={`/admin/dashboard/products/${p.id}`}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#DDD5C7] dark:border-[#38322D] text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5]"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeletingProduct(p)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-200"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalProducts > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-[#786F64] dark:text-[#A89F91]">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              Showing <strong className="text-[#181513] dark:text-[#FAF8F5]">{startIndex}</strong> -{" "}
              <strong className="text-[#181513] dark:text-[#FAF8F5]">{endIndex}</strong> of{" "}
              <strong className="text-[#181513] dark:text-[#FAF8F5]">{totalProducts}</strong> gifts
            </span>
            <div className="flex items-center gap-1.5 pl-3 border-l border-[#D0C5B4] dark:border-[#2E2723]">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 px-2 rounded-lg border border-[#D0C5B4] dark:border-[#2E2723] bg-white dark:bg-[#181412] text-[#181513] dark:text-[#FAF8F5] font-semibold focus:outline-none"
              >
                <option value={4}>4 / page</option>
                <option value={8}>8 / page</option>
                <option value={12}>12 / page</option>
                <option value={24}>24 / page</option>
                <option value={48}>48 / page</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-[#D0C5B4] dark:border-[#2E2723] bg-white dark:bg-[#181412] text-[#181513] dark:text-[#FAF8F5] disabled:opacity-35 disabled:cursor-not-allowed hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-colors flex items-center gap-1 font-semibold cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* Page Number Buttons */}
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
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          currentPage === p
                            ? "bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] shadow-xs"
                            : "border border-[#D0C5B4] dark:border-[#2E2723] bg-white dark:bg-[#181412] text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5]"
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-[#D0C5B4] dark:border-[#2E2723] bg-white dark:bg-[#181412] text-[#181513] dark:text-[#FAF8F5] disabled:opacity-35 disabled:cursor-not-allowed hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-colors flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Portaled with Full Edge-to-Edge Blur) */}
      <AdminModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        maxWidth="max-w-md"
      >
        {deletingProduct && (
          <div className="w-full bg-white dark:bg-[#181412] rounded-xl border border-[#D0C5B4] dark:border-[#2E2925] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#181513] dark:text-[#FAF8F5]">
                Delete &apos;{deletingProduct.title}&apos;?
              </h3>
            </div>

            <p className="text-xs text-[#786F64] dark:text-[#A89F91] leading-relaxed">
              Are you sure you want to remove this gift from your catalog? Customers will no longer be able to purchase it.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-xl border border-[#DDD5C7] dark:border-[#2E2925] text-xs font-semibold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
