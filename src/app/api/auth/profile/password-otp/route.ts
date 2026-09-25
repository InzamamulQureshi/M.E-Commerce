import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

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

    console.log(`[PASSWORD_OTP] Generated security code for ${user.email}: ${code}`);

    return NextResponse.json({
      success: true,
      message: `Security verification OTP sent to ${user.email}`,
      devCode: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (error: any) {
    console.error("Password OTP error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch password security OTP" },
      { status: 500 }
    );
  }
}
