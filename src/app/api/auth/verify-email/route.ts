import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    const user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      // User is already verified, sign token and log them in
      const token = signToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

      const response = NextResponse.json({
        success: true,
        message: "Email is already verified.",
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
    }

    if (!user.verificationCode) {
      return NextResponse.json(
        { error: "No pending verification code found. Please request a new code." },
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
          error: "This verification code has expired (codes are valid for 10 minutes). Please request a new code.",
          codeExpired: true,
        },
        { status: 400 }
      );
    }

    if (user.verificationCode !== cleanCode) {
      return NextResponse.json(
        { error: "Incorrect verification code. Please check your email or enter the 6-digit code again." },
        { status: 400 }
      );
    }

    // Mark user as verified
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationExpiresAt: null,
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
      message: "Email verified successfully! Welcome to M.E-Commerce.",
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
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
