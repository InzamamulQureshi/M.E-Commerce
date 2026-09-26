import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, signToken, COOKIE_NAME } from "@/lib/auth";
import { sendVerificationEmail, isEmailConfigured } from "@/lib/email/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.status === "BANNED") {
      return NextResponse.json(
        {
          error:
            "Your account has been permanently banned from the store." +
            (user.statusReason ? ` Reason: ${user.statusReason}` : ""),
        },
        { status: 403 }
      );
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        {
          error:
            "Your account is temporarily suspended." +
            (user.statusReason ? ` Reason: ${user.statusReason}.` : "") +
            " Please contact support for assistance.",
        },
        { status: 403 }
      );
    }

    if (user.role === "CUSTOMER" && !user.emailVerified) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await db.user.update({
        where: { id: user.id },
        data: { verificationCode, verificationExpiresAt },
      });

      await sendVerificationEmail({
        email: user.email,
        code: verificationCode,
        userName: user.name,
      });

      const emailConfigured = isEmailConfigured();

      return NextResponse.json(
        {
          requiresVerification: true,
          email: user.email,
          error: "Your email is not verified yet. Please enter the 6-digit code sent to your email.",
          ...(emailConfigured ? {} : { devCode: verificationCode }),
        },
        { status: 403 }
      );
    }

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
