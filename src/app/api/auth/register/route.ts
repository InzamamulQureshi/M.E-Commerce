import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { sendVerificationEmail, isEmailConfigured, isDemoOtpEnabled } from "@/lib/email/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, address, city, state, postalCode } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address (e.g. name@example.com)." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    // 6-digit verification OTP (valid for 10 minutes)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const passwordHash = await hashPassword(password);

    if (existing) {
      if (existing.emailVerified) {
        return NextResponse.json(
          { error: "An account with this verified email already exists. Please log in." },
          { status: 409 }
        );
      }

      // If user exists but was never verified, check 60s cooldown to prevent abuse
      const CODE_EXPIRY_MS = 10 * 60 * 1000;
      const RESEND_COOLDOWN_MS = 60 * 1000;
      if (existing.verificationExpiresAt) {
        const timeRemainingMs = existing.verificationExpiresAt.getTime() - Date.now();
        if (timeRemainingMs > CODE_EXPIRY_MS - RESEND_COOLDOWN_MS) {
          const waitSeconds = Math.min(
            60,
            Math.max(1, Math.ceil((timeRemainingMs - (CODE_EXPIRY_MS - RESEND_COOLDOWN_MS)) / 1000))
          );
          return NextResponse.json(
            {
              error: `A verification code was recently requested. Please wait ${waitSeconds}s before requesting a new code.`,
              requiresVerification: true,
              email: cleanEmail,
              retryAfter: waitSeconds,
              devCode: (isDemoOtpEnabled() && !isEmailConfigured()) ? (existing.verificationCode || undefined) : undefined,
            },
            { status: 429 }
          );
        }
      }

      // Update details and refresh OTP
      await db.user.update({
        where: { id: existing.id },
        data: {
          name: name.trim(),
          passwordHash,
          phone: phone?.trim() || existing.phone,
          address: address?.trim() || existing.address,
          city: city?.trim() || existing.city,
          state: state?.trim() || existing.state,
          postalCode: postalCode?.trim() || existing.postalCode,
          verificationCode,
          verificationExpiresAt,
        },
      });
    } else {
      await db.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          phone: phone?.trim() || null,
          address: address?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          postalCode: postalCode?.trim() || null,
          emailVerified: false,
          verificationCode,
          verificationExpiresAt,
        },
      });
    }

    // Send React Email verification code (falls back gracefully if no key is configured or recipient is unverified sandbox)
    const emailResult = await sendVerificationEmail({
      email: cleanEmail,
      code: verificationCode,
      userName: cleanName,
    });

    const includeDevCode = isDemoOtpEnabled() || emailResult.isSandboxRestriction || !isEmailConfigured() || !emailResult.success;

    let message = `A 6-digit verification code has been sent to ${cleanEmail}.`;
    if (!emailResult.success) {
      message = emailResult.isSandboxRestriction
        ? `Resend sandbox testing active: code provided directly on screen for testing.`
        : `A 6-digit verification code has been generated.`;
    }

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      message,
      ...(includeDevCode ? { devCode: verificationCode } : {}),
      expiresIn: 600,
      cooldown: 60,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
