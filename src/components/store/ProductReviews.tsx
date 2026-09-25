"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  Star,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  CornerDownRight,
  Send,
  RefreshCw,
} from "lucide-react";

export function ProductReviews({
  slug,
  initialReviews,
}: {
  slug: string;
  initialReviews?: any[];
}) {
  const [reviews, setReviews] = useState<any[]>(initialReviews || []);
  const [avgRating, setAvgRating] = useState<string>("0.0");
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState("");
  const [formError, setFormError] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/products/${slug}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || "0.0");
        setCanReview(data.canReview);
        setAlreadyReviewed(data.alreadyReviewed);
        setIsLoggedIn(data.isLoggedIn);
      }
    } catch {
      console.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    setFormMsg("");
    setFormError("");

    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to submit review.");
      } else {
        setFormMsg("Thank you. Your review has been recorded.");
        setComment("");
        setAlreadyReviewed(true);
        setCanReview(false);
        fetchReviews();
      }
    } catch {
      setFormError("Network error while submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-xs font-medium uppercase tracking-widest text-[#786F64]">
        Loading customer reviews...
      </div>
    );
  }

  return (
    <section className="space-y-8 pt-10 border-t border-[#E5DFD4] dark:border-[#2E2925]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E7E0D5] dark:border-[#2E2925]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#A64732] dark:text-[#E07A5F] font-semibold block">
            Customer Journal
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5] mt-1">
            Verified Reviews ({reviews.length})
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  reviews.length > 0 && s <= Math.round(Number(avgRating))
                    ? "fill-amber-500 text-amber-500"
                    : "text-neutral-300 dark:text-neutral-700"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
            {reviews.length > 0 ? `${avgRating} / 5.0` : "0.0 / 5.0"}
          </span>
        </div>
      </div>

      {/* Review Gating Card */}
      <div className="bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#E5DFD4] dark:border-[#2E2925] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        {canReview ? (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <h3 className="font-bold tracking-tight text-base text-[#181513] dark:text-[#FAF8F5]">
                Leave Your Review
              </h3>
              <p className="text-xs text-[#6E665D] dark:text-[#A89F91] mt-0.5">
                As a verified owner of this piece, share your experience with the craftsmanship.
              </p>
            </div>

            {formMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs">
                {formMsg}
              </div>
            )}

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl text-xs">
                {formError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] block">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setRating(s)}
                    className="p-1 text-amber-500 hover:scale-110 transition-transform rounded-lg"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        s <= rating ? "fill-amber-500 text-amber-500" : "text-[#DDD5C7] dark:text-[#38322D]"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] block">
                Your Review *
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on the craftsmanship, folds, and recipient's unboxing reaction..."
                className="w-full p-3.5 text-xs bg-white dark:bg-[#12100E] rounded-xl border border-[#DDD5C7] dark:border-[#2E2925] text-[#181513] dark:text-[#FAF8F5] placeholder:text-[#9A9185] dark:placeholder:text-[#6E665D] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white transition-colors flex items-center gap-2 shadow-xs"
            >
              {submitting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Publish Verified Review</span>
            </button>
          </form>
        ) : alreadyReviewed ? (
          <div className="flex items-center gap-2 text-xs text-[#786F64] dark:text-[#A89F91]">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
            <span>Thank you. You have already reviewed this creation.</span>
          </div>
        ) : !isLoggedIn ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#6E665D] dark:text-[#A89F91]">
              <MessageSquare className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F] flex-shrink-0" />
              <span>Purchased this creation? Sign in to submit a verified review.</span>
            </div>
            <Link
              href="/account"
              className="px-4 py-2 border border-[#DDD5C7] dark:border-[#2E2925] text-[#181513] dark:text-[#FAF8F5] text-[11px] font-semibold uppercase tracking-wider rounded-xl hover:border-[#181513] dark:hover:border-[#FAF8F5] hover:bg-white dark:hover:bg-[#12100E] transition-colors self-start sm:self-auto"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#786F64] dark:text-[#A89F91]">
            <AlertCircle className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F] flex-shrink-0" />
            <span>
              Customer reviews are reserved for verified purchasers who have ordered this gift.
            </span>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="p-10 bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#E5DFD4] dark:border-[#2E2925] rounded-2xl text-center text-xs text-[#786F64] dark:text-[#A89F91]">
          No verified reviews yet. Be the first customer to leave your thoughts.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#E5DFD4] dark:border-[#2E2925] rounded-2xl space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EFE9DF] dark:border-[#2E2925]">
                <div>
                  <span className="font-semibold text-sm text-[#181513] dark:text-[#FAF8F5] block">
                    {rev.authorName}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Purchaser
                  </span>
                </div>

                <div className="flex text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= rev.rating ? "fill-amber-500 text-amber-500" : "text-neutral-200 dark:text-neutral-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-[#524B43] dark:text-[#C5BCAD] leading-relaxed">
                &ldquo;{rev.comment}&rdquo;
              </p>

              {/* Admin Team Response (Google Play Store Style) */}
              {rev.adminReply && (
                <div className="mt-3 p-3.5 bg-white dark:bg-[#12100E] border border-[#E5DFD4] dark:border-[#2E2925] rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#A64732] dark:text-[#E07A5F] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CornerDownRight className="w-3 h-3" />
                      The Fourfold Team Reply
                    </span>
                    {rev.adminRepliedAt && (
                      <span className="text-[10px] text-[#8C8276] dark:text-[#8E8478] font-normal">
                        {formatDate(rev.adminRepliedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#524B43] dark:text-[#C5BCAD] leading-relaxed pl-4">
                    {rev.adminReply}
                  </p>
                </div>
              )}

              <div className="text-[10px] font-medium text-[#8C8276] dark:text-[#8E8478] pt-2 border-t border-[#EFE9DF] dark:border-[#2E2925]">
                {formatDate(rev.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
