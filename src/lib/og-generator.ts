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
    label: "Modern Minimalist",
    desc: "Clean asymmetric studio card with accent glow, top eyebrow badge, bold headline, narrative subtitle, and bottom highlight tags.",
  },
  {
    id: "editorial-chic",
    label: "Luxury Editorial",
    desc: "Refined boutique aesthetic with double-rule luxury frame, elegant serif headline, and centered studio accents.",
  },
  {
    id: "vibrant-showcase",
    label: "Centered Spotlight",
    desc: "High-impact centered spotlight with radiant aura, large headline, and modern capsule badge pill.",
  },
  {
    id: "minimal-monogram",
    label: "Monogram Gallery",
    desc: "Understated gallery presentation with monogram icon, centered typography, and a delicate hairline divider.",
  },
  {
    id: "split-studio",
    label: "Split Atelier",
    desc: "Side-by-side atelier layout with brand emblem on the left and typography details on the right.",
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

export function wrapTextToLines(text: string, maxCharsPerLine: number, maxLines: number = 2): string[] {
  const clean = (text || "").trim();
  if (!clean) return [];
  const words = clean.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const candidate = current ? current + " " + word : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
        if (lines.length >= maxLines) {
          const lastIdx = lines.length - 1;
          if (i < words.length && !lines[lastIdx].endsWith("…")) {
            lines[lastIdx] = lines[lastIdx].slice(0, Math.max(10, maxCharsPerLine - 2)) + "…";
          }
          return lines;
        }
      }
      current = word.length > maxCharsPerLine ? word.slice(0, Math.max(10, maxCharsPerLine - 2)) + "…" : word;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  return lines;
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

  const rawTitle = (title || storeName || "M.E-Commerce").trim();
  const rawSubtitle = (subtitle || tagline || "Minimalist, Modular E-Commerce Platform").trim();

  const displayEyebrow = escapeSvg((merged.eyebrowText || storeLocation || "HANDCRAFTED ATELIER").trim()).toUpperCase();
  const rawBadges = [merged.badge1, merged.badge2, merged.badge3]
    .map((b) => (b || "").trim())
    .filter(Boolean);

  const domain = escapeSvg(
    (
      merged.domainWatermark?.trim() ||
      (storeName.toLowerCase().replace(/[^a-z0-9]/g, "") || "mecommerce") + ".com"
    ).toUpperCase()
  );

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
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.22" />
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.06" />
    </linearGradient>
  </defs>`;

  // 1. Layout: modern-atelier
  if (merged.layoutPreset === "modern-atelier") {
    const titleLines = wrapTextToLines(rawTitle, 28, 2);
    const titleFontSize = titleLines.length > 1 ? 44 : 52;
    const titleLineHeight = 54;
    const titleStartY = titleLines.length > 1 ? 215 : 235;

    const subtitleLines = wrapTextToLines(rawSubtitle, 58, 2);
    const subStartY = titleLines.length > 1 ? 335 : 310;
    const subLineHeight = 34;

    const badgesText = escapeSvg(rawBadges.join("   •   ").toUpperCase());

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
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

  <!-- Main Headline (Wrapped) -->
  <g transform="translate(80, 0)">
    ${titleLines
      .map(
        (line, idx) =>
          `<text x="0" y="${titleStartY + idx * titleLineHeight}" font-family="sans-serif" font-size="${titleFontSize}" font-weight="900" fill="#FAF8F5" letter-spacing="0.5">${escapeSvg(line)}</text>`
      )
      .join("\n    ")}
  </g>

  <!-- Narrative Subtitle (Wrapped) -->
  <g transform="translate(80, 0)">
    ${subtitleLines
      .map(
        (line, idx) =>
          `<text x="0" y="${subStartY + idx * subLineHeight}" font-family="sans-serif" font-size="22" font-weight="400" fill="#D1C9BE" letter-spacing="0.3">${escapeSvg(line)}</text>`
      )
      .join("\n    ")}
  </g>

  <!-- Horizontal Hairline -->
  <line x1="80" y1="475" x2="1120" y2="475" stroke="${palette.borderEnd}" stroke-width="1.5" />

  <!-- Bottom Badges (Auto-Flowing, Non-Overlapping) -->
  ${
    merged.showBadges && badgesText
      ? `<g transform="translate(80, 525)">
           <text x="0" y="0" font-family="sans-serif" font-size="13" font-weight="600" letter-spacing="2" fill="${palette.textMuted}">
             ${badgesText}
           </text>
         </g>`
      : ""
  }

  <!-- Watermark -->
  ${
    merged.showWatermark
      ? `<g transform="translate(1120, 525)">
           <text x="0" y="0" font-family="sans-serif" font-size="14" font-weight="800" letter-spacing="2" fill="${accent}" text-anchor="end">
             ${domain}
           </text>
         </g>`
      : ""
  }
</svg>`;
  }

  // 2. Layout: editorial-chic (Luxury Editorial Serif)
  if (merged.layoutPreset === "editorial-chic") {
    const titleLines = wrapTextToLines(rawTitle, 26, 2);
    const titleFontSize = titleLines.length > 1 ? 46 : 54;
    const titleLineHeight = 56;
    const titleStartY = titleLines.length > 1 ? 215 : 240;

    const subtitleLines = wrapTextToLines(rawSubtitle, 55, 2);
    const subStartY = titleLines.length > 1 ? 335 : 315;
    const subLineHeight = 34;

    const badgesText = escapeSvg(rawBadges.join("   /   ").toUpperCase());

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  ${defs}
  <rect width="1200" height="630" fill="url(#cardGrad)" />
  ${glowElement}

  <!-- Double Rule Luxury Frame -->
  <rect x="28" y="28" width="1144" height="574" fill="none" stroke="${palette.borderStart}" stroke-width="1" />
  <rect x="36" y="36" width="1128" height="558" fill="none" stroke="${accent}" stroke-opacity="0.4" stroke-width="2" />

  <!-- Top Monogram & Eyebrow -->
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

  <!-- Editorial Serif Headline (Wrapped) -->
  <g transform="translate(80, 0)">
    ${titleLines
      .map(
        (line, idx) =>
          `<text x="0" y="${titleStartY + idx * titleLineHeight}" font-family="Georgia, 'Times New Roman', serif" font-size="${titleFontSize}" font-style="italic" font-weight="700" fill="#FAF8F5" letter-spacing="1">${escapeSvg(line)}</text>`
      )
      .join("\n    ")}
  </g>

  <!-- Editorial Subtitle (Wrapped) -->
  <g transform="translate(80, 0)">
    ${subtitleLines
      .map(
        (line, idx) =>
          `<text x="0" y="${subStartY + idx * subLineHeight}" font-family="sans-serif" font-size="22" font-weight="300" fill="#E2DACD" letter-spacing="0.5">${escapeSvg(line)}</text>`
      )
      .join("\n    ")}
  </g>

  <!-- Elegant Editorial Footer -->
  <line x1="80" y1="475" x2="1120" y2="475" stroke="${accent}" stroke-opacity="0.3" stroke-width="1" />

  ${
    merged.showBadges && badgesText
      ? `<g transform="translate(80, 520)">
           <text x="0" y="0" font-family="sans-serif" font-size="13" font-weight="600" letter-spacing="3" fill="${palette.textMuted}">
             ${badgesText}
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
    const titleLines = wrapTextToLines(rawTitle, 26, 2);
    const titleFontSize = titleLines.length > 1 ? 44 : 52;
    const titleLineHeight = 54;
    const titleStartY = titleLines.length > 1 ? 240 : 265;

    const subtitleLines = wrapTextToLines(rawSubtitle, 55, 2);
    const subStartY = titleLines.length > 1 ? 360 : 335;
    const subLineHeight = 32;

    const badgesText = escapeSvg(rawBadges.join("   •   ").toUpperCase());

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
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
      ? `<g transform="translate(600, 105)">
           <circle cx="0" cy="0" r="36" fill="#181513" stroke="${accent}" stroke-width="2.5" />
           <text x="0" y="12" font-family="sans-serif" font-size="32" font-weight="900" fill="${accent}" text-anchor="middle">${initial}</text>
         </g>`
      : ""
  }

  <!-- Eyebrow Pill -->
  <g transform="translate(600, 175)">
    <text x="0" y="0" font-family="sans-serif" font-size="15" font-weight="800" letter-spacing="4" fill="${accent}" text-anchor="middle">
      ${displayEyebrow}
    </text>
  </g>

  <!-- Big Centered Title (Wrapped) -->
  <g transform="translate(600, 0)">
    ${titleLines
      .map(
        (line, idx) =>
          `<text x="0" y="${titleStartY + idx * titleLineHeight}" font-family="sans-serif" font-size="${titleFontSize}" font-weight="900" fill="#FAF8F5" letter-spacing="1" text-anchor="middle">${escapeSvg(line)}</text>`
      )
      .join("\n    ")}
  </g>

  <!-- Centered Subtitle (Wrapped) -->
  <g transform="translate(600, 0)">
    ${subtitleLines
      .map(
        (line, idx) =>
          `<text x="0" y="${subStartY + idx * subLineHeight}" font-family="sans-serif" font-size="22" font-weight="400" fill="#D6CDC2" letter-spacing="0.4" text-anchor="middle">${escapeSvg(line)}</text>`
      )
      .join("\n    ")}
  </g>

  <!-- Unified Center Capsule Badge Pill -->
  ${
    merged.showBadges && badgesText
      ? `<g transform="translate(600, 482)">
           <rect x="-340" y="-19" width="680" height="38" rx="19" fill="url(#accentPillGrad)" stroke="${accent}" stroke-opacity="0.35" stroke-width="1.2" />
           <text x="0" y="5" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="2" fill="#FAF8F5" text-anchor="middle">${badgesText}</text>
         </g>`
      : ""
  }

  ${
    merged.showWatermark
      ? `<g transform="translate(600, 560)">
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
    const titleLines = wrapTextToLines(rawTitle, 26, 2);
    const titleFontSize = titleLines.length > 1 ? 42 : 50;
    const titleLineHeight = 52;
    const titleStartY = titleLines.length > 1 ? 260 : 285;

    const dividerY = titleLines.length > 1 ? 355 : 330;
    const subStartY = titleLines.length > 1 ? 405 : 380;
    const subtitleLines = wrapTextToLines(rawSubtitle, 55, 2);
    const subLineHeight = 32;

    const galleryBadges = [
      merged.showBadges && rawBadges[0] ? escapeSvg(rawBadges[0].toUpperCase()) : null,
      merged.showWatermark ? `<tspan fill="${accent}">${domain}</tspan>` : null,
      merged.showBadges && (rawBadges[1] || rawBadges[2]) ? escapeSvg((rawBadges[1] || rawBadges[2] || "").toUpperCase()) : null,
    ].filter(Boolean);

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  ${defs}
  <rect width="1200" height="630" fill="url(#cardGrad)" />
  ${glowElement}
  ${borderElement}

  <!-- Gallery Header Emblem -->
  ${
    merged.showMonogram
      ? `<g transform="translate(600, 125)">
           <rect x="-30" y="-30" width="60" height="60" rx="14" fill="#181513" stroke="${accent}" stroke-width="2" />
           <text x="0" y="11" font-family="sans-serif" font-size="30" font-weight="800" fill="${accent}" text-anchor="middle">${initial}</text>
         </g>`
      : ""
  }

  <!-- Store Name & Eyebrow -->
  <g transform="translate(600, 205)">
    <text x="0" y="0" font-family="sans-serif" font-size="15" font-weight="800" letter-spacing="5" fill="${accent}" text-anchor="middle">
      ${displayEyebrow}
    </text>
  </g>

  <!-- Large Title (Wrapped) -->
  <g transform="translate(600, 0)">
    ${titleLines
      .map(
        (line, idx) =>
          `<text x="0" y="${titleStartY + idx * titleLineHeight}" font-family="sans-serif" font-size="${titleFontSize}" font-weight="900" fill="#FAF8F5" letter-spacing="1" text-anchor="middle">${escapeSvg(line)}</text>`
      )
      .join("\n    ")}
  </g>

  <!-- Single Delicate Center Hairline -->
  <line x1="480" y1="${dividerY}" x2="720" y2="${dividerY}" stroke="${palette.borderStart}" stroke-width="1.5" />

  <!-- Subtitle (Wrapped) -->
  <g transform="translate(600, 0)">
    ${subtitleLines
      .map(
        (line, idx) =>
          `<text x="0" y="${subStartY + idx * subLineHeight}" font-family="sans-serif" font-size="22" font-weight="400" fill="#D1C9BE" letter-spacing="0.5" text-anchor="middle">${escapeSvg(line)}</text>`
      )
      .join("\n    ")}
  </g>

  <!-- Bottom Domain with Badges -->
  ${
    galleryBadges.length > 0
      ? `<g transform="translate(600, 530)">
           <text x="0" y="0" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="3" fill="${palette.textMuted}" text-anchor="middle">
             ${galleryBadges.join("   •   ")}
           </text>
         </g>`
      : ""
  }
</svg>`;
  }

  // 5. Layout: split-studio (Side-by-Side Architectural Atelier)
  const titleLines = wrapTextToLines(rawTitle, 22, 2);
  const titleFontSize = titleLines.length > 1 ? 38 : 46;
  const titleLineHeight = 48;
  const titleStartY = titleLines.length > 1 ? 210 : 230;

  const subtitleLines = wrapTextToLines(rawSubtitle, 45, 2);
  const subStartY = titleLines.length > 1 ? 320 : 295;
  const subLineHeight = 30;

  const badgesText = escapeSvg(rawBadges.join("   •   ").toUpperCase());

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  ${defs}
  <rect width="1200" height="630" fill="url(#cardGrad)" />
  ${glowElement}
  ${borderElement}

  <!-- Left Studio Panel (width 340) -->
  <rect x="24" y="24" width="340" height="582" rx="20" fill="#13100E" stroke="${palette.borderStart}" stroke-width="1" />

  <g transform="translate(194, 200)">
    <circle cx="0" cy="0" r="50" fill="#1B1714" stroke="${accent}" stroke-width="3" />
    <text x="0" y="17" font-family="sans-serif" font-size="44" font-weight="900" fill="${accent}" text-anchor="middle">${initial}</text>
  </g>

  <g transform="translate(194, 305)">
    <text x="0" y="0" font-family="sans-serif" font-size="22" font-weight="900" letter-spacing="1" fill="#FAF8F5" text-anchor="middle">
      ${safeStoreName}
    </text>
    <text x="0" y="26" font-family="sans-serif" font-size="12" font-weight="700" letter-spacing="3" fill="${accent}" text-anchor="middle">
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
  <g transform="translate(430, 150)">
    <text x="0" y="0" font-family="sans-serif" font-size="14" font-weight="800" letter-spacing="4" fill="${accent}">
      ${displayEyebrow}
    </text>
  </g>

  <!-- Main Headline (Wrapped) -->
  <g transform="translate(430, 0)">
    ${titleLines
      .map(
        (line, idx) =>
          `<text x="0" y="${titleStartY + idx * titleLineHeight}" font-family="sans-serif" font-size="${titleFontSize}" font-weight="900" fill="#FAF8F5" letter-spacing="0.5">${escapeSvg(line)}</text>`
      )
      .join("\n    ")}
  </g>

  <!-- Narrative Subtitle (Wrapped) -->
  <g transform="translate(430, 0)">
    ${subtitleLines
      .map(
        (line, idx) =>
          `<text x="0" y="${subStartY + idx * subLineHeight}" font-family="sans-serif" font-size="20" font-weight="400" fill="#D1C9BE" letter-spacing="0.3">${escapeSvg(line)}</text>`
      )
      .join("\n    ")}
  </g>

  <line x1="430" y1="460" x2="1120" y2="460" stroke="${palette.borderEnd}" stroke-width="1.5" />

  ${
    merged.showBadges && badgesText
      ? `<g transform="translate(430, 520)">
           <text x="0" y="0" font-family="sans-serif" font-size="13" font-weight="600" letter-spacing="2" fill="${palette.textMuted}">
             ${badgesText}
           </text>
         </g>`
      : ""
  }
</svg>`;
}
