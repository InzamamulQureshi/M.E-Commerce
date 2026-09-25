"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/utils";
import { X, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
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
    freeShippingThreshold,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isOpen) return null;

  const threshold = freeShippingThreshold ?? 999;
  const amountNeededForFreeShipping = Math.max(0, threshold - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
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
      setIsApplyingCoupon(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex w-full sm:w-auto sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-[#FAF8F5] dark:bg-[#1A1715] text-[#181513] dark:text-[#FAF8F5] border-l border-[#E5DFD4] dark:border-[#2E2925] shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div>
            <div className="p-5 sm:p-6 border-b border-[#E7E0D5] dark:border-[#2E2925] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#A64732] dark:text-[#E07A5F] font-semibold block">
                  Studio Bag
                </span>
                <h2 className="text-lg font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5] mt-0.5">
                  Your Selected Gifts ({count})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F] transition-colors rounded-full"
                aria-label="Close Bag"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            <div className="px-5 sm:px-6 py-3 bg-[#F2EDE4] dark:bg-[#12100E] border-b border-[#E7E0D5] dark:border-[#2E2925] text-[11px] font-medium uppercase tracking-wider text-[#6E665D] dark:text-[#A89F91]">
              {amountNeededForFreeShipping > 0 ? (
                <span>
                  Add <strong className="text-[#181513] dark:text-[#FAF8F5]">{formatCurrency(amountNeededForFreeShipping)}</strong> for Complimentary Shipping
                </span>
              ) : (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  ✓ Qualified for Complimentary Shipping
                </span>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <ShoppingBag className="w-8 h-8 mx-auto text-[#DDD5C7] dark:text-[#453E38]" />
                <p className="text-xs font-medium uppercase tracking-widest text-[#786F64] dark:text-[#A89F91]">
                  Your shopping bag is empty
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#A64732] dark:hover:bg-[#E07A5F] transition-colors"
                >
                  Browse Creations
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#EFE9DF] dark:divide-[#2E2925]">
                {items.map((item) => (
                  <div key={item.id} className="py-4 space-y-3">
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 bg-[#F0EBE2] dark:bg-[#262220] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl flex-shrink-0 overflow-hidden">
                        {item.image && (
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-semibold text-sm text-[#181513] dark:text-[#FAF8F5] truncate">
                          {item.title}
                        </h4>
                        <div className="text-xs font-semibold text-[#181513] dark:text-[#FAF8F5]">
                          {formatCurrency(item.price)}
                        </div>

                        {/* Custom tags */}
                        {item.customRecipientName && (
                          <div className="text-[10px] text-[#786F64] dark:text-[#A89F91] truncate font-medium">
                            For: {item.customRecipientName}
                          </div>
                        )}
                        {item.waxSealColor && (
                          <div className="text-[10px] text-[#786F64] dark:text-[#A89F91] font-medium">
                            Seal: {item.waxSealColor}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#9B9287] hover:text-[#A64732] dark:hover:text-[#E07A5F] p-1.5 self-start rounded-lg"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-[#DDD5C7] dark:border-[#3A332E] bg-[#F2EDE4] dark:bg-[#262220] rounded-full overflow-hidden h-8">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="px-3 text-xs text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F]"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold text-[#181513] dark:text-[#FAF8F5]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 text-xs text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F]"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-[#181513] dark:text-[#FAF8F5]">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-[#E7E0D5] dark:border-[#2E2925] bg-[#F7F3EB] dark:bg-[#12100E] space-y-4">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="flex-1 h-9 px-3.5 text-xs uppercase bg-white dark:bg-[#1A1715] rounded-xl border border-[#DDD5C7] dark:border-[#2E2925] text-[#181513] dark:text-[#FAF8F5] placeholder:text-[#9A9185] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                />
                <button
                  type="submit"
                  disabled={isApplyingCoupon}
                  className="px-4 h-9 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#A64732] dark:hover:bg-[#E07A5F] transition-colors"
                >
                  Apply
                </button>
              </form>

              {couponError && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400">{couponError}</p>
              )}

              {coupon && (
                <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  <span>Code &quot;{coupon.code}&quot; applied</span>
                  <button onClick={removeCoupon} className="underline text-xs">Remove</button>
                </div>
              )}

              {/* Subtotal breakdown */}
              <div className="space-y-1.5 text-xs font-semibold uppercase tracking-wider text-[#575048] dark:text-[#C5BCAD] pt-2 border-t border-[#E2DACD] dark:border-[#2E2925]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#181513] dark:text-[#FAF8F5] font-bold">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#A64732] dark:text-[#E07A5F]">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? "Complimentary" : formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#181513] dark:text-[#FAF8F5] pt-2 border-t border-[#E2DACD] dark:border-[#2E2925]">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full h-12 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#A64732] dark:hover:bg-[#E07A5F] transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
