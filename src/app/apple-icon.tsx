import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default async function AppleIcon() {
  let initial = "M";
  let accent = "#E07A5F";

  try {
    const s = await db.studioSetting.findUnique({
      where: { id: "default" },
      select: { storeName: true, brandAccentColor: true },
    });
    if (s?.storeName?.trim()) {
      initial = s.storeName.trim().charAt(0).toUpperCase();
    }
    if (s?.brandAccentColor) {
      accent = s.brandAccentColor;
    }
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 90,
          background: "#181513",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#FAF8F5",
          borderRadius: "40px",
          fontWeight: 800,
          border: `4px solid ${accent}`,
        }}
      >
        <span style={{ color: accent }}>{initial}</span>
      </div>
    ),
    {
      ...size,
    }
  );
}
