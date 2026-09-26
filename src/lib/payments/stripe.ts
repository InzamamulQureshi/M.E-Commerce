import {
  PaymentProvider,
  PaymentGatewayId,
  CreatePaymentOrderParams,
  PaymentOrderResult,
  VerifyPaymentParams,
  VerifyPaymentResult,
} from "./types";

export class StripeProvider implements PaymentProvider {
  readonly id: PaymentGatewayId = "STRIPE";
  readonly name = "Stripe";

  private getPublishableKey(): string | null {
    return (
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ||
      process.env.STRIPE_PUBLISHABLE_KEY?.trim() ||
      null
    );
  }

  private getSecretKey(): string | null {
    return process.env.STRIPE_SECRET_KEY?.trim() || null;
  }

  isConfigured(): boolean {
    const pub = this.getPublishableKey();
    const sec = this.getSecretKey();
    return Boolean(pub && sec && pub.startsWith("pk_") && sec.startsWith("sk_"));
  }

  getPublicKey(): string | null {
    return this.getPublishableKey();
  }

  async createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.id,
        error: "Stripe is not configured. Missing STRIPE_SECRET_KEY or NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
      };
    }

    try {
      // Future Stripe PaymentIntent or Checkout Session creation hook
      // When 'stripe' package is activated, initialize Stripe with secret key and create PaymentIntent.
      return {
        success: true,
        provider: this.id,
        amount: Math.round(params.amount * 100),
        currency: params.currency.toLowerCase(),
        keyId: this.getPublishableKey() || undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        provider: this.id,
        error: error?.message || "Failed to create Stripe payment intent.",
      };
    }
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    if (!this.isConfigured()) {
      return {
        verified: false,
        error: "Stripe is not configured.",
      };
    }

    // Stripe webhook or payment_intent retrieval verification stub
    return {
      verified: Boolean(params.providerPaymentId),
      paymentId: params.providerPaymentId,
    };
  }
}

export const stripeProvider = new StripeProvider();
