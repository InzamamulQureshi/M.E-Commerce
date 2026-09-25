"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Folders, FolderPlus, Pencil, X } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";

interface EditingTarget {
  id: string;
  type: "category" | "subcategory";
  name: string;
  description: string;
  image?: string;
  categoryId?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category state
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatImage, setNewCatImage] = useState("");
  const [catLoading, setCatLoading] = useState(false);

  // New Subcategory state
  const [selectedParentCatId, setSelectedParentCatId] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [newSubDesc, setNewSubDesc] = useState("");
  const [subLoading, setSubLoading] = useState(false);

  // Edit State
  const [editingTarget, setEditingTarget] = useState<EditingTarget | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [heroFeaturedCategoryId, setHeroFeaturedCategoryId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        if (data.heroFeaturedCategoryId !== undefined) {
          setHeroFeaturedCategoryId(data.heroFeaturedCategoryId);
        }
        if (data.categories?.length > 0 && !selectedParentCatId) {
          setSelectedParentCatId(data.categories[0].id);
        }
      }
    } catch {
      console.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [selectedParentCatId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleToggleHeroFeatured = async (catId: string) => {
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_hero_featured",
          categoryId: catId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setHeroFeaturedCategoryId(data.heroFeaturedCategoryId);
      }
    } catch (err) {
      console.error("Failed to toggle hero category:", err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatLoading(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "category",
          name: newCatName.trim(),
          description: newCatDesc.trim(),
          image: newCatImage.trim() || null,
        }),
      });

      if (res.ok) {
        setNewCatName("");
        setNewCatDesc("");
        setNewCatImage("");
        fetchCategories();
      }
    } catch {
      console.error("Failed to create category");
    } finally {
      setCatLoading(false);
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !selectedParentCatId) return;
    setSubLoading(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "subcategory",
          categoryId: selectedParentCatId,
          name: newSubName.trim(),
          description: newSubDesc.trim(),
        }),
      });

      if (res.ok) {
        setNewSubName("");
        setNewSubDesc("");
        fetchCategories();
      }
    } catch {
      console.error("Failed to create subcategory");
    } finally {
      setSubLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget || !editingTarget.name.trim()) return;
    setEditLoading(true);
    setEditError("");

    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTarget),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Failed to update category or subcategory");
      } else {
        setEditingTarget(null);
        fetchCategories();
      }
    } catch {
      setEditError("Connection error while updating. Please retry.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string, type: "category" | "subcategory", name: string) => {
    if (!confirm(`Are you sure you want to delete ${type} "${name}"?`)) return;

    try {
      await fetch(`/api/admin/categories?id=${id}&type=${type}`, { method: "DELETE" });
      fetchCategories();
    } catch {
      console.error("Delete failed");
    }
  };

  return (
    <div className="space-y-10">
      <div className="border-b border-[#D0C5B4] dark:border-[#2E2723] pb-4">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A64732] dark:text-[#E07A5F]">
          Store Architecture
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5] mt-1">
          Categories & Subcategories
        </h1>
        <p className="text-xs text-[#786F64] dark:text-[#A89F91] mt-1">
          Organize your catalog collections, gift hierarchies, and edit existing titles.
        </p>
      </div>

      {/* Category Architecture Guide for Non-Technical Staff */}
      <div className="bg-[#FAF7F2] dark:bg-[#181412] p-4 sm:p-5 rounded-2xl border border-[#D0C5B4] dark:border-[#2E2723] space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#A64732] dark:bg-[#E07A5F] text-white flex items-center justify-center text-[11px] font-bold">
            i
          </span>
          <h2 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-[#181513] dark:text-[#FAF8F5]">
            Store Architecture Guide
          </h2>
          <span className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
            How collections and subcategories work together
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#786F64] dark:text-[#A89F91]">
          <div className="p-3 bg-white dark:bg-[#201B18] rounded-xl border border-[#E8E1D5] dark:border-[#2E2723]">
            <p className="font-bold text-[#181513] dark:text-[#FAF8F5] mb-1 flex items-center gap-1.5">
              <span>📁</span> Primary Categories
            </p>
            <p className="leading-relaxed">
              Main store departments (e.g. Letters, Wax Seals, Gift Boxes). These show up in the top menu and category popups for customers.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-[#201B18] rounded-xl border border-[#E8E1D5] dark:border-[#2E2723]">
            <p className="font-bold text-[#181513] dark:text-[#FAF8F5] mb-1 flex items-center gap-1.5">
              <span>📂</span> Subcategories
            </p>
            <p className="leading-relaxed">
              Specific groupings inside a primary category (e.g. Wedding, Birthday, Anniversary). They help patrons filter down exactly what they want.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-[#201B18] rounded-xl border border-[#E8E1D5] dark:border-[#2E2723]">
            <p className="font-bold text-[#181513] dark:text-[#FAF8F5] mb-1 flex items-center gap-1.5">
              <span>✏️</span> Editing & Renaming
            </p>
            <p className="leading-relaxed">
              Click the pencil icon on any item to change its title, refine descriptions, or re-assign subcategories to different parent categories.
            </p>
          </div>
        </div>
      </div>

      {/* Creation Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Create Category Form */}
        <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] shadow-2xs space-y-4">
          <h3 className="font-bold tracking-tight text-sm text-[#181513] dark:text-[#FAF8F5] uppercase tracking-wider flex items-center gap-2">
            <Folders className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
            Add Primary Category
          </h3>

          <form onSubmit={handleCreateCategory} className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                Category Name *
              </label>
              <Input
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Resin Keepsakes & Charms"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                Description
              </label>
              <Input
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Hand-poured crystal resin bookmarks, keychains, and charms..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                  Cover / Spotlight Image URL (Optional)
                </label>
                {newCatImage && (
                  <button
                    type="button"
                    onClick={() => setNewCatImage("")}
                    className="text-[10px] text-red-600 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <Input
                value={newCatImage}
                onChange={(e) => setNewCatImage(e.target.value)}
                placeholder="https://images.unsplash.com/... (used in mega-menu spotlight)"
              />
              {newCatImage && (
                <div className="mt-2 relative w-full h-24 rounded-xl overflow-hidden border border-[#D0C5B4] dark:border-[#2E2723] bg-stone-100 dark:bg-stone-900">
                  <img
                    src={newCatImage}
                    alt="Category Cover Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={catLoading}
              variant="default"
              className="w-full py-5 text-xs font-semibold rounded-xl shadow-xs"
            >
              {catLoading ? "Creating Category..." : "Create Primary Category"}
            </Button>
          </form>
        </div>

        {/* Create Subcategory Form */}
        <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] shadow-2xs space-y-4">
          <h3 className="font-bold tracking-tight text-sm text-[#181513] dark:text-[#FAF8F5] uppercase tracking-wider flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
            Add Subcategory
          </h3>

          <form onSubmit={handleCreateSubcategory} className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                Select Parent Category *
              </label>
              <select
                required
                value={selectedParentCatId}
                onChange={(e) => setSelectedParentCatId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#DDD5C7] dark:border-[#38322D] bg-[#FAF8F5] dark:bg-[#12100E] text-xs text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                Subcategory Name *
              </label>
              <Input
                required
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="e.g. Gold Flake Resin Bookmarks"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                Brief Tagline (Optional)
              </label>
              <Input
                value={newSubDesc}
                onChange={(e) => setNewSubDesc(e.target.value)}
                placeholder="With real pressed hydrangea petals"
              />
            </div>

            <Button
              type="submit"
              disabled={subLoading}
              variant="accent"
              className="w-full py-5 text-xs font-semibold rounded-xl shadow-xs"
            >
              {subLoading ? "Adding Subcategory..." : "Add Subcategory"}
            </Button>
          </form>
        </div>
      </div>

      {/* Existing Tree List */}
      <div className="space-y-6">
        <h3 className="font-bold tracking-tight text-xl text-[#181513] dark:text-[#FAF8F5]">
          Catalog Hierarchy ({categories.length} Categories)
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#786F64] dark:text-[#A89F91]">Loading hierarchy...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-3 border-b border-[#EAE3D8] dark:border-[#2E2925] gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#FAF7F2] dark:bg-[#201B18] border border-[#E8E1D5] dark:border-[#2E2723] shrink-0 flex items-center justify-center">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Folders className="w-5 h-5 text-[#A89F91]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <h4 className="font-bold tracking-tight text-base sm:text-lg text-[#181513] dark:text-[#FAF8F5] truncate">
                          {cat.name}
                        </h4>
                        {cat.id === heroFeaturedCategoryId && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A64732] text-white shadow-xs inline-flex items-center gap-1">
                            <span>★</span>
                            <span>Hero Featured</span>
                          </span>
                        )}
                        {!cat.image && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                            No Image
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#786F64] dark:text-[#A89F91] line-clamp-1">
                        {cat.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F0EAE1] dark:border-[#26211D]">
                    <button
                      type="button"
                      onClick={() => handleToggleHeroFeatured(cat.id)}
                      className={`px-2.5 py-1.5 sm:py-1 text-[11px] sm:text-[10px] font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1 cursor-pointer flex-1 sm:flex-initial ${
                        cat.id === heroFeaturedCategoryId
                          ? "border-[#A64732] text-[#A64732] bg-[#A64732]/10 dark:text-[#E07A5F] dark:border-[#E07A5F]"
                          : "border-[#DDD5C7] dark:border-[#38322D] text-[#786F64] dark:text-[#A89F91] hover:border-[#181513] dark:hover:border-[#FAF8F5] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
                      }`}
                      title={cat.id === heroFeaturedCategoryId ? "Currently spotlighted on Homepage Hero. Click to reset." : "Feature this category on Homepage Hero CTA"}
                    >
                      <span>{cat.id === heroFeaturedCategoryId ? "★ Hero Active" : "☆ Set Hero"}</span>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() =>
                          setEditingTarget({
                            id: cat.id,
                            type: "category",
                            name: cat.name,
                            description: cat.description || "",
                            image: cat.image || "",
                          })
                        }
                        className="p-1.5 text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5] transition-colors rounded-lg hover:bg-[#F2EDE4] dark:hover:bg-[#25211E] cursor-pointer"
                        title="Edit category"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, "category", cat.name)}
                        className="p-1.5 text-[#786F64] dark:text-[#A89F91] hover:text-[#A64732] dark:hover:text-[#E07A5F] transition-colors rounded-lg hover:bg-[#F2EDE4] dark:hover:bg-[#25211E] cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subcategories list */}
                <div className="space-y-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#786F64] dark:text-[#A89F91]">
                    Subcategories ({cat.subcategories?.length || 0})
                  </div>

                  {!cat.subcategories || cat.subcategories.length === 0 ? (
                    <p className="text-xs text-[#786F64] dark:text-[#A89F91] italic">No subcategories yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {cat.subcategories.map((sub: any) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#F2EDE4] dark:bg-[#25211E] text-xs text-[#181513] dark:text-[#FAF8F5] border border-[#DDD5C7] dark:border-[#38322D] gap-2"
                        >
                          <span className="font-medium truncate">• {sub.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() =>
                                setEditingTarget({
                                  id: sub.id,
                                  type: "subcategory",
                                  name: sub.name,
                                  description: sub.description || "",
                                  categoryId: cat.id,
                                })
                              }
                              className="text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5] p-1 transition-colors"
                              title="Edit subcategory"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(sub.id, "subcategory", sub.name)}
                              className="text-[#786F64] dark:text-[#A89F91] hover:text-[#A64732] dark:hover:text-[#E07A5F] p-1 transition-colors"
                              title="Delete subcategory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Category or Subcategory Modal (Portaled with Full Edge-to-Edge Blur) */}
      <AdminModal
        isOpen={!!editingTarget}
        onClose={() => { setEditingTarget(null); setEditError(""); }}
        maxWidth="max-w-lg"
      >
        {editingTarget && (
          <div className="bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] rounded-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
            {/* Sticky Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-[#EAE3D8] dark:border-[#2E2925] flex items-center justify-between bg-white dark:bg-[#181412]">
              <h3 className="font-bold text-base sm:text-lg text-[#181513] dark:text-[#FAF8F5]">
                Edit {editingTarget.type === "category" ? "Primary Category" : "Subcategory"}
              </h3>
              <button
                onClick={() => { setEditingTarget(null); setEditError(""); }}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                aria-label="Close edit category modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4 text-xs">
                {editError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs font-medium">
                    {editError}
                  </div>
                )}

                {editingTarget.type === "subcategory" && (
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                      Parent Category *
                    </label>
                    <select
                      value={editingTarget.categoryId}
                      onChange={(e) => setEditingTarget({ ...editingTarget, categoryId: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-[#DDD5C7] dark:border-[#38322D] bg-white dark:bg-[#12100E] text-xs text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                      required
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                    Name *
                  </label>
                  <Input
                    required
                    value={editingTarget.name}
                    onChange={(e) => setEditingTarget({ ...editingTarget, name: e.target.value })}
                    className="w-full h-11"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                    Description
                  </label>
                  <Input
                    value={editingTarget.description}
                    onChange={(e) => setEditingTarget({ ...editingTarget, description: e.target.value })}
                    className="w-full h-11"
                  />
                </div>

                {editingTarget.type === "category" && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                        Category Cover Image URL (Optional)
                      </label>
                      {editingTarget.image && (
                        <button
                          type="button"
                          onClick={() => setEditingTarget({ ...editingTarget, image: "" })}
                          className="text-[10px] text-red-600 hover:underline cursor-pointer"
                        >
                          Clear Image
                        </button>
                      )}
                    </div>
                    <Input
                      value={editingTarget.image || ""}
                      onChange={(e) => setEditingTarget({ ...editingTarget, image: e.target.value })}
                      placeholder="https://images.unsplash.com/... (used in Explora mega-menu spotlight)"
                      className="w-full h-11"
                    />
                    {editingTarget.image && (
                      <div className="mt-2 relative w-full h-28 rounded-xl overflow-hidden border border-[#D0C5B4] dark:border-[#2E2723] bg-stone-100 dark:bg-stone-900">
                        <img
                          src={editingTarget.image}
                          alt="Category Cover Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="shrink-0 p-3.5 sm:p-4 flex items-center justify-end gap-2.5 border-t border-[#EAE3D8] dark:border-[#2E2925] bg-[#FAF8F5] dark:bg-[#141210]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setEditingTarget(null); setEditError(""); }}
                  className="flex-1 sm:flex-initial rounded-xl px-4 py-2.5 sm:py-2 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editLoading}
                  variant="default"
                  className="flex-1 sm:flex-initial rounded-xl px-5 py-2.5 sm:py-2 text-xs cursor-pointer"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
