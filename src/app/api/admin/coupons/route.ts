import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession, checkDemoAdminMutation } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET all promo coupons
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ coupons });
  } catch (error: any) {
    console.error("Fetch coupons error:", error);
    return NextResponse.json({ error: "Failed to load coupons" }, { status: 500 });
  }
}

// POST create a new promo coupon
export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  const demoGuard = checkDemoAdminMutation(admin);
  if (demoGuard) return demoGuard;

  try {
    const body = await request.json();
    const {
      code,
      discountPercent,
      discountAmount,
      minOrderAmount,
      maxDiscountAmount,
      targetAudience = "ALL",
      targetUserId,
      targetUserEmail,
      minOrderCount = 0,
      usageLimit,
      isActive = true,
      expiresAt,
    } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "Coupon promo code is required." }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();

    // Check if code already exists
    const existing = await db.coupon.findUnique({
      where: { code: cleanCode },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Coupon code "${cleanCode}" already exists. Please choose a unique code.` },
        { status: 400 }
      );
    }

    if (!discountPercent && !discountAmount) {
      return NextResponse.json(
        { error: "Please provide either a discount percentage or a flat discount amount." },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.create({
      data: {
        code: cleanCode,
        discountPercent: discountPercent ? Number(discountPercent) : null,
        discountAmount: discountAmount ? Number(discountAmount) : null,
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        targetAudience: String(targetAudience),
        targetUserId: targetUserId?.trim() || null,
        targetUserEmail: targetUserEmail?.trim().toLowerCase() || null,
        minOrderCount: minOrderCount ? Number(minOrderCount) : 0,
        usageLimit: usageLimit !== undefined && usageLimit !== null && usageLimit !== "" ? Number(usageLimit) : null,
        usedCount: 0,
        isActive: Boolean(isActive),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("Create coupon error:", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

// PUT update coupon status or details
export async function PUT(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  const demoGuard = checkDemoAdminMutation(admin);
  if (demoGuard) return demoGuard;

  try {
    const body = await request.json();
    const {
      id,
      code,
      discountPercent,
      discountAmount,
      minOrderAmount,
      maxDiscountAmount,
      targetAudience,
      targetUserId,
      targetUserEmail,
      minOrderCount,
      usageLimit,
      isActive,
      expiresAt,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    const current = await db.coupon.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (code !== undefined) updateData.code = code.toUpperCase().trim();
    if (discountPercent !== undefined) updateData.discountPercent = discountPercent ? Number(discountPercent) : null;
    if (discountAmount !== undefined) updateData.discountAmount = discountAmount ? Number(discountAmount) : null;
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount ? Number(minOrderAmount) : null;
    if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
    if (targetAudience !== undefined) updateData.targetAudience = String(targetAudience);
    if (targetUserId !== undefined) updateData.targetUserId = targetUserId?.trim() || null;
    if (targetUserEmail !== undefined) updateData.targetUserEmail = targetUserEmail?.trim().toLowerCase() || null;
    if (minOrderCount !== undefined) updateData.minOrderCount = minOrderCount ? Number(minOrderCount) : 0;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

    if (usageLimit !== undefined) {
      const parsedLimit = usageLimit !== null && usageLimit !== "" ? Number(usageLimit) : null;
      updateData.usageLimit = parsedLimit;
      // If admin expanded usage quota beyond usedCount, re-enable coupon automatically
      if (parsedLimit !== null && parsedLimit > current.usedCount && !current.isActive) {
        updateData.isActive = true;
      }
    }

    const coupon = await db.coupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("Update coupon error:", error);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

// DELETE coupon
export async function DELETE(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  const demoGuard = checkDemoAdminMutation(admin);
  if (demoGuard) return demoGuard;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    await db.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error: any) {
    console.error("Delete coupon error:", error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
