export type OgLayoutPreset =
  | "modern-atelier"
  | "editorial-chic"
  | "vibrant-showcase"
  | "minimal-monogram"
  | "split-studio";

export type OgThemeBackdrop =
  | "dark-slate"
  | "warm-terracotta"
  | "rich-espresso"
  | "midnight-indigo"
  | "forest-emerald"
  | "pure-noir";

export interface OgDesignConfig {
  layoutPreset: OgLayoutPreset;
  themeBackdrop: OgThemeBackdrop;
  eyebrowText: string;
  badge1: string;
  badge2: string;
  badge3: string;
  domainWatermark?: string;
  showMonogram: boolean;
  showAccentGlow: boolean;
  showOuterBorder: boolean;
  showBadges: boolean;
  showWatermark: boolean;
}

export const DEFAULT_OG_CONFIG: OgDesignConfig = {
  layoutPreset: "modern-atelier",
  themeBackdrop: "dark-slate",
  eyebrowText: "HANDCRAFTED ATELIER",
  badge1: "MODULAR ARCHITECTURE",
  badge2: "MINIMALIST STOREFRONT",
  badge3: "HANDCRAFTED ATELIER",
  domainWatermark: "",
  showMonogram: true,
  showAccentGlow: true,
  showOuterBorder: true,
  showBadges: true,
  showWatermark: true,
};

export const OG_THEME_PALETTES: Record<
  OgThemeBackdrop,
  { bgStart: string; bgEnd: string; borderStart: string; borderEnd: string; textMuted: string; label: string }
> = {
  "dark-slate": {
    label: "Dark Slate Noir",
    bgStart: "#1A1614",
    bgEnd: "#12100E",
    borderStart: "#3A322D",
    borderEnd: "#2E2824",
    textMuted: "#A89F91",
  },
  "warm-terracotta": {
    label: "Warm Terracotta",
    bgStart: "#2C1713",
    bgEnd: "#150D0B",
    borderStart: "#5A2C23",
    borderEnd: "#341914",
    textMuted: "#C4A59D",
  },
  "rich-espresso": {
    label: "Rich Espresso",
    bgStart: "#231A15",
    bgEnd: "#130E0C",
    borderStart: "#4B392F",
    borderEnd: "#2B1F19",
    textMuted: "#B8A99E",
  },
  "midnight-indigo": {
    label: "Midnight Sapphire",
    bgStart: "#101827",
    bgEnd: "#090D15",
    borderStart: "#25344D",
    borderEnd: "#162030",
    textMuted: "#94A3B8",
  },
  "forest-emerald": {
    label: "Botanical Forest",
    bgStart: "#11241C",
    bgEnd: "#0A1410",
    borderStart: "#23493A",
    borderEnd: "#142820",
    textMuted: "#97B5A7",
  },
  "pure-noir": {
    label: "Pure Noir",
    bgStart: "#141414",
    bgEnd: "#080808",
    borderStart: "#333333",
    borderEnd: "#1C1C1C",
    textMuted: "#999999",
  },
};

export const OG_LAYOUT_PRESETS: { id: OgLayoutPreset; label: string; desc: string }[] = [
  {
    id: "modern-atelier",
    label: "Modern Atelier",
    desc: "Sleek asymmetric card with ambient aura glow, studio badge, bold headline, narrative, and craft pills.",
  },
  {
    id: "editorial-chic",
    label: "Editorial Chic",
    desc: "Refined luxury magazine aesthetic with double-rule frame, serif headline, and studio emblem.",
  },
  {
    id: "vibrant-showcase",
    label: "Center Spotlight",
    desc: "Centered high-impact showcase with glowing emblem, large headline, and pill badges.",
  },
  {
    id: "minimal-monogram",
    label: "Minimal Monogram",
    desc: "Understated gallery presentation with monogram icon, balanced typography, and clean hairline divider.",
  },
  {
    id: "split-studio",
    label: "Split Studio",
    desc: "Two-column atelier layout with monogram badge panel on the left and typography showcase on the right.",
  },
];

function escapeSvg(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateOgBillboardSvg({
  config,
  storeName,
  tagline,
  storeLocation,
  accentColor,
  title,
  subtitle,
}: {
  config: Partial<OgDesignConfig>;
  storeName: string;
  tagline: string;
  storeLocation: string;
  accentColor: string;
  title?: string;
  subtitle?: string;
}): string {
  const merged: OgDesignConfig = { ...DEFAULT_OG_CONFIG, ...config };
  const palette = OG_THEME_PALETTES[merged.themeBackdrop] || OG_THEME_PALETTES["dark-slate"];

  const safeStoreName = escapeSvg(storeName || "M.E-Commerce");
  const initial = (storeName || "M").trim().charAt(0).toUpperCase();
  const displayTitle = escapeSvg(title || storeName || "M.E-Commerce");
  const displaySubtitle = escapeSvg(subtitle || tagline || "Minimalist, Modular E-Commerce Platform");
  const displayEyebrow = escapeSvg(merged.eyebrowText || storeLocation || "HANDCRAFTED ATELIER").toUpperCase();
  const displayBadge1 = escapeSvg(merged.badge1 || "MODULAR ARCHITECTURE").toUpperCase();
  const displayBadge2 = escapeSvg(merged.badge2 || "MINIMALIST STOREFRONT").toUpperCase();
  const displayBadge3 = escapeSvg(merged.badge3 || "HANDCRAFTED ATELIER").toUpperCase();
  const domain = escapeSvg(
    merged.domainWatermark?.trim() ||
      (storeName.toLowerCase().replace(/[^a-z0-9]/g, "") || "mecommerce") + ".com"
  ).toUpperCase();

  const accent = accentColor || "#E07A5F";

  const glowElement = merged.showAccentGlow
    ? `<radialGradient id="accentGlow" cx="85%" cy="18%" r="65%">
         <stop offset="0%" stop-color="${accent}" stop-opacity="0.32" />
         <stop offset="55%" stop-color="${palette.bgStart}" stop-opacity="0.08" />
         <stop offset="100%" stop-color="${palette.bgEnd}" stop-opacity="0" />
       </radialGradient>
       <rect width="1200" height="630" fill="url(#accentGlow)" />`
    : "";

  const borderElement = merged.showOuterBorder
    ? `<rect x="24" y="24" width="1152" height="582" rx="20" fill="none" stroke="url(#borderGrad)" stroke-width="2" />`
    : "";

  // Common definitions
  const defs = `
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bgStart}" />
      <stop offset="100%" stop-color="${palette.bgEnd}" />
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${palette.borderStart}" />
      <stop offset="50%" stop-color="${accent}" stop-opacity="0.65" />
      <stop offset="100%" stop-color="${palette.borderEnd}" />
    </linearGradient>
    <linearGradient id="accentPillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.25" />
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.08" />
    </linearGradient>
  </defs>`;

  // 1. Layout: modern-atelier
  if (merged.layoutPreset === "modern-atelier") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  ${defs}
  <rect width="1200" height="630" fill="url(#cardGrad)" />
  ${glowElement}
  ${borderElement}

  <!-- Studio Eyebrow & Monogram -->
  <g transform="translate(80, 85)">
    ${
      merged.showMonogram
        ? `<rect x="0" y="-4" width="36" height="36" rx="8" fill="#181513" stroke="${accent}" stroke-width="1.5" />
           <text x="18" y="21" font-family="sans-serif" font-size="18" font-weight="800" fill="${accent}" text-anchor="middle">${initial}</text>
           <text x="50" y="20" font-family="sans-serif" font-size="15" font-weight="700" letter-spacing="4" fill="${accent}">
             ${displayEyebrow}
           </text>`
        : `<circle cx="8" cy="8" r="7" fill="${accent}" />
           <text x="28" y="14" font-family="sans-serif" font-size="16" font-weight="700" letter-spacing="4" fill="${accent}">
             ${displayEyebrow}
           </text>`
    }
  </g>

  <!-- Main Headline -->
  <g transform="translate(80, 235)">
    <text x="0" y="0" font-family="sans-serif" font-size="54" font-weight="900" fill="#FAF8F5" letter-spacing="0.5">
      ${displayTitle}
    </text>
  </g>

  <!-- Narrative Subtitle -->
  <g transform="translate(80, 315)">
    <text x="0" y="0" font-family="sans-serif" font-size="24" font-weight="400" fill="#D1C9BE" letter-spacing="0.3">
      ${displaySubtitle}
    </text>
  </g>

  <!-- Horizontal Hairline -->
  <line x1="80" y1="480" x2="1120" y2="480" stroke="${palette.borderEnd}" stroke-width="1.5" />

  <!-- Bottom Badges -->
  ${
    merged.showBadges
      ? `<g transform="translate(80, 525)">
           <text x="0" y="0" font-family="sans-serif" font-size="14" font-weight="600" letter-spacing="2" fill="${palette.textMuted}">
             ${displayBadge1}
           </text>
           <circle cx="260" cy="-5" r="3" fill="${palette.borderStart}" />
           <text x="280" y="0" font-family="sans-serif" font-size="14" font-weight="600" letter-spacing="2" fill="${palette.textMuted}">
             ${displayBadge2}
           </text>
           <circle cx="560" cy="-5" r="3" fill="${palette.borderStart}" />
           <text x="580" y="0" font-family="sans-serif" font-size="14" font-weight="600" letter-spacing="2" fill="${palette.textMuted}">
             ${displayBadge3}
           </text>
         </g>`
      : ""
  }

  <!-- Watermark -->
  ${
    merged.showWatermark
      ? `<g transform="translate(1120, 525)">
           <text x="0" y="0" font-family="sans-serif" font-size="15" font-weight="800" letter-spacing="2" fill="${accent}" text-anchor="end">
             ${domain}
           </text>
         </g>`
      : ""
  }
</svg>`;
  }

  // 2. Layout: editorial-chic (Serif elegance with double border)
  if (merged.layoutPreset === "editorial-chic") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  ${defs}
  <rect width="1200" height="630" fill="url(#cardGrad)" />
  ${glowElement}

  <!-- Double Rule Luxury Frame -->
  <rect x="28" y="28" width="1144" height="574" fill="none" stroke="${palette.borderStart}" stroke-width="1" />
  <rect x="36" y="36" width="1128" height="558" fill="none" stroke="${accent}" stroke-opacity="0.4" stroke-width="2" />

  <!-- Top Monogram & Sub-eyebrow -->
  <g transform="translate(80, 95)">
    ${
      merged.showMonogram
        ? `<rect x="0" y="0" width="44" height="44" fill="${palette.bgEnd}" stroke="${accent}" stroke-width="1.5" />
           <text x="22" y="30" font-family="Georgia, serif" font-size="24" font-weight="700" fill="${accent}" text-anchor="middle">${initial}</text>
           <text x="64" y="27" font-family="sans-serif" font-size="14" font-weight="700" letter-spacing="5" fill="${accent}">
             ◆ ${displayEyebrow}
           </text>`
        : `<text x="0" y="24" font-family="sans-serif" font-size="15" font-weight="700" letter-spacing="5" fill="${accent}">
             ◆ ${displayEyebrow}
           </text>`
    }
  </g>

  <!-- Editorial Serif Headline -->
  <g transform="translate(80, 240)">
    <text x="0" y="0" font-family="Georgia, 'Times New Roman', serif" font-size="58" font-style="italic" font-weight="700" fill="#FAF8F5" letter-spacing="1">
      ${displayTitle}
    </text>
  </g>

  <!-- Editorial Subtitle -->
  <g transform="translate(80, 320)">
    <text x="0" y="0" font-family="sans-serif" font-size="23" font-weight="300" fill="#E2DACD" letter-spacing="0.5">
      ${displaySubtitle}
    </text>
  </g>

  <!-- Elegant Editorial Footer -->
  <line x1="80" y1="475" x2="1120" y2="475" stroke="${accent}" stroke-opacity="0.3" stroke-width="1" />

  ${
    merged.showBadges
      ? `<g transform="translate(80, 520)">
           <text x="0" y="0" font-family="sans-serif" font-size="13" font-weight="600" letter-spacing="3" fill="${palette.textMuted}">
             ${displayBadge1}  /  ${displayBadge2}  /  ${displayBadge3}
           </text>
         </g>`
      : ""
  }

  ${
    merged.showWatermark
      ? `<g transform="translate(1120, 520)">
           <text x="0" y="0" font-family="sans-serif" font-size="14" font-weight="700" letter-spacing="3" fill="${accent}" text-anchor="end">
             ${domain}
           </text>
         </g>`
      : ""
  }
</svg>`;
  }

  // 3. Layout: vibrant-showcase (Centered High-Impact Spotlight)
  if (merged.layoutPreset === "vibrant-showcase") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  ${defs}
  <rect width="1200" height="630" fill="url(#cardGrad)" />

  <!-- Center Radial Spotlight Glow -->
  <radialGradient id="centerGlow" cx="50%" cy="40%" r="55%">
    <stop offset="0%" stop-color="${accent}" stop-opacity="0.35" />
    <stop offset="70%" stop-color="${palette.bgStart}" stop-opacity="0.05" />
    <stop offset="100%" stop-color="${palette.bgEnd}" stop-opacity="0" />
  </radialGradient>
  <rect width="1200" height="630" fill="url(#centerGlow)" />
  ${borderElement}

  <!-- Center Monogram Emblem -->
  ${
    merged.showMonogram
      ? `<g transform="translate(600, 110)">
           <circle cx="0" cy="0" r="38" fill="#181513" stroke="${accent}" stroke-width="2.5" />
           <text x="0" y="13" font-family="sans-serif" font-size="34" font-weight="900" fill="${accent}" text-anchor="middle">${initial}</text>
         </g>`
      : ""
  }

  <!-- Eyebrow Pill -->
  <g transform="translate(600, 185)">
    <text x="0" y="0" font-family="sans-serif" font-size="15" font-weight="800" letter-spacing="4" fill="${accent}" text-anchor="middle">
      ${displayEyebrow}
    </text>
  </g>

  <!-- Big Centered Title -->
  <g transform="translate(600, 275)">
    <text x="0" y="0" font-family="sans-serif" font-size="56" font-weight="900" fill="#FAF8F5" letter-spacing="1" text-anchor="middle">
      ${displayTitle}
    </text>
  </g>

  <!-- Centered Subtitle -->
  <g transform="translate(600, 345)">
    <text x="0" y="0" font-family="sans-serif" font-size="24" font-weight="400" fill="#D6CDC2" letter-spacing="0.4" text-anchor="middle">
      ${displaySubtitle}
    </text>
  </g>

  <!-- Bottom Pills Row -->
  ${
    merged.showBadges
      ? `<g transform="translate(600, 485)">
           <rect x="-380" y="-18" width="220" height="36" rx="18" fill="url(#accentPillGrad)" stroke="${accent}" stroke-opacity="0.3" stroke-width="1" />
           <text x="-270" y="5" font-family="sans-serif" font-size="12" font-weight="700" letter-spacing="1.5" fill="#FAF8F5" text-anchor="middle">${displayBadge1}</text>

           <rect x="-130" y="-18" width="260" height="36" rx="18" fill="url(#accentPillGrad)" stroke="${accent}" stroke-opacity="0.3" stroke-width="1" />
           <text x="0" y="5" font-family="sans-serif" font-size="12" font-weight="700" letter-spacing="1.5" fill="#FAF8F5" text-anchor="middle">${displayBadge2}</text>

           <rect x="160" y="-18" width="220" height="36" rx="18" fill="url(#accentPillGrad)" stroke="${accent}" stroke-opacity="0.3" stroke-width="1" />
           <text x="270" y="5" font-family="sans-serif" font-size="12" font-weight="700" letter-spacing="1.5" fill="#FAF8F5" text-anchor="middle">${displayBadge3}</text>
         </g>`
      : ""
  }

  ${
    merged.showWatermark
      ? `<g transform="translate(600, 565)">
           <text x="0" y="0" font-family="sans-serif" font-size="14" font-weight="800" letter-spacing="3" fill="${accent}" text-anchor="middle">
             ${domain}
           </text>
         </g>`
      : ""
  }
</svg>`;
  }

  // 4. Layout: minimal-monogram (Balanced Gallery Aesthetics)
  if (merged.layoutPreset === "minimal-monogram") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  ${defs}
  <rect width="1200" height="630" fill="url(#cardGrad)" />
  ${glowElement}
  ${borderElement}

  <!-- Gallery Header Emblem -->
  ${
    merged.showMonogram
      ? `<g transform="translate(600, 130)">
           <rect x="-32" y="-32" width="64" height="64" rx="16" fill="#181513" stroke="${accent}" stroke-width="2" />
           <text x="0" y="11" font-family="sans-serif" font-size="32" font-weight="800" fill="${accent}" text-anchor="middle">${initial}</text>
         </g>`
      : ""
  }

  <!-- Store Name & Eyebrow -->
  <g transform="translate(600, 220)">
    <text x="0" y="0" font-family="sans-serif" font-size="15" font-weight="800" letter-spacing="5" fill="${accent}" text-anchor="middle">
      ${displayEyebrow}
    </text>
  </g>

  <!-- Large Title -->
  <g transform="translate(600, 305)">
    <text x="0" y="0" font-family="sans-serif" font-size="52" font-weight="900" fill="#FAF8F5" letter-spacing="1" text-anchor="middle">
      ${displayTitle}
    </text>
  </g>

  <!-- Single Delicate Center Hairline -->
  <line x1="480" y1="355" x2="720" y2="355" stroke="${palette.borderStart}" stroke-width="1.5" />

  <!-- Subtitle -->
  <g transform="translate(600, 410)">
    <text x="0" y="0" font-family="sans-serif" font-size="22" font-weight="400" fill="#D1C9BE" letter-spacing="0.5" text-anchor="middle">
      ${displaySubtitle}
    </text>
  </g>

  <!-- Bottom Domain with Badges -->
  ${
    merged.showWatermark || merged.showBadges
      ? `<g transform="translate(600, 530)">
           <text x="0" y="0" font-family="sans-serif" font-size="14" font-weight="700" letter-spacing="3" fill="${palette.textMuted}" text-anchor="middle">
             ${displayBadge1}  •  <tspan fill="${accent}">${domain}</tspan>  •  ${displayBadge3}
           </text>
         </g>`
      : ""
  }
</svg>`;
  }

  // 5. Layout: split-studio (Side-by-Side Architectural Atelier)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  ${defs}
  <rect width="1200" height="630" fill="url(#cardGrad)" />
  ${glowElement}
  ${borderElement}

  <!-- Left Studio Panel (width 360) -->
  <rect x="24" y="24" width="340" height="582" rx="20" fill="#13100E" stroke="${palette.borderStart}" stroke-width="1" />

  <g transform="translate(194, 210)">
    <circle cx="0" cy="0" r="54" fill="#1B1714" stroke="${accent}" stroke-width="3" />
    <text x="0" y="19" font-family="sans-serif" font-size="48" font-weight="900" fill="${accent}" text-anchor="middle">${initial}</text>
  </g>

  <g transform="translate(194, 320)">
    <text x="0" y="0" font-family="sans-serif" font-size="22" font-weight="900" letter-spacing="1" fill="#FAF8F5" text-anchor="middle">
      ${safeStoreName}
    </text>
    <text x="0" y="28" font-family="sans-serif" font-size="12" font-weight="700" letter-spacing="3" fill="${accent}" text-anchor="middle">
      ${displayEyebrow}
    </text>
  </g>

  ${
    merged.showWatermark
      ? `<g transform="translate(194, 520)">
           <text x="0" y="0" font-family="sans-serif" font-size="13" font-weight="800" letter-spacing="2" fill="${palette.textMuted}" text-anchor="middle">
             ${domain}
           </text>
         </g>`
      : ""
  }

  <!-- Right Details Section -->
  <g transform="translate(430, 160)">
    <text x="0" y="0" font-family="sans-serif" font-size="15" font-weight="800" letter-spacing="4" fill="${accent}">
      FEATURED HEADLINE
    </text>
  </g>

  <g transform="translate(430, 240)">
    <text x="0" y="0" font-family="sans-serif" font-size="48" font-weight="900" fill="#FAF8F5" letter-spacing="0.5">
      ${displayTitle}
    </text>
  </g>

  <g transform="translate(430, 320)">
    <text x="0" y="0" font-family="sans-serif" font-size="22" font-weight="400" fill="#D1C9BE" letter-spacing="0.3">
      ${displaySubtitle}
    </text>
  </g>

  <line x1="430" y1="460" x2="1120" y2="460" stroke="${palette.borderEnd}" stroke-width="1.5" />

  ${
    merged.showBadges
      ? `<g transform="translate(430, 520)">
           <text x="0" y="0" font-family="sans-serif" font-size="14" font-weight="600" letter-spacing="2" fill="${palette.textMuted}">
             ${displayBadge1}  •  ${displayBadge2}  •  ${displayBadge3}
           </text>
         </g>`
      : ""
  }
</svg>`;
}
