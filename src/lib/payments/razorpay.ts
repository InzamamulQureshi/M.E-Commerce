import crypto from "crypto";
import Razorpay from "razorpay";
import {
  PaymentProvider,
  PaymentGatewayId,
  CreatePaymentOrderParams,
  PaymentOrderResult,
  VerifyPaymentParams,
  VerifyPaymentResult,
} from "./types";

export class RazorpayProvider implements PaymentProvider {
  readonly id: PaymentGatewayId = "RAZORPAY";
  readonly name = "Razorpay";

  private getKeyId(): string | null {
    return (
      process.env.RAZORPAY_KEY_ID?.trim() ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ||
      null
    );
  }

  private getKeySecret(): string | null {
    return (
      process.env.RAZORPAY_KEY_SECRET?.trim() ||
      process.env.RAZORPAY_SECRET_KEY?.trim() ||
      null
    );
  }

  isConfigured(): boolean {
    const keyId = this.getKeyId();
    const keySecret = this.getKeySecret();
    return Boolean(keyId && keySecret && keyId.length > 3 && keySecret.length > 3);
  }

  getPublicKey(): string | null {
    return this.getKeyId();
  }

  private getInstance(): Razorpay | null {
    const keyId = this.getKeyId();
    const keySecret = this.getKeySecret();
    if (!keyId || !keySecret) return null;
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.id,
        error: "Razorpay is not configured. Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET.",
      };
    }

    try {
      const razorpay = this.getInstance();
      if (!razorpay) throw new Error("Razorpay instance could not be initialized");

      // Razorpay expects amount in smallest currency subunit (e.g., paise for INR)
      const amountInSubunits = Math.round(params.amount * 100);

      const options = {
        amount: amountInSubunits,
        currency: params.currency || "INR",
        receipt: params.orderNumber.slice(-40), // Razorpay receipt max length 40 chars
        notes: {
          orderId: params.orderId,
          orderNumber: params.orderNumber,
          customerEmail: params.customer.email,
          ...(params.notes || {}),
        },
      };

      const order = await razorpay.orders.create(options);

      return {
        success: true,
        provider: this.id,
        providerOrderId: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        keyId: this.getKeyId() || undefined,
      };
    } catch (error: any) {
      console.error("[Razorpay Provider] Order creation failed:", error);
      return {
        success: false,
        provider: this.id,
        error: error?.message || "Failed to create Razorpay payment order.",
      };
    }
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    if (!this.isConfigured()) {
      return {
        verified: false,
        error: "Razorpay is not configured. Cannot verify payment signature.",
      };
    }

    const keySecret = this.getKeySecret();
    if (!keySecret) {
      return {
        verified: false,
        error: "Razorpay secret key is missing.",
      };
    }

    const { providerOrderId, providerPaymentId, signature } = params;

    if (!providerOrderId || !providerPaymentId || !signature) {
      return {
        verified: false,
        error: "Missing required payment verification parameters.",
      };
    }

    try {
      // Razorpay signature formula: HMAC-SHA256(order_id + "|" + payment_id, secret)
      const payload = `${providerOrderId}|${providerPaymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(payload)
        .digest("hex");

      const isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "utf-8"),
        Buffer.from(signature, "utf-8")
      );

      if (!isSignatureValid) {
        return {
          verified: false,
          error: "Invalid Razorpay payment signature.",
        };
      }

      return {
        verified: true,
        paymentId: providerPaymentId,
      };
    } catch (error: any) {
      console.error("[Razorpay Provider] Signature verification error:", error);
      return {
        verified: false,
        error: error?.message || "Signature verification failed.",
      };
    }
  }
}

export const razorpayProvider = new RazorpayProvider();
