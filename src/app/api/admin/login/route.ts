import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, hashPassword, signToken, COOKIE_NAME } from "@/lib/auth";

const MASTER_ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "mecommerce_admin_secret_2026";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secretPasscode, email, password, isDemoLogin } = body;

    // Option 0: Demo Preview Admin Account Login (1-click or credentials)
    const enableDemo = process.env.ENABLE_DEMO_ADMIN !== "false";
    const demoEmail = (process.env.DEMO_ADMIN_EMAIL || "demo@mecommerce.dev").toLowerCase().trim();
    const demoPassword = process.env.DEMO_ADMIN_PASSWORD || "demo_preview_2026";

    if (enableDemo && (isDemoLogin || (email && email.toLowerCase().trim() === demoEmail))) {
      if (!isDemoLogin && password !== demoPassword && password !== MASTER_ADMIN_SECRET) {
        return NextResponse.json({ error: "Invalid demo credentials." }, { status: 401 });
      }

      let demoUser = await db.user.findUnique({
        where: { email: demoEmail },
      });

      if (!demoUser) {
        demoUser = await db.user.create({
          data: {
            name: "Demo Admin (Preview)",
            email: demoEmail,
            passwordHash: await hashPassword(demoPassword),
            role: "ADMIN",
            isDemo: true,
          },
        });
      }

      const token = signToken({
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        role: "ADMIN",
        isDemo: true,
      });

      const response = NextResponse.json({
        success: true,
        isDemo: true,
        user: {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: "ADMIN",
          isDemo: true,
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

    // Option 1: Direct Master Studio Secret Passcode
    if (secretPasscode && secretPasscode === MASTER_ADMIN_SECRET) {
      let adminUser = await db.user.findFirst({
        where: { role: "ADMIN" },
      });

      if (!adminUser) {
        // Create default studio admin if not found
        adminUser = await db.user.create({
          data: {
            name: "M.E-Commerce Admin",
            email: "admin@mecommerce.dev",
            passwordHash: "master_passcode_authenticated",
            role: "ADMIN",
          },
        });
      }

      const token = signToken({
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: "ADMIN",
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: "ADMIN",
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

    // Option 2: Email & Password for Admin
    if (email && password) {
      const user = await db.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user || user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Access denied. Valid artisan admin credentials required." },
          { status: 403 }
        );
      }

      const isMasterPasscode = password === MASTER_ADMIN_SECRET;
      const isValid = isMasterPasscode ? true : await comparePassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid admin credentials or password." },
          { status: 401 }
        );
      }

      const token = signToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: "ADMIN",
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: "ADMIN",
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

    return NextResponse.json(
      { error: "Please provide a valid Studio Secret Passcode or Admin credentials." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Admin authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
