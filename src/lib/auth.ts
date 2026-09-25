import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "./db";

const JWT_SECRET = process.env.BETTER_AUTH_SECRET || "thefourfold_fallback_jwt_secret_craft_gifting_2026";
const COOKIE_NAME = "fourfold_session";

export interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: AuthSessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): AuthSessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSessionUser;
  } catch {
    return null;
  }
}

export const getSessionUser = cache(async (): Promise<AuthSessionUser | null> => {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    return user ? (user as AuthSessionUser) : null;
  } catch {
    return null;
  }
});

export async function getAdminSession(): Promise<AuthSessionUser | null> {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export { COOKIE_NAME };
