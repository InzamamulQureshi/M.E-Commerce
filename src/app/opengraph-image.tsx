import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const alt = "M.E-Commerce | Minimalist, Modular E-Commerce Platform";
export const dynamic = "force-dynamic";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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

  const displayTitle = ogTitle || storeName;
  const displaySubtitle = ogDescription || tagline;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#181513",
          padding: "80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle decorative background gradient accent */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(224,122,95,0.25) 0%, rgba(24,21,19,0) 70%)",
          }}
        />

        {/* Top studio badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: accentColor,
            }}
          />
          <span
            style={{
              fontSize: "18px",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: accentColor,
              fontWeight: 700,
            }}
          >
            {location}
          </span>
        </div>

        {/* Center Main Typography */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h1
            style={{
              fontSize: "68px",
              fontWeight: 900,
              color: "#FAF8F5",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {displayTitle}
          </h1>
          <p
            style={{
              fontSize: "30px",
              color: "#D1C9BE",
              fontWeight: 400,
              margin: 0,
              maxWidth: "880px",
              lineHeight: 1.35,
            }}
          >
            {displaySubtitle}
          </p>
        </div>

        {/* Bottom details */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1.5px solid #2E2925",
            paddingTop: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <span style={{ fontSize: "16px", color: "#A89F91", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Modular Architecture
            </span>
            <span style={{ fontSize: "16px", color: "#665E54" }}>•</span>
            <span style={{ fontSize: "16px", color: "#A89F91", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Minimalist Storefront
            </span>
            <span style={{ fontSize: "16px", color: "#665E54" }}>•</span>
            <span style={{ fontSize: "16px", color: "#A89F91", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Open Source
            </span>
          </div>
          <span
            style={{
              fontSize: "17px",
              color: accentColor,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              paddingLeft: "24px",
            }}
          >
            {storeName.toLowerCase().replace(/[^a-z0-9]/g, "") || "mecommerce"}.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
