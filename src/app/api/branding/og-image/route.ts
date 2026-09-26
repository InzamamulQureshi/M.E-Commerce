import { NextResponse } from "next/server";
import { Resvg } from "@resvg/resvg-js";
import { db } from "@/lib/db";
import { generateOgBillboardSvg, DEFAULT_OG_CONFIG, OgDesignConfig } from "@/lib/og-generator";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wantSvg = searchParams.get("format") === "svg";

  let storeName = "M.E-Commerce";
  let tagline = "Minimalist, Modular E-Commerce Platform";
  let location = "Modern Atelier";
  let accentColor = "#E07A5F";
  let ogTitle = "";
  let ogDescription = "";
  let ogDesignConfig: OgDesignConfig = { ...DEFAULT_OG_CONFIG };

  try {
    const s = await db.studioSetting.findUnique({ where: { id: "default" } });
    if (s) {
      if (s.storeName) storeName = s.storeName;
      if (s.tagline) tagline = s.tagline;
      if (s.storeLocation) location = s.storeLocation;
      if (s.brandAccentColor) accentColor = s.brandAccentColor;
      if (s.ogTitle) ogTitle = s.ogTitle;
      if (s.ogDescription) ogDescription = s.ogDescription;
      if (s.ogDesignConfig) {
        try {
          const parsed = typeof s.ogDesignConfig === "string" ? JSON.parse(s.ogDesignConfig) : s.ogDesignConfig;
          ogDesignConfig = { ...DEFAULT_OG_CONFIG, ...parsed };
        } catch {}
      }
    }
  } catch {}

  const svg = generateOgBillboardSvg({
    config: ogDesignConfig,
    storeName,
    tagline,
    storeLocation: location,
    accentColor,
    title: ogTitle || storeName,
    subtitle: ogDescription || tagline,
  });

  if (wantSvg) {
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  }

  try {
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: 1200 },
      font: {
        loadSystemFonts: true,
        defaultFontFamily: "sans-serif",
      },
    });
    const pngBuffer = resvg.render().asPng();

    return new Response(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": pngBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (renderError) {
    console.error("Resvg rendering error:", renderError);
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
      },
    });
  }
}
