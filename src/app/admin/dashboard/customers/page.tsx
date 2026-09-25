"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Calendar,
  IndianRupee,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Ban,
  AlertTriangle,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AdminModal } from "@/components/admin/AdminModal";

interface OrderSummary {
  id: string;
  orderNumber: string;
  finalTotal: number;
  status: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  emailVerified: boolean;
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  statusReason: string | null;
  statusUpdatedAt: string | null;
  joinedAt: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
  recentOrders: OrderSummary[];
}

interface StatusCounts {
  all: number;
  active: number;
  suspended: number;
  banned: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [counts, setCounts] = useState<StatusCounts>({ all: 0, active: 0, suspended: 0, banned: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED" | "BANNED">("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Moderation Action Modal State
  const [moderatingCustomer, setModeratingCustomer] = useState<Customer | null>(null);
  const [moderationAction, setModerationAction] = useState<"SUSPEND" | "BAN" | "ACTIVATE">("SUSPEND");
  const [moderationReason, setModerationReason] = useState("");
  const [moderationLoading, setModerationLoading] = useState(false);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch {
      console.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: "ALL" | "ACTIVE" | "SUSPENDED" | "BANNED") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open moderation modal for Suspend, Ban, or Reactivate
  const openModerationModal = (customer: Customer, action: "SUSPEND" | "BAN" | "ACTIVATE") => {
    setModeratingCustomer(customer);
    setModerationAction(action);
    setModerationReason(
      action === "SUSPEND"
        ? "Suspended pending contact verification / policy check"
        : action === "BAN"
        ? "Fraudulent activity or severe policy violation"
        : ""
    );
  };

  const submitModerationAction = async () => {
    if (!moderatingCustomer) return;
    setModerationLoading(true);

    const targetStatus =
      moderationAction === "SUSPEND"
        ? "SUSPENDED"
        : moderationAction === "BAN"
        ? "BANNED"
        : "ACTIVE";

    try {
      const res = await fetch("/api/admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: moderatingCustomer.id,
          status: targetStatus,
          reason: targetStatus === "ACTIVE" ? null : moderationReason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionSuccessToast(
          `${moderatingCustomer.name || "Customer"} has been ${
            targetStatus === "ACTIVE" ? "reactivated" : targetStatus.toLowerCase()
          }.`
        );
        setTimeout(() => setActionSuccessToast(null), 4000);

        // Update selected customer if profile modal is currently open
        if (selectedCustomer && selectedCustomer.id === moderatingCustomer.id) {
          setSelectedCustomer({
            ...selectedCustomer,
            status: targetStatus,
            statusReason: targetStatus === "ACTIVE" ? null : moderationReason.trim(),
            statusUpdatedAt: new Date().toISOString(),
          });
        }

        setModeratingCustomer(null);
        fetchCustomers();
      } else {
        alert(data.error || "Failed to update customer status.");
      }
    } catch {
      alert("Network error while updating customer status.");
    } finally {
      setModerationLoading(false);
    }
  };

  // Metrics calculations
  const totalPatrons = customers.length;
  const repeatPatrons = customers.filter((c) => c.orderCount > 1).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const activeBuyers = customers.filter((c) => c.orderCount > 0).length;

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(totalPatrons / pageSize));
  const paginatedCustomers = customers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startIndex = totalPatrons === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalPatrons);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      {actionSuccessToast && (
        <div className="fixed top-4 right-4 z-[120] bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionSuccessToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-[#1C1816] p-4 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>Patron Directory</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-bold">
            Studio Customers & Patrons
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-0.5">
            Manage customer accounts, monitor orders, suspend or ban problematic accounts, and contact patrons.
          </p>
        </div>

        <button
          onClick={() => fetchCustomers()}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-sm font-medium cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-[#1C1816] p-3.5 sm:p-4 rounded-xl border border-stone-200 dark:border-stone-800">
          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Total Registered</p>
          <p className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 mt-0.5">
            {counts.all || totalPatrons}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1C1816] p-3.5 sm:p-4 rounded-xl border border-stone-200 dark:border-stone-800">
          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Active Patrons</p>
          <p className="text-xl sm:text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-0.5">
            {counts.active}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1C1816] p-3.5 sm:p-4 rounded-xl border border-stone-200 dark:border-stone-800">
          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>Suspended</span>
          </p>
          <p className="text-xl sm:text-2xl font-bold font-serif text-amber-600 dark:text-amber-400 mt-0.5">
            {counts.suspended}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1C1816] p-3.5 sm:p-4 rounded-xl border border-stone-200 dark:border-stone-800">
          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <span>Permanently Banned</span>
          </p>
          <p className="text-xl sm:text-2xl font-bold font-serif text-rose-600 dark:text-rose-400 mt-0.5">
            {counts.banned}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter Tabs (Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => handleStatusFilterChange("ALL")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] shadow-xs"
                : "bg-white dark:bg-[#1C1816] text-[#575048] dark:text-[#DCD5CB] border border-stone-200 dark:border-stone-800 hover:border-[#181513] dark:hover:border-[#FAF8F5]"
            }`}
          >
            All Patrons ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilterChange("ACTIVE")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "ACTIVE"
                ? "bg-emerald-700 text-white dark:bg-emerald-600 shadow-xs"
                : "bg-white dark:bg-[#1C1816] text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Active ({counts.active})</span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilterChange("SUSPENDED")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "SUSPENDED"
                ? "bg-amber-600 text-white dark:bg-amber-600 shadow-xs"
                : "bg-white dark:bg-[#1C1816] text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/20"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Suspended ({counts.suspended})</span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilterChange("BANNED")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "BANNED"
                ? "bg-rose-700 text-white dark:bg-rose-700 shadow-xs"
                : "bg-white dark:bg-[#1C1816] text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Banned ({counts.banned})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, phone, email, or city..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-[#1C1816] border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-stone-900 dark:text-stone-100 shadow-xs"
          />
        </div>
      </div>

      {/* Customers List / Table */}
      {loading ? (
        <div className="p-12 text-center text-xs font-medium uppercase tracking-widest text-stone-400 bg-white dark:bg-[#1C1816] rounded-2xl border border-stone-200 dark:border-stone-800">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
          <span>Consulting patron records...</span>
        </div>
      ) : customers.length === 0 ? (
        <div className="p-12 bg-white dark:bg-[#1C1816] border border-stone-200 dark:border-stone-800 rounded-2xl text-center space-y-2">
          <p className="font-serif text-lg text-stone-700 dark:text-stone-300">
            {statusFilter === "BANNED"
              ? "No permanently banned customers found."
              : statusFilter === "SUSPENDED"
              ? "No suspended customers found."
              : "No patrons found matching your search."}
          </p>
          <p className="text-xs text-stone-400">
            {searchQuery
              ? "Try searching with a different keyword, name, or phone number."
              : "All patrons currently have normal standing."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-[#1C1816] rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Patron</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Contact Details</th>
                  <th className="py-3.5 px-5">Location</th>
                  <th className="py-3.5 px-5 text-center">Orders</th>
                  <th className="py-3.5 px-5 text-right">Lifetime Spend</th>
                  <th className="py-3.5 px-5 text-right">Moderation & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {paginatedCustomers.map((c) => {
                  const initials = c.name
                    ? c.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "P";

                  const isSuspended = c.status === "SUSPENDED";
                  const isBanned = c.status === "BANNED";

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-stone-50/60 dark:hover:bg-stone-900/40 transition-colors ${
                        isBanned
                          ? "bg-rose-50/30 dark:bg-rose-950/10"
                          : isSuspended
                          ? "bg-amber-50/30 dark:bg-amber-950/10"
                          : ""
                      }`}
                    >
                      {/* Name & Joined */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                              isBanned
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                : isSuspended
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <button
                              onClick={() => setSelectedCustomer(c)}
                              className="font-medium text-stone-900 dark:text-stone-100 hover:text-primary transition-colors text-left font-serif"
                            >
                              {c.name || "Anonymous Patron"}
                            </button>
                            <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>Joined {formatDate(c.joinedAt)}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Account Status Pill */}
                      <td className="py-4 px-5">
                        {isBanned ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              <Ban className="w-3 h-3" />
                              <span>BANNED</span>
                            </span>
                            {c.statusReason && (
                              <p className="text-[10px] text-rose-600 dark:text-rose-400 line-clamp-1 max-w-[150px]">
                                {c.statusReason}
                              </p>
                            )}
                          </div>
                        ) : isSuspended ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              <AlertTriangle className="w-3 h-3" />
                              <span>SUSPENDED</span>
                            </span>
                            {c.statusReason && (
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 line-clamp-1 max-w-[150px]">
                                {c.statusReason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>ACTIVE</span>
                          </span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5 text-xs">
                          <p className="text-stone-700 dark:text-stone-300 flex items-center gap-1.5 font-mono">
                            <Mail className="w-3 h-3 text-stone-400" />
                            <span>{c.email}</span>
                          </p>
                          {c.phone && (
                            <p className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5 font-mono">
                              <Phone className="w-3 h-3 text-stone-400" />
                              <span>{c.phone}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-5">
                        <div className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{[c.city, c.state].filter(Boolean).join(", ") || "India"}</span>
                        </div>
                      </td>

                      {/* Orders */}
                      <td className="py-4 px-5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            c.orderCount > 1
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                              : c.orderCount === 1
                              ? "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                              : "bg-stone-50 text-stone-400 dark:bg-stone-900"
                          }`}
                        >
                          {c.orderCount} {c.orderCount === 1 ? "order" : "orders"}
                        </span>
                      </td>

                      {/* Lifetime Spend */}
                      <td className="py-4 px-5 text-right font-medium text-stone-900 dark:text-stone-100 font-mono">
                        {formatCurrency(c.totalSpent)}
                      </td>

                      {/* Actions & Moderation */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Chat button */}
                          {c.phone && (
                            <a
                              href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Hello ${c.name || "valued customer"}, this is M.E-Commerce!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}

                          {/* Quick Moderation Controls */}
                          {isBanned || isSuspended ? (
                            <button
                              type="button"
                              onClick={() => openModerationModal(c, "ACTIVATE")}
                              className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Reactivate Account"
                            >
                              <Unlock className="w-3 h-3" />
                              <span>Reactivate</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openModerationModal(c, "SUSPEND")}
                              className="px-2 py-1 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Suspend Customer"
                            >
                              <Lock className="w-3 h-3" />
                              <span>Suspend</span>
                            </button>
                          )}

                          {!isBanned && (
                            <button
                              type="button"
                              onClick={() => openModerationModal(c, "BAN")}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Permanently Ban Customer"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(c)}
                            className="p-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                            title="View Patron Profile"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Enhanced & Touch-Friendly) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {paginatedCustomers.map((c) => {
              const initials = c.name
                ? c.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "P";

              const isSuspended = c.status === "SUSPENDED";
              const isBanned = c.status === "BANNED";

              return (
                <div
                  key={c.id}
                  className={`bg-white dark:bg-[#1C1816] rounded-2xl border p-4 space-y-3 shadow-xs ${
                    isBanned
                      ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10"
                      : isSuspended
                      ? "border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10"
                      : "border-stone-200 dark:border-stone-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm shrink-0 ${
                          isBanned
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            : isSuspended
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {initials}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                          {c.name || "Anonymous Patron"}
                        </h4>
                        <p className="text-[11px] text-stone-400">
                          Joined {formatDate(c.joinedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isBanned ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 flex items-center gap-1">
                          <Ban className="w-2.5 h-2.5" />
                          <span>BANNED</span>
                        </span>
                      ) : isSuspended ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>SUSPENDED</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Reason Banner if moderated */}
                  {(isSuspended || isBanned) && c.statusReason && (
                    <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-900/80 text-[11px] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800">
                      <span className="font-bold">Reason:</span> {c.statusReason}
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs text-stone-600 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800/80 pt-2.5">
                    <p className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </p>
                    {c.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{c.phone}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{[c.city, c.state].filter(Boolean).join(", ") || "India"}</span>
                    </p>
                  </div>

                  {/* Spend & Order Summary */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100 dark:border-stone-800/80">
                    <span className="text-stone-500">
                      Orders: <strong className="text-stone-900 dark:text-stone-100">{c.orderCount}</strong>
                    </span>
                    <span className="text-stone-500">
                      Spend:{" "}
                      <strong className="font-mono text-stone-900 dark:text-stone-100">
                        {formatCurrency(c.totalSpent)}
                      </strong>
                    </span>
                  </div>

                  {/* Footer Actions (Easy Tap Targets) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800/80">
                    {/* Moderation Action Button */}
                    <div className="flex items-center gap-1.5">
                      {isBanned || isSuspended ? (
                        <button
                          type="button"
                          onClick={() => openModerationModal(c, "ACTIVATE")}
                          className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Reactivate</span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => openModerationModal(c, "SUSPEND")}
                            className="px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-amber-200 dark:border-amber-800"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Suspend</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openModerationModal(c, "BAN")}
                            className="p-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-lg border border-rose-200 dark:border-rose-900"
                            title="Ban Customer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {c.phone && (
                        <a
                          href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Hello ${c.name || "valued customer"}, this is M.E-Commerce!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg text-xs font-medium flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-3 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPatrons > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs text-stone-500 dark:text-stone-400">
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  Showing <strong className="text-stone-900 dark:text-stone-100">{startIndex}</strong> -{" "}
                  <strong className="text-stone-900 dark:text-stone-100">{endIndex}</strong> of{" "}
                  <strong className="text-stone-900 dark:text-stone-100">{totalPatrons}</strong> patrons
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
        </>
      )}

      {/* MODERATION ACTION MODAL (SUSPEND / BAN / REACTIVATE) */}
      <AdminModal
        isOpen={!!moderatingCustomer}
        onClose={() => !moderationLoading && setModeratingCustomer(null)}
        maxWidth="max-w-md"
      >
        {moderatingCustomer && (
          <div className="bg-white dark:bg-[#1C1816] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl w-full overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white ${
                    moderationAction === "BAN"
                      ? "bg-rose-600"
                      : moderationAction === "SUSPEND"
                      ? "bg-amber-600"
                      : "bg-emerald-600"
                  }`}
                >
                  {moderationAction === "BAN" ? (
                    <Ban className="w-4 h-4" />
                  ) : moderationAction === "SUSPEND" ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Unlock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base">
                    {moderationAction === "BAN"
                      ? "Permanently Ban Patron"
                      : moderationAction === "SUSPEND"
                      ? "Suspend Patron Account"
                      : "Reactivate Patron Account"}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {moderatingCustomer.name || "Customer"} ({moderatingCustomer.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModeratingCustomer(null)}
                disabled={moderationLoading}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {moderationAction === "BAN" ? (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Permanent Ban Notice</span>
                  </p>
                  <p>
                    Banning this customer prevents them from logging in, accessing past orders, and completing checkout at the store.
                  </p>
                </div>
              ) : moderationAction === "SUSPEND" ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Temporary Suspension</span>
                  </p>
                  <p>
                    Suspended customers are temporarily barred from logging in or placing new orders until reactivated by an artisan admin.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Account Restoration</span>
                  </p>
                  <p>
                    Reactivating will restore full access for {moderatingCustomer.name || "this patron"} to place orders and manage their account.
                  </p>
                </div>
              )}

              {moderationAction !== "ACTIVATE" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Reason for {moderationAction === "BAN" ? "Ban" : "Suspension"} *
                  </label>
                  <textarea
                    rows={3}
                    value={moderationReason}
                    onChange={(e) => setModerationReason(e.target.value)}
                    placeholder="Enter reason or policy citation..."
                    className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />

                  {/* Preset quick reasons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      "Unverified UPI / Fake UTR",
                      "Abusive conduct to artisan",
                      "Chargeback / Payment Dispute",
                      "Suspicious duplicate account",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setModerationReason(preset)}
                        className="px-2 py-0.5 rounded-full text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModeratingCustomer(null)}
                disabled={moderationLoading}
                className="px-4 py-2 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitModerationAction}
                disabled={moderationLoading}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer ${
                  moderationAction === "BAN"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : moderationAction === "SUSPEND"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {moderationLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {moderationAction === "BAN"
                    ? "Confirm Permanent Ban"
                    : moderationAction === "SUSPEND"
                    ? "Confirm Suspension"
                    : "Confirm Reactivation"}
                </span>
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Patron Profile Modal */}
      <AdminModal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        maxWidth="max-w-lg"
      >
        {selectedCustomer && (
          <div className="bg-white dark:bg-[#1C1816] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl w-full overflow-hidden flex flex-col max-h-[90dvh]">
            {/* Sticky Modal Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-[#1C1816]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm font-serif ${
                    selectedCustomer.status === "BANNED"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      : selectedCustomer.status === "SUSPENDED"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {selectedCustomer.name
                    ? selectedCustomer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "P"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base sm:text-lg">
                      {selectedCustomer.name || "Anonymous Patron"}
                    </h3>
                    {selectedCustomer.status === "BANNED" ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                        BANNED
                      </span>
                    ) : selectedCustomer.status === "SUSPENDED" ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                        SUSPENDED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400">
                    Patron since {formatDate(selectedCustomer.joinedAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                aria-label="Close patron details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4">
              {/* Account Standing & Moderation Action Box */}
              <div
                className={`p-3.5 rounded-xl border space-y-2.5 ${
                  selectedCustomer.status === "BANNED"
                    ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                    : selectedCustomer.status === "SUSPENDED"
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                    : "bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                      Account Standing & Access
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedCustomer.status === "BANNED"
                        ? "bg-rose-600 text-white"
                        : selectedCustomer.status === "SUSPENDED"
                        ? "bg-amber-600 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {selectedCustomer.status}
                  </span>
                </div>

                {selectedCustomer.statusReason && (
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    <strong className="text-stone-800 dark:text-stone-200">Logged Reason:</strong>{" "}
                    {selectedCustomer.statusReason}
                  </p>
                )}

                {selectedCustomer.statusUpdatedAt && (
                  <p className="text-[10px] text-stone-400">
                    Last status change: {formatDate(selectedCustomer.statusUpdatedAt)}
                  </p>
                )}

                {/* Moderation Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-200 dark:border-stone-800/80">
                  {selectedCustomer.status !== "ACTIVE" ? (
                    <button
                      type="button"
                      onClick={() => openModerationModal(selectedCustomer, "ACTIVATE")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Reactivate Account</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openModerationModal(selectedCustomer, "SUSPEND")}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Suspend Account</span>
                    </button>
                  )}

                  {selectedCustomer.status !== "BANNED" && (
                    <button
                      type="button"
                      onClick={() => openModerationModal(selectedCustomer, "BAN")}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Permanently Ban</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Stat Pills */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800">
                  <p className="text-[11px] text-stone-500 font-medium">Lifetime Purchases</p>
                  <p className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 mt-0.5">
                    {selectedCustomer.orderCount} {selectedCustomer.orderCount === 1 ? "order" : "orders"}
                  </p>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800">
                  <p className="text-[11px] text-stone-500 font-medium">Lifetime Spend</p>
                  <p className="text-lg font-bold font-mono text-primary mt-0.5">
                    {formatCurrency(selectedCustomer.totalSpent)}
                  </p>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="p-4 bg-stone-50/80 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
                <p className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Contact & Shipping Details
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email:
                  </span>
                  <span className="font-mono text-stone-900 dark:text-stone-100 select-all font-medium">
                    {selectedCustomer.email}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone:
                  </span>
                  <span className="font-mono text-stone-900 dark:text-stone-100 font-medium">
                    {selectedCustomer.phone || "Not provided"}
                  </span>
                </div>

                <div className="flex items-start justify-between pt-1 border-t border-stone-200/60 dark:border-stone-800">
                  <span className="text-stone-600 dark:text-stone-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" /> Address:
                  </span>
                  <div className="text-right text-stone-900 dark:text-stone-100 max-w-[240px]">
                    <p className="font-medium">{selectedCustomer.address || "No street address provided"}</p>
                    <p className="text-stone-500 dark:text-stone-400">
                      {[selectedCustomer.city, selectedCustomer.state, selectedCustomer.postalCode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>

                {selectedCustomer.address && (
                  <div className="pt-2 text-right">
                    <button
                      onClick={() =>
                        handleCopy(
                          `${selectedCustomer.name}\n${selectedCustomer.phone || ""}\n${
                            selectedCustomer.address
                          }\n${[
                            selectedCustomer.city,
                            selectedCustomer.state,
                            selectedCustomer.postalCode,
                          ]
                            .filter(Boolean)
                            .join(", ")}`,
                          "address"
                        )
                      }
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium cursor-pointer"
                    >
                      {copiedId === "address" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied Address!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Shipping Label</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Orders List */}
              <div>
                <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                  <span>Recent Purchases</span>
                </p>

                {selectedCustomer.recentOrders && selectedCustomer.recentOrders.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomer.recentOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-mono font-bold text-stone-900 dark:text-stone-100">
                            #{ord.orderNumber}
                          </p>
                          <p className="text-[11px] text-stone-400">{formatDate(ord.createdAt)}</p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <span className="font-bold font-mono text-stone-900 dark:text-stone-100">
                            {formatCurrency(ord.finalTotal)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic py-2">
                    This patron has not completed any orders yet.
                  </p>
                )}
              </div>
            </div>

            {/* Sticky Modal Footer with Visible Close Button */}
            <div className="shrink-0 p-3.5 sm:p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Close Profile
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/dashboard/orders"
                  className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 transition-colors"
                >
                  <span>Orders</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                {selectedCustomer.phone && (
                  <a
                    href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Hello ${selectedCustomer.name || "valued customer"}, this is M.E-Commerce!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Note</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
