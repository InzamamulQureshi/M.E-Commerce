import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { OrderStatus, PaymentMethod } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in or create an account to complete your order." },
        { status: 401 }
      );
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { status: true, statusReason: true },
    });

    if (dbUser?.status === "BANNED") {
      return NextResponse.json(
        { error: "Your account is permanently banned from placing orders." },
        { status: 403 }
      );
    }
    if (dbUser?.status === "SUSPENDED") {
      return NextResponse.json(
        {
          error:
            "Your account is currently suspended from placing orders." +
            (dbUser.statusReason ? ` Reason: ${dbUser.statusReason}.` : "") +
            " Please contact studio support.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      state,
      postalCode,
      items,
      couponCode,
      paymentMethod = "UPI_QR",
      paymentRef,
      orderNotes,
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Please fill in all required contact and shipping details." },
        { status: 400 }
      );
    }

    // Verify Payment Acceptance based on Studio Settings
    const studioSetting = await db.studioSetting.findUnique({ where: { id: "default" } });
    const enableUpi = studioSetting?.enableUpi ?? true;
    let enableCod = studioSetting?.enableCod ?? true;
    if (!enableUpi && !enableCod) enableCod = true; // Safe fallback

    if (paymentMethod === "UPI_QR" && !enableUpi) {
      return NextResponse.json(
        { error: "UPI QR payments are currently disabled. Please checkout using Cash on Delivery (COD)." },
        { status: 400 }
      );
    }
    if (paymentMethod === "COD" && !enableCod) {
      return NextResponse.json(
        { error: "Cash on Delivery is currently disabled. Please checkout using UPI QR Transfer." },
        { status: 400 }
      );
    }

    // Validate 12-digit numeric UTR for UPI payments
    if (paymentMethod === "UPI_QR") {
      const cleanUtr = paymentRef ? String(paymentRef).trim() : "";
      if (!cleanUtr || !/^\d{12}$/.test(cleanUtr)) {
        return NextResponse.json(
          { error: "Please enter a valid 12-digit numeric UPI transaction ID (UTR)." },
          { status: 400 }
        );
      }
    }

    // Determine initial payment and order status
    let paymentStatus = "PENDING";
    let orderStatus: OrderStatus = OrderStatus.PENDING;

    if (paymentMethod === "UPI_QR") {
      paymentStatus = "PENDING_VERIFICATION";
      orderStatus = OrderStatus.PENDING;
    } else if (paymentMethod === "COD") {
      paymentStatus = "PENDING";
      orderStatus = OrderStatus.PENDING;
    } else if (paymentMethod === "ONLINE_CARD") {
      paymentStatus = "CONFIRMED";
      orderStatus = OrderStatus.CONFIRMED;
    }

    // Batch fetch all required products in a single database query
    const productIds = items.map((i: any) => i.productId).filter(Boolean);
    const dbProducts = await db.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Calculate subtotal with strictly enforced database pricing (preventing client price tampering)
    let subtotal = 0;
    const verifiedItems: any[] = [];

    // Aggregate requested quantities per product to validate stock availability
    const productQuantities: Record<string, number> = {};
    for (const item of items) {
      if (!item.productId) continue;
      productQuantities[item.productId] =
        (productQuantities[item.productId] || 0) + (Number(item.quantity) || 1);
    }

    // Verify stock availability before proceeding
    for (const prodId of Object.keys(productQuantities)) {
      const reqQty = productQuantities[prodId];
      const product = productMap.get(prodId);
      if (!product) {
        return NextResponse.json(
          { error: "One or more selected creations are no longer available." },
          { status: 400 }
        );
      }

      if (product.stock <= 0) {
        return NextResponse.json(
          { error: `"${product.title}" is currently out of stock.` },
          { status: 400 }
        );
      }

      if (product.stock < reqQty) {
        return NextResponse.json(
          {
            error: `Only ${product.stock} ${
              product.stock === 1 ? "unit" : "units"
            } available for "${product.title}". Please adjust your quantity.`,
          },
          { status: 400 }
        );
      }
    }

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product "${item.title || item.productTitle || "Selected creation"}" is no longer available.` },
          { status: 400 }
        );
      }

      const itemPrice = Number(product.price);
      subtotal += itemPrice * item.quantity;

      verifiedItems.push({
        productId: product.id,
        productTitle: product.title,
        price: itemPrice,
        quantity: item.quantity,
        selectedImage: item.selectedImage || item.image || null,
        customRecipientName: item.customRecipientName || null,
        customMessage: item.customMessage || null,
        waxSealColor: item.waxSealColor || null,
        giftWrapOption: item.giftWrapOption || null,
      });
    }

    // Coupon discount calculation with strict verification & maxDiscountAmount capping
    let discountTotal = 0;
    let appliedCoupon: any = null;
    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (coupon && coupon.isActive) {
        // 1. Expiration check
        const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
        // 2. Usage quota check
        const isQuotaReached =
          coupon.usageLimit !== null &&
          coupon.usageLimit !== undefined &&
          coupon.usedCount >= coupon.usageLimit;
        // 3. Minimum order amount check
        const isMinOrderValid =
          !coupon.minOrderAmount || subtotal >= Number(coupon.minOrderAmount);

        // 4. Audience eligibility check
        let isAudienceValid = true;
        if (coupon.targetAudience === "SPECIFIC_USER") {
          const userEmailClean = customerEmail.toLowerCase().trim();
          const matchesEmail =
            coupon.targetUserEmail &&
            coupon.targetUserEmail.toLowerCase().trim() === userEmailClean;
          const matchesId = coupon.targetUserId && coupon.targetUserId === user.id;
          isAudienceValid = Boolean(matchesEmail || matchesId);
        } else if (coupon.targetAudience === "NEW_CUSTOMERS") {
          const priorCount = await db.order.count({
            where: {
              OR: [
                { userId: user.id },
                { customerEmail: customerEmail.toLowerCase().trim() },
              ],
              status: { not: "CANCELLED" },
            },
          });
          isAudienceValid = priorCount === 0;
        } else if (coupon.targetAudience === "REPEAT_CUSTOMERS") {
          const minOrders = coupon.minOrderCount || 1;
          const priorCount = await db.order.count({
            where: {
              OR: [
                { userId: user.id },
                { customerEmail: customerEmail.toLowerCase().trim() },
              ],
              status: { not: "CANCELLED" },
            },
          });
          isAudienceValid = priorCount >= minOrders;
        }

        if (!isExpired && !isQuotaReached && isMinOrderValid && isAudienceValid) {
          if (coupon.discountPercent) {
            discountTotal = Math.round((subtotal * coupon.discountPercent) / 100);
            // CRITICAL: Strictly cap discountTotal by maxDiscountAmount if configured
            if (coupon.maxDiscountAmount && Number(coupon.maxDiscountAmount) > 0) {
              discountTotal = Math.min(discountTotal, Number(coupon.maxDiscountAmount));
            }
          } else if (coupon.discountAmount) {
            discountTotal = Math.min(Number(coupon.discountAmount), subtotal);
          }
          appliedCoupon = coupon;
        }
      }
    }

    const freeThreshold = studioSetting?.freeShippingThreshold ?? 999;
    const stdFee = studioSetting?.standardShippingFee ?? 79;
    const shippingFee = subtotal >= freeThreshold || subtotal === 0 ? 0 : stdFee;
    const finalTotal = Math.max(0, subtotal - discountTotal + shippingFee);

    // Collision-resistant unique order number: FF-<timestamp-base36>-<rand4>
    const timestamp = Date.now().toString(36).toUpperCase();
    const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `FF-${timestamp}-${randSuffix}`;

    // Execute order creation, stock deduction, coupon count, and user sync in an atomic transaction
    const order = await db.$transaction(async (tx) => {
      // 1. Create Order and OrderItems
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          customerName: customerName.trim(),
          customerEmail: customerEmail.toLowerCase().trim(),
          customerPhone: customerPhone.trim(),
          shippingAddress: shippingAddress.trim(),
          city: city?.trim() || "",
          state: state?.trim() || "",
          postalCode: postalCode?.trim() || "",
          subtotal,
          discountTotal,
          shippingFee,
          finalTotal,
          status: orderStatus,
          paymentMethod: paymentMethod as PaymentMethod,
          paymentStatus,
          paymentRef: paymentRef || null,
          orderNotes: orderNotes || null,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          items: {
            create: verifiedItems,
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Decrement inventory stock atomically, ensuring stock never drops below 0
      for (const item of verifiedItems) {
        const currentProd = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, title: true, stock: true },
        });

        if (!currentProd || currentProd.stock < item.quantity) {
          throw new Error(
            `"${currentProd?.title || "Item"}" no longer has sufficient stock available.`
          );
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // 3. Increment coupon usage and auto-disable if quota is hit
      if (appliedCoupon) {
        const newCount = (appliedCoupon.usedCount || 0) + 1;
        const reachedLimit = appliedCoupon.usageLimit && newCount >= appliedCoupon.usageLimit;
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: {
            usedCount: { increment: 1 },
            ...(reachedLimit ? { isActive: false } : {}),
          },
        });
      }

      // 4. Update default phone and shipping address on user profile
      try {
        await tx.user.update({
          where: { id: user.id },
          data: {
            phone: customerPhone.trim(),
            address: shippingAddress.trim(),
            city: city?.trim() || null,
            state: state?.trim() || null,
            postalCode: postalCode?.trim() || null,
          },
        });
      } catch {
        // Non-fatal if user update fails
      }

      return createdOrder;
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      finalTotal: order.finalTotal,
      order,
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create order. Please try again." },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Please log in to view your orders." },
        { status: 401 }
      );
    }

    const orders = await db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 }
    );
  }
}
