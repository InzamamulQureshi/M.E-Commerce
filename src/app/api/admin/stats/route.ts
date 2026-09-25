import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    const [
      totalOrders,
      revenueAggregate,
      activeOrders,
      totalProducts,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      db.order.count(),
      db.order.aggregate({
        _sum: { finalTotal: true },
        where: { status: { not: "CANCELLED" } },
      }),
      db.order.count({
        where: { status: { in: ["PENDING", "CONFIRMED", "HANDCRAFTING", "PACKED", "SHIPPED"] } },
      }),
      db.product.count(),
      db.product.count({
        where: { stock: { lte: 5 } },
      }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
    ]);

    const totalRevenue = Number(revenueAggregate._sum.finalTotal || 0);

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      activeOrders,
      totalProducts,
      lowStockProducts,
      recentOrders,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
