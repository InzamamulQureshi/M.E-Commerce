import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "M.E-Commerce | Minimalist, Modular E-Commerce Platform",
    short_name: "M.E-Commerce",
    description:
      "Minimalist, modular, open-source e-commerce platform with bespoke customization, fast checkout, and studio management.",
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
