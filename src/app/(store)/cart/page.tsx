"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/utils";
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";

export default function CartPage() {
  const {
    items,
    count,
    subtotal,
    discount,
    shippingFee,
    total,
    updateQuantity,
    removeItem,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplying(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), cartTotal: subtotal }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Failed to apply coupon");
      } else {
        applyCoupon(data.coupon);
        setCouponInput("");
      }
    } catch {
      setCouponError("Failed to apply coupon. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <ShoppingBag className="w-12 h-12 mx-auto text-[#DDD5C7] dark:text-[#453E38]" />
        <h1 className="text-3xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5]">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-xs sm:text-sm text-[#786F64] dark:text-[#A89F91] max-w-md mx-auto leading-relaxed">
          You have not added any handcrafted gifts to your bag yet. Explore our explosion boxes, greeting cards, and bespoke gifts.
        </p>
        <div className="pt-2">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] text-xs font-semibold uppercase tracking-widest hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white transition-colors rounded-full"
          >
            <span>Browse Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="pb-6 border-b border-[#E7E0D5] dark:border-[#2E2925] flex items-baseline justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#A64732] dark:text-[#E07A5F] font-semibold block">
            Review Bag
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5] mt-1">
            Shopping Bag ({count})
          </h1>
        </div>
        <Link
          href="/catalog"
          className="text-xs font-medium uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F]"
        >
          Continue Shopping →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 divide-y divide-[#EFE9DF] dark:divide-[#2E2925]">
          {items.map((item) => (
            <div
              key={item.id}
              className="py-6 flex flex-col sm:flex-row gap-6 relative"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-[#F0EBE2] dark:bg-[#201C19] border border-[#DDD5C7] dark:border-[#2E2925] rounded-2xl overflow-hidden flex-shrink-0">
                {item.image && (
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between pr-8">
                  <div>
                    <h3 className="font-semibold text-base text-[#181513] dark:text-[#FAF8F5]">
                      {item.title}
                    </h3>
                    <div className="text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] mt-0.5">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                </div>

                {/* Custom Options Display */}
                {(item.customRecipientName || item.waxSealColor || item.giftWrapOption || item.customMessage) && (
                  <div className="text-[11px] text-[#786F64] dark:text-[#A89F91] bg-[#F7F3EB] dark:bg-[#1A1715] p-3 border border-[#E7E0D5] dark:border-[#2E2925] rounded-xl space-y-1 font-medium">
                    {item.customRecipientName && (
                      <div>
                        <span className="uppercase text-[#181513] dark:text-[#FAF8F5]">Recipient: </span>
                        <span>{item.customRecipientName}</span>
                      </div>
                    )}
                    {item.waxSealColor && (
                      <div>
                        <span className="uppercase text-[#181513] dark:text-[#FAF8F5]">Wax Seal: </span>
                        <span>{item.waxSealColor}</span>
                      </div>
                    )}
                    {item.giftWrapOption && (
                      <div>
                        <span className="uppercase text-[#181513] dark:text-[#FAF8F5]">Packaging: </span>
                        <span>{item.giftWrapOption}</span>
                      </div>
                    )}
                    {item.customMessage && (
                      <div className="pt-1 border-t border-[#E8DDD0] dark:border-[#2E2925]">
                        <span className="uppercase text-[#181513] dark:text-[#FAF8F5]">Scribed Message: </span>
                        <span className="italic text-xs text-[#181513] dark:text-[#FAF8F5]">&ldquo;{item.customMessage}&rdquo;</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity and Line Total */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center border border-[#DDD5C7] dark:border-[#2E2925] bg-[#F2EDE4] dark:bg-[#1A1715] rounded-full overflow-hidden h-8">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="px-3 text-xs text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F]"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-semibold text-[#181513] dark:text-[#FAF8F5]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 text-xs text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F]"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-sm font-semibold text-[#181513] dark:text-[#FAF8F5]">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-6 right-0 p-1.5 text-[#9B9287] dark:text-[#8E8478] hover:text-[#A64732] dark:hover:text-[#E07A5F] transition-colors rounded-lg"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-[#FAF8F5] dark:bg-[#1A1715] p-6 border border-[#E5DFD4] dark:border-[#2E2925] rounded-2xl shadow-sm space-y-6 sticky top-28">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#A64732] dark:text-[#E07A5F] font-semibold block">
              Calculation
            </span>
            <h3 className="font-bold tracking-tight text-xl text-[#181513] dark:text-[#FAF8F5] mt-1 pb-3 border-b border-[#EAE3D8] dark:border-[#2E2925]">
              Order Summary
            </h3>
          </div>

          {/* Promo code input */}
          {coupon ? (
            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-medium text-emerald-800 dark:text-emerald-300">
              <span>Code &quot;{coupon.code}&quot; applied</span>
              <button onClick={removeCoupon} className="underline text-xs">Remove</button>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                Gift / Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. FOURFOLD10"
                  className="flex-1 h-10 px-3.5 text-xs uppercase bg-white dark:bg-[#12100E] rounded-xl border border-[#DDD5C7] dark:border-[#2E2925] text-[#181513] dark:text-[#FAF8F5] placeholder:normal-case placeholder:text-[#9A9185] dark:placeholder:text-[#6E665D] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                />
                <button
                  type="submit"
                  disabled={isApplying || !couponInput.trim()}
                  className="px-4 h-10 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white transition-colors"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="text-[11px] text-rose-700 dark:text-rose-400">{couponError}</p>
              )}
            </form>
          )}

          {/* Pricing calculations */}
          <div className="space-y-2 text-xs font-medium uppercase tracking-wider text-[#6E665D] dark:text-[#A89F91] pt-2 border-t border-[#EAE3D8] dark:border-[#2E2925]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-[#181513] dark:text-[#FAF8F5] font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#A64732] dark:text-[#E07A5F]">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Pan-India Delivery</span>
              <span>{shippingFee === 0 ? "Complimentary" : formatCurrency(shippingFee)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-[#181513] dark:text-[#FAF8F5] pt-3 border-t border-[#EAE3D8] dark:border-[#2E2925]">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Link
            href="/checkout"
            className="w-full h-12 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-wider text-[#786F64] dark:text-[#A89F91] pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#181513] dark:text-[#FAF8F5]" />
            <span>UPI • Card • NetBanking • COD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
