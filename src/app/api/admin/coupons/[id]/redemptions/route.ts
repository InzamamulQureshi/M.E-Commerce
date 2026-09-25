import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    const coupon = await db.coupon.findUnique({
      where: { id: params.id },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const orders = await db.order.findMany({
      where: { couponCode: coupon.code },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        subtotal: true,
        discountTotal: true,
        finalTotal: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productTitle: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    const totalSavingsGiven = orders.reduce(
      (sum, o) => sum + Number(o.discountTotal || 0),
      0
    );

    return NextResponse.json({
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount: coupon.discountAmount ? Number(coupon.discountAmount) : null,
        maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        isActive: coupon.isActive,
        targetAudience: coupon.targetAudience,
        targetUserEmail: coupon.targetUserEmail,
        createdAt: coupon.createdAt,
      },
      redemptions: orders,
      totalRedemptions: orders.length,
      totalSavingsGiven,
      summary: {
        totalRedemptions: orders.length,
        totalDiscountGiven: totalSavingsGiven,
      },
    });
  } catch (error: any) {
    console.error("Fetch coupon redemptions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon redemption tracking data" },
      { status: 500 }
    );
  }
}
