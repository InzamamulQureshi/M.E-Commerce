import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendVerificationEmail, isEmailConfigured } from "@/lib/email/service";

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

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.user.update({
      where: { id: user.id },
      data: {
        verificationCode: code,
        verificationExpiresAt: expiresAt,
      },
    });

    await sendVerificationEmail({
      email: user.email,
      code,
      userName: user.name,
    });

    const emailConfigured = isEmailConfigured();

    return NextResponse.json({
      success: true,
      message: `Security verification OTP sent to ${user.email}`,
      ...(emailConfigured ? {} : { devCode: code }),
    });
  } catch (error: any) {
    console.error("Password OTP error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch password security OTP" },
      { status: 500 }
    );
  }
}
