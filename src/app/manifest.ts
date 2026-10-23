import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "BasedSpeak", short_name: "BasedSpeak", description: "Uma conversa guiada em uma cafeteria, do primeiro café à despedida.", start_url: "/", display: "standalone", background_color: "#f4f0e8", theme_color: "#f4f0e8", icons: [{ src: "/basedspeak-tab.png", sizes: "512x512", type: "image/png" }] };
}
