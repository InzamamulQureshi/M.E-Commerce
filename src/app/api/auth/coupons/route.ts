import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionUser();

  try {
    const allActive = await db.coupon.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    let orderCount = 0;
    if (session?.id) {
      orderCount = await db.order.count({
        where: { userId: session.id, status: { not: "CANCELLED" } },
      });
    }

    // Filter coupons that apply to this user
    const eligible = allActive.filter((c) => {
      // Check quota
      if (c.usageLimit !== null && c.usedCount >= c.usageLimit) {
        return false;
      }

      if (c.targetAudience === "SPECIFIC_USER") {
        if (!session) return false;
        const matchesId = c.targetUserId && c.targetUserId === session.id;
        const matchesEmail =
          c.targetUserEmail &&
          session.email &&
          c.targetUserEmail.toLowerCase().trim() === session.email.toLowerCase().trim();
        return matchesId || matchesEmail;
      }

      if (c.targetAudience === "NEW_CUSTOMERS") {
        return orderCount === 0;
      }

      if (c.targetAudience === "REPEAT_CUSTOMERS") {
        return orderCount >= (c.minOrderCount || 1);
      }

      return true; // "ALL"
    });

    return NextResponse.json({
      coupons: eligible.map((c) => ({
        id: c.id,
        code: c.code,
        discountPercent: c.discountPercent,
        discountAmount: c.discountAmount ? Number(c.discountAmount) : null,
        minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
        maxDiscountAmount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : null,
        targetAudience: c.targetAudience,
        expiresAt: c.expiresAt,
        isPersonalized: c.targetAudience === "SPECIFIC_USER",
      })),
    });
  } catch (error: any) {
    console.error("Fetch customer coupons error:", error);
    return NextResponse.json({ error: "Failed to load coupons" }, { status: 500 });
  }
}
