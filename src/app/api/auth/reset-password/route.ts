import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signToken, COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Email, verification code, and new password are required." },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanCode = String(code).trim();

    const user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    if (user.status === "BANNED" || user.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "This account cannot be accessed at this time. Please contact support." },
        { status: 403 }
      );
    }

    if (!user.verificationCode) {
      return NextResponse.json(
        { error: "No pending password reset requested. Please request a new reset code." },
        { status: 400 }
      );
    }

    if (user.verificationExpiresAt && new Date() > user.verificationExpiresAt) {
      await db.user.update({
        where: { id: user.id },
        data: {
          verificationCode: null,
          verificationExpiresAt: null,
        },
      });
      return NextResponse.json(
        {
          error: "This reset code has expired (codes are valid for 10 minutes). Please request a new code.",
          codeExpired: true,
        },
        { status: 400 }
      );
    }

    if (user.verificationCode !== cleanCode) {
      return NextResponse.json(
        { error: "Incorrect verification code. Please check your email and try again." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(String(newPassword));

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        verificationCode: null,
        verificationExpiresAt: null,
        emailVerified: true,
      },
    });

    const token = signToken({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Your password has been successfully updated! Welcome back.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
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
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
