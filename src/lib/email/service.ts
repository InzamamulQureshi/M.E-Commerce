import { Resend } from "resend";
import { VerificationCodeEmail } from "@/components/emails/VerificationCodeEmail";
import { OrderConfirmationEmail } from "@/components/emails/OrderConfirmationEmail";

export function getEmailApiKey(): string | null {
  const key =
    process.env.RESEND_API_KEY?.trim() ||
    process.env.REACT_EMAIL_SECRET_KEY?.trim() ||
    null;

  if (!key || key === "" || key === "your-resend-api-key" || key === "none") {
    return null;
  }
  return key;
}

export function isEmailConfigured(): boolean {
  return getEmailApiKey() !== null;
}

export function getEmailFromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    "M.E-Commerce <onboarding@resend.dev>"
  );
}

export interface SendVerificationEmailParams {
  email: string;
  code: string;
  userName?: string;
  storeName?: string;
}

export async function sendVerificationEmail({
  email,
  code,
  userName,
  storeName = "M.E-Commerce",
}: SendVerificationEmailParams): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const apiKey = getEmailApiKey();

  // Graceful fallback to console / devCode if secret key is empty or not provided
  if (!apiKey) {
    console.log(
      `[React Email: Fallback Mode] 💌 Verification code for ${email}: ${code} (No RESEND_API_KEY/REACT_EMAIL_SECRET_KEY configured)`
    );
    return {
      success: true,
      simulated: true,
    };
  }

  try {
    const resend = new Resend(apiKey);
    const from = getEmailFromAddress();

    const result = await resend.emails.send({
      from,
      to: [email],
      subject: `${code} is your ${storeName} verification code`,
      react: VerificationCodeEmail({
        code,
        userName,
        storeName,
      }),
    });

    if (result.error) {
      console.warn("[React Email] Resend API error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("[React Email] Failed to send verification email:", error);
    // Graceful fallback on unexpected transport failure
    return { success: false, error: error?.message || "Failed to dispatch email." };
  }
}

export interface SendOrderConfirmationParams {
  email: string;
  customerName: string;
  orderNumber: string;
  items: Array<{
    productTitle: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  finalTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  city?: string;
  state?: string;
  postalCode?: string;
  storeName?: string;
}

export async function sendOrderConfirmationEmail(
  params: SendOrderConfirmationParams
): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const apiKey = getEmailApiKey();

  // Graceful fallback: do nothing if email key is not configured
  if (!apiKey) {
    console.log(
      `[React Email: Fallback Mode] 📦 Order confirmation for #${params.orderNumber} to ${params.email} skipped (No RESEND_API_KEY configured)`
    );
    return {
      success: true,
      simulated: true,
    };
  }

  try {
    const resend = new Resend(apiKey);
    const from = getEmailFromAddress();
    const storeName = params.storeName || "M.E-Commerce";

    const result = await resend.emails.send({
      from,
      to: [params.email],
      subject: `Order Confirmed: #${params.orderNumber} - ${storeName}`,
      react: OrderConfirmationEmail({
        orderNumber: params.orderNumber,
        customerName: params.customerName,
        items: params.items,
        subtotal: params.subtotal,
        discountTotal: params.discountTotal,
        shippingFee: params.shippingFee,
        finalTotal: params.finalTotal,
        paymentMethod: params.paymentMethod,
        paymentStatus: params.paymentStatus,
        shippingAddress: params.shippingAddress,
        city: params.city,
        state: params.state,
        postalCode: params.postalCode,
        storeName,
      }),
    });

    if (result.error) {
      console.warn("[React Email] Resend API error sending order confirmation:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("[React Email] Failed to send order confirmation email:", error);
    return { success: false, error: error?.message || "Failed to dispatch email." };
  }
}
