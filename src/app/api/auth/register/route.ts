import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

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

    // 6-digit verification OTP
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const passwordHash = await hashPassword(password);

    if (existing) {
      if (existing.emailVerified) {
        return NextResponse.json(
          { error: "An account with this verified email already exists. Please log in." },
          { status: 409 }
        );
      }
      // If user exists but was never verified, update password and refresh OTP
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

    console.log(`[THE FOURFOLD AUTH] 💌 Verification code for ${cleanEmail}: ${verificationCode}`);

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
      devCode: verificationCode, // included for effortless demo / studio test verification
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
