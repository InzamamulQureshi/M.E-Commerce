"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Star,
  Trash2,
  Search,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  CornerDownRight,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Replying state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [savingReply, setSavingReply] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("limit", pageSize.toString());
      if (ratingFilter !== "ALL") {
        params.set("rating", ratingFilter.toString());
      }
      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      }

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setTotalCount(data.total ?? (data.reviews || []).length);
        setTotalPages(data.totalPages ?? 1);
      }
    } catch {
      console.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, ratingFilter, searchQuery]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleRatingChange = (r: number | "ALL") => {
    setRatingFilter(r);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleStartReply = (review: any) => {
    setReplyingReviewId(review.id);
    setReplyText(review.adminReply || "");
  };

  const handleCancelReply = () => {
    setReplyingReviewId(null);
    setReplyText("");
  };

  const handleSaveReply = async (id: string) => {
    setSavingReply(true);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, adminReply: replyText }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to save reply." });
      } else {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, adminReply: replyText.trim() || null, adminRepliedAt: replyText.trim() ? new Date().toISOString() : null }
              : r
          )
        );
        setFeedback({ type: "success", message: "Store reply updated successfully!" });
        setReplyingReviewId(null);
        setReplyText("");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch {
      setFeedback({ type: "error", message: "Network connection error." });
    } finally {
      setSavingReply(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this customer review?")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: "Review deleted successfully." });
        setTimeout(() => setFeedback(null), 3000);
        fetchReviews();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to delete review." });
      }
    } catch {
      setFeedback({ type: "error", message: "An error occurred while deleting review." });
    } finally {
      setDeletingId(null);
    }
  };

  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="border-b border-[#D0C5B4] dark:border-[#2E2723] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold text-[#A64732] dark:text-[#E07A5F] uppercase tracking-widest block">
            Customer Feedback
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5] mt-1">
            Reviews & Responses ({totalCount})
          </h1>
          <p className="text-xs text-[#6E665D] dark:text-[#A89F91] mt-1">
            Reply directly to customer feedback as the Store Team, or remove invalid reviews.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          className="text-xs font-semibold uppercase tracking-wider px-4 py-2 border border-[#DDD5C7] dark:border-[#38322D] rounded-full text-[#181513] dark:text-[#FAF8F5] bg-white dark:bg-[#1A1715] hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 text-xs font-medium uppercase tracking-wider flex items-center gap-2 border rounded-xl ${
            feedback.type === "success"
              ? "bg-[#FAF8F5] dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
              : "bg-[#FFF8F8] dark:bg-rose-950/30 text-[#A64732] dark:text-rose-300 border-[#E8C5A8] dark:border-rose-900"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Rating filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[11px] font-medium uppercase tracking-wider">
          {["ALL", 5, 4, 3, 2, 1].map((r) => (
            <button
              key={r.toString()}
              onClick={() => handleRatingChange(r as any)}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors border ${
                ratingFilter === r
                  ? "bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] border-[#181513] dark:border-[#FAF8F5] font-semibold"
                  : "bg-white dark:bg-[#181412] border-[#D0C5B4] dark:border-[#2E2723] text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5] hover:border-[#181513]"
              }`}
            >
              {r === "ALL" ? "All Ratings" : `${r} ★`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search author, comment, product..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full text-xs pl-8 pr-3 bg-white dark:bg-[#12100E] text-[#181513] dark:text-[#FAF8F5] h-10 border border-[#DDD5C7] dark:border-[#38322D] rounded-full focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
          />
          <Search className="w-3.5 h-3.5 text-[#786F64] dark:text-[#A89F91] absolute left-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Reviews Table / Card View */}
      {loading ? (
        <div className="p-12 text-center text-xs font-medium uppercase tracking-widest text-[#786F64] dark:text-[#A89F91]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#A64732] dark:text-[#E07A5F]" />
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] rounded-xl text-center text-xs text-[#786F64] dark:text-[#A89F91] font-medium uppercase tracking-wider">
          No customer reviews found matching your filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 sm:p-5 bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] rounded-xl space-y-3 transition-colors hover:border-[#181513] dark:hover:border-[#FAF8F5] shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#EAE3D8] dark:border-[#2E2925]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-xs">
                    {rev.authorName ? rev.authorName.charAt(0).toUpperCase() : "C"}
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-[#181513] dark:text-[#FAF8F5] block">
                      {rev.authorName}
                    </span>
                    <span className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                      {rev.user?.email || "Customer"} • {formatDate(rev.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? "fill-amber-500 text-amber-500" : "text-neutral-300 dark:text-neutral-700"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handleDelete(rev.id)}
                    disabled={deletingId === rev.id}
                    title="Delete Review"
                    className="p-1.5 text-[#786F64] dark:text-[#A89F91] hover:text-[#A64732] dark:hover:text-[#E07A5F] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product link */}
              {rev.product && (
                <div className="text-[11px] font-medium uppercase tracking-wider text-[#786F64] dark:text-[#A89F91] flex items-center gap-1">
                  <span>Product:</span>
                  <Link
                    href={`/catalog/${rev.product.slug}`}
                    target="_blank"
                    className="text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F] font-semibold flex items-center gap-0.5"
                  >
                    <span>{rev.product.title}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Review Comment */}
              <p className="text-xs sm:text-sm text-[#575048] dark:text-[#D1C8BD] leading-relaxed italic bg-white dark:bg-[#12100E] p-3 rounded-xl border border-[#EAE3D8] dark:border-[#2E2925]">
                &ldquo;{rev.comment}&rdquo;
              </p>

              {/* Admin Reply Display or Form */}
              {replyingReviewId === rev.id ? (
                <div className="mt-3 p-3.5 bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#181513] dark:border-[#FAF8F5] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A64732] dark:text-[#E07A5F] flex items-center gap-1">
                      <CornerDownRight className="w-3 h-3" />
                      <span>Store Team Reply</span>
                    </span>
                    <button
                      onClick={handleCancelReply}
                      className="p-1 text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a warm, thoughtful studio reply to this customer..."
                    rows={3}
                    className="w-full text-xs p-2.5 bg-white dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#38322D] text-[#181513] dark:text-[#FAF8F5] rounded-xl focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5] resize-y"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCancelReply}
                      className="text-xs font-semibold uppercase tracking-wider px-3 py-1.5 border border-[#DDD5C7] dark:border-[#38322D] rounded-xl text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveReply(rev.id)}
                      disabled={savingReply}
                      className="text-xs font-semibold uppercase tracking-wider px-4 py-1.5 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>{savingReply ? "Publishing..." : "Publish Reply"}</span>
                    </button>
                  </div>
                </div>
              ) : rev.adminReply ? (
                <div className="mt-2 pl-4 border-l-2 border-[#181513] dark:border-[#FAF8F5] space-y-1 bg-[#F4EFE6] dark:bg-[#25211E] p-3 rounded-r-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] flex items-center gap-1">
                      <CornerDownRight className="w-3 h-3" />
                      <span>Store Team Reply</span>
                      {rev.adminRepliedAt && (
                        <span className="text-[#786F64] dark:text-[#A89F91] font-normal lowercase">
                          • {formatDate(rev.adminRepliedAt)}
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => handleStartReply(rev)}
                      className="text-[10px] font-semibold uppercase tracking-wider text-[#A64732] dark:text-[#E07A5F] hover:underline"
                    >
                      Edit Reply
                    </button>
                  </div>
                  <p className="text-xs text-[#575048] dark:text-[#C5BCAD] leading-relaxed">
                    {rev.adminReply}
                  </p>
                </div>
              ) : (
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => handleStartReply(rev)}
                    className="text-xs font-semibold uppercase tracking-wider px-3 py-1 border border-[#DDD5C7] dark:border-[#38322D] rounded-full text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5] flex items-center gap-1 transition-colors"
                  >
                    <CornerDownRight className="w-3 h-3" />
                    <span>Reply to Customer</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 pb-6 text-xs text-[#786F64] dark:text-[#A89F91]">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              Showing <strong className="text-[#181513] dark:text-[#FAF8F5]">{startIndex}</strong> -{" "}
              <strong className="text-[#181513] dark:text-[#FAF8F5]">{endIndex}</strong> of{" "}
              <strong className="text-[#181513] dark:text-[#FAF8F5]">{totalCount}</strong> reviews
            </span>
            <div className="flex items-center gap-1.5 pl-3 border-l border-[#D0C5B4] dark:border-[#2E2723]">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-8 px-2 rounded-lg border border-[#D0C5B4] dark:border-[#2E2723] bg-white dark:bg-[#181412] text-[#181513] dark:text-[#FAF8F5] font-semibold focus:outline-none cursor-pointer"
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
    </div>
  );
}
