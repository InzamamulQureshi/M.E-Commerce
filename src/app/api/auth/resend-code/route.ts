import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendVerificationEmail, isEmailConfigured } from "@/lib/email/service";

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

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationExpiresAt,
      },
    });

    await sendVerificationEmail({
      email: cleanEmail,
      code: verificationCode,
      userName: user.name,
    });

    const emailConfigured = isEmailConfigured();

    return NextResponse.json({
      success: true,
      message: `A new 6-digit verification code has been sent to ${cleanEmail}.`,
      ...(emailConfigured ? {} : { devCode: verificationCode }),
    });
  } catch (error: any) {
    console.error("Resend verification code error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification code. Please try again." },
      { status: 500 }
    );
  }
}
