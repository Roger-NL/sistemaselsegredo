import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: ["/", "/first-day", "/termos", "/privacidade"], disallow: ["/api/", "/adm"] }, sitemap: "https://basedspeak.com/sitemap.xml" };
}
