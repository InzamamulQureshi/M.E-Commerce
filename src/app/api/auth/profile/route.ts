import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, signToken, COOKIE_NAME, comparePassword, hashPassword } from "@/lib/auth";

// GET current user profile details
export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      role: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      postalCode: true,
      birthDate: true,
      anniversaryDate: true,
      createdAt: true,
      addresses: {
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// PUT update user profile details
export async function PUT(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      phone,
      address,
      city,
      state,
      postalCode,
      birthDate,
      anniversaryDate,
      currentPassword,
      newPassword,
    } = body;

    const currentUser = await db.user.findUnique({
      where: { id: session.id },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (address !== undefined) updateData.address = address ? address.trim() : null;
    if (city !== undefined) updateData.city = city ? city.trim() : null;
    if (state !== undefined) updateData.state = state ? state.trim() : null;
    if (postalCode !== undefined) updateData.postalCode = postalCode ? postalCode.trim() : null;
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
    if (anniversaryDate !== undefined) updateData.anniversaryDate = anniversaryDate ? new Date(anniversaryDate) : null;

    // Handle Password Change if requested
    if (newPassword) {
      const { otp } = body;

      if (!currentPassword) {
        return NextResponse.json(
          { error: "Please enter your current password to set a new password." },
          { status: 400 }
        );
      }
      if (!otp || !String(otp).trim()) {
        return NextResponse.json(
          { error: "Security OTP is required. Please request and enter the 6-digit code sent to your email." },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }
      const isCurrentValid = await comparePassword(currentPassword, currentUser.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: "Current password is incorrect." },
          { status: 400 }
        );
      }

      // Verify OTP code
      const cleanOtp = String(otp).trim();
      if (!currentUser.verificationCode || currentUser.verificationCode !== cleanOtp) {
        return NextResponse.json(
          { error: "Invalid security code. Please check your email or request a fresh OTP." },
          { status: 400 }
        );
      }
      if (currentUser.verificationExpiresAt && new Date(currentUser.verificationExpiresAt) < new Date()) {
        return NextResponse.json(
          { error: "Security code has expired. Please request a new code." },
          { status: 400 }
        );
      }

      updateData.passwordHash = await hashPassword(newPassword);
      updateData.verificationCode = null;
      updateData.verificationExpiresAt = null;
    }

    const updatedUser = await db.user.update({
      where: { id: session.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        birthDate: true,
        anniversaryDate: true,
      },
    });

    // Refresh JWT session with new name if changed
    const token = signToken({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
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
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
