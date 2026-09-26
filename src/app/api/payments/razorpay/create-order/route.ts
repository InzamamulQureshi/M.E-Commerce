import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { razorpayProvider } from "@/lib/payments/razorpay";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to initiate payment." },
        { status: 401 }
      );
    }

    if (!razorpayProvider.isConfigured()) {
      return NextResponse.json(
        { error: "Razorpay payment gateway is not configured on this server." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized order access." }, { status: 403 });
    }

    if (order.paymentStatus === "CONFIRMED") {
      return NextResponse.json(
        { error: "This order has already been paid for and confirmed." },
        { status: 400 }
      );
    }

    // Call modular razorpay provider
    const paymentResult = await razorpayProvider.createOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: Number(order.finalTotal),
      currency: "INR",
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
    });

    if (!paymentResult.success || !paymentResult.providerOrderId) {
      return NextResponse.json(
        { error: paymentResult.error || "Failed to create Razorpay payment order." },
        { status: 500 }
      );
    }

    // Update order with razorpayOrderId
    await db.order.update({
      where: { id: order.id },
      data: {
        razorpayOrderId: paymentResult.providerOrderId,
        paymentMethod: "RAZORPAY",
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: paymentResult.providerOrderId,
      keyId: paymentResult.keyId,
      amount: paymentResult.amount, // in paise
      currency: paymentResult.currency || "INR",
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
    });
  } catch (error: any) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to initiate Razorpay checkout." },
      { status: 500 }
    );
  }
}
