import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendVerificationEmail, isEmailConfigured } from "@/lib/email/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address (e.g. name@example.com)." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address. Please check your spelling or register." },
        { status: 404 }
      );
    }

    if (user.status === "BANNED") {
      return NextResponse.json(
        {
          error:
            "This account has been banned from the store." +
            (user.statusReason ? ` Reason: ${user.statusReason}` : ""),
        },
        { status: 403 }
      );
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        {
          error:
            "This account is temporarily suspended." +
            (user.statusReason ? ` Reason: ${user.statusReason}.` : "") +
            " Please contact support.",
        },
        { status: 403 }
      );
    }

    // Cooldown Rate Limiting: 60-second limit to prevent spam
    const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes validity
    const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds minimum interval

    if (user.verificationExpiresAt) {
      const timeRemainingMs = user.verificationExpiresAt.getTime() - Date.now();
      if (timeRemainingMs > CODE_EXPIRY_MS - RESEND_COOLDOWN_MS) {
        const waitSeconds = Math.min(
          60,
          Math.max(1, Math.ceil((timeRemainingMs - (CODE_EXPIRY_MS - RESEND_COOLDOWN_MS)) / 1000))
        );
        return NextResponse.json(
          {
            error: `Please wait ${waitSeconds}s before requesting a new reset code.`,
            retryAfter: waitSeconds,
          },
          { status: 429 }
        );
      }
    }

    // Generate 6-digit OTP code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiresAt = new Date(Date.now() + CODE_EXPIRY_MS);

    await db.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationExpiresAt,
      },
    });

    const emailResult = await sendVerificationEmail({
      email: cleanEmail,
      code: verificationCode,
      userName: user.name,
      subject: `${verificationCode} is your M.E-Commerce password reset code`,
    });

    const includeDevCode = !isEmailConfigured() || !emailResult.success;

    let message = `A 6-digit password reset code has been sent to ${cleanEmail}.`;
    if (!emailResult.success) {
      message = emailResult.isSandboxRestriction
        ? `Resend sandbox testing active: reset code provided directly on screen for testing.`
        : `A 6-digit password reset code has been generated.`;
    }

    return NextResponse.json({
      success: true,
      message,
      email: cleanEmail,
      expiresIn: 600,
      cooldown: 60,
      ...(includeDevCode ? { devCode: verificationCode } : {}),
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch password reset code. Please try again." },
      { status: 500 }
    );
  }
}
