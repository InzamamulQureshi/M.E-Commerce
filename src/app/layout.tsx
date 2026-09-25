import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
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
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://thefourfold.com");

export const metadata: Metadata = {
  metadataBase: new URL(rawSiteUrl),
  title: {
    default: "The Fourfold | Handcrafted Gifting Studio • Mumbai",
    template: "%s | The Fourfold",
  },
  description:
    "Artisanal explosion boxes, accordion fold keepsake cards, preserved crochet tulips, and bespoke hampers hand-folded with love in Mumbai.",
  keywords: [
    "The Fourfold",
    "Handmade gifts",
    "Explosion boxes",
    "Accordion cards",
    "Crochet tulips",
    "Handmade albums",
    "Custom gift hamper",
    "Wax sealed letters",
    "Mumbai gifting studio",
  ],
  authors: [{ name: "The Fourfold Studio" }],
  creator: "The Fourfold Studio",
  publisher: "The Fourfold Studio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "The Fourfold | Handcrafted Gifting Studio • Mumbai",
    description: "Every memory deserves to be folded with intent. Personalized gifts crafted by hand in Bandra.",
    url: "/",
    siteName: "The Fourfold",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Fourfold | Handcrafted Gifting Studio • Mumbai",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Fourfold | Handcrafted Gifting Studio • Mumbai",
    description: "Every memory deserves to be folded with intent. Personalized gifts crafted by hand in Bandra.",
    creator: "@thefourfold.official",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
