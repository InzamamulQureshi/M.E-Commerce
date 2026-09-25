"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Check,
  RefreshCw,
  Info,
  Trash2,
  Star,
  Sparkles,
  IndianRupee,
  Clock,
  Eye,
  ExternalLink,
  Sliders,
} from "lucide-react";

const STUDIO_PHOTO_PRESETS = [
  {
    label: "Multilayer Explosion Box",
    url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    category: "Explosion Boxes",
  },
  {
    label: "Artisan Pop-up Love Card",
    url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80",
    category: "Cards & Letters",
  },
  {
    label: "Hand-Bound Sage Linen Album",
    url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    category: "Scrapbooks",
  },
  {
    label: "Pastel Crochet Tulips Bouquet",
    url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    category: "Crochet Flowers",
  },
  {
    label: "Luxe Celebration Keepsake Hamper",
    url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
    category: "Hampers",
  },
  {
    label: "Wax-Sealed Vintage Envelope",
    url: "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=800&q=80",
    category: "Cards & Letters",
  },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [slug, setSlug] = useState("");

  // Step Tabs
  const [activeStep, setActiveStep] = useState<"basics" | "pricing" | "photos" | "crafting">("basics");

  // Form Fields
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [subcategoryId, setSubcategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [craftDays, setCraftDays] = useState("3");

  // Multi-Image Array
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrlInput, setCustomImageUrlInput] = useState("");

  const [materials, setMaterials] = useState("");
  const [dimensions, setDimensions] = useState("");

  const [allowsCustomNote, setAllowsCustomNote] = useState(true);
  const [allowsWaxSeal, setAllowsWaxSeal] = useState(true);
  const [allowsGiftWrap, setAllowsGiftWrap] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch("/api/categories"),
        fetch(`/api/admin/products?id=${productId}`),
      ]);

      const catData = await catRes.json();
      const prodData = await prodRes.json();

      if (catData.categories) {
        setCategories(catData.categories);
      }

      if (prodData.product) {
        const p = prodData.product;
        setTitle(p.title || "");
        setTagline(p.tagline || "");
        setDescription(p.description || "");
        setCategoryId(p.categoryId || "");
        const assignedIds = (p.categories && p.categories.length > 0)
          ? p.categories.map((c: any) => c.categoryId || c.category?.id).filter(Boolean)
          : (p.categoryId ? [p.categoryId] : []);
        setSelectedCategoryIds(assignedIds.length > 0 ? assignedIds : [p.categoryId].filter(Boolean));
        setSubcategoryId(p.subcategoryId || "");
        setPrice(String(p.price || ""));
        setCompareAtPrice(p.compareAtPrice ? String(p.compareAtPrice) : "");
        setStock(String(p.stock ?? 10));
        setCraftDays(String(p.craftDays ?? 3));
        setMaterials(p.materials || "");
        setDimensions(p.dimensions || "");
        setAllowsCustomNote(p.allowsCustomNote ?? true);
        setAllowsWaxSeal(p.allowsWaxSeal ?? true);
        setAllowsGiftWrap(p.allowsGiftWrap ?? true);
        setIsFeatured(p.isFeatured ?? false);
        setIsBestSeller(p.isBestSeller ?? false);
        setSlug(p.slug || "");

        // Parse images
        try {
          const parsed = JSON.parse(p.images);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setImages(parsed);
          } else {
            setImages([STUDIO_PHOTO_PRESETS[0].url]);
          }
        } catch {
          setImages([STUDIO_PHOTO_PRESETS[0].url]);
        }

        // Subcategories for current category
        const selectedCat = catData.categories?.find((c: any) => c.id === p.categoryId);
        if (selectedCat) {
          setSubcategories(selectedCat.subcategories || []);
        }
      }
    } catch {
      setError("Failed to load product data");
    } finally {
      setInitialLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId);
    if (!selectedCategoryIds.includes(catId)) {
      setSelectedCategoryIds([catId, ...selectedCategoryIds]);
    }
    const selected = categories.find((c) => c.id === catId);
    if (selected) {
      setSubcategories(selected.subcategories || []);
      setSubcategoryId(selected.subcategories?.[0]?.id || "");
    }
  };

  const toggleCategory = (catId: string) => {
    let next: string[];
    if (selectedCategoryIds.includes(catId)) {
      if (selectedCategoryIds.length <= 1) return; // Keep at least one
      next = selectedCategoryIds.filter((id) => id !== catId);
    } else {
      next = [...selectedCategoryIds, catId];
    }
    setSelectedCategoryIds(next);
    if (!next.includes(categoryId)) {
      handleCategoryChange(next[0]);
    }
  };

  const addPresetImage = (url: string) => {
    if (!images.includes(url)) {
      setImages([...images, url]);
    }
  };

  const addCustomImage = () => {
    if (customImageUrlInput.trim() && !images.includes(customImageUrlInput.trim())) {
      setImages([...images, customImageUrlInput.trim()]);
      setCustomImageUrlInput("");
    }
  };

  const removeImage = (index: number) => {
    if (images.length <= 1) return;
    setImages(images.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index: number) => {
    const selected = images[index];
    const rest = images.filter((_, i) => i !== index);
    setImages([selected, ...rest]);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!title.trim() || !description.trim() || !price || !categoryId) {
      setError("Please fill in Title, Description, Price, and Category.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          title: title.trim(),
          tagline: tagline.trim() || undefined,
          description: description.trim(),
          categoryId,
          categoryIds: selectedCategoryIds,
          subcategoryId: subcategoryId || undefined,
          price,
          compareAtPrice: compareAtPrice || undefined,
          stock,
          craftDays,
          images,
          materials,
          dimensions,
          allowsCustomNote,
          allowsWaxSeal,
          allowsGiftWrap,
          isFeatured,
          isBestSeller,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      setSuccessMsg("✓ Creation updated successfully!");
      router.refresh();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-16 text-center text-xs text-[#786F64] dark:text-[#A89F91]">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#A64732] dark:text-[#E07A5F]" />
        Loading product details...
      </div>
    );
  }

  const primaryImage = images[0] || STUDIO_PHOTO_PRESETS[0].url;
  const currentCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E0D5] dark:border-[#2E2925] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/products"
            className="p-2 rounded-xl border border-[#DDD5C7] dark:border-[#38322D] bg-white dark:bg-[#1A1715] text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A64732] dark:text-[#E07A5F]">
              Catalog Edit Wizard
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5] mt-0.5">
              Edit: {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {slug && (
            <Link
              href={`/catalog/${slug}`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl border border-[#DDD5C7] dark:border-[#38322D] bg-white dark:bg-[#221E1B] text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>View on Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            type="button"
            onClick={handleUpdate}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#A64732] hover:bg-[#8D3825] dark:bg-[#E07A5F] dark:hover:bg-[#D46548] text-white dark:text-[#181513] text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{loading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "basics", label: "1. Gift Details" },
          { id: "pricing", label: "2. Pricing & Stock" },
          { id: "photos", label: "3. Studio Photos" },
          { id: "crafting", label: "4. Customizations" },
        ].map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => setActiveStep(step.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeStep === step.id
                ? "bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] shadow-xs"
                : "bg-white dark:bg-[#1A1715] text-[#786F64] dark:text-[#A89F91] border border-[#DDD5C7] dark:border-[#2E2925] hover:border-[#181513] dark:hover:border-[#FAF8F5]"
            }`}
          >
            {step.label}
          </button>
        ))}
      </div>

      {/* Split Grid: Form VS Sticky Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Form (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: BASICS */}
          {activeStep === "basics" && (
            <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] shadow-2xs space-y-5">
              <div className="border-b border-[#EAE3D8] dark:border-[#2E2925] pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                  Gift Basics & Story
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                  Gift Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-4 text-xs font-medium bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                  Tagline (Short Summary)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full h-11 px-4 text-xs font-medium bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none"
                />
              </div>

              {/* Assign Multiple Categories */}
              <div className="space-y-2 p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#181412] border border-[#DDD5C7] dark:border-[#2E2925]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] flex items-center gap-1.5">
                    <span>Collections / Categories</span>
                    <span className="text-[10px] text-[#A64732] dark:text-[#E07A5F] font-bold lowercase">
                      ({selectedCategoryIds.length} assigned)
                    </span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                    Click to assign to multiple collections
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {categories.map((c) => {
                    const isSelected = selectedCategoryIds.includes(c.id);
                    const isPrimary = categoryId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCategory(c.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] border-[#181513] dark:border-[#FAF8F5] shadow-xs"
                            : "bg-white dark:bg-[#201D1A] text-[#575048] dark:text-[#C5BCAD] border-[#DDD5C7] dark:border-[#2E2925] hover:border-[#181513] dark:hover:border-[#FAF8F5]"
                        }`}
                      >
                        <span className="font-bold">{isSelected ? "✓" : "+"}</span>
                        <span>{c.name}</span>
                        {isPrimary && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500 text-white font-bold tracking-wider">
                            Primary
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                    Primary Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full h-11 px-3 text-xs font-medium bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                    Subcategory (Optional)
                  </label>
                  <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className="w-full h-11 px-3 text-xs font-medium bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none"
                  >
                    <option value="">None / General</option>
                    {subcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                  Artisan Craft Story & Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 text-xs font-medium bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Product Customization & Personalization Options */}
              <div className="p-4 sm:p-5 rounded-xl border border-[#DDD5C7] dark:border-[#2E2925] bg-[#FAF8F5] dark:bg-[#1C1815] space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#EAE3D8] dark:border-[#2E2925]">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                        Product Personalization & Customization Options
                      </h4>
                      <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                        Control whether this gift allows bespoke customer personalizations or is a standard ready-to-ship piece.
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 w-fit ${
                      allowsCustomNote || allowsWaxSeal || allowsGiftWrap
                        ? "bg-[#A64732]/10 text-[#A64732] dark:text-[#E07A5F]"
                        : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {allowsCustomNote || allowsWaxSeal || allowsGiftWrap
                      ? "Customization Active"
                      : "Standard Off-the-Shelf"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: Handwritten Letter / Note */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      allowsCustomNote
                        ? "border-[#A64732] bg-white dark:bg-[#201D1A] shadow-xs"
                        : "border-[#DDD5C7] dark:border-[#2E2925] bg-white/50 dark:bg-[#201D1A]/50 opacity-70"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={allowsCustomNote}
                      onChange={(e) => setAllowsCustomNote(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-[#A64732] focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] block">
                        Personalized Letter
                      </span>
                      <span className="text-[10px] text-[#786F64] dark:text-[#A89F91] block mt-0.5">
                        Customer dedication & message
                      </span>
                    </div>
                  </label>

                  {/* Option 2: Wax Seal */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      allowsWaxSeal
                        ? "border-[#A64732] bg-white dark:bg-[#201D1A] shadow-xs"
                        : "border-[#DDD5C7] dark:border-[#2E2925] bg-white/50 dark:bg-[#201D1A]/50 opacity-70"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={allowsWaxSeal}
                      onChange={(e) => setAllowsWaxSeal(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-[#A64732] focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] block">
                        Melted Wax Seal
                      </span>
                      <span className="text-[10px] text-[#786F64] dark:text-[#A89F91] block mt-0.5">
                        Hot wax stamp color choice
                      </span>
                    </div>
                  </label>

                  {/* Option 3: Gift Wrapping */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      allowsGiftWrap
                        ? "border-[#A64732] bg-white dark:bg-[#201D1A] shadow-xs"
                        : "border-[#DDD5C7] dark:border-[#2E2925] bg-white/50 dark:bg-[#201D1A]/50 opacity-70"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={allowsGiftWrap}
                      onChange={(e) => setAllowsGiftWrap(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-[#A64732] focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] block">
                        Gift Wrapping
                      </span>
                      <span className="text-[10px] text-[#786F64] dark:text-[#A89F91] block mt-0.5">
                        Studio packaging options
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const anyOn = allowsCustomNote || allowsWaxSeal || allowsGiftWrap;
                      setAllowsCustomNote(!anyOn);
                      setAllowsWaxSeal(!anyOn);
                      setAllowsGiftWrap(!anyOn);
                    }}
                    className="text-[11px] font-semibold text-[#A64732] dark:text-[#E07A5F] hover:underline cursor-pointer"
                  >
                    {allowsCustomNote || allowsWaxSeal || allowsGiftWrap
                      ? "Turn OFF all personalizations (Make standard ready-to-ship)"
                      : "Turn ON all personalizations"}
                  </button>
                  <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                    Also fine-tune in Step 4
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStep("pricing")}
                  className="px-5 py-2.5 rounded-xl bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] text-xs font-bold uppercase tracking-wider"
                >
                  Next: Pricing & Stock →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PRICING & STOCK */}
          {activeStep === "pricing" && (
            <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] shadow-2xs space-y-5">
              <div className="border-b border-[#EAE3D8] dark:border-[#2E2925] pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                  Pricing, Stock & Handcraft Time
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                    Selling Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-[#786F64] dark:text-[#A89F91] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full h-11 pl-9 pr-4 text-xs font-medium bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                    Original / MRP Price (₹) (Optional strikethrough)
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-[#786F64] dark:text-[#A89F91] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                      className="w-full h-11 pl-9 pr-4 text-xs font-medium bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                    Available Stock Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full h-11 px-4 text-xs font-medium bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                    Handcraft Lead Time (Days)
                  </label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-[#786F64] dark:text-[#A89F91] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={craftDays}
                      onChange={(e) => setCraftDays(e.target.value)}
                      className="w-full h-11 pl-9 pr-4 text-xs font-medium bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep("basics")}
                  className="px-4 py-2 rounded-xl border border-[#DDD5C7] dark:border-[#2E2925] text-xs font-semibold uppercase tracking-wider"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep("photos")}
                  className="px-5 py-2.5 rounded-xl bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] text-xs font-bold uppercase tracking-wider"
                >
                  Next: Studio Photos →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PHOTOS */}
          {activeStep === "photos" && (
            <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] shadow-2xs space-y-5">
              <div className="border-b border-[#EAE3D8] dark:border-[#2E2925] pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                  Studio Photography & Gallery
                </h3>
              </div>

              {/* Active Photos Strip */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                  Attached Photos ({images.length})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((url, idx) => (
                    <div
                      key={url}
                      className="relative aspect-square rounded-xl overflow-hidden border-2 border-[#DDD5C7] dark:border-[#38322D] bg-[#EAE3D8] group shadow-xs"
                    >
                      <Image src={url} alt={`Photo ${idx + 1}`} fill className="object-cover" />

                      {idx === 0 ? (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#A64732] text-white text-[9px] font-bold uppercase tracking-wider shadow-xs">
                          Primary Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx)}
                          className="absolute top-2 left-2 p-1.5 rounded-md bg-black/60 text-white hover:bg-[#A64732] transition-colors text-[9px] font-semibold"
                          title="Set as primary cover"
                        >
                          <Star className="w-3 h-3" />
                        </button>
                      )}

                      {images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 text-white hover:bg-red-600 transition-colors"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-2 pt-3 border-t border-[#EAE3D8] dark:border-[#2E2925]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                  <span>Curated Studio Photo Library (1-Click Add)</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {STUDIO_PHOTO_PRESETS.map((preset) => {
                    const isAdded = images.includes(preset.url);

                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => addPresetImage(preset.url)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          isAdded
                            ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20"
                            : "border-[#DDD5C7] dark:border-[#2E2925] bg-white dark:bg-[#201D1A] hover:border-[#181513] dark:hover:border-[#FAF8F5]"
                        }`}
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#EAE3D8]">
                          <Image src={preset.url} alt={preset.label} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-[#181513] dark:text-[#FAF8F5] truncate">
                            {preset.label}
                          </p>
                          <span className="text-[9.5px] text-[#786F64] dark:text-[#A89F91]">
                            {isAdded ? "✓ Added" : "+ Add"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom URL */}
              <div className="space-y-1.5 pt-3 border-t border-[#EAE3D8] dark:border-[#2E2925]">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                  Or Paste Custom Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrlInput}
                    onChange={(e) => setCustomImageUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 h-10 px-4 text-xs bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomImage}
                    className="px-4 py-2 rounded-xl bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] text-xs font-bold uppercase tracking-wider"
                  >
                    + Add URL
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep("pricing")}
                  className="px-4 py-2 rounded-xl border border-[#DDD5C7] dark:border-[#2E2925] text-xs font-semibold uppercase tracking-wider"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep("crafting")}
                  className="px-5 py-2.5 rounded-xl bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] text-xs font-bold uppercase tracking-wider"
                >
                  Next: Customizations →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CUSTOMIZATIONS */}
          {activeStep === "crafting" && (
            <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] shadow-2xs space-y-5">
              <div className="border-b border-[#EAE3D8] dark:border-[#2E2925] pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                  Handcrafting Options & Storefront Badges
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                    Materials Used
                  </label>
                  <input
                    type="text"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder="e.g. 320 GSM Kraft Cardstock, Silk ribbon"
                    className="w-full h-11 px-4 text-xs font-medium bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                    Gift Dimensions
                  </label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="e.g. 15cm x 15cm x 15cm"
                    className="w-full h-11 px-4 text-xs font-medium bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none"
                  />
                </div>
              </div>

              {/* Master Customization Toggle */}
              <div className="p-4 rounded-xl border border-[#DDD5C7] dark:border-[#2E2925] bg-[#FAF8F5] dark:bg-[#1C1815] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                    <span>Product Customization Suite</span>
                  </h4>
                  <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] mt-0.5">
                    {allowsCustomNote || allowsWaxSeal || allowsGiftWrap
                      ? "Customization is ACTIVE for this product. Fine-tune options below or turn off for standard off-the-shelf items."
                      : "Customization is OFF. Customers will purchase this product as-is with standard direct add-to-bag."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const anyOn = allowsCustomNote || allowsWaxSeal || allowsGiftWrap;
                    setAllowsCustomNote(!anyOn);
                    setAllowsWaxSeal(!anyOn);
                    setAllowsGiftWrap(!anyOn);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                    allowsCustomNote || allowsWaxSeal || allowsGiftWrap
                      ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 hover:bg-red-100"
                      : "bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] hover:opacity-90"
                  }`}
                >
                  {allowsCustomNote || allowsWaxSeal || allowsGiftWrap
                    ? "Disable All Customizations"
                    : "Enable Customizations"}
                </button>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-1">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowsCustomNote}
                    onChange={(e) => setAllowsCustomNote(e.target.checked)}
                    className="w-4 h-4 rounded text-[#A64732] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] block">
                      Allow Personalized Recipient Name & Letter
                    </span>
                    <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                      Customers can specify a custom message and recipient name at checkout.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowsWaxSeal}
                    onChange={(e) => setAllowsWaxSeal(e.target.checked)}
                    className="w-4 h-4 rounded text-[#A64732] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] block">
                      Allow Melted Wax Seal Color Selection
                    </span>
                    <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                      Customers can pick Antique Gold, Burgundy Rose, or Emerald wax seals.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowsGiftWrap}
                    onChange={(e) => setAllowsGiftWrap(e.target.checked)}
                    className="w-4 h-4 rounded text-[#A64732] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] block">
                      Allow Studio Packaging & Gift Wrapping
                    </span>
                    <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                      Customers can select botanical wrap, silk ribbons, or studio packaging.
                    </span>
                  </div>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-[#A64732] focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] block">
                        Feature on Homepage
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#2E2925] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="w-4 h-4 rounded text-[#A64732] focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5] block">
                        Mark as Studio Bestseller
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#EAE3D8] dark:border-[#2E2925]">
                <button
                  type="button"
                  onClick={() => setActiveStep("photos")}
                  className="px-4 py-2 rounded-xl border border-[#DDD5C7] dark:border-[#2E2925] text-xs font-semibold uppercase tracking-wider"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-[#A64732] hover:bg-[#8D3825] dark:bg-[#E07A5F] text-white dark:text-[#181513] text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{loading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
            <Eye className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
            <span>Live Storefront Card Preview</span>
          </div>

          <div className="sticky top-24 rounded-xl border border-[#D0C5B4] dark:border-[#2E2925] bg-white dark:bg-[#181412] p-4 shadow-md space-y-3">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#EAE3D8]">
              <Image src={primaryImage} alt={title || "Preview"} fill className="object-cover" />

              {isBestSeller && (
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] text-[9px] font-bold uppercase tracking-widest shadow-xs">
                  Bestseller
                </span>
              )}
            </div>

            {/* Category & Customization Status */}
            <div className="flex items-center justify-between text-[10px] text-[#786F64] dark:text-[#A89F91]">
              <span className="uppercase font-semibold tracking-wider">
                {currentCategory?.name || "Collection"}
              </span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                allowsCustomNote || allowsWaxSeal || allowsGiftWrap
                  ? "bg-[#A64732]/10 text-[#A64732] dark:text-[#E07A5F]"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              }`}>
                {allowsCustomNote || allowsWaxSeal || allowsGiftWrap ? "Bespoke Custom" : "Standard Ready"}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-[#181513] dark:text-[#FAF8F5] line-clamp-1">
                {title || "Handcrafted Gift Title"}
              </h4>
              <p className="text-xs text-[#786F64] dark:text-[#A89F91] line-clamp-2 mt-0.5">
                {tagline || description || "Description"}
              </p>
            </div>

            <div className="flex items-baseline gap-2 pt-1 border-t border-[#EFE9DF] dark:border-[#282320]">
              <span className="text-base font-black text-[#181513] dark:text-[#FAF8F5]">
                {price ? formatCurrency(price) : "₹1,499"}
              </span>
              {compareAtPrice && Number(compareAtPrice) > Number(price) && (
                <span className="text-xs text-[#786F64] dark:text-[#A89F91] line-through">
                  {formatCurrency(compareAtPrice)}
                </span>
              )}
            </div>

            {/* Storefront Button Preview */}
            <div className="pt-2">
              <div className="w-full py-2 rounded-xl bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                <span>View Product</span>
                <span className="text-sm">↗</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
