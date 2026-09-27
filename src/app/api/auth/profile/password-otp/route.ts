import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendVerificationEmail, isEmailConfigured, isDemoOtpEnabled } from "@/lib/email/service";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    // 60-second cooldown rate limit to prevent abuse
    const CODE_EXPIRY_MS = 10 * 60 * 1000;
    const RESEND_COOLDOWN_MS = 60 * 1000;

    if (user.verificationExpiresAt) {
      const timeRemainingMs = user.verificationExpiresAt.getTime() - Date.now();
      if (timeRemainingMs > CODE_EXPIRY_MS - RESEND_COOLDOWN_MS) {
        const waitSeconds = Math.min(
          60,
          Math.max(1, Math.ceil((timeRemainingMs - (CODE_EXPIRY_MS - RESEND_COOLDOWN_MS)) / 1000))
        );
        return NextResponse.json(
          {
            error: `Please wait ${waitSeconds}s before requesting a new password OTP.`,
            retryAfter: waitSeconds,
          },
          { status: 429 }
        );
      }
    }

    // Generate 6-digit verification code (10 minutes validity)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS);

    await db.user.update({
      where: { id: user.id },
      data: {
        verificationCode: code,
        verificationExpiresAt: expiresAt,
      },
    });

    const emailResult = await sendVerificationEmail({
      email: user.email,
      code,
      userName: user.name,
    });

    const includeDevCode = isDemoOtpEnabled() && (!isEmailConfigured() || !emailResult.success);

    return NextResponse.json({
      success: true,
      message: `Security verification OTP sent to ${user.email}`,
      cooldown: 60,
      expiresIn: 600,
      ...(includeDevCode ? { devCode: code } : {}),
    });
  } catch (error: any) {
    console.error("Password OTP error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch password security OTP" },
      { status: 500 }
    );
  }
}
