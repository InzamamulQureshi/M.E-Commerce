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

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
    <rect width="32" height="32" rx="8" fill="#181513" stroke="${accent}" stroke-width="1.5" />
    <text x="16" y="22" font-family="sans-serif" font-size="18" font-weight="800" fill="${accent}" text-anchor="middle">
      ${initial}
    </text>
  </svg>`;

  try {
    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 32 } });
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
