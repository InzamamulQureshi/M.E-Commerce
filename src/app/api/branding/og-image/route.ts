import { NextResponse } from "next/server";
import { Resvg } from "@resvg/resvg-js";
import { db } from "@/lib/db";

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

  try {
    const s = await db.studioSetting.findUnique({ where: { id: "default" } });
    if (s) {
      if (s.storeName) storeName = s.storeName;
      if (s.tagline) tagline = s.tagline;
      if (s.storeLocation) location = s.storeLocation;
      if (s.brandAccentColor) accentColor = s.brandAccentColor;
      if (s.ogTitle) ogTitle = s.ogTitle;
      if (s.ogDescription) ogDescription = s.ogDescription;
    }
  } catch {}

  const displayTitle = (ogTitle || storeName).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const displaySubtitle = (ogDescription || tagline).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const displayLocation = location.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const domain = (storeName.toLowerCase().replace(/[^a-z0-9]/g, "") || "mecommerce") + ".com";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <radialGradient id="accentGlow" cx="85%" cy="15%" r="65%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.28" />
      <stop offset="60%" stop-color="#181513" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#14110F" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A1614" />
      <stop offset="100%" stop-color="#12100E" />
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3A322D" />
      <stop offset="50%" stop-color="${accentColor}" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#2E2824" />
    </linearGradient>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#cardGrad)" />
  <rect width="1200" height="630" fill="url(#accentGlow)" />

  <!-- Outer Border Frame -->
  <rect x="24" y="24" width="1152" height="582" rx="20" fill="none" stroke="url(#borderGrad)" stroke-width="2" />

  <!-- Studio Location & Branding Badge -->
  <g transform="translate(80, 85)">
    <circle cx="8" cy="8" r="7" fill="${accentColor}" />
    <text x="28" y="14" font-family="sans-serif" font-size="16" font-weight="700" letter-spacing="4" fill="${accentColor}">
      ${displayLocation.toUpperCase()}
    </text>
  </g>

  <!-- Main Title -->
  <g transform="translate(80, 230)">
    <text x="0" y="0" font-family="sans-serif" font-size="56" font-weight="900" fill="#FAF8F5" letter-spacing="1">
      ${displayTitle}
    </text>
  </g>

  <!-- Subtitle / Narrative Description -->
  <g transform="translate(80, 310)">
    <text x="0" y="0" font-family="sans-serif" font-size="24" font-weight="400" fill="#D1C9BE" letter-spacing="0.5">
      ${displaySubtitle}
    </text>
  </g>

  <!-- Bottom Divider Line -->
  <line x1="80" y1="480" x2="1120" y2="480" stroke="#2E2824" stroke-width="1.5" />

  <!-- Bottom Badges: Architecture, Studio, Craft -->
  <g transform="translate(80, 525)">
    <text x="0" y="0" font-family="sans-serif" font-size="15" font-weight="600" letter-spacing="2" fill="#A89F91">
      MODULAR ARCHITECTURE
    </text>
    <circle cx="270" cy="-5" r="3" fill="#665E54" />
    <text x="290" y="0" font-family="sans-serif" font-size="15" font-weight="600" letter-spacing="2" fill="#A89F91">
      MINIMALIST STOREFRONT
    </text>
    <circle cx="585" cy="-5" r="3" fill="#665E54" />
    <text x="605" y="0" font-family="sans-serif" font-size="15" font-weight="600" letter-spacing="2" fill="#A89F91">
      HANDCRAFTED ATELIER
    </text>
  </g>

  <!-- Bottom Domain Label -->
  <g transform="translate(1120, 525)">
    <text x="0" y="0" font-family="sans-serif" font-size="16" font-weight="800" letter-spacing="2" fill="${accentColor}" text-anchor="end">
      ${domain.toUpperCase()}
    </text>
  </g>
</svg>`;

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
