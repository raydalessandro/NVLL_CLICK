import type { MetadataRoute } from "next";
import { site } from "@/lib/catalog";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    lang: "it",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: site.backgroundColor,
    theme_color: site.themeColor,
    categories: ["music", "entertainment"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Ascolta", url: "/listen", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Feed", url: "/social", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
