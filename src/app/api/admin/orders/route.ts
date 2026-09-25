import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET all orders with dynamic status filter and full text search
export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim() || searchParams.get("q")?.trim() || "";
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  const where: any = {};
  if (status && status !== "ALL") {
    where.status = status as OrderStatus;
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customerName: { contains: search } },
      { customerEmail: { contains: search } },
      { customerPhone: { contains: search } },
      { trackingNumber: { contains: search } },
      { courierName: { contains: search } },
      { city: { contains: search } },
    ];
  }

  try {
    const total = await db.order.count({ where });

    let skip: number | undefined = undefined;
    let take: number | undefined = undefined;
    let page = 1;
    let limit = 0;
    let totalPages = 1;

    if (limitParam) {
      limit = Math.max(1, parseInt(limitParam, 10) || 10);
      page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
      totalPages = Math.max(1, Math.ceil(total / limit));
      if (page > totalPages && totalPages > 0) {
        page = totalPages;
      }
      skip = (page - 1) * limit;
      take = limit;
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: true,
                price: true,
              },
            },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      orders,
      total,
      page,
      limit: limit || total,
      totalPages,
    });
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}

// PUT update order status, payment status, tracking details, or reject fake payment
export async function PUT(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, action, rejectionReason, status, trackingNumber, courierName, paymentStatus, orderNotes } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const existingOrder = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: any = {};

    // Check if this action is rejecting or cancelling an active order
    const isRejecting = action === "REJECT";
    const isCancelling = status === "CANCELLED" || isRejecting;

    const order = await db.$transaction(async (tx) => {
      if (isCancelling && existingOrder.status !== OrderStatus.CANCELLED) {
        // 1. Restore product inventory stock
        for (const item of existingOrder.items) {
          if (item.productId) {
            try {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            } catch (e) {
              console.error(`Failed to restore stock for product ${item.productId}:`, e);
            }
          }
        }

        // 2. Restore coupon quota & re-enable if auto-disabled
        if (existingOrder.couponCode) {
          try {
            const coupon = await tx.coupon.findUnique({
              where: { code: existingOrder.couponCode },
            });
            if (coupon) {
              const newUsedCount = Math.max(0, coupon.usedCount - 1);
              const shouldReactivate =
                !coupon.isActive &&
                (!coupon.usageLimit || newUsedCount < coupon.usageLimit);

              await tx.coupon.update({
                where: { id: coupon.id },
                data: {
                  usedCount: newUsedCount,
                  ...(shouldReactivate ? { isActive: true } : {}),
                },
              });
            }
          } catch (e) {
            console.error(`Failed to restore coupon ${existingOrder.couponCode}:`, e);
          }
        }
      }

      if (isRejecting) {
        updateData.status = OrderStatus.CANCELLED;
        updateData.paymentStatus = "REJECTED";
        const reasonText = rejectionReason?.trim() || "Fake / Unverified Payment Details";
        const auditNote = `[REJECTED: ${reasonText} on ${new Date().toISOString().slice(0, 10)}]`;
        updateData.orderNotes = existingOrder.orderNotes
          ? `${existingOrder.orderNotes}\n${auditNote}`
          : auditNote;
      } else {
        if (status) updateData.status = status as OrderStatus;
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
        if (courierName !== undefined) updateData.courierName = courierName;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (orderNotes !== undefined) updateData.orderNotes = orderNotes;
      }

      return tx.order.update({
        where: { id },
        data: updateData,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  images: true,
                  price: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      order,
      message: isRejecting
        ? "Order rejected, payment marked fraudulent/rejected, and stock restored."
        : "Order updated successfully",
    });
  } catch (error: any) {
    console.error("Admin update order error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

// DELETE permanently delete an order (with stock & coupon restoration)
export async function DELETE(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Execute stock restoration, coupon restoration, and order deletion in atomic transaction
    await db.$transaction(async (tx) => {
      // If order was not already cancelled, restore product stock & coupon usage
      if (order.status !== OrderStatus.CANCELLED) {
        // 1. Restore product inventory stock
        for (const item of order.items) {
          if (item.productId) {
            try {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            } catch (e) {
              console.error(`Failed to restore stock for deleted product ${item.productId}:`, e);
            }
          }
        }

        // 2. Restore coupon quota & re-enable if auto-disabled
        if (order.couponCode) {
          try {
            const coupon = await tx.coupon.findUnique({
              where: { code: order.couponCode },
            });
            if (coupon) {
              const newUsedCount = Math.max(0, coupon.usedCount - 1);
              const shouldReactivate =
                !coupon.isActive &&
                (!coupon.usageLimit || newUsedCount < coupon.usageLimit);

              await tx.coupon.update({
                where: { id: coupon.id },
                data: {
                  usedCount: newUsedCount,
                  ...(shouldReactivate ? { isActive: true } : {}),
                },
              });
            }
          } catch (e) {
            console.error(`Failed to restore coupon for deleted order ${order.couponCode}:`, e);
          }
        }
      }

      // Delete order (cascades to orderItem)
      await tx.order.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Order #${order.orderNumber} was permanently deleted and inventory was restored.`,
    });
  } catch (error: any) {
    console.error("Admin delete order error:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
