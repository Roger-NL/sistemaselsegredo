import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "BasedSpeak", short_name: "BasedSpeak", description: "Inglês na prática: apresentação, guia, atividades, teoria e teste.", start_url: "/", display: "standalone", background_color: "#fff7e8", theme_color: "#fff7e8", icons: [{ src: "/basedspeak-tab.png", sizes: "512x512", type: "image/png" }] };
}
