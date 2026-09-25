import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { extractRejectionReason } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const order = await db.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const sessionUser = await getSessionUser();
    const isOwner = sessionUser && (sessionUser.id === order.userId || sessionUser.role === "ADMIN");

    // If not authenticated owner, securely mask personal data while returning delivery status
    if (!isOwner) {
      const maskedEmail = order.customerEmail.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + "*".repeat(Math.max(b.length, 3)));
      const maskedPhone = order.customerPhone.length > 4 
        ? "*".repeat(order.customerPhone.length - 4) + order.customerPhone.slice(-4)
        : "******";

      return NextResponse.json({
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          createdAt: order.createdAt,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          courierName: order.courierName,
          trackingNumber: order.trackingNumber,
          customerName: order.customerName,
          customerEmail: maskedEmail,
          customerPhone: maskedPhone,
          city: order.city,
          state: order.state,
          postalCode: order.postalCode,
          shippingAddress: "Secure delivery address",
          finalTotal: order.finalTotal,
          orderNotes: order.orderNotes,
          rejectionReason: extractRejectionReason(order.orderNotes),
          items: order.items.map((item) => ({
            id: item.id,
            productTitle: item.productTitle,
            quantity: item.quantity,
            price: item.price,
            waxSealColor: item.waxSealColor,
            giftWrapOption: item.giftWrapOption,
            customRecipientName: item.customRecipientName,
          })),
        },
      });
    }

    return NextResponse.json({
      order: {
        ...order,
        rejectionReason: extractRejectionReason(order.orderNotes),
      },
    });
  } catch (error: any) {
    console.error("Fetch order detail error:", error);
    return NextResponse.json(
      { error: "Failed to load order" },
      { status: 500 }
    );
  }
}
