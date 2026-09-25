import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Package,
  Clock,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  IndianRupee,
  Scissors,
  Truck,
  CheckCircle2,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Tag,
  Users,
  Settings,
  HelpCircle,
  FileText,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    totalOrders,
    orders,
    totalProducts,
    lowStockProducts,
    recentOrders,
    topProducts,
    totalCustomers,
  ] = await Promise.all([
    db.order.count(),
    db.order.findMany({ select: { finalTotal: true, status: true } }),
    db.product.count(),
    db.product.findMany({
      where: { stock: { lte: 5 } },
      take: 3,
      orderBy: { stock: "asc" },
      include: { category: true },
    }),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    db.product.findMany({
      take: 3,
      orderBy: { isBestSeller: "desc" },
      include: {
        category: true,
        _count: { select: { orderItems: true } },
      },
    }),
    db.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.finalTotal), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Pipeline counts
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const confirmedCount = orders.filter((o) => o.status === "CONFIRMED").length;
  const craftingCount = orders.filter((o) => o.status === "HANDCRAFTING").length;
  const packedCount = orders.filter((o) => o.status === "PACKED").length;
  const shippedCount = orders.filter((o) => o.status === "SHIPPED").length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  const activeCraftingTotal = pendingCount + confirmedCount + craftingCount + packedCount;

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* Compact Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#D0C5B4] dark:border-[#2E2723]">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#A64732] dark:bg-[#E07A5F] animate-pulse shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5]">
                Studio Operations Overview
              </h1>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#A64732]/10 text-[#A64732] dark:text-[#E07A5F] font-bold uppercase tracking-wider">
                Live Atelier
              </span>
            </div>
            <p className="text-[10.5px] text-[#786F64] dark:text-[#A89F91]">
              Overview of active handcrafting queues, inventory levels, and customer dispatches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="px-2.5 py-1 rounded-lg border border-[#D0C5B4] dark:border-[#332A24] bg-white dark:bg-[#181412] text-[11px] font-semibold text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3 h-3 text-[#786F64] dark:text-[#A89F91]" />
          </Link>

          <Link
            href="/admin/dashboard/products/new"
            className="px-2.5 py-1 rounded-lg bg-[#A64732] text-white hover:bg-[#8D3825] dark:bg-[#E07A5F] dark:hover:bg-[#D46548] dark:text-[#181513] text-[11px] font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Add Gift</span>
          </Link>
        </div>
      </div>

      {/* 4 Key Metrics Cards (High Density) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Revenue */}
        <div className="bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#786F64] dark:text-[#A89F91]">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Revenue</span>
            <div className="w-5 h-5 rounded-full bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] flex items-center justify-center">
              <IndianRupee className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1">
            <div className="text-lg sm:text-xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5]">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-[10px] text-[#786F64] dark:text-[#A89F91] truncate">
              Avg {formatCurrency(avgOrderValue)} per order
            </p>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#786F64] dark:text-[#A89F91]">
            <span className="text-[10px] uppercase font-bold tracking-wider">Customer Orders</span>
            <div className="w-5 h-5 rounded-full bg-[#A64732]/10 text-[#A64732] dark:text-[#E07A5F] flex items-center justify-center">
              <ShoppingBag className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1">
            <div className="text-lg sm:text-xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5]">
              {totalOrders}
            </div>
            <p className="text-[10px] text-[#A64732] dark:text-[#E07A5F] font-semibold truncate">
              {activeCraftingTotal} active in queue
            </p>
          </div>
        </div>

        {/* Catalog */}
        <div className="bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#786F64] dark:text-[#A89F91]">
            <span className="text-[10px] uppercase font-bold tracking-wider">Catalog Gifts</span>
            <div className="w-5 h-5 rounded-full bg-[#EAE3D8] dark:bg-[#2E2925] text-[#181513] dark:text-[#FAF8F5] flex items-center justify-center">
              <Package className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1">
            <div className="text-lg sm:text-xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5]">
              {totalProducts}
            </div>
            <p className="text-[10px] text-[#786F64] dark:text-[#A89F91] truncate">
              {totalCustomers} registered patrons
            </p>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#786F64] dark:text-[#A89F91]">
            <span className="text-[10px] uppercase font-bold tracking-wider">Stock Alerts</span>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                lowStockProducts.length > 0
                  ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400"
                  : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1">
            <div
              className={`text-lg sm:text-xl font-bold tracking-tight ${
                lowStockProducts.length > 0
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {lowStockProducts.length}
            </div>
            <p className="text-[10px] text-[#786F64] dark:text-[#A89F91] truncate">
              {lowStockProducts.length > 0 ? "Items low in inventory" : "All products well stocked"}
            </p>
          </div>
        </div>
      </div>

      {/* Compact Order Fulfillment Pipeline */}
      <div className="bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] rounded-xl p-2 sm:p-2.5 shadow-2xs">
        <div className="flex items-center justify-between px-1.5 pb-2 mb-2 border-b border-[#EFE9DF] dark:border-[#25201C]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
              Order Fulfillment Pipeline
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#A64732]/10 text-[#A64732] dark:text-[#E07A5F] font-bold">
              {activeCraftingTotal} Active
            </span>
          </div>
          <Link
            href="/admin/dashboard/orders"
            className="text-[10.5px] font-semibold text-[#A64732] dark:text-[#E07A5F] hover:underline flex items-center gap-1"
          >
            <span>Fulfillment Board</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {/* Stage 1: Pending */}
          <Link
            href="/admin/dashboard/orders?status=PENDING"
            className="p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#DDD5C7] dark:border-[#2D2622] hover:border-[#A64732] dark:hover:border-[#E07A5F] transition-all group flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1 text-[9.5px] uppercase font-bold tracking-wider text-[#786F64] dark:text-[#A89F91]">
                <Clock className="w-3 h-3 group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F]" />
                <span>1. Pending</span>
              </div>
              <p className="text-[9px] text-[#786F64] dark:text-[#A89F91] mt-0.5">Payment check</p>
            </div>
            <span className="text-base font-black text-[#181513] dark:text-[#FAF8F5]">
              {pendingCount}
            </span>
          </Link>

          {/* Stage 2: Crafting */}
          <Link
            href="/admin/dashboard/orders?status=HANDCRAFTING"
            className="p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#DDD5C7] dark:border-[#2D2622] hover:border-[#A64732] dark:hover:border-[#E07A5F] transition-all group flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1 text-[9.5px] uppercase font-bold tracking-wider text-[#786F64] dark:text-[#A89F91]">
                <Scissors className="w-3 h-3 group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F]" />
                <span>2. Crafting</span>
              </div>
              <p className="text-[9px] text-[#786F64] dark:text-[#A89F91] mt-0.5">In production</p>
            </div>
            <span className="text-base font-black text-[#A64732] dark:text-[#E07A5F]">
              {craftingCount + confirmedCount}
            </span>
          </Link>

          {/* Stage 3: Packed */}
          <Link
            href="/admin/dashboard/orders?status=PACKED"
            className="p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#DDD5C7] dark:border-[#2D2622] hover:border-[#A64732] dark:hover:border-[#E07A5F] transition-all group flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1 text-[9.5px] uppercase font-bold tracking-wider text-[#786F64] dark:text-[#A89F91]">
                <Package className="w-3 h-3 group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F]" />
                <span>3. Packed</span>
              </div>
              <p className="text-[9px] text-[#786F64] dark:text-[#A89F91] mt-0.5">Ready for courier</p>
            </div>
            <span className="text-base font-black text-[#181513] dark:text-[#FAF8F5]">
              {packedCount}
            </span>
          </Link>

          {/* Stage 4: In Transit */}
          <Link
            href="/admin/dashboard/orders?status=SHIPPED"
            className="p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#DDD5C7] dark:border-[#2D2622] hover:border-[#A64732] dark:hover:border-[#E07A5F] transition-all group flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1 text-[9.5px] uppercase font-bold tracking-wider text-[#786F64] dark:text-[#A89F91]">
                <Truck className="w-3 h-3 group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F]" />
                <span>4. In Transit</span>
              </div>
              <p className="text-[9px] text-[#786F64] dark:text-[#A89F91] mt-0.5">Dispatched</p>
            </div>
            <span className="text-base font-black text-[#181513] dark:text-[#FAF8F5]">
              {shippedCount}
            </span>
          </Link>

          {/* Stage 5: Delivered */}
          <Link
            href="/admin/dashboard/orders?status=DELIVERED"
            className="p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#DDD5C7] dark:border-[#2D2622] hover:border-[#A64732] dark:hover:border-[#E07A5F] transition-all group flex items-center justify-between col-span-2 sm:col-span-1"
          >
            <div>
              <div className="flex items-center gap-1 text-[9.5px] uppercase font-bold tracking-wider text-[#786F64] dark:text-[#A89F91]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>5. Delivered</span>
              </div>
              <p className="text-[9px] text-[#786F64] dark:text-[#A89F91] mt-0.5">Completed</p>
            </div>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {deliveredCount}
            </span>
          </Link>
        </div>
      </div>

      {/* Main Split Content: Recent Orders (2 cols) & Right Column Alerts + Bestsellers (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Recent Orders (Left 2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between">
          <div>
            {/* Distinct Card Header */}
            <div className="bg-[#FAF7F2] dark:bg-[#1E1916] border-b border-[#D0C5B4] dark:border-[#2E2723] px-3.5 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                  Recent Customer Orders
                </span>
                <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                  (Latest {recentOrders.length})
                </span>
              </div>
              <Link
                href="/admin/dashboard/orders"
                className="text-[10.5px] font-semibold text-[#A64732] dark:text-[#E07A5F] hover:underline flex items-center gap-1"
              >
                <span>View All Orders</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Orders List Rows */}
            <div className="divide-y divide-[#EFE9DF] dark:divide-[#282320]">
              {recentOrders.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#786F64] dark:text-[#A89F91]">
                  No customer orders received yet.
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="px-3.5 py-2 flex items-center justify-between gap-3 hover:bg-[#FAF7F2] dark:hover:bg-[#1F1A17] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-[11px] font-bold text-[#181513] dark:text-[#FAF8F5] shrink-0">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : order.status === "HANDCRAFTING"
                            ? "bg-[#A64732]/10 text-[#A64732] dark:text-[#E07A5F]"
                            : "bg-[#EFE9DF] dark:bg-[#282320] text-[#181513] dark:text-[#FAF8F5]"
                        }`}
                      >
                        {order.status}
                      </span>
                      <div className="min-w-0 truncate">
                        <span className="text-xs font-semibold text-[#181513] dark:text-[#FAF8F5]">
                          {order.customerName}
                        </span>
                        <span className="text-[10px] text-[#786F64] dark:text-[#A89F91] ml-1.5 hidden sm:inline">
                          • {order.items.length} item(s)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="font-bold text-xs text-[#181513] dark:text-[#FAF8F5] block">
                          {formatCurrency(order.finalTotal)}
                        </span>
                        <span className="text-[9.5px] text-[#786F64] dark:text-[#A89F91] block">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <Link
                        href={`/admin/dashboard/orders?search=${order.orderNumber}`}
                        className="px-2 py-1 rounded-md border border-[#DDD5C7] dark:border-[#38322D] hover:border-[#181513] dark:hover:border-[#FAF8F5] text-[10.5px] font-semibold text-[#A64732] dark:text-[#E07A5F] flex items-center gap-0.5 transition-colors"
                      >
                        <span>Fulfill</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Footer inside Orders Card */}
          <div className="bg-[#FAF7F2] dark:bg-[#1E1916] border-t border-[#EFE9DF] dark:border-[#282320] px-3.5 py-1.5 flex items-center justify-between text-[10.5px] text-[#786F64] dark:text-[#A89F91]">
            <span>Total registered customers: {totalCustomers}</span>
            <Link
              href="/admin/dashboard/customers"
              className="font-semibold text-[#181513] dark:text-[#FAF8F5] hover:underline"
            >
              Customer Directory →
            </Link>
          </div>
        </div>

        {/* Right Column: Low Stock Alerts + Studio Bestsellers */}
        <div className="space-y-2.5 sm:space-y-3">
          {/* Low Stock Alerts Card */}
          <div className="bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-[#FAF7F2] dark:bg-[#1E1916] border-b border-[#D0C5B4] dark:border-[#2E2723] px-3 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Low Stock Warnings</span>
              </div>
              <Link
                href="/admin/dashboard/products"
                className="text-[10px] font-semibold text-[#A64732] dark:text-[#E07A5F] hover:underline"
              >
                Catalog
              </Link>
            </div>

            <div className="p-2 space-y-1.5">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-2.5 text-[11px] text-[#786F64] dark:text-[#A89F91]">
                  ✓ All products have healthy stock.
                </div>
              ) : (
                lowStockProducts.map((p) => {
                  let img = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80";
                  try {
                    const parsed = JSON.parse(p.images);
                    if (Array.isArray(parsed) && parsed[0]) img = parsed[0];
                  } catch {}

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-[#FAF7F2] dark:hover:bg-[#1F1A17] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative w-7 h-7 rounded-md overflow-hidden shrink-0 bg-[#EAE3D8]">
                          <Image src={img} alt={p.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] font-bold text-[#181513] dark:text-[#FAF8F5] truncate">
                            {p.title}
                          </h4>
                          <span className="text-[9px] text-[#786F64] dark:text-[#A89F91]">
                            {p.category?.name || "Handcrafted"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-bold text-red-600 dark:text-red-400 block">
                          {p.stock} left
                        </span>
                        <Link
                          href={`/admin/dashboard/products/${p.id}`}
                          className="text-[9.5px] font-semibold text-[#A64732] dark:text-[#E07A5F] hover:underline"
                        >
                          Restock
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Studio Bestsellers Card */}
          <div className="bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-[#FAF7F2] dark:bg-[#1E1916] border-b border-[#D0C5B4] dark:border-[#2E2723] px-3 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5]">
                <Sparkles className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
                <span>Studio Bestsellers</span>
              </div>
              <Link
                href="/admin/dashboard/products"
                className="text-[10px] font-semibold text-[#A64732] dark:text-[#E07A5F] hover:underline"
              >
                All Gifts
              </Link>
            </div>

            <div className="p-2 space-y-1.5">
              {topProducts.map((p) => {
                let img = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80";
                try {
                  const parsed = JSON.parse(p.images);
                  if (Array.isArray(parsed) && parsed[0]) img = parsed[0];
                } catch {}

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-[#FAF7F2] dark:hover:bg-[#1F1A17] transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative w-7 h-7 rounded-md overflow-hidden shrink-0 bg-[#EAE3D8]">
                        <Image src={img} alt={p.title} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-bold text-[#181513] dark:text-[#FAF8F5] truncate">
                          {p.title}
                        </h4>
                        <span className="text-[9px] text-[#786F64] dark:text-[#A89F91]">
                          {formatCurrency(p.price)}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/catalog/${p.slug}`}
                      target="_blank"
                      className="p-1 text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
                      title="View on storefront"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Staff User Interface Guide (Friendly Quick Navigation for Non-Technical Team) */}
      <div className="bg-white dark:bg-[#181412] border border-[#D0C5B4] dark:border-[#2E2723] rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#EFE9DF] dark:border-[#25201C] pb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#A64732] dark:bg-[#E07A5F] text-white flex items-center justify-center text-xs font-bold">
              ?
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-[#181513] dark:text-[#FAF8F5]">
                Studio Admin Navigation Guide
              </h3>
              <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                Simple summary of what each section does so anyone on the team can manage the atelier.
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF7F2] dark:bg-[#201B18] border border-[#DDD5C7] dark:border-[#2E2723] text-[#786F64] dark:text-[#A89F91] font-medium hidden sm:inline-block">
            Quick Cheatsheet
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          {/* Order Fulfillment */}
          <Link
            href="/admin/dashboard/orders"
            className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#DDD5C7] dark:border-[#2D2622] hover:border-[#A64732] dark:hover:border-[#E07A5F] transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
              <span className="font-bold text-[#181513] dark:text-[#FAF8F5] group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F]">
                Order Fulfillment
              </span>
            </div>
            <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] leading-relaxed">
              Review custom calligraphy notes, advance orders from crafting to packed, and print clean packing slips.
            </p>
          </Link>

          {/* Catalog Creations */}
          <Link
            href="/admin/dashboard/products"
            className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#DDD5C7] dark:border-[#2D2622] hover:border-[#A64732] dark:hover:border-[#E07A5F] transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
              <span className="font-bold text-[#181513] dark:text-[#FAF8F5] group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F]">
                Catalog Creations
              </span>
            </div>
            <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] leading-relaxed">
              Update physical stock (+ / -), feature items on the homepage, or publish new handmade gifts.
            </p>
          </Link>

          {/* Collections & Tags */}
          <Link
            href="/admin/dashboard/categories"
            className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#DDD5C7] dark:border-[#2D2622] hover:border-[#A64732] dark:hover:border-[#E07A5F] transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
              <span className="font-bold text-[#181513] dark:text-[#FAF8F5] group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F]">
                Collections & Tags
              </span>
            </div>
            <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] leading-relaxed">
              Manage store categories and subcategories so customers can easily browse gifts.
            </p>
          </Link>

          {/* Coupons & Promos */}
          <Link
            href="/admin/dashboard/coupons"
            className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#DDD5C7] dark:border-[#2D2622] hover:border-[#A64732] dark:hover:border-[#E07A5F] transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
              <span className="font-bold text-[#181513] dark:text-[#FAF8F5] group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F]">
                Coupons & Promos
              </span>
            </div>
            <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] leading-relaxed">
              Create discount promo codes (% off or ₹ flat off) and toggle them active or saved as draft.
            </p>
          </Link>

          {/* Customer Directory */}
          <Link
            href="/admin/dashboard/customers"
            className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#DDD5C7] dark:border-[#2D2622] hover:border-[#A64732] dark:hover:border-[#E07A5F] transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
              <span className="font-bold text-[#181513] dark:text-[#FAF8F5] group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F]">
                Customer Directory
              </span>
            </div>
            <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] leading-relaxed">
              Look up buyers, copy shipping labels for couriers with 1 click, or start a WhatsApp chat.
            </p>
          </Link>

          {/* Studio Settings */}
          <Link
            href="/admin/dashboard/settings"
            className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1916] border border-[#DDD5C7] dark:border-[#2D2622] hover:border-[#A64732] dark:hover:border-[#E07A5F] transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Settings className="w-3.5 h-3.5 text-[#A64732] dark:text-[#E07A5F]" />
              <span className="font-bold text-[#181513] dark:text-[#FAF8F5] group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F]">
                Studio Settings
              </span>
            </div>
            <p className="text-[11px] text-[#786F64] dark:text-[#A89F91] leading-relaxed">
              Customize studio phone number, support email, studio address, and brand story details.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
