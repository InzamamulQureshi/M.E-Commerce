import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendVerificationEmail, isEmailConfigured, isDemoOtpEnabled } from "@/lib/email/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email." },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "This email is already verified. You can log in directly." },
        { status: 200 }
      );
    }

    // Cooldown Rate Limiting: 60-second limit to prevent abuse
    const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes validity
    const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds minimum interval

    if (user.verificationExpiresAt) {
      const timeRemainingMs = user.verificationExpiresAt.getTime() - Date.now();
      // If code was created within the last RESEND_COOLDOWN_MS (60s)
      if (timeRemainingMs > CODE_EXPIRY_MS - RESEND_COOLDOWN_MS) {
        const waitSeconds = Math.min(
          60,
          Math.max(1, Math.ceil((timeRemainingMs - (CODE_EXPIRY_MS - RESEND_COOLDOWN_MS)) / 1000))
        );
        return NextResponse.json(
          {
            error: `Please wait ${waitSeconds}s before requesting a new code.`,
            retryAfter: waitSeconds,
          },
          { status: 429 }
        );
      }
    }

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
    });

    const includeDevCode = isDemoOtpEnabled() || emailResult.isSandboxRestriction || !isEmailConfigured() || !emailResult.success;

    let message = `A new 6-digit verification code has been sent to ${cleanEmail}.`;
    if (!emailResult.success) {
      message = emailResult.isSandboxRestriction
        ? `Resend sandbox testing active: code provided directly on screen for testing.`
        : `A new 6-digit verification code has been generated.`;
    }

    return NextResponse.json({
      success: true,
      message,
      expiresIn: 600,
      cooldown: 60,
      ...(includeDevCode ? { devCode: verificationCode } : {}),
    });
  } catch (error: any) {
    console.error("Resend verification code error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification code. Please try again." },
      { status: 500 }
    );
  }
}
