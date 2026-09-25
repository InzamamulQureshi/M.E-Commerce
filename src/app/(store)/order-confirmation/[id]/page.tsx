import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate, extractRejectionReason } from "@/lib/utils";
import { CheckCircle2, MessageCircle, ArrowRight, XCircle, AlertCircle } from "lucide-react";

interface OrderConfirmationProps {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({ params }: OrderConfirmationProps) {
  const { id } = params;

  const order = await db.order.findFirst({
    where: {
      OR: [{ orderNumber: id }, { id }],
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  const isRejected = order.status === "CANCELLED" || order.paymentStatus === "REJECTED";
  const rejectionReason = extractRejectionReason(order.orderNotes);

  const whatsappMessage = encodeURIComponent(
    isRejected
      ? `Hello M.E-Commerce! My order #${order.orderNumber} was marked as rejected (Reason: ${rejectionReason || "Payment unverified"}). I'd like to share my payment screenshot for review.`
      : `Hello M.E-Commerce! I've placed order #${order.orderNumber} for ₹${order.finalTotal}. Looking forward to receiving my order!`
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-10">
      {/* Editorial Confirmation or Rejection Card */}
      {isRejected ? (
        <div className="text-center space-y-4 bg-rose-50/40 dark:bg-rose-950/20 p-8 sm:p-14 border border-rose-200 dark:border-rose-900/50 rounded-2xl shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs border border-rose-200 dark:border-rose-800">
            <XCircle className="w-6 h-6" />
          </div>

          <span className="text-[10px] uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400 font-bold block">
            Payment Rejected • Order Cancelled
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Order Payment Rejected
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
            Your order <strong className="text-stone-900 dark:text-stone-100">#{order.orderNumber}</strong> has been rejected by our studio and will not be handcrafted.
          </p>

          {/* Explicit Rejection Reason Banner */}
          <div className="p-4 bg-white dark:bg-[#1A1715] border border-rose-200 dark:border-rose-900/50 rounded-xl text-left max-w-lg mx-auto space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Reason for Rejection:</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-semibold pl-5">
              {rejectionReason || "Fake or unverified payment details provided. Payment was not credited to our studio account."}
            </p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 pl-5 pt-1">
              If you have already paid or believe this was marked in error, please tap below to share your transaction UTR receipt on WhatsApp.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`https://wa.me/919876543210?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact Studio on WhatsApp</span>
            </a>

            <Link
              href="/account"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 hover:border-stone-900 dark:hover:border-stone-100 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <span>View Account & Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 bg-[#FAF8F5] dark:bg-[#1A1715] p-8 sm:p-14 border border-[#E5DFD4] dark:border-[#2E2925] rounded-2xl shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <span className="text-[10px] uppercase tracking-[0.2em] text-[#A64732] dark:text-[#E07A5F] font-semibold block">
            Order Placed Successfully
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5]">
            Thank You, {order.customerName.split(" ")[0]}
          </h1>

          <p className="text-xs sm:text-sm text-[#6E665D] dark:text-[#A89F91] max-w-md mx-auto leading-relaxed">
            Your order <strong className="text-[#181513] dark:text-[#FAF8F5]">#{order.orderNumber}</strong> has been received by our Mumbai studio. We are preparing the cardstocks, calligraphy inks, and wax seals for handcrafting.
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`https://wa.me/919876543210?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect on WhatsApp</span>
            </a>

            <Link
              href="/account"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#DDD5C7] dark:border-[#38322D] text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5] rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <span>View Client History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Itemized Studio Receipt */}
      <div className="p-8 bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#E5DFD4] dark:border-[#2E2925] rounded-2xl shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EAE3D8] dark:border-[#2E2925] gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A64732] dark:text-[#E07A5F] block">
              Studio Invoice Receipt
            </span>
            <h3 className="font-bold tracking-tight text-lg text-[#181513] dark:text-[#FAF8F5] mt-0.5">
              Order #{order.orderNumber}
            </h3>
          </div>
          <div className="text-xs text-[#786F64] dark:text-[#A89F91] flex items-center gap-2">
            <span>{formatDate(order.createdAt)} • {order.paymentMethod}</span>
            {isRejected ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800 uppercase">
                REJECTED
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 uppercase">
                {order.status}
              </span>
            )}
          </div>
        </div>

        {isRejected && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-800 dark:text-rose-300 space-y-1">
            <span className="font-bold block">Status Note: Order Cancelled & Payment Rejected</span>
            <p className="text-[11.5px] text-rose-700 dark:text-rose-300/90">
              Reason: <strong>{rejectionReason || "Fake or unverified payment reference details provided."}</strong>
            </p>
          </div>
        )}

        {/* Item list */}
        <div className="divide-y divide-[#EFE9DF] dark:divide-[#2E2925]">
          {order.items.map((item) => (
            <div key={item.id} className="py-4 space-y-1.5 text-xs">
              <div className="flex justify-between items-start font-medium text-[#181513] dark:text-[#FAF8F5]">
                <span>{item.productTitle} × {item.quantity}</span>
                <span className="font-semibold">{formatCurrency(Number(item.price) * item.quantity)}</span>
              </div>

              {(item.customRecipientName || item.waxSealColor || item.giftWrapOption) && (
                <div className="text-[11px] font-medium text-[#786F64] dark:text-[#A89F91] space-y-0.5 pt-1">
                  {item.customRecipientName && <div>Recipient: {item.customRecipientName}</div>}
                  {item.waxSealColor && <div>Wax Seal: {item.waxSealColor}</div>}
                  {item.giftWrapOption && <div>Packaging: {item.giftWrapOption}</div>}
                </div>
              )}

              {item.customMessage && (
                <div className="p-3 bg-[#F7F3EB] dark:bg-[#25211E] border border-[#E7E0D5] dark:border-[#38322D] rounded-xl text-xs text-[#181513] dark:text-[#FAF8F5] mt-2">
                  <span className="text-[10px] font-semibold uppercase text-[#A64732] dark:text-[#E07A5F] block mb-1">
                    Scribed Calligraphy Note:
                  </span>
                  <span className="italic">&ldquo;{item.customMessage}&rdquo;</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Totals Breakdown */}
        <div className="pt-4 border-t border-[#EAE3D8] dark:border-[#2E2925] space-y-1.5 text-xs font-medium uppercase tracking-wider text-[#6E665D] dark:text-[#A89F91]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-[#181513] dark:text-[#FAF8F5] font-semibold">{formatCurrency(order.subtotal)}</span>
          </div>
          {Number(order.discountTotal) > 0 && (
            <div className="flex justify-between text-[#A64732] dark:text-[#E07A5F]">
              <span>Discount</span>
              <span>-{formatCurrency(order.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Pan-India Delivery</span>
            <span>{Number(order.shippingFee) === 0 ? "Complimentary" : formatCurrency(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-[#181513] dark:text-[#FAF8F5] pt-3 border-t border-[#EAE3D8] dark:border-[#2E2925]">
            <span>Total Paid</span>
            <span>{formatCurrency(order.finalTotal)}</span>
          </div>
        </div>

        {/* Shipping Destination */}
        <div className="pt-4 border-t border-[#EAE3D8] dark:border-[#2E2925] text-xs space-y-1 text-[#6E665D] dark:text-[#A89F91]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] block">
            Shipping Destination:
          </span>
          <div>{order.customerName} ({order.customerPhone})</div>
          <div>{order.shippingAddress}, {order.city}, {order.state} - {order.postalCode}</div>
        </div>
      </div>
    </div>
  );
}
