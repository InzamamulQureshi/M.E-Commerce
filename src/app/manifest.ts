import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Fourfold | Handcrafted Gifting Studio",
    short_name: "The Fourfold",
    description:
      "Personalized explosion boxes, handmade cards, keepsake scrapbooks, and everlasting crochet flowers folded by hand in Mumbai.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F5",
    theme_color: "#181513",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
