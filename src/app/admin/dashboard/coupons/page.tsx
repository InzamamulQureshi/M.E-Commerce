"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Tag,
  Plus,
  Percent,
  Calendar,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Search,
  AlertCircle,
  Share2,
  X,
  Sparkles,
  ShoppingBag,
  IndianRupee,
  Users,
  Award,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  BarChart2,
  Edit2,
  Activity,
  FileText,
  Mail,
  Receipt,
  User,
} from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  discountPercent: number | null;
  discountAmount: number | null;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  targetAudience: string;
  minOrderCount: number | null;
  targetUserId?: string | null;
  targetUserEmail?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

interface CouponRedemption {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  discountAmount: number;
  finalTotal: number;
  status: string;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form Fields
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENT" | "FLAT">("PERCENT");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [targetAudience, setTargetAudience] = useState<
    "ALL" | "NEW_CUSTOMERS" | "REPEAT_CUSTOMERS" | "SPECIFIC_USER"
  >("ALL");
  const [targetUserEmail, setTargetUserEmail] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [minOrderCount, setMinOrderCount] = useState("2");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Deletion modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Tracking Dossier Modal State
  const [trackingCoupon, setTrackingCoupon] = useState<Coupon | null>(null);
  const [redemptions, setRedemptions] = useState<CouponRedemption[]>([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);
  const [redemptionsSummary, setRedemptionsSummary] = useState<{
    totalRedemptions: number;
    totalDiscountGiven: number;
  } | null>(null);

  // Edit Quota Modal State
  const [quotaEditCoupon, setQuotaEditCoupon] = useState<Coupon | null>(null);
  const [newQuotaValue, setNewQuotaValue] = useState("");
  const [quotaSaving, setQuotaSaving] = useState(false);
  const [quotaError, setQuotaError] = useState("");

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch {
      console.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: coupon.id,
          isActive: !coupon.isActive,
        }),
      });
      if (res.ok) {
        setCoupons(
          coupons.map((c) =>
            c.id === coupon.id ? { ...c, isActive: !coupon.isActive } : c
          )
        );
      }
    } catch {
      console.error("Failed to toggle coupon status");
    }
  };

  const handleOpenTrackModal = async (coupon: Coupon) => {
    setTrackingCoupon(coupon);
    setRedemptionsLoading(true);
    setRedemptions([]);
    setRedemptionsSummary(null);
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}/redemptions`);
      if (res.ok) {
        const data = await res.json();
        setRedemptions(data.redemptions || []);
        setRedemptionsSummary(data.summary || null);
      }
    } catch (err) {
      console.error("Failed to load redemptions", err);
    } finally {
      setRedemptionsLoading(false);
    }
  };

  const handleOpenQuotaModal = (coupon: Coupon) => {
    setQuotaEditCoupon(coupon);
    setNewQuotaValue(
      coupon.usageLimit !== null && coupon.usageLimit !== undefined
        ? String(coupon.usageLimit)
        : ""
    );
    setQuotaError("");
  };

  const handleSaveQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotaEditCoupon) return;
    setQuotaSaving(true);
    setQuotaError("");

    const parsedQuota =
      newQuotaValue.trim() === "" ? null : parseInt(newQuotaValue.trim());
    if (parsedQuota !== null && (isNaN(parsedQuota) || parsedQuota < 0)) {
      setQuotaError("Please enter a valid positive number, or leave empty for unlimited.");
      setQuotaSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: quotaEditCoupon.id,
          usageLimit: parsedQuota,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setQuotaError(data.error || "Failed to update quota");
      } else {
        setQuotaEditCoupon(null);
        fetchCoupons();
      }
    } catch {
      setQuotaError("Network error. Please try again.");
    } finally {
      setQuotaSaving(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!code.trim()) {
      setFormError("Please enter a coupon promo code.");
      return;
    }

    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      setFormError("Please enter a valid discount value greater than 0.");
      return;
    }

    if (discountType === "PERCENT" && val > 90) {
      setFormError("Discount percentage cannot exceed 90%.");
      return;
    }

    if (targetAudience === "SPECIFIC_USER" && !targetUserEmail.trim()) {
      setFormError("Please provide the patron's email address for single-user coupons.");
      return;
    }

    const parsedQuota = usageLimit.trim() ? parseInt(usageLimit.trim()) : null;
    if (parsedQuota !== null && (isNaN(parsedQuota) || parsedQuota <= 0)) {
      setFormError("Usage limit must be a positive number greater than 0.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          discountPercent: discountType === "PERCENT" ? val : null,
          discountAmount: discountType === "FLAT" ? val : null,
          minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
          maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
          targetAudience,
          targetUserEmail:
            targetAudience === "SPECIFIC_USER" ? targetUserEmail.trim().toLowerCase() : null,
          usageLimit: parsedQuota,
          minOrderCount:
            targetAudience === "REPEAT_CUSTOMERS" ? parseInt(minOrderCount) || 2 : 0,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create coupon");
        setSubmitting(false);
        return;
      }

      // Success
      setIsCreateModalOpen(false);
      resetForm();
      fetchCoupons();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons?id=${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== deleteId));
        setDeleteId(null);
      }
    } catch {
      console.error("Failed to delete coupon");
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setCode("");
    setDiscountType("PERCENT");
    setDiscountValue("");
    setMinOrderAmount("");
    setMaxDiscountAmount("");
    setTargetAudience("ALL");
    setTargetUserEmail("");
    setUsageLimit("");
    setMinOrderCount("2");
    setExpiresAt("");
    setIsActive(true);
    setFormError("");
  };

  const filteredCoupons = coupons.filter((c) => {
    if (filter === "ACTIVE" && !c.isActive) return false;
    if (filter === "INACTIVE" && c.isActive) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.code.toLowerCase().includes(q) ||
        (c.targetUserEmail && c.targetUserEmail.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleFilterChange = (mode: "ALL" | "ACTIVE" | "INACTIVE") => {
    setFilter(mode);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const activeCount = coupons.filter((c) => c.isActive).length;
  const inactiveCount = coupons.length - activeCount;

  // Pagination calculations
  const totalCoupons = filteredCoupons.length;
  const totalPages = Math.max(1, Math.ceil(totalCoupons / pageSize));
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const startIndex = totalCoupons === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCoupons);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-[#1C1816] p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Tag className="w-3.5 h-3.5 text-primary" />
            <span>Store Promotions</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-bold">
            Promo Coupons & Offers
          </h1>
          <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm mt-0.5">
            Create discount codes for festive sales, individual patron rewards, or VIP collector perks with usage limits and tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchCoupons()}
            disabled={loading}
            className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Refresh coupons"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] hover:bg-[#A64732] dark:hover:bg-[#E07A5F] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Promo Code</span>
          </button>
        </div>
      </div>

      {/* Non-Technical Friendly Studio Guide Banner */}
      <div className="bg-white dark:bg-[#1C1816] border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
              Studio Promotions & Discounts Guide
            </span>
          </div>
          <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
            How Coupons Work
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t border-stone-100 dark:border-stone-800">
          <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
            <strong className="block text-stone-900 dark:text-stone-100">1. Create or Assign</strong>
            <span className="text-stone-500 dark:text-stone-400 text-[10.5px] leading-snug">
              Set promo codes for everyone or dedicate a special coupon to a specific customer email.
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
            <strong className="block text-stone-900 dark:text-stone-100">2. Usage Limits & Auto-Disable</strong>
            <span className="text-stone-500 dark:text-stone-400 text-[10.5px] leading-snug">
              Set how many patrons can redeem it. When exhausted, the code automatically pauses without being deleted.
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
            <strong className="block text-emerald-600 dark:text-emerald-400">3. Track Redemptions</strong>
            <span className="text-stone-500 dark:text-stone-400 text-[10.5px] leading-snug">
              Click &quot;Track&quot; on any card to see who redeemed the coupon, their order numbers, and discount amounts!
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#1C1816] p-4 rounded-xl border border-stone-200 dark:border-stone-800">
          <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">Total Codes</p>
          <p className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 mt-1">
            {coupons.length}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1C1816] p-4 rounded-xl border border-stone-200 dark:border-stone-800">
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Active & Ready</p>
          <p className="text-xl sm:text-2xl font-bold font-serif text-emerald-700 dark:text-emerald-400 mt-1">
            {activeCount}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1C1816] p-4 rounded-xl border border-stone-200 dark:border-stone-800">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Paused / Limit Reached</p>
          <p className="text-xl sm:text-2xl font-bold font-serif text-amber-700 dark:text-amber-400 mt-1">
            {inactiveCount}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1C1816] p-4 rounded-xl border border-stone-200 dark:border-stone-800">
          <p className="text-xs text-primary font-medium">Checkout Status</p>
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 mt-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Coupons Live
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search code or email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-[#1C1816] border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl w-full sm:w-auto self-stretch">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handleFilterChange(mode)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === mode
                  ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm"
                  : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              {mode === "ALL" ? "All Codes" : mode === "ACTIVE" ? "Active" : "Paused"}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-stone-600 dark:text-stone-300">Loading coupons...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-[#1C1816] rounded-2xl border border-stone-200 dark:border-stone-800">
          <Tag className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-stone-800 dark:text-stone-200">
            No Coupons Found
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-sm mx-auto mt-1 mb-4">
            {search
              ? "No promo codes match your current search query."
              : "You haven't created any promo codes yet. Offer festive discounts to boost your sales!"}
          </p>
          <button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] hover:bg-[#A64732] dark:hover:bg-[#E07A5F] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Coupon</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {paginatedCoupons.map((coupon) => {
            const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
            const isQuotaReached =
              coupon.usageLimit !== null &&
              coupon.usageLimit !== undefined &&
              coupon.usedCount >= coupon.usageLimit;

            const discountLabel = coupon.discountPercent
              ? `${coupon.discountPercent}% OFF`
              : coupon.discountAmount
              ? `${formatCurrency(coupon.discountAmount)} OFF`
              : "SPECIAL";

            return (
              <div
                key={coupon.id}
                className={`relative bg-white dark:bg-[#1C1816] rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  !coupon.isActive || isExpired || isQuotaReached
                    ? "border-stone-200 dark:border-stone-800 opacity-80"
                    : "border-primary/20 dark:border-primary/30 shadow-sm"
                }`}
              >
                {/* Top Accent Strip */}
                <div
                  className={`h-1.5 w-full ${
                    !coupon.isActive || isExpired
                      ? "bg-stone-300 dark:bg-stone-700"
                      : isQuotaReached
                      ? "bg-amber-500"
                      : "bg-[#A64732] dark:bg-[#E07A5F]"
                  }`}
                />

                <div className="p-5 flex-1 space-y-3">
                  {/* Status & Discount badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                      {coupon.discountPercent ? (
                        <Percent className="w-3 h-3" />
                      ) : (
                        <IndianRupee className="w-3 h-3" />
                      )}
                      <span>{discountLabel}</span>
                    </span>

                    <button
                      onClick={() => handleToggleStatus(coupon)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                        coupon.isActive && !isExpired && !isQuotaReached
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                          : isQuotaReached
                          ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                          : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                      }`}
                      title="Click to toggle active status"
                    >
                      {isExpired
                        ? "Expired"
                        : isQuotaReached
                        ? "Quota Reached (Paused)"
                        : coupon.isActive
                        ? "● Active"
                        : "Paused"}
                    </button>
                  </div>

                  {/* Coupon Code Box */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <span className="font-mono font-bold tracking-wider text-base sm:text-lg text-stone-900 dark:text-stone-100">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      title="Copy promo code"
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Target Audience Badge */}
                  <div>
                    {coupon.targetAudience === "SPECIFIC_USER" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 truncate max-w-full">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">Single Patron: {coupon.targetUserEmail || "Assigned User"}</span>
                      </span>
                    ) : coupon.targetAudience === "NEW_CUSTOMERS" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>First-Time Patrons Only</span>
                      </span>
                    ) : coupon.targetAudience === "REPEAT_CUSTOMERS" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>VIP Patrons ({coupon.minOrderCount || 1}+ Orders)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                        <Users className="w-3.5 h-3.5 text-stone-500" />
                        <span>All Patrons (Public)</span>
                      </span>
                    )}
                  </div>

                  {/* Usage Quota Card & Progress Bar */}
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 font-medium">
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>Redemption Quota:</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          {coupon.usedCount} / {coupon.usageLimit !== null && coupon.usageLimit !== undefined ? coupon.usageLimit : "∞"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenQuotaModal(coupon)}
                          className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                          title="Edit coupon usage quota"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {coupon.usageLimit !== null && coupon.usageLimit !== undefined && (
                      <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            coupon.usedCount >= coupon.usageLimit
                              ? "bg-rose-500"
                              : coupon.usedCount >= coupon.usageLimit * 0.8
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((coupon.usedCount / coupon.usageLimit) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    )}

                    {isQuotaReached && (
                      <div className="text-[10.5px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>Quota Reached (Auto-Disabled)</span>
                      </div>
                    )}
                  </div>

                  {/* Conditions & Details */}
                  <div className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Min. Purchase:</span>
                      </span>
                      <span className="font-semibold text-stone-900 dark:text-stone-100">
                        {coupon.minOrderAmount
                          ? formatCurrency(coupon.minOrderAmount)
                          : "No minimum"}
                      </span>
                    </div>

                    {coupon.maxDiscountAmount && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>Max Discount Cap:</span>
                        </span>
                        <span className="font-semibold text-stone-900 dark:text-stone-100">
                          {formatCurrency(coupon.maxDiscountAmount)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Valid Until:</span>
                      </span>
                      <span
                        className={`font-semibold ${
                          isExpired
                            ? "text-red-600 dark:text-red-400"
                            : "text-stone-900 dark:text-stone-100"
                        }`}
                      >
                        {coupon.expiresAt ? formatDate(coupon.expiresAt) : "Never expires"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-3 bg-stone-50/80 dark:bg-stone-900/60 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Track Redemptions Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenTrackModal(coupon)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-200/70 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors cursor-pointer"
                      title="Track who redeemed this coupon"
                    >
                      <Activity className="w-3.5 h-3.5 text-primary" />
                      <span>Track ({coupon.usedCount})</span>
                    </button>

                    {/* WhatsApp Customer Share link */}
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Hello! Here's a special gift from The Fourfold Studio. Use promo code *${
                          coupon.code
                        }* at checkout to enjoy ${discountLabel}${
                          coupon.minOrderAmount
                            ? ` on orders above ${formatCurrency(coupon.minOrderAmount)}`
                            : ""
                        }! Handcrafted with love: https://thefourfold.com`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-semibold transition-colors"
                      title="Share promo code on WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => setDeleteId(coupon.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                    title="Delete coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalCoupons > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              Showing <strong className="text-stone-900 dark:text-stone-100">{startIndex}</strong> -{" "}
              <strong className="text-stone-900 dark:text-stone-100">{endIndex}</strong> of{" "}
              <strong className="text-stone-900 dark:text-stone-100">{totalCoupons}</strong> promo codes
            </span>
            <div className="flex items-center gap-1.5 pl-3 border-l border-stone-200 dark:border-stone-800">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 px-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1816] text-stone-900 dark:text-stone-100 font-semibold focus:outline-none"
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1816] text-stone-800 dark:text-stone-200 disabled:opacity-35 disabled:cursor-not-allowed hover:border-stone-400 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
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
                        <span className="text-stone-400 px-1 select-none">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          currentPage === p
                            ? "bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] shadow-xs"
                            : "border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1816] text-stone-800 dark:text-stone-200 hover:border-stone-400"
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
              className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1816] text-stone-800 dark:text-stone-200 disabled:opacity-35 disabled:cursor-not-allowed hover:border-stone-400 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      <AdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxWidth="max-w-lg"
      >
        <div className="bg-white dark:bg-[#1C1816] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl w-full overflow-hidden flex flex-col max-h-[90dvh]">
          {/* Modal Header */}
          <div className="shrink-0 p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-[#1C1816]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base sm:text-lg">
                  Create Promo Coupon
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Configure promo code, discount rules, usage quota, and customer eligibility
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Close promo code dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateCoupon} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Promo Code Input */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wider">
                  Promo Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME10, VIPCOLLECTOR, DIWALI25"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-mono font-bold tracking-wider text-stone-900 dark:text-stone-100 uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Patrons type this code at checkout.
                </p>
              </div>

              {/* Customer Target Eligibility Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 uppercase tracking-wider">
                  Audience Eligibility Rules *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetAudience("ALL")}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                      targetAudience === "ALL"
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-[11px]">All Patrons</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience("NEW_CUSTOMERS")}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                      targetAudience === "NEW_CUSTOMERS"
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[11px]">First-Time</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience("REPEAT_CUSTOMERS")}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                      targetAudience === "REPEAT_CUSTOMERS"
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50"
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span className="text-[11px]">VIP Repeat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience("SPECIFIC_USER")}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                      targetAudience === "SPECIFIC_USER"
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50"
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span className="text-[11px]">Single Patron</span>
                  </button>
                </div>

                {/* If Single Patron, show target user email input */}
                {targetAudience === "SPECIFIC_USER" && (
                  <div className="mt-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-1">
                    <label className="block text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">
                      Patron&apos;s Registered Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={targetUserEmail}
                      onChange={(e) => setTargetUserEmail(e.target.value)}
                      placeholder="e.g. patron@example.com"
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-blue-300 dark:border-blue-800 rounded-lg text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-none"
                    />
                    <p className="text-[11px] text-blue-800 dark:text-blue-300 mt-1">
                      Only this specific customer logged into their account will be permitted to redeem this coupon.
                    </p>
                  </div>
                )}

                {/* If VIP Repeat Patrons, show threshold */}
                {targetAudience === "REPEAT_CUSTOMERS" && (
                  <div className="mt-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                    <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                      Minimum Prior Orders Required
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={minOrderCount}
                      onChange={(e) => setMinOrderCount(e.target.value)}
                      placeholder="e.g. 2, 3, or 5 orders"
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-800 rounded-lg text-xs font-medium text-stone-900 dark:text-stone-100"
                    />
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1">
                      Only patrons who have completed at least {minOrderCount || "2"} orders will be able to apply this promo code.
                    </p>
                  </div>
                )}

                {targetAudience === "NEW_CUSTOMERS" && (
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5">
                    Only patrons with 0 prior completed orders can use this code. Returning customers will be prevented from applying it.
                  </p>
                )}
              </div>

              {/* Usage Limit / Redemption Quota */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wider">
                  Usage Limit / Redemption Quota (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 50 (leave empty for unlimited redemptions)"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  How many times or by how many patrons this coupon can be redeemed. Once reached, the coupon is <strong>automatically disabled (paused)</strong> instead of deleted. You can edit this quota later to reactivate it.
                </p>
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 uppercase tracking-wider">
                  Discount Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountType("PERCENT")}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      discountType === "PERCENT"
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50"
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>Percentage (%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("FLAT")}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      discountType === "FLAT"
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50"
                    }`}
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Flat Amount (₹)</span>
                  </button>
                </div>
              </div>

              {/* Discount Value & Max Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wider">
                    Discount Amount *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder={discountType === "PERCENT" ? "e.g. 15 for 15% off" : "e.g. 200 for ₹200 off"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wider">
                    Max Discount Cap (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 500 (₹)"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Minimum Order Value */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wider">
                  Minimum Order Value (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 999 (leave blank for no minimum)"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wider">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Active Toggle with Clear Visual Status & Explanation */}
              <div className="pt-3 pb-1 border-t border-stone-200 dark:border-stone-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 block">
                      Coupon Availability Status
                    </span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Choose whether patrons can use this code right away or keep it paused as a draft.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActive ? "bg-emerald-600" : "bg-stone-300 dark:bg-stone-700"
                    }`}
                    role="switch"
                    aria-checked={isActive}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-colors ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                      : "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                  }`}
                >
                  {isActive ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">
                      {isActive ? "Status: Active & Ready at Checkout" : "Status: Saved as Draft (Paused)"}
                    </span>
                    <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                      {isActive
                        ? "Patrons can enter this code on the cart or checkout page and receive the discount immediately."
                        : "This code is saved in your studio admin list but disabled. Customers cannot use it at checkout until you toggle it ON later."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              {code && discountValue && (
                <div className="p-3.5 bg-stone-50 dark:bg-stone-900 rounded-xl border border-dashed border-primary/40 space-y-1">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                    Live Ticket Preview
                  </p>
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-stone-900 dark:text-stone-100">
                    <span>{code}</span>
                    <span className="text-primary">
                      {discountType === "PERCENT" ? `${discountValue}% OFF` : `₹${discountValue} OFF`}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600 dark:text-stone-300">
                    <span>
                      Audience: {targetAudience === "SPECIFIC_USER" ? `Single Patron (${targetUserEmail || "Assigned"})` : targetAudience === "NEW_CUSTOMERS" ? "New Patrons" : targetAudience === "REPEAT_CUSTOMERS" ? `VIP (${minOrderCount}+ Orders)` : "Everyone"}
                    </span>
                    {usageLimit && <span>• Quota: {usageLimit} redemptions</span>}
                    {minOrderAmount && <span>• Min Order: ₹{minOrderAmount}</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Modal Footer */}
            <div className="shrink-0 p-3.5 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 text-xs font-bold bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] hover:bg-[#A64732] dark:hover:bg-[#E07A5F] rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Promo Code</span>
              </button>
            </div>
          </form>
        </div>
      </AdminModal>

      {/* Tracking Dossier Modal */}
      <AdminModal
        isOpen={!!trackingCoupon}
        onClose={() => setTrackingCoupon(null)}
        maxWidth="max-w-2xl"
      >
        {trackingCoupon && (
          <div className="bg-white dark:bg-[#1C1816] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl w-full overflow-hidden flex flex-col max-h-[90dvh]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base sm:text-lg">
                      Coupon Tracking Dossier
                    </h3>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-primary">
                      {trackingCoupon.code}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Audit log of orders and customers who have redeemed this promo code
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTrackingCoupon(null)}
                className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-stone-50/70 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800 text-xs">
              <div className="p-3 bg-white dark:bg-[#1C1816] rounded-xl border border-stone-200 dark:border-stone-800">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block">Total Redemptions</span>
                <strong className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5 block">
                  {redemptionsSummary?.totalRedemptions ?? trackingCoupon.usedCount}
                </strong>
              </div>
              <div className="p-3 bg-white dark:bg-[#1C1816] rounded-xl border border-stone-200 dark:border-stone-800">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block">Discount Disbursed</span>
                <strong className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {formatCurrency(redemptionsSummary?.totalDiscountGiven || 0)}
                </strong>
              </div>
              <div className="p-3 bg-white dark:bg-[#1C1816] rounded-xl border border-stone-200 dark:border-stone-800">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block">Usage Quota</span>
                <strong className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5 block">
                  {trackingCoupon.usageLimit !== null && trackingCoupon.usageLimit !== undefined
                    ? `${trackingCoupon.usedCount} / ${trackingCoupon.usageLimit}`
                    : "Unlimited"}
                </strong>
              </div>
            </div>

            {/* Redemptions List */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5">
              {redemptionsLoading ? (
                <div className="py-12 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                  <p className="text-xs text-stone-500">Loading redemption records...</p>
                </div>
              ) : redemptions.length === 0 ? (
                <div className="py-12 text-center text-stone-500 dark:text-stone-400 space-y-2">
                  <Receipt className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600" />
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                    No Redemptions Recorded Yet
                  </p>
                  <p className="text-xs max-w-sm mx-auto">
                    Once customers apply this code on checkout and complete their order, their order details and discount amounts will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {redemptions.map((r) => (
                    <div
                      key={r.id}
                      className="p-3.5 bg-white dark:bg-[#1C1816] border border-stone-200 dark:border-stone-800 rounded-xl hover:border-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 dark:text-stone-100 font-mono">
                            #{r.orderNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 uppercase">
                            {r.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-stone-600 dark:text-stone-300">
                          <span className="font-medium flex items-center gap-1">
                            <User className="w-3 h-3 text-stone-400" />
                            {r.customerName}
                          </span>
                          <span className="text-stone-400">•</span>
                          <span className="flex items-center gap-1 text-stone-500">
                            <Mail className="w-3 h-3 text-stone-400" />
                            {r.customerEmail}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400">
                          Redeemed on {formatDate(r.createdAt)}
                        </p>
                      </div>

                      <div className="text-right sm:border-l sm:border-stone-100 sm:dark:border-stone-800 sm:pl-4">
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                          Discount: -{formatCurrency(r.discountAmount)}
                        </span>
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          Total Paid: {formatCurrency(r.finalTotal)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setTrackingCoupon(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Edit Quota Modal */}
      <AdminModal
        isOpen={!!quotaEditCoupon}
        onClose={() => setQuotaEditCoupon(null)}
        maxWidth="max-w-md"
      >
        {quotaEditCoupon && (
          <div className="bg-white dark:bg-[#1C1816] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base">
                    Edit Redemption Quota
                  </h3>
                  <span className="font-mono text-xs text-primary font-bold">
                    {quotaEditCoupon.code}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setQuotaEditCoupon(null)}
                className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {quotaError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400">
                {quotaError}
              </div>
            )}

            <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Current Times Used:</span>
                <strong className="text-stone-900 dark:text-stone-100 font-bold">
                  {quotaEditCoupon.usedCount} times
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Current Limit:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {quotaEditCoupon.usageLimit !== null && quotaEditCoupon.usageLimit !== undefined
                    ? `${quotaEditCoupon.usageLimit} redemptions`
                    : "Unlimited"}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveQuota} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  New Quota (Max Redemptions)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Leave blank for unlimited"
                  value={newQuotaValue}
                  onChange={(e) => setNewQuotaValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  autoFocus
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                  Only this amount can be adjusted. If this coupon was automatically paused because the quota was reached, increasing the limit above {quotaEditCoupon.usedCount} will <strong>automatically re-enable</strong> the coupon at checkout.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setQuotaEditCoupon(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quotaSaving}
                  className="px-5 py-2 text-xs font-bold bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] hover:bg-[#A64732] dark:hover:bg-[#E07A5F] rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {quotaSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Quota</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        maxWidth="max-w-sm"
      >
        <div className="bg-white dark:bg-[#1C1816] rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl">
          <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-lg mb-2">
            Delete Promo Coupon?
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mb-5">
            Patrons will no longer be able to use this promo code at checkout. This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setDeleteId(null)}
              disabled={deleting}
              className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCoupon}
              disabled={deleting}
              className="px-4 py-2 text-xs font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {deleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm Delete</span>
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
