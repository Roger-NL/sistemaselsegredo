import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/demo", "/termos", "/privacidade"].map(route => ({ url: `https://basedspeak.com${route}`, changeFrequency: "monthly", priority: route ? 0.5 : 1 }));
}
