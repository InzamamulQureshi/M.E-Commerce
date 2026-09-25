import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { code, cartTotal = 0, email } = await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: "Coupon promo code is required" },
        { status: 400 }
      );
    }

    const cleanCode = code.toUpperCase().trim();
    const coupon = await db.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { error: "Invalid or inactive promo code" },
        { status: 404 }
      );
    }

    // Check Expiration
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This promo code has expired." },
        { status: 400 }
      );
    }

    // Check Usage Quota / Limit
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "This promo code has reached its maximum redemption quota and is no longer active." },
        { status: 400 }
      );
    }

    // Check Minimum Order Spend
    if (coupon.minOrderAmount && cartTotal < Number(coupon.minOrderAmount)) {
      return NextResponse.json(
        {
          error: `This coupon requires a minimum cart value of ₹${coupon.minOrderAmount}.`,
        },
        { status: 400 }
      );
    }

    // Check Target Audience (New Users vs Repeat Patrons vs Specific User)
    const sessionUser = await getSessionUser();
    const customerEmail = email || sessionUser?.email;

    if (coupon.targetAudience === "SPECIFIC_USER") {
      const isTargetUser =
        (coupon.targetUserId && sessionUser?.id === coupon.targetUserId) ||
        (coupon.targetUserEmail &&
          ((customerEmail && customerEmail.toLowerCase().trim() === coupon.targetUserEmail.toLowerCase().trim()) ||
           (sessionUser?.email && sessionUser.email.toLowerCase().trim() === coupon.targetUserEmail.toLowerCase().trim())));

      if (!isTargetUser) {
        return NextResponse.json(
          {
            error: "This exclusive discount is reserved for a specific studio recipient.",
          },
          { status: 403 }
        );
      }
    } else if (coupon.targetAudience === "NEW_CUSTOMERS") {
      let previousOrdersCount = 0;
      if (sessionUser?.id) {
        previousOrdersCount = await db.order.count({
          where: { userId: sessionUser.id, status: { not: "CANCELLED" } },
        });
      } else if (customerEmail) {
        previousOrdersCount = await db.order.count({
          where: { customerEmail: customerEmail.toLowerCase().trim(), status: { not: "CANCELLED" } },
        });
      }

      if (previousOrdersCount > 0) {
        return NextResponse.json(
          {
            error: "This welcome promo code is reserved exclusively for first-time patrons.",
          },
          { status: 400 }
        );
      }
    } else if (coupon.targetAudience === "REPEAT_CUSTOMERS") {
      const requiredOrders = coupon.minOrderCount || 1;
      let previousOrdersCount = 0;

      if (sessionUser?.id) {
        previousOrdersCount = await db.order.count({
          where: { userId: sessionUser.id, status: { not: "CANCELLED" } },
        });
      } else if (customerEmail) {
        previousOrdersCount = await db.order.count({
          where: { customerEmail: customerEmail.toLowerCase().trim(), status: { not: "CANCELLED" } },
        });
      } else {
        return NextResponse.json(
          {
            error: `This VIP discount is reserved for loyal patrons with at least ${requiredOrders} previous orders. Please sign in to your account first.`,
          },
          { status: 400 }
        );
      }

      if (previousOrdersCount < requiredOrders) {
        return NextResponse.json(
          {
            error: `This VIP discount is reserved for loyal patrons with at least ${requiredOrders} completed orders. You currently have ${previousOrdersCount}.`,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount: coupon.discountAmount ? Number(coupon.discountAmount) : null,
        maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
      },
    });
  } catch (error: any) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
