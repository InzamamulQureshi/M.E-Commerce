import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import "./globals.css";

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ubuntu",
});

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://mecommerce.dev");

export async function generateMetadata(): Promise<Metadata> {
  let storeName = "M.E-Commerce";
  let tagline = "Minimalist, Modular E-Commerce Platform";
  let ogTitle = "";
  let ogDescription = "";
  let ogImageUrl = "";

  try {
    const setting = await db.studioSetting.findUnique({
      where: { id: "default" },
      select: {
        storeName: true,
        tagline: true,
        ogTitle: true,
        ogDescription: true,
        ogImageUrl: true,
      },
    });
    if (setting) {
      if (setting.storeName) storeName = setting.storeName;
      if (setting.tagline) tagline = setting.tagline;
      if (setting.ogTitle) ogTitle = setting.ogTitle;
      if (setting.ogDescription) ogDescription = setting.ogDescription;
      if (setting.ogImageUrl) ogImageUrl = setting.ogImageUrl;
    }
  } catch {}

  let siteUrl = rawSiteUrl;
  try {
    const headerList = await headers();
    const rawHost = headerList.get("x-forwarded-host") || headerList.get("host");
    const host = rawHost ? rawHost.split(",")[0].trim() : null;
    const rawProto = headerList.get("x-forwarded-proto");
    const proto = rawProto ? rawProto.split(",")[0].trim() : (host?.includes("localhost") ? "http" : "https");
    if (host) {
      siteUrl = `${proto}://${host}`;
    }
  } catch {}

  const metaTitle = ogTitle || `${storeName} | Minimalist, Modular E-Commerce`;
  const metaDescription = ogDescription || tagline || "Minimalist, modular open-source e-commerce platform.";

  const ogImageFullUrl = ogImageUrl || `${siteUrl}/api/branding/og-image.png`;

  const images = [
    {
      url: ogImageFullUrl,
      secureUrl: ogImageFullUrl,
      width: 1200,
      height: 630,
      alt: metaTitle,
      type: "image/png",
    },
  ];

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: metaTitle,
      template: `%s | ${storeName}`,
    },
    description: metaDescription,
    icons: {
      icon: [
        { url: "/api/branding/favicon.svg", type: "image/svg+xml" },
        { url: "/api/branding/icon", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/api/branding/apple-icon", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: siteUrl,
      siteName: storeName,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [ogImageFullUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let activeTheme = "warm-terracotta";
  let currencyCode = "INR";
  let currencySymbol = "₹";

  try {
    const setting = await db.studioSetting.findUnique({
      where: { id: "default" },
      select: { activeTheme: true, currencyCode: true, currencySymbol: true },
    });
    if (setting) {
      if (setting.activeTheme) activeTheme = setting.activeTheme;
      if (setting.currencyCode) currencyCode = setting.currencyCode;
      if (setting.currencySymbol) currencySymbol = setting.currencySymbol;
    }
  } catch {}

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme={activeTheme}
      data-currency={currencyCode}
      data-currency-symbol={currencySymbol}
      className={`${ubuntu.variable} font-ubuntu`}
    >
      <head>
        <link rel="icon" type="image/svg+xml" href="/api/branding/favicon.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}else{document.documentElement.classList.remove("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased selection:bg-[hsl(var(--primary))] selection:text-[hsl(var(--primary-foreground))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
