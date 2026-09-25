"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  User,
  Phone,
  MapPin,
  RefreshCw,
  ExternalLink,
  Search,
  MessageCircle,
  Copy,
  Check,
  Truck,
  Scissors,
  Package,
  CheckCircle2,
  Printer,
  X,
  Clock,
  Send,
  FileText,
  CreditCard,
  Tag,
  Gift,
  Mail,
  Receipt,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  XCircle,
  Trash2,
  AlertTriangle,
  Ban,
} from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Pagination and row expansion state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set());

  // Modals
  const [trackingModalOrder, setTrackingModalOrder] = useState<any | null>(null);
  const [courierNameInput, setCourierNameInput] = useState("Delhivery");
  const [trackingNumberInput, setTrackingNumberInput] = useState("");
  const [packingSlipOrder, setPackingSlipOrder] = useState<any | null>(null);
  const [dossierOrder, setDossierOrder] = useState<any | null>(null);

  // Reject & Delete modal state
  const [rejectModalOrder, setRejectModalOrder] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("Fake or Unverified UPI UTR");
  const [customRejectReason, setCustomRejectReason] = useState<string>("");
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [deleteModalOrder, setDeleteModalOrder] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Copy status indicators
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [copiedUtrId, setCopiedUtrId] = useState<string | null>(null);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedOrderIds(new Set(orders.map((o) => o.id)));
  };

  const collapseAll = () => {
    setExpandedOrderIds(new Set());
  };

  const allExpanded = orders.length > 0 && orders.every((o) => expandedOrderIds.has(o.id));

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("page", String(currentPage));
      params.set("limit", String(pageSize));

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setTotalOrders(data.total || (data.orders?.length ?? 0));
        setTotalPages(data.totalPages || Math.ceil((data.total || (data.orders?.length ?? 0)) / pageSize) || 1);
      }
    } catch {
      console.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, currentPage, pageSize]);

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, pageSize]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setOrders(orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
      }
    } catch {
      console.error("Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentVerify = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, paymentStatus: "CONFIRMED", status: "CONFIRMED" }),
      });
      if (res.ok) {
        setOrders(
          orders.map((o) =>
            o.id === id ? { ...o, paymentStatus: "CONFIRMED", status: "CONFIRMED" } : o
          )
        );
      }
    } catch {
      console.error("Payment verification failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalOrder) return;
    const finalReason = rejectReason === "CUSTOM" ? customRejectReason.trim() : rejectReason;
    if (!finalReason) {
      alert("Please select or enter a rejection reason.");
      return;
    }

    setIsRejecting(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rejectModalOrder.id,
          action: "REJECT",
          rejectionReason: finalReason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === rejectModalOrder.id
              ? {
                  ...o,
                  status: "CANCELLED",
                  paymentStatus: "REJECTED",
                  orderNotes: o.orderNotes
                    ? `${o.orderNotes}\n[REJECTED: ${finalReason} on ${new Date().toISOString().slice(0, 10)}]`
                    : `[REJECTED: ${finalReason} on ${new Date().toISOString().slice(0, 10)}]`,
                }
              : o
          )
        );
        if (dossierOrder?.id === rejectModalOrder.id) {
          setDossierOrder((prev: any) =>
            prev ? { ...prev, status: "CANCELLED", paymentStatus: "REJECTED" } : null
          );
        }
        setRejectModalOrder(null);
        setRejectReason("Fake or Unverified UPI UTR");
        setCustomRejectReason("");
      } else {
        alert(data.error || "Failed to reject order.");
      }
    } catch {
      alert("Network error. Could not reject order.");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalOrder) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders?id=${deleteModalOrder.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== deleteModalOrder.id));
        setTotalOrders((prev) => Math.max(0, prev - 1));
        if (dossierOrder?.id === deleteModalOrder.id) setDossierOrder(null);
        if (packingSlipOrder?.id === deleteModalOrder.id) setPackingSlipOrder(null);
        setDeleteModalOrder(null);
      } else {
        alert(data.error || "Failed to delete order.");
      }
    } catch {
      alert("Network error. Could not delete order.");
    } finally {
      setIsDeleting(false);
    }
  };

  const submitCourierDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingModalOrder) return;

    setUpdatingId(trackingModalOrder.id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: trackingModalOrder.id,
          courierName: courierNameInput,
          trackingNumber: trackingNumberInput,
          status: "SHIPPED",
        }),
      });

      if (res.ok) {
        setOrders(
          orders.map((o) =>
            o.id === trackingModalOrder.id
              ? {
                  ...o,
                  courierName: courierNameInput,
                  trackingNumber: trackingNumberInput,
                  status: "SHIPPED",
                }
              : o
          )
        );
        setTrackingModalOrder(null);
      }
    } catch {
      console.error("Tracking update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const copyAddress = (order: any) => {
    const text = `${order.customerName}\nPhone: ${order.customerPhone}\n${order.shippingAddress}\n${order.city}, ${order.state} - ${order.postalCode}`;
    navigator.clipboard.writeText(text);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const copyCustomMessage = (messageText: string, itemId: string) => {
    navigator.clipboard.writeText(messageText);
    setCopiedMessageId(itemId);
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  const copyUtr = (utr: string, orderId: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtrId(orderId);
    setTimeout(() => setCopiedUtrId(null), 2500);
  };

  const generateWhatsAppUrl = (order: any) => {
    let cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");
    if (!cleanPhone.startsWith("91") && cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    let statusText = "";
    if (order.status === "CONFIRMED") {
      statusText = "has been confirmed and our artisan team will begin scoring and folding your gift!";
    } else if (order.status === "HANDCRAFTING") {
      statusText = "is currently being handcrafted in our Bandra studio!";
    } else if (order.status === "PACKED") {
      statusText = "is packed in our protective double-walled gift box and ready for dispatch!";
    } else if (order.status === "SHIPPED") {
      statusText = `has been dispatched via ${order.courierName || "courier"}${order.trackingNumber ? ` (Tracking: ${order.trackingNumber})` : ""}!`;
    } else if (order.status === "DELIVERED") {
      statusText = "has been successfully delivered! We hope your recipient cherishes it.";
    } else {
      statusText = "has been received at The Fourfold studio.";
    }

    const message = `Hello ${order.customerName},\n\nThis is from The Fourfold Handcrafted Gifting Studio. Your order #${order.orderNumber} ${statusText}\n\nThank you for supporting handcrafting!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E0D5] dark:border-[#2E2925] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#A64732] dark:text-[#E07A5F]">
            Studio Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5] mt-0.5">
            Order Fulfillment Board
          </h1>
          <p className="text-xs text-[#575048] dark:text-[#DCD5CB] mt-0.5">
            All order information, customer calligraphy notes, live product links, packing slips, and 1-click dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchOrders}
            className="p-2.5 rounded-xl border border-[#DDD5C7] dark:border-[#38322D] bg-white dark:bg-[#221E1B] text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-colors shadow-xs"
            title="Refresh orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Non-Technical Friendly Studio Guide Banner */}
      <div className="bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
              Artisan Order Handling Workflow
            </span>
          </div>
          <span className="text-[10px] font-semibold text-[#786F64] dark:text-[#A89F91]">
            Simple 5-Step Guide
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] pt-1 border-t border-[#EFE9DF] dark:border-[#282320]">
          <div className="p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#E5DFD4] dark:border-[#2E2925]">
            <strong className="block text-[#181513] dark:text-[#FAF8F5]">1. Payment Check</strong>
            <span className="text-[#786F64] dark:text-[#A89F91] text-[10px] leading-snug">Verify UPI/Card payment reference</span>
          </div>
          <div className="p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#E5DFD4] dark:border-[#2E2925]">
            <strong className="block text-[#A64732] dark:text-[#E07A5F]">2. Crafting</strong>
            <span className="text-[#786F64] dark:text-[#A89F91] text-[10px] leading-snug">Handwrite calligraphy & score paper</span>
          </div>
          <div className="p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#E5DFD4] dark:border-[#2E2925]">
            <strong className="block text-[#181513] dark:text-[#FAF8F5]">3. Pack & Print</strong>
            <span className="text-[#786F64] dark:text-[#A89F91] text-[10px] leading-snug">Print Packing Slip & box securely</span>
          </div>
          <div className="p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#E5DFD4] dark:border-[#2E2925]">
            <strong className="block text-[#181513] dark:text-[#FAF8F5]">4. Dispatch</strong>
            <span className="text-[#786F64] dark:text-[#A89F91] text-[10px] leading-snug">Hand to courier with tracking</span>
          </div>
          <div className="p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#E5DFD4] dark:border-[#2E2925]">
            <strong className="block text-emerald-600 dark:text-emerald-400">5. Delivered</strong>
            <span className="text-[#786F64] dark:text-[#A89F91] text-[10px] leading-snug">Order successfully completed!</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs, View Switcher & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { label: "All Orders", value: "ALL" },
            { label: "New / Pending", value: "PENDING" },
            { label: "Crafting", value: "HANDCRAFTING" },
            { label: "Packed", value: "PACKED" },
            { label: "In Transit", value: "SHIPPED" },
            { label: "Delivered", value: "DELIVERED" },
            { label: "Cancelled / Rejected", value: "CANCELLED" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? "bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] shadow-xs"
                  : "bg-white dark:bg-[#1A1715] text-[#575048] dark:text-[#DCD5CB] border border-[#DDD5C7] dark:border-[#2E2925] hover:border-[#181513] dark:hover:border-[#FAF8F5]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Controls: Expand All Toggle & Search Input */}
        <div className="flex items-center gap-2">
          {/* Expand / Collapse All Details Button */}
          {orders.length > 0 && (
            <button
              type="button"
              onClick={allExpanded ? collapseAll : expandAll}
              className="px-3 py-1.5 bg-white dark:bg-[#1A1715] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl shrink-0 shadow-2xs text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-colors flex items-center gap-1.5 cursor-pointer"
              title={allExpanded ? "Collapse all order details" : "Expand all order details"}
            >
              {allExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                  <span>Collapse All</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                  <span>Expand All Details</span>
                </>
              )}
            </button>
          )}

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#786F64] dark:text-[#DCD5CB] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, phone, order #..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-white dark:bg-[#1A1715] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] placeholder:text-[#9A9185] dark:placeholder:text-[#9A9185] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5] shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Orders Container */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#575048] dark:text-[#DCD5CB] bg-white dark:bg-[#181412] rounded-xl border border-[#D0C5B4] dark:border-[#2E2723]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#A64732] dark:text-[#E07A5F]" />
          <span>Loading orders from studio database...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#181412] rounded-xl border border-[#D0C5B4] dark:border-[#2E2925] space-y-2">
          <p className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">No customer orders found</p>
          <p className="text-xs text-[#575048] dark:text-[#DCD5CB]">
            {searchQuery
              ? "No orders match your search criteria."
              : "Orders placed by patrons will automatically appear here."}
          </p>
        </div>
      ) : (
        /* UNIFIED ORDERS LIST VIEW (WITH COMPLETE DETAILS IN DROPDOWN CARDS) */
        <div className="bg-white dark:bg-[#181412] rounded-xl border border-[#D0C5B4] dark:border-[#2E2723] overflow-hidden shadow-2xs">
          {/* Table Header (Desktop) */}
          <div className="hidden lg:grid grid-cols-12 gap-3 px-4 py-3 bg-[#FAF7F2] dark:bg-[#1E1916] border-b border-[#D0C5B4] dark:border-[#2E2723] text-[10.5px] font-bold uppercase tracking-wider text-[#575048] dark:text-[#DCD5CB]">
            <div className="col-span-2">Order & Date</div>
            <div className="col-span-3">Customer & Destination</div>
            <div className="col-span-3">Creations & Personalization</div>
            <div className="col-span-2">Payment & Total</div>
            <div className="col-span-2 text-right">Stage & Actions</div>
          </div>

          {/* List Rows */}
          <div className="divide-y divide-[#EAE3D8] dark:divide-[#282320]">
            {orders.map((order) => {
              const isUpdating = updatingId === order.id;
              const isExpanded = expandedOrderIds.has(order.id);
              const hasCalligraphy = order.items.some((i: any) => !!i.customMessage);
              const totalItemsCount = order.items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);

              return (
                <div
                  key={order.id}
                  className={`transition-colors ${
                    isExpanded ? "bg-[#FAF8F5]/80 dark:bg-[#1A1715]/90" : "hover:bg-[#FAF7F2]/40 dark:hover:bg-[#1E1916]/40"
                  }`}
                >
                  {/* Summary Row Content */}
                  <div className="p-3.5 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start lg:items-center">
                    {/* 1. Order Number & Date */}
                    <div className="col-span-2 flex items-center justify-between lg:block">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleExpand(order.id)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isExpanded
                              ? "bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] border-[#181513] dark:border-[#FAF8F5]"
                              : "bg-[#FAF7F2] dark:bg-[#201D1A] border-[#DDD5C7] dark:border-[#38322D] text-[#786F64] hover:border-[#181513] dark:hover:border-[#FAF8F5]"
                          }`}
                          title={isExpanded ? "Collapse order details" : "Expand full order details"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <Link
                          href={`/order-confirmation/${order.id}`}
                          target="_blank"
                          title="View public customer tracking page"
                          className="group font-mono text-xs sm:text-sm font-black text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F] flex items-center gap-1"
                        >
                          <span>#{order.orderNumber}</span>
                          <ExternalLink className="w-3 h-3 text-[#786F64] group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F]" />
                        </Link>
                      </div>
                      <div className="text-[11px] text-[#786F64] dark:text-[#A89F91] lg:mt-1 lg:ml-7">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>

                    {/* 2. Customer & Contact */}
                    <div className="col-span-3 text-xs space-y-0.5">
                      <div className="font-bold text-[#181513] dark:text-[#FAF8F5] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F] shrink-0" />
                        <span className="truncate">{order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#575048] dark:text-[#DCD5CB]">
                        <span className="font-mono">{order.customerPhone}</span>
                        {order.customerPhone && (
                          <a
                            href={generateWhatsAppUrl(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors font-medium text-[10px]"
                            title="Chat with customer on WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WA</span>
                          </a>
                        )}
                      </div>
                      <div className="text-[10.5px] text-[#786F64] dark:text-[#A89F91] truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0 text-[#786F64] dark:text-[#A89F91]" />
                        <span>{order.city}, {order.state}</span>
                      </div>
                    </div>

                    {/* 3. Items Summary & Calligraphy Callout */}
                    <div className="col-span-3 text-xs space-y-1">
                      <div className="text-[#181513] dark:text-[#FAF8F5] font-medium truncate" title={order.items.map((i: any) => `${i.productTitle} ×${i.quantity}`).join(", ")}>
                        <span className="font-bold text-[#A64732] dark:text-[#E07A5F] mr-1">
                          {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}:
                        </span>
                        {order.items.map((i: any) => `${i.productTitle} ×${i.quantity}`).join(", ")}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {hasCalligraphy && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-[10px] font-semibold">
                            <span>✍️</span>
                            <span>Calligraphy Note</span>
                          </span>
                        )}
                        {order.orderNotes && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-semibold">
                            <span>📝</span>
                            <span>Special Note</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 4. Payment & Final Total */}
                    <div className="col-span-2 text-xs">
                      <div className="font-mono font-bold text-sm text-[#181513] dark:text-[#FAF8F5]">
                        {formatCurrency(order.finalTotal)}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider mt-0.5">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            order.paymentStatus === "CONFIRMED"
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                              : order.paymentStatus === "REJECTED"
                              ? "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-bold"
                              : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                          }`}
                        >
                          {order.paymentStatus === "REJECTED" ? "REJECTED" : order.paymentMethod}
                        </span>
                        {order.paymentRef && (
                          <span className="font-mono text-[#786F64] dark:text-[#A89F91] truncate max-w-[80px]" title={order.paymentRef}>
                            UTR:{order.paymentRef}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 5. Status & Quick Actions */}
                    <div className="col-span-2 flex flex-wrap items-center justify-between lg:justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#EAE3D8] dark:border-[#2E2925]">
                      {/* Status Pill */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                            : order.status === "SHIPPED"
                            ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
                            : order.status === "PACKED"
                            ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300"
                            : order.status === "HANDCRAFTING"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                            : order.status === "CANCELLED"
                            ? "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-bold"
                            : "bg-[#EFE9DF] dark:bg-[#25201A] text-[#181513] dark:text-[#FAF8F5]"
                        }`}
                      >
                        {order.status}
                      </span>

                      {/* Dropdown View Button (Prominently Toggles All Card Details) */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(order.id)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                          isExpanded
                            ? "bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] border-[#181513] dark:border-[#FAF8F5] shadow-xs"
                            : "border-[#DDD5C7] dark:border-[#38322D] bg-[#FAF7F2] dark:bg-[#201D1A] text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5]"
                        }`}
                        title={isExpanded ? "Hide full order card" : "View full order card"}
                      >
                        <span>{isExpanded ? "Hide Details" : "View Details"}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Fast Workflow Advance Button */}
                      {order.status === "PENDING" && order.paymentStatus !== "CONFIRMED" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handlePaymentVerify(order.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                          title="Verify & Confirm Payment"
                        >
                          Verify
                        </button>
                      )}
                      {order.status === "CONFIRMED" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(order.id, "HANDCRAFTING")}
                          className="px-2.5 py-1 rounded-lg bg-[#A64732] hover:bg-[#8D3825] dark:bg-[#E07A5F] text-white dark:text-[#181513] text-[11px] font-bold transition-colors cursor-pointer"
                          title="Start Handcrafting"
                        >
                          Craft
                        </button>
                      )}
                      {order.status === "HANDCRAFTING" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(order.id, "PACKED")}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                          title="Mark as Packed"
                        >
                          Pack
                        </button>
                      )}
                      {order.status === "PACKED" && (
                        <button
                          type="button"
                          onClick={() => {
                            setTrackingModalOrder(order);
                            setCourierNameInput(order.courierName || "Delhivery");
                            setTrackingNumberInput(order.trackingNumber || "");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                          title="Dispatch Courier"
                        >
                          Ship
                        </button>
                      )}
                      {order.status === "SHIPPED" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(order.id, "DELIVERED")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                          title="Mark as Delivered"
                        >
                          Delivered
                        </button>
                      )}

                      {/* Reject Fake Payment / Cancel Order Button */}
                      {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => {
                            setRejectModalOrder(order);
                            setRejectReason("Fake or Unverified UPI UTR");
                            setCustomRejectReason("");
                          }}
                          className="px-2 py-1 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Reject order due to fake payment or invalid details"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      )}

                      {/* Delete Order Action */}
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => setDeleteModalOrder(order)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors cursor-pointer"
                        title="Permanently Delete Order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Complete Dropdown Card (Full Order Dossier, Creations, Calligraphy, Shipping & Controls) */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 bg-[#FAF7F2] dark:bg-[#151210] border-t border-[#EAE3D8] dark:border-[#2E2925] space-y-5">
                      {/* Top Bar: Order ID, Date, Quick Status Pills, Dossier & Slip Launchers */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DFD4] dark:border-[#282320]">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <Link
                            href={`/order-confirmation/${order.id}`}
                            target="_blank"
                            title="Open public tracking page"
                            className="group font-mono text-base font-black text-[#181513] dark:text-[#FAF8F5] hover:text-[#A64732] dark:hover:text-[#E07A5F] flex items-center gap-1.5 transition-colors"
                          >
                            <span>#{order.orderNumber}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-[#786F64] group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F]" />
                          </Link>

                          <span className="text-xs text-[#575048] dark:text-[#DCD5CB]">
                            Placed on {formatDate(order.createdAt)}
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              order.status === "DELIVERED"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                : order.status === "SHIPPED"
                                ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
                                : order.status === "PACKED"
                                ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800"
                                : order.status === "HANDCRAFTING"
                                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                                : "bg-[#EFE9DF] dark:bg-[#25201A] text-[#181513] dark:text-[#FAF8F5] border border-[#DDD5C7] dark:border-[#38322D]"
                            }`}
                          >
                            {order.status}
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              order.paymentStatus === "CONFIRMED"
                                ? "text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800"
                                : "text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800"
                            }`}
                          >
                            {order.paymentMethod} • {order.paymentStatus}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDossierOrder(order)}
                            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg border border-[#DDD5C7] dark:border-[#38322D] bg-white dark:bg-[#201D1A] text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                            title="Inspect complete order dossier"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                            <span>Full Dossier</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPackingSlipOrder(order)}
                            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg border border-[#DDD5C7] dark:border-[#38322D] bg-white dark:bg-[#201D1A] text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                            title="Print Packing Slip"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#786F64] dark:text-[#DCD5CB]" />
                            <span>Packing Slip</span>
                          </button>

                          <span className="text-base font-bold text-[#181513] dark:text-[#FAF8F5] ml-1 font-mono">
                            {formatCurrency(order.finalTotal)}
                          </span>
                        </div>
                      </div>

                      {/* Main Dual Columns: Customer & Shipping on Left VS Creations & Personalization on Right */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Left Column: Customer Details, Address, Special Instructions & Logistics */}
                        <div className="space-y-4">
                          {/* Customer & Address Details Card */}
                          <div className="p-4 rounded-xl bg-white dark:bg-[#1E1B18] border border-[#E5DFD4] dark:border-[#2E2925] space-y-3 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-[#F0EBE1] dark:border-[#282320] pb-2">
                              <span className="font-bold text-[10.5px] uppercase tracking-wider text-[#A64732] dark:text-[#E07A5F] flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                <span>Customer & Shipping Destination</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => copyAddress(order)}
                                className="text-[11px] font-semibold text-[#A64732] dark:text-[#E07A5F] hover:underline flex items-center gap-1 cursor-pointer"
                                title="Copy formatted shipping address for courier label"
                              >
                                {copiedId === order.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-600 font-bold">Copied Label!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Label</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="space-y-1.5 text-xs text-[#575048] dark:text-[#DCD5CB]">
                              <p className="font-bold text-sm text-[#181513] dark:text-[#FAF8F5]">
                                {order.customerName}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-[#786F64] dark:text-[#A89F91]" />
                                <a href={`mailto:${order.customerEmail}`} className="hover:underline text-[#181513] dark:text-[#FAF8F5]">
                                  {order.customerEmail}
                                </a>
                              </p>
                              <div className="flex items-start gap-1.5 pt-1">
                                <MapPin className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F] shrink-0 mt-0.5" />
                                <div>
                                  <p className="leading-relaxed text-[#181513] dark:text-[#FAF8F5]">{order.shippingAddress}</p>
                                  <p className="font-semibold text-[#181513] dark:text-[#FAF8F5]">
                                    {order.city}, {order.state} - {order.postalCode}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {order.customerPhone && (
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F0EBE1] dark:border-[#282320]">
                                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#181513] dark:text-[#FAF8F5]">
                                  <Phone className="w-3.5 h-3.5 text-[#786F64]" />
                                  <span>{order.customerPhone}</span>
                                </div>
                                <a
                                  href={generateWhatsAppUrl(order)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>WhatsApp Customer</span>
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Customer Special Delivery Instructions Callout */}
                          {order.orderNotes && (
                            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-[#221D18] border border-amber-200 dark:border-amber-900/60 text-xs space-y-1">
                              <span className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider block text-[10px] flex items-center gap-1">
                                <Info className="w-3.5 h-3.5" />
                                <span>Special Customer Delivery Instructions:</span>
                              </span>
                              <p className="italic text-amber-950 dark:text-amber-100 font-serif leading-relaxed">
                                &ldquo;{order.orderNotes}&rdquo;
                              </p>
                            </div>
                          )}

                          {/* Payment & Shipping Logistics Box */}
                          <div className="p-4 rounded-xl bg-white dark:bg-[#1E1B18] border border-[#E5DFD4] dark:border-[#2E2925] space-y-3 shadow-2xs text-xs">
                            <span className="font-bold text-[10.5px] uppercase tracking-wider text-[#A64732] dark:text-[#E07A5F] block border-b border-[#F0EBE1] dark:border-[#282320] pb-2 flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Payment & Logistics Tracking</span>
                            </span>

                            <div className="grid grid-cols-2 gap-3 text-[#575048] dark:text-[#DCD5CB]">
                              <div>
                                <span className="text-[10px] text-[#786F64] dark:text-[#A89F91] block uppercase tracking-wider">Payment Method</span>
                                <strong className="text-[#181513] dark:text-[#FAF8F5]">{order.paymentMethod}</strong>
                              </div>
                              <div>
                                <span className="text-[10px] text-[#786F64] dark:text-[#A89F91] block uppercase tracking-wider">Payment Status</span>
                                <strong className={order.paymentStatus === "CONFIRMED" ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}>
                                  {order.paymentStatus}
                                </strong>
                              </div>
                              {order.paymentRef && (
                                <div className="col-span-2 flex items-center justify-between p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#141210] border border-[#E5DFD4] dark:border-[#282320]">
                                  <div>
                                    <span className="text-[10px] text-[#786F64] dark:text-[#A89F91] block uppercase tracking-wider">Transaction UTR / Ref</span>
                                    <span className="font-mono font-bold text-[#181513] dark:text-[#FAF8F5]">{order.paymentRef}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => copyUtr(order.paymentRef, order.id)}
                                    className="px-2 py-1 rounded bg-white dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#38322D] text-[10.5px] font-semibold flex items-center gap-1 hover:border-[#181513] transition-colors cursor-pointer"
                                    title="Copy UTR"
                                  >
                                    {copiedUtrId === order.id ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-[#786F64]" />
                                    )}
                                    <span>{copiedUtrId === order.id ? "Copied" : "Copy"}</span>
                                  </button>
                                </div>
                              )}
                              <div className="col-span-2 pt-2 border-t border-[#F0EBE1] dark:border-[#282320] flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] text-[#786F64] dark:text-[#A89F91] block uppercase tracking-wider">Courier Dispatch Status</span>
                                  <span className="font-semibold text-[#181513] dark:text-[#FAF8F5]">
                                    {order.courierName ? `${order.courierName}` : "Not Dispatched Yet"}
                                    {order.trackingNumber ? ` • ${order.trackingNumber}` : ""}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTrackingModalOrder(order);
                                    setCourierNameInput(order.courierName || "Delhivery");
                                    setTrackingNumberInput(order.trackingNumber || "");
                                  }}
                                  className="px-3 py-1.5 rounded-lg border border-[#DDD5C7] dark:border-[#38322D] bg-[#FAF7F2] dark:bg-[#201D1A] text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Truck className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                                  <span>{order.trackingNumber ? "Edit Courier" : "Dispatch"}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Ordered Creations, Custom Messages & Financial Breakdown */}
                        <div className="space-y-4">
                          {/* Creations List */}
                          <div className="p-4 rounded-xl bg-white dark:bg-[#1E1B18] border border-[#E5DFD4] dark:border-[#2E2925] space-y-3 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-[#F0EBE1] dark:border-[#282320] pb-2">
                              <span className="font-bold text-[10.5px] uppercase tracking-wider text-[#A64732] dark:text-[#E07A5F] flex items-center gap-1.5">
                                <Gift className="w-3.5 h-3.5" />
                                <span>Creations to Handcraft ({order.items.length})</span>
                              </span>
                              <span className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                                Custom personalization details
                              </span>
                            </div>

                            <div className="space-y-3">
                              {order.items.map((item: any) => (
                                <div
                                  key={item.id}
                                  className="space-y-2 pb-3 border-b last:border-0 border-[#F0EBE1] dark:border-[#282320]"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <h4 className="text-xs sm:text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
                                        {item.productTitle}
                                      </h4>
                                      <div className="flex flex-wrap gap-2 text-[11px] text-[#786F64] dark:text-[#A89F91] mt-0.5">
                                        {item.customRecipientName && (
                                          <span>Recipient: <strong className="text-[#181513] dark:text-[#FAF8F5]">{item.customRecipientName}</strong></span>
                                        )}
                                        {item.waxSealColor && (
                                          <span>• Wax Seal: <strong className="text-[#181513] dark:text-[#FAF8F5]">{item.waxSealColor}</strong></span>
                                        )}
                                        {item.giftWrapOption && (
                                          <span>• Wrap: <strong className="text-[#181513] dark:text-[#FAF8F5]">{item.giftWrapOption}</strong></span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="text-xs font-mono font-bold text-[#181513] dark:text-[#FAF8F5] block">
                                        {formatCurrency(Number(item.price) * item.quantity)}
                                      </span>
                                      <span className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                                        {formatCurrency(item.price)} × {item.quantity}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Full Calligraphy Card Note (NOT Hidden or Truncated!) */}
                                  {item.customMessage && (
                                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-[#201B15] border border-amber-200 dark:border-amber-900/60 text-xs space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block text-[10px]">
                                          ✍️ Calligraphy Card Note to Handwrite:
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => copyCustomMessage(item.customMessage, item.id)}
                                          className="text-[10.5px] font-semibold text-amber-900 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                                          title="Copy note to clipboard"
                                        >
                                          {copiedMessageId === item.id ? (
                                            <>
                                              <Check className="w-3 h-3 text-emerald-600" />
                                              <span className="text-emerald-600 font-bold">Copied!</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="w-3 h-3" />
                                              <span>Copy Note</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                      <p className="font-serif italic text-amber-950 dark:text-amber-100 leading-relaxed text-xs sm:text-sm">
                                        &ldquo;{item.customMessage}&rdquo;
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Financial Breakdown */}
                            <div className="pt-3 border-t border-[#F0EBE1] dark:border-[#282320] flex justify-end">
                              <div className="w-full sm:w-64 space-y-1.5 text-xs">
                                <div className="flex justify-between text-[#575048] dark:text-[#DCD5CB]">
                                  <span>Subtotal:</span>
                                  <span>{formatCurrency(order.subtotal)}</span>
                                </div>
                                {Number(order.discountTotal) > 0 && (
                                  <div className="flex justify-between text-red-600 dark:text-red-400 font-medium">
                                    <span>Discount Applied:</span>
                                    <span>-{formatCurrency(order.discountTotal)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-[#575048] dark:text-[#DCD5CB]">
                                  <span>Shipping Fee:</span>
                                  <span>{formatCurrency(order.shippingFee)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-sm text-[#181513] dark:text-[#FAF8F5] pt-1.5 border-t border-[#EAE3D8] dark:border-[#2E2925]">
                                  <span>Final Total Paid:</span>
                                  <span className="font-mono text-base text-[#A64732] dark:text-[#E07A5F]">
                                    {formatCurrency(order.finalTotal)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Workflow Action Bar & Manual Override Selector */}
                      <div className="pt-3 border-t border-[#E5DFD4] dark:border-[#282320] flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1A1715] p-3.5 sm:p-4 rounded-xl border border-[#E5DFD4] dark:border-[#2E2925]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#786F64] dark:text-[#A89F91]">
                            Workflow Stage:
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={isUpdating}
                            className="px-2.5 py-1.5 rounded-lg border border-[#DDD5C7] dark:border-[#38322D] bg-[#FAF7F2] dark:bg-[#201D1A] text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] focus:outline-none cursor-pointer"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="HANDCRAFTING">HANDCRAFTING</option>
                            <option value="PACKED">PACKED</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Fast Workflow Step Progression Button */}
                          {order.status === "PENDING" && order.paymentStatus !== "CONFIRMED" && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handlePaymentVerify(order.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify & Confirm Payment</span>
                            </button>
                          )}
                          {order.status === "CONFIRMED" && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(order.id, "HANDCRAFTING")}
                              className="px-4 py-2 rounded-xl bg-[#A64732] hover:bg-[#8D3825] dark:bg-[#E07A5F] text-white dark:text-[#181513] text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Scissors className="w-3.5 h-3.5" />
                              <span>Start Handcrafting</span>
                            </button>
                          )}
                          {order.status === "HANDCRAFTING" && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(order.id, "PACKED")}
                              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Package className="w-3.5 h-3.5" />
                              <span>Mark as Packed & Ready</span>
                            </button>
                          )}
                          {order.status === "PACKED" && (
                            <button
                              type="button"
                              onClick={() => {
                                setTrackingModalOrder(order);
                                setCourierNameInput(order.courierName || "Delhivery");
                                setTrackingNumberInput(order.trackingNumber || "");
                              }}
                              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Dispatch Courier & Add Tracking</span>
                            </button>
                          )}
                          {order.status === "SHIPPED" && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(order.id, "DELIVERED")}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Delivered</span>
                            </button>
                          )}
                          {order.status === "DELIVERED" && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Order Completed</span>
                            </span>
                          )}

                          {/* Reject Fake Payment / Cancel Order Button */}
                          {order.status !== "CANCELLED" && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => {
                                setRejectModalOrder(order);
                                setRejectReason("Fake or Unverified UPI UTR");
                                setCustomRejectReason("");
                              }}
                              className="px-3.5 py-2 rounded-xl border border-red-300 dark:border-red-900/70 bg-red-50/50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                              title="Reject fake payment and cancel order"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Reject Order</span>
                            </button>
                          )}

                          {/* Delete Order Action */}
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => setDeleteModalOrder(order)}
                            className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-red-300 dark:hover:border-red-900/60 text-stone-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/30 dark:hover:bg-red-950/20 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Permanently delete order from database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>

                          {/* Quick Collapse Button */}
                          <button
                            type="button"
                            onClick={() => toggleExpand(order.id)}
                            className="px-3.5 py-2 rounded-xl border border-[#DDD5C7] dark:border-[#38322D] hover:bg-stone-200 dark:hover:bg-stone-800 text-xs font-semibold text-[#575048] dark:text-[#DCD5CB] transition-colors flex items-center gap-1 cursor-pointer"
                            title="Collapse details for this order"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Collapse</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {totalOrders > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-[#181412] rounded-xl border border-[#D0C5B4] dark:border-[#2E2723] shadow-2xs text-xs">
          {/* Summary Count */}
          <div className="text-[#575048] dark:text-[#DCD5CB] font-medium">
            Showing <strong className="text-[#181513] dark:text-[#FAF8F5]">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
            <strong className="text-[#181513] dark:text-[#FAF8F5]">{Math.min(currentPage * pageSize, totalOrders)}</strong> of{" "}
            <strong className="text-[#181513] dark:text-[#FAF8F5]">{totalOrders}</strong> orders
          </div>

          {/* Page Buttons & Limit Selector */}
          <div className="flex items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-[#575048] dark:text-[#DCD5CB]">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#38322D] rounded-lg text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] focus:outline-none"
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-[#DDD5C7] dark:border-[#38322D] bg-[#FAF7F2] dark:bg-[#201D1A] text-[#181513] dark:text-[#FAF8F5] hover:bg-stone-200 dark:hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
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
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                            currentPage === p
                              ? "bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] shadow-xs"
                              : "border border-[#DDD5C7] dark:border-[#38322D] bg-[#FAF7F2] dark:bg-[#201D1A] text-[#181513] dark:text-[#FAF8F5] hover:bg-stone-200 dark:hover:bg-stone-800"
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
                className="p-1.5 rounded-lg border border-[#DDD5C7] dark:border-[#38322D] bg-[#FAF7F2] dark:bg-[#201D1A] text-[#181513] dark:text-[#FAF8F5] hover:bg-stone-200 dark:hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Order Dossier Modal (Mobile Sticky Header & Sticky Footer Fix) */}
      <AdminModal
        isOpen={!!dossierOrder}
        onClose={() => setDossierOrder(null)}
        maxWidth="max-w-3xl"
      >
        {dossierOrder && (
          <div className="w-full bg-white dark:bg-[#181412] rounded-2xl border border-[#D0C5B4] dark:border-[#2E2723] shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
            {/* Sticky Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-[#EAE3D8] dark:border-[#2E2925] flex items-center justify-between bg-white dark:bg-[#181412]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#A64732]/10 flex items-center justify-center text-[#A64732] dark:text-[#E07A5F]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[#181513] dark:text-[#FAF8F5]">
                    Order Dossier #{dossierOrder.orderNumber}
                  </h3>
                  <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                    Placed on {formatDate(dossierOrder.createdAt)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDossierOrder(null)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-[#181513] dark:text-[#FAF8F5] transition-colors"
                aria-label="Close dossier modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Patron & Shipping */}
                <div className="space-y-2 p-3.5 sm:p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#EAE3D8] dark:border-[#282320]">
                  <span className="font-bold uppercase tracking-wider text-[10.5px] text-[#A64732] dark:text-[#E07A5F] block">
                    Customer & Delivery Details
                  </span>
                  <p className="font-bold text-sm text-[#181513] dark:text-[#FAF8F5]">{dossierOrder.customerName}</p>
                  <p className="text-[#575048] dark:text-[#DCD5CB]">Email: {dossierOrder.customerEmail}</p>
                  <p className="text-[#575048] dark:text-[#DCD5CB]">Phone: {dossierOrder.customerPhone}</p>
                  <p className="text-[#575048] dark:text-[#DCD5CB] pt-1">
                    Address: {dossierOrder.shippingAddress}
                  </p>
                  <p className="font-semibold text-[#181513] dark:text-[#FAF8F5]">
                    {dossierOrder.city}, {dossierOrder.state} - {dossierOrder.postalCode}
                  </p>
                </div>

                {/* Payment & Logistics */}
                <div className="space-y-2 p-3.5 sm:p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#EAE3D8] dark:border-[#282320]">
                  <span className="font-bold uppercase tracking-wider text-[10.5px] text-[#A64732] dark:text-[#E07A5F] block">
                    Payment & Logistics
                  </span>
                  <p className="text-[#575048] dark:text-[#DCD5CB]">
                    Method: <strong className="text-[#181513] dark:text-[#FAF8F5]">{dossierOrder.paymentMethod}</strong>
                  </p>
                  <p className="text-[#575048] dark:text-[#DCD5CB]">
                    Payment Status: <strong className="text-emerald-700 dark:text-emerald-400">{dossierOrder.paymentStatus}</strong>
                  </p>
                  {dossierOrder.paymentRef && (
                    <p className="text-[#575048] dark:text-[#DCD5CB]">
                      Transaction UTR: <strong className="font-mono text-[#181513] dark:text-[#FAF8F5]">{dossierOrder.paymentRef}</strong>
                    </p>
                  )}
                  {dossierOrder.courierName && (
                    <p className="text-[#575048] dark:text-[#DCD5CB]">
                      Courier Partner: <strong className="text-[#181513] dark:text-[#FAF8F5]">{dossierOrder.courierName}</strong>
                    </p>
                  )}
                  {dossierOrder.trackingNumber && (
                    <p className="text-[#575048] dark:text-[#DCD5CB]">
                      Tracking Number: <strong className="font-mono text-[#181513] dark:text-[#FAF8F5]">{dossierOrder.trackingNumber}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Special Delivery Instructions */}
              {dossierOrder.orderNotes && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-[#221D18] border border-amber-200 dark:border-amber-900/60 text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider block mb-1">
                    Customer Special Delivery Instructions:
                  </span>
                  <p className="italic text-amber-950 dark:text-amber-100">{dossierOrder.orderNotes}</p>
                </div>
              )}

              {/* Ordered Items with full messages */}
              <div className="space-y-3">
                <span className="font-bold uppercase tracking-wider text-xs text-[#181513] dark:text-[#FAF8F5] block">
                  Purchased Creations & Personalization Notes
                </span>
                <div className="space-y-3">
                  {dossierOrder.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#EAE3D8] dark:border-[#282320] text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#181513] dark:text-[#FAF8F5]">{item.productTitle}</span>
                        <span className="font-mono font-bold text-[#181513] dark:text-[#FAF8F5]">
                          {formatCurrency(item.price)} × {item.quantity}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px] text-[#575048] dark:text-[#DCD5CB]">
                        {item.customRecipientName && <span>Recipient: <strong>{item.customRecipientName}</strong></span>}
                        {item.waxSealColor && <span>• Wax Seal: <strong>{item.waxSealColor}</strong></span>}
                        {item.giftWrapOption && <span>• Wrap: <strong>{item.giftWrapOption}</strong></span>}
                      </div>

                      {item.customMessage && (
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-[#201B15] border border-amber-200 dark:border-amber-900/60 text-xs">
                          <span className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block text-[10px] mb-1">
                            Calligraphy Card Note:
                          </span>
                          <p className="font-serif italic text-amber-950 dark:text-amber-100">&ldquo;{item.customMessage}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="pt-4 border-t border-[#EAE3D8] dark:border-[#2E2925] flex justify-end">
                <div className="w-64 space-y-1 text-xs">
                  <div className="flex justify-between text-[#575048] dark:text-[#DCD5CB]">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(dossierOrder.subtotal)}</span>
                  </div>
                  {Number(dossierOrder.discountTotal) > 0 && (
                    <div className="flex justify-between text-[#A64732] dark:text-[#E07A5F]">
                      <span>Discount:</span>
                      <span>-{formatCurrency(dossierOrder.discountTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#575048] dark:text-[#DCD5CB]">
                    <span>Shipping:</span>
                    <span>{formatCurrency(dossierOrder.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#181513] dark:text-[#FAF8F5] pt-1 border-t border-[#EAE3D8] dark:border-[#2E2925]">
                    <span>Final Total:</span>
                    <span>{formatCurrency(dossierOrder.finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer (Guaranteed Visible on All Phone Displays) */}
            <div className="shrink-0 p-3.5 sm:p-4 border-t border-[#EAE3D8] dark:border-[#2E2925] bg-[#FAF8F5] dark:bg-[#141210] flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setDossierOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-[#DDD5C7] dark:border-[#38322D] hover:bg-stone-200 dark:hover:bg-stone-800 text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] transition-colors cursor-pointer"
              >
                Close Dossier
              </button>

              <div className="flex items-center gap-2">
                {dossierOrder.customerPhone && (
                  <a
                    href={generateWhatsAppUrl(dossierOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {/* Reject Fake Payment / Cancel Order Button */}
                {dossierOrder.status !== "CANCELLED" && (
                  <button
                    type="button"
                    onClick={() => {
                      setRejectModalOrder(dossierOrder);
                      setRejectReason("Fake or Unverified UPI UTR");
                      setCustomRejectReason("");
                      setDossierOrder(null);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-red-300 dark:border-red-900/70 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                    title="Reject order and mark payment as fake/unverified"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}

                {/* Delete Order Action */}
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOrder(dossierOrder);
                    setDossierOrder(null);
                  }}
                  className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/30 dark:hover:bg-red-950/20 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Permanently delete order"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPackingSlipOrder(dossierOrder);
                    setDossierOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#A64732] hover:bg-[#8D3825] dark:bg-[#E07A5F] dark:hover:bg-[#D46548] text-white dark:text-[#181513] text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Packing Slip</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Courier Dispatch & Tracking Modal (Mobile Sticky Header & Sticky Footer Fix) */}
      <AdminModal
        isOpen={!!trackingModalOrder}
        onClose={() => setTrackingModalOrder(null)}
        maxWidth="max-w-md"
      >
        {trackingModalOrder && (
          <div className="w-full bg-white dark:bg-[#181412] rounded-2xl border border-[#D0C5B4] dark:border-[#2E2723] shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
            {/* Sticky Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-[#EAE3D8] dark:border-[#2E2925] flex items-center justify-between bg-white dark:bg-[#181412]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
                <h3 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
                  Dispatch Order #{trackingModalOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTrackingModalOrder(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#786F64] dark:text-[#DCD5CB] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={submitCourierDispatch} className="flex-1 overflow-y-auto min-h-0 flex flex-col">
              <div className="p-4 sm:p-5 space-y-4 flex-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#575048] dark:text-[#DCD5CB]">
                    Courier Partner
                  </label>
                  <select
                    value={courierNameInput}
                    onChange={(e) => setCourierNameInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#DDD5C7] dark:border-[#2E2925] bg-white dark:bg-[#201D1A] text-xs font-medium text-[#181513] dark:text-[#FAF8F5] focus:outline-none"
                  >
                    <option value="Delhivery">Delhivery</option>
                    <option value="BlueDart">BlueDart</option>
                    <option value="DTDC Express">DTDC Express</option>
                    <option value="India Post Speed Post">India Post Speed Post</option>
                    <option value="Porter (Mumbai Local)">Porter (Mumbai Local)</option>
                    <option value="Shiprocket">Shiprocket</option>
                    <option value="Other Courier">Other Courier</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#575048] dark:text-[#DCD5CB]">
                    Tracking / AWB Number
                  </label>
                  <input
                    type="text"
                    required
                    value={trackingNumberInput}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    placeholder="e.g. 142095819034"
                    className="w-full h-10 px-3 rounded-xl border border-[#DDD5C7] dark:border-[#2E2925] bg-white dark:bg-[#201D1A] text-xs font-medium text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="shrink-0 p-3.5 sm:p-4 border-t border-[#EAE3D8] dark:border-[#2E2925] bg-[#FAF8F5] dark:bg-[#141210] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-4 py-2 rounded-xl border border-[#DDD5C7] dark:border-[#2E2925] text-xs font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#A64732] hover:bg-[#8D3825] dark:bg-[#E07A5F] text-white dark:text-[#181513] text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        )}
      </AdminModal>

      {/* Printable Packing Slip / Invoice Modal (Mobile Sticky Header & Sticky Footer Fix) */}
      <AdminModal
        isOpen={!!packingSlipOrder}
        onClose={() => setPackingSlipOrder(null)}
        maxWidth="max-w-2xl"
      >
        {packingSlipOrder && (
          <div className="w-full bg-[#FAF7F2] dark:bg-[#181412] text-[#181513] dark:text-[#FAF8F5] rounded-2xl border border-[#D0C5B4] dark:border-[#2E2723] shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
            {/* Sticky Header (Always Visible on Mobile) */}
            <div className="shrink-0 p-3.5 sm:p-4 border-b border-[#DDD5C7] dark:border-[#2E2723] bg-white dark:bg-[#181412] flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
                <span className="font-bold text-xs sm:text-sm uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                  Packing Slip • #{packingSlipOrder.orderNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPackingSlipOrder(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800 text-[#181513] dark:text-[#FAF8F5] hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                aria-label="Close packing slip modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Slip Body */}
            <div className="printable-slip flex-1 overflow-y-auto min-h-0 p-5 sm:p-8 space-y-6">
              {/* Packing Slip Header Details */}
              <div className="flex items-center justify-between pb-4 border-b border-[#DDD5C7] dark:border-[#2E2723]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                    THE FOURFOLD
                  </h2>
                  <p className="text-xs text-[#786F64] dark:text-[#A89F91]">
                    Handcrafted Gifting Studio • Bandra West, Mumbai
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#A64732] dark:text-[#E07A5F] block">
                    Studio Packing Slip
                  </span>
                  <p className="font-mono text-base font-black text-[#181513] dark:text-[#FAF8F5]">
                    #{packingSlipOrder.orderNumber}
                  </p>
                  <p className="text-xs text-[#786F64] dark:text-[#A89F91]">
                    {formatDate(packingSlipOrder.createdAt)}
                  </p>
                </div>
              </div>

              {/* Customer Shipping Address & Payment Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 p-3.5 rounded-xl bg-white dark:bg-[#201B18] border border-[#E5DFD4] dark:border-[#2E2723]">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[#A64732] dark:text-[#E07A5F] block">
                    Ship To Customer:
                  </span>
                  <p className="font-bold text-sm text-[#181513] dark:text-[#FAF8F5]">
                    {packingSlipOrder.customerName}
                  </p>
                  <p className="text-[#575048] dark:text-[#DCD5CB] leading-relaxed">
                    {packingSlipOrder.shippingAddress}
                  </p>
                  <p className="text-[#575048] dark:text-[#DCD5CB]">
                    {packingSlipOrder.city}, {packingSlipOrder.state} - {packingSlipOrder.postalCode}
                  </p>
                  <p className="font-semibold text-[#181513] dark:text-[#FAF8F5] pt-0.5">
                    Phone: {packingSlipOrder.customerPhone}
                  </p>
                </div>

                <div className="space-y-1 p-3.5 rounded-xl bg-white dark:bg-[#201B18] border border-[#E5DFD4] dark:border-[#2E2723] text-left sm:text-right">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[#786F64] dark:text-[#A89F91] block">
                    Payment & Order Status:
                  </span>
                  <p className="font-semibold text-[#181513] dark:text-[#FAF8F5]">
                    {packingSlipOrder.paymentMethod} ({packingSlipOrder.paymentStatus})
                  </p>
                  {packingSlipOrder.paymentRef && (
                    <p className="text-[11px] font-mono text-[#786F64] dark:text-[#A89F91]">
                      UTR: {packingSlipOrder.paymentRef}
                    </p>
                  )}
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[#786F64] dark:text-[#A89F91] block pt-1.5">
                    Workflow Stage:
                  </span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAF7F2] dark:bg-[#181412] text-[#181513] dark:text-[#FAF8F5] border border-[#D0C5B4] dark:border-[#332A24]">
                    {packingSlipOrder.status}
                  </span>
                </div>
              </div>

              {/* Customer Special Delivery Instructions */}
              {packingSlipOrder.orderNotes && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs space-y-0.5">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block text-[10px] uppercase tracking-wider">
                    Special Delivery Instructions:
                  </span>
                  <p className="italic text-amber-950 dark:text-amber-100 text-xs">
                    &ldquo;{packingSlipOrder.orderNotes}&rdquo;
                  </p>
                </div>
              )}

              {/* Items Table with Calligraphy Notes */}
              <div className="border border-[#DDD5C7] dark:border-[#2E2723] rounded-xl overflow-hidden bg-white dark:bg-[#201B18]">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#DDD5C7] dark:border-[#2E2723] text-[#575048] dark:text-[#DCD5CB] bg-[#FAF7F2] dark:bg-[#1E1916] uppercase text-[10px] tracking-wider font-bold">
                      <th className="py-2.5 px-3">Item Description & Custom Calligraphy</th>
                      <th className="py-2.5 px-3 text-center w-14">Qty</th>
                      <th className="py-2.5 px-3 text-right w-24">Unit Price</th>
                      <th className="py-2.5 px-3 text-right w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE3D8] dark:divide-[#282320]">
                    {packingSlipOrder.items.map((item: any) => (
                      <tr key={item.id} className="hover:bg-[#FAF7F2]/50 dark:hover:bg-[#1E1916]/50 transition-colors">
                        <td className="py-3 px-3 space-y-1.5">
                          <p className="font-bold text-sm text-[#181513] dark:text-[#FAF8F5]">
                            {item.productTitle}
                          </p>
                          <div className="text-[11px] text-[#786F64] dark:text-[#A89F91] flex flex-wrap gap-2">
                            {item.customRecipientName && (
                              <span>Recipient: <strong className="text-[#181513] dark:text-[#FAF8F5]">{item.customRecipientName}</strong></span>
                            )}
                            {item.waxSealColor && (
                              <span>• Wax Seal: <strong className="text-[#181513] dark:text-[#FAF8F5]">{item.waxSealColor}</strong></span>
                            )}
                            {item.giftWrapOption && (
                              <span>• Wrap: <strong className="text-[#181513] dark:text-[#FAF8F5]">{item.giftWrapOption}</strong></span>
                            )}
                          </div>

                          {/* Custom calligraphy message */}
                          {item.customMessage && (
                            <div className="mt-2 p-2.5 bg-amber-50/90 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800/80 rounded-lg space-y-0.5">
                              <span className="font-bold uppercase tracking-wider text-[9.5px] text-[#A64732] dark:text-[#E07A5F] block">
                                Calligraphy Note to Handwrite:
                              </span>
                              <p className="font-serif italic text-xs text-[#2A231F] dark:text-[#F7F3EB]">
                                &ldquo;{item.customMessage}&rdquo;
                              </p>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center align-top font-bold text-[#181513] dark:text-[#FAF8F5]">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right align-top text-[#575048] dark:text-[#DCD5CB]">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-3 px-3 text-right align-top font-bold text-[#181513] dark:text-[#FAF8F5]">
                          {formatCurrency(Number(item.price) * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary */}
              <div className="pt-2 border-t border-[#DDD5C7] dark:border-[#2E2723] flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#786F64] dark:text-[#A89F91]">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-[#181513] dark:text-[#FAF8F5]">
                      {formatCurrency(packingSlipOrder.subtotal)}
                    </span>
                  </div>
                  {Number(packingSlipOrder.discountTotal) > 0 && (
                    <div className="flex justify-between text-red-600 dark:text-red-400">
                      <span>Discount Applied:</span>
                      <span className="font-semibold">-{formatCurrency(packingSlipOrder.discountTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#786F64] dark:text-[#A89F91]">
                    <span>Shipping Fee:</span>
                    <span className="font-semibold text-[#181513] dark:text-[#FAF8F5]">
                      {formatCurrency(packingSlipOrder.shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#181513] dark:text-[#FAF8F5] pt-1.5 border-t border-[#DDD5C7] dark:border-[#2E2723]">
                    <span>Final Total Paid:</span>
                    <span className="text-base text-[#A64732] dark:text-[#E07A5F]">
                      {formatCurrency(packingSlipOrder.finalTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer (Guaranteed Visible on All Phone Displays) */}
            <div className="shrink-0 p-3.5 sm:p-4 border-t border-[#DDD5C7] dark:border-[#2E2723] bg-white dark:bg-[#181412] flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
              <span className="text-xs text-[#786F64] dark:text-[#A89F91] italic text-center sm:text-left">
                Thank you for choosing handmade craftsmanship. Folded to cherish.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setPackingSlipOrder(null)}
                  className="px-4 py-2.5 border border-[#D0C5B4] dark:border-[#38322D] hover:bg-[#F2EDE4] dark:hover:bg-[#25211E] rounded-xl text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] transition-colors cursor-pointer"
                >
                  Close Slip
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-[#A64732] hover:bg-[#8D3825] dark:bg-[#E07A5F] dark:hover:bg-[#D46548] text-white dark:text-[#181513] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Reject Fake Payment / Cancel Order Modal */}
      <AdminModal
        isOpen={!!rejectModalOrder}
        onClose={() => setRejectModalOrder(null)}
        maxWidth="max-w-md"
      >
        {rejectModalOrder && (
          <div className="w-full bg-white dark:bg-[#181412] rounded-2xl border border-[#D0C5B4] dark:border-[#2E2723] shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
            {/* Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-[#EAE3D8] dark:border-[#2E2925] flex items-center justify-between bg-red-50/50 dark:bg-red-950/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                  <Ban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#181513] dark:text-[#FAF8F5]">
                    Reject Payment & Cancel Order
                  </h3>
                  <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                    Order #{rejectModalOrder.orderNumber} • {rejectModalOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto">
              {/* Payment Details Alert */}
              <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DDD5C7] dark:border-[#38322D] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#786F64] dark:text-[#A89F91]">Payment Method:</span>
                  <span className="font-bold text-[#181513] dark:text-[#FAF8F5]">{rejectModalOrder.paymentMethod}</span>
                </div>
                {rejectModalOrder.paymentRef && (
                  <div className="flex justify-between">
                    <span className="text-[#786F64] dark:text-[#A89F91]">Submitted UTR:</span>
                    <span className="font-mono font-bold text-red-600 dark:text-red-400">{rejectModalOrder.paymentRef}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#786F64] dark:text-[#A89F91]">Total Amount:</span>
                  <span className="font-bold text-[#181513] dark:text-[#FAF8F5]">{formatCurrency(rejectModalOrder.finalTotal)}</span>
                </div>
              </div>

              {/* Reason Selector */}
              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-2">
                  Select Reason for Rejection *
                </label>
                <div className="space-y-2">
                  {[
                    "Fake or Unverified UPI UTR",
                    "Payment Not Credited to Studio Account",
                    "Customer Unreachable / Invalid Contact",
                    "Spam / Duplicate Test Order",
                    "CUSTOM",
                  ].map((r) => (
                    <label
                      key={r}
                      onClick={() => setRejectReason(r)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        rejectReason === r
                          ? "border-red-500 bg-red-50/50 dark:bg-red-950/30 text-[#181513] dark:text-[#FAF8F5] font-semibold"
                          : "border-[#DDD5C7] dark:border-[#2E2925] hover:bg-stone-50 dark:hover:bg-stone-800/50 text-[#575048] dark:text-[#DCD5CB]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="rejectionReason"
                        checked={rejectReason === r}
                        onChange={() => setRejectReason(r)}
                        className="accent-red-600 w-3.5 h-3.5"
                      />
                      <span>{r === "CUSTOM" ? "Other Custom Reason (Type below)" : r}</span>
                    </label>
                  ))}
                </div>
              </div>

              {rejectReason === "CUSTOM" && (
                <div>
                  <textarea
                    value={customRejectReason}
                    onChange={(e) => setCustomRejectReason(e.target.value)}
                    placeholder="Enter specific reason for rejecting this order..."
                    rows={2}
                    className="w-full p-2.5 bg-white dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-xs text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-red-500"
                  />
                </div>
              )}

              {/* Automatic Restoration Guarantee Callout */}
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Automatic Restorations Applied Upon Rejection:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-emerald-900 dark:text-emerald-200">
                  <li>Product stock is returned back to available inventory.</li>
                  <li>Applied coupon quota is released & re-enabled if limit was hit.</li>
                  <li>Order marked as CANCELLED and payment marked as REJECTED.</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 p-3.5 sm:p-4 border-t border-[#EAE3D8] dark:border-[#2E2925] bg-[#FAF8F5] dark:bg-[#141210] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="px-4 py-2 border border-[#DDD5C7] dark:border-[#38322D] hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRejecting}
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isRejecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                <span>Confirm & Reject Order</span>
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Permanent Order Deletion Modal */}
      <AdminModal
        isOpen={!!deleteModalOrder}
        onClose={() => setDeleteModalOrder(null)}
        maxWidth="max-w-md"
      >
        {deleteModalOrder && (
          <div className="w-full bg-white dark:bg-[#181412] rounded-2xl border border-red-200 dark:border-red-900/60 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
            {/* Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-red-100 dark:border-red-950/60 flex items-center justify-between bg-red-50 dark:bg-red-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-red-900 dark:text-red-200">
                    Permanently Delete Order
                  </h3>
                  <p className="text-[11px] text-red-700 dark:text-red-300">
                    Irreversible database action
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalOrder(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 space-y-3.5 text-xs">
              <p className="text-[#181513] dark:text-[#FAF8F5] leading-relaxed">
                Are you sure you want to permanently delete order{" "}
                <strong className="font-mono text-red-600 dark:text-red-400">
                  #{deleteModalOrder.orderNumber}
                </strong>
                ?
              </p>

              <div className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1 text-[11px] text-stone-600 dark:text-stone-300">
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{deleteModalOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="text-stone-900 dark:text-stone-100">{deleteModalOrder.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{formatCurrency(deleteModalOrder.finalTotal)}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Permanent Deletion & Safety Restorations:</span>
                </p>
                <p className="text-[10.5px] leading-relaxed">
                  This record and all its associated line items will be purged from the database. If the order was active, inventory stock and any applied coupon quotas will be safely returned before deletion.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 p-3.5 sm:p-4 border-t border-[#EAE3D8] dark:border-[#2E2925] bg-[#FAF8F5] dark:bg-[#141210] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteModalOrder(null)}
                className="px-4 py-2 border border-[#DDD5C7] dark:border-[#38322D] hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl text-xs font-semibold text-[#181513] dark:text-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Permanently Delete Order</span>
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
