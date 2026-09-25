import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default async function Icon() {
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
          fontSize: 18,
          background: "#181513",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FAF8F5",
          borderRadius: "8px",
          fontWeight: 800,
          letterSpacing: "-0.05em",
          border: `1.5px solid ${accent}`,
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
