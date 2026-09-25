import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mecommerce.dev";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/catalog", "/catalog/*", "/about"],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/account",
          "/account/*",
          "/checkout",
          "/order-confirmation/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
