import { Resvg } from "@resvg/resvg-js";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
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

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
    <rect width="180" height="180" rx="40" fill="#181513" stroke="${accent}" stroke-width="4" />
    <text x="90" y="122" font-family="sans-serif" font-size="90" font-weight="800" fill="${accent}" text-anchor="middle">
      ${initial}
    </text>
  </svg>`;

  try {
    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 180 } });
    const pngBuffer = resvg.render().asPng();

    return new Response(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (e) {
    return new Response(svg, {
      status: 200,
      headers: { "Content-Type": "image/svg+xml" },
    });
  }
}
