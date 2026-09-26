import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";
import { razorpayProvider } from "@/lib/payments/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to verify payment." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Missing required Razorpay verification credentials." },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized order verification." }, { status: 403 });
    }

    // Verify HMAC-SHA256 signature using modular provider
    const verification = await razorpayProvider.verifyPayment({
      orderId,
      providerOrderId: razorpayOrderId,
      providerPaymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: verification.error || "Payment signature verification failed." },
        { status: 400 }
      );
    }

    // Update order status to CONFIRMED
    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CONFIRMED,
        paymentStatus: "CONFIRMED",
        razorpayPaymentId,
        razorpaySignature,
      },
      include: {
        items: true,
      },
    });

    // Send React Email order confirmation (falls back safely if email key is unset)
    sendOrderConfirmationEmail({
      email: updatedOrder.customerEmail,
      customerName: updatedOrder.customerName,
      orderNumber: updatedOrder.orderNumber,
      items: updatedOrder.items.map((i) => ({
        productTitle: i.productTitle,
        quantity: i.quantity,
        price: Number(i.price),
      })),
      subtotal: Number(updatedOrder.subtotal),
      discountTotal: Number(updatedOrder.discountTotal),
      shippingFee: Number(updatedOrder.shippingFee),
      finalTotal: Number(updatedOrder.finalTotal),
      paymentMethod: "Razorpay (Online)",
      paymentStatus: "CONFIRMED",
      shippingAddress: updatedOrder.shippingAddress,
      city: updatedOrder.city || undefined,
      state: updatedOrder.state || undefined,
      postalCode: updatedOrder.postalCode || undefined,
    }).catch((err) => console.error("Email send background error:", err));

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
    });
  } catch (error: any) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to complete payment verification." },
      { status: 500 }
    );
  }
}
