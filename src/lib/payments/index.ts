import { PaymentGatewayId, PaymentProvider } from "./types";
import { razorpayProvider } from "./razorpay";
import { stripeProvider } from "./stripe";

export * from "./types";
export { razorpayProvider } from "./razorpay";
export { stripeProvider } from "./stripe";

const providers: Record<string, PaymentProvider> = {
  RAZORPAY: razorpayProvider,
  STRIPE: stripeProvider,
};

export function getPaymentProvider(id: PaymentGatewayId): PaymentProvider | null {
  return providers[id] || null;
}

export function isRazorpayConfigured(): boolean {
  return razorpayProvider.isConfigured();
}

export function isStripeConfigured(): boolean {
  return stripeProvider.isConfigured();
}

export function getAvailableGateways() {
  return {
    razorpay: {
      enabled: isRazorpayConfigured(),
      keyId: razorpayProvider.getPublicKey(),
      name: "Razorpay",
      description: "Credit / Debit Cards, UPI, Netbanking, & Wallets",
    },
    stripe: {
      enabled: isStripeConfigured(),
      keyId: stripeProvider.getPublicKey(),
      name: "Stripe",
      description: "International Cards & Digital Wallets",
    },
  };
}
