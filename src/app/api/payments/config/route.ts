import { NextResponse } from "next/server";
import { isRazorpayConfigured, isStripeConfigured, razorpayProvider, stripeProvider } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function GET() {
  const razorpayEnabled = isRazorpayConfigured();
  const stripeEnabled = isStripeConfigured();

  return NextResponse.json({
    razorpay: {
      enabled: razorpayEnabled,
      keyId: razorpayEnabled ? razorpayProvider.getPublicKey() : null,
    },
    stripe: {
      enabled: stripeEnabled,
      publishableKey: stripeEnabled ? stripeProvider.getPublicKey() : null,
    },
  });
}
