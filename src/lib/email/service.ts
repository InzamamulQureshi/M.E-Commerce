import React from "react";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { VerificationCodeEmail } from "@/components/emails/VerificationCodeEmail";
import { OrderConfirmationEmail } from "@/components/emails/OrderConfirmationEmail";
import { db } from "@/lib/db";

export function isDemoOtpEnabled(): boolean {
  return (
    process.env.ENABLE_DEMO_OTP === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_DEMO_OTP === "true"
  );
}

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

export async function resolveStoreName(explicitStoreName?: string): Promise<string> {
  if (explicitStoreName && explicitStoreName.trim() && explicitStoreName !== "M.E-Commerce") {
    return explicitStoreName.trim();
  }
  try {
    const setting = await db.studioSetting.findUnique({
      where: { id: "default" },
      select: { storeName: true },
    });
    if (setting?.storeName?.trim()) {
      return setting.storeName.trim();
    }
  } catch {
    // Graceful fallback if database lookup fails
  }
  return (
    process.env.NEXT_PUBLIC_STORE_NAME?.trim() ||
    process.env.STORE_NAME?.trim() ||
    explicitStoreName ||
    "Store"
  );
}

export function getEmailFromAddress(storeName?: string): string {
  const custom = process.env.EMAIL_FROM?.trim() || process.env.RESEND_FROM?.trim();
  const name = storeName || process.env.NEXT_PUBLIC_STORE_NAME?.trim() || "Store";

  if (custom) {
    if (custom.includes("<") && custom.includes(">")) {
      const match = custom.match(/<([^>]+)>/);
      const emailPart = match ? match[1] : "onboarding@resend.dev";
      const displayName = custom.replace(/<[^>]+>/, "").trim();
      if (!displayName || displayName === "M.E-Commerce" || displayName === "Store") {
        return `${name} <${emailPart}>`;
      }
      return custom;
    }
    return custom;
  }

  return `${name} <onboarding@resend.dev>`;
}

export interface SendVerificationEmailParams {
  email: string;
  code: string;
  userName?: string;
  storeName?: string;
  subject?: string;
}

export async function sendVerificationEmail({
  email,
  code,
  userName,
  storeName,
  subject,
}: SendVerificationEmailParams): Promise<{
  success: boolean;
  simulated?: boolean;
  error?: string;
  isSandboxRestriction?: boolean;
}> {
  const effectiveStoreName = await resolveStoreName(storeName);
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
    const from = getEmailFromAddress(effectiveStoreName);

    const html = await render(
      React.createElement(VerificationCodeEmail, {
        code,
        userName,
        storeName: effectiveStoreName,
      })
    );

    const emailSubject = subject || `${code} is your ${effectiveStoreName} verification code`;

    const result = await resend.emails.send({
      from,
      to: [email],
      subject: emailSubject,
      html,
    });

    if (result.error) {
      const isSandbox =
        (result.error as any).statusCode === 403 ||
        result.error.message?.includes("testing emails to your own email address") ||
        result.error.name === "validation_error";

      if (isSandbox) {
        console.warn(
          `[React Email: Sandbox Restriction] ⚠️ Resend free testing domain (onboarding@resend.dev) can only deliver to the account owner's registered email.\n` +
          `Recipient: "${email}" is unverified on Resend. System will provide fallback OTP on screen.\n` +
          `👉 To send real emails to all customers in production, verify your domain at https://resend.com/domains and set EMAIL_FROM="Brand <orders@yourverifieddomain.com>".`
        );
      } else {
        console.warn("[React Email] Resend API error:", result.error);
      }

      return {
        success: false,
        error: result.error.message,
        isSandboxRestriction: Boolean(isSandbox),
      };
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
  const effectiveStoreName = await resolveStoreName(params.storeName);
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
    const from = getEmailFromAddress(effectiveStoreName);

    const html = await render(
      React.createElement(OrderConfirmationEmail, {
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
        storeName: effectiveStoreName,
      })
    );

    const result = await resend.emails.send({
      from,
      to: [params.email],
      subject: `Order Confirmed: #${params.orderNumber} - ${effectiveStoreName}`,
      html,
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
