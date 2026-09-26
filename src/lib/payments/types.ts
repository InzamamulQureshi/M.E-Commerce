export type PaymentGatewayId = "RAZORPAY" | "STRIPE" | "UPI_QR" | "COD";

export interface CreatePaymentOrderParams {
  orderId: string;
  orderNumber: string;
  amount: number; // in standard currency units (e.g. INR Rupees)
  currency: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  notes?: Record<string, string>;
}

export interface PaymentOrderResult {
  success: boolean;
  provider: PaymentGatewayId;
  providerOrderId?: string;
  amount?: number; // In smallest currency unit (e.g., paise for INR) or standard units
  currency?: string;
  keyId?: string; // Public key for frontend SDK (e.g. Razorpay Key ID)
  clientSecret?: string; // For Stripe PaymentIntents
  error?: string;
}

export interface VerifyPaymentParams {
  orderId: string;
  providerOrderId: string;
  providerPaymentId: string;
  signature?: string;
}

export interface VerifyPaymentResult {
  verified: boolean;
  paymentId?: string;
  error?: string;
}

export interface PaymentProvider {
  readonly id: PaymentGatewayId;
  readonly name: string;
  isConfigured(): boolean;
  getPublicKey(): string | null;
  createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult>;
}
