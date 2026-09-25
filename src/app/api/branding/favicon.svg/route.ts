import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await db.studioSetting.findUnique({
      where: { id: "default" },
      select: { storeName: true, faviconSvg: true, brandAccentColor: true },
    });

    if (setting?.faviconSvg?.trim()) {
      const raw = setting.faviconSvg.trim();
      if (raw.startsWith("<svg") || raw.startsWith("<?xml")) {
        return new NextResponse(raw, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
          },
        });
      }
      if (raw.startsWith("data:image/svg+xml;base64,")) {
        const base64Content = raw.replace("data:image/svg+xml;base64,", "");
        const decoded = Buffer.from(base64Content, "base64").toString("utf-8");
        return new NextResponse(decoded, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
          },
        });
      }
      if (raw.startsWith("data:image/svg+xml,")) {
        const decoded = decodeURIComponent(raw.replace("data:image/svg+xml,", ""));
        return new NextResponse(decoded, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
          },
        });
      }
    }

    // Default dynamic SVG monogram based on store initial
    const initial = (setting?.storeName || "M").trim().charAt(0).toUpperCase();
    const accent = setting?.brandAccentColor || "#E07A5F";

    const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="8" fill="#181513" stroke="${accent}" stroke-width="1.5"/>
  <text x="16" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="800" text-anchor="middle" fill="${accent}">${initial}</text>
</svg>`;

    return new NextResponse(defaultSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="8" fill="#181513" stroke="#E07A5F" stroke-width="1.5"/>
  <text x="16" y="22" font-family="sans-serif" font-size="18" font-weight="800" text-anchor="middle" fill="#E07A5F">M</text>
</svg>`;
    return new NextResponse(fallbackSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });
  }
}
