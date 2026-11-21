import type { Metadata } from "next";
import { FirstDay } from "@/features/first-day/FirstDay";
import { art, coverSources } from "@/features/first-day/content";

export const metadata: Metadata = {
  title: "First Day · Protótipo",
  robots: { index: false, follow: false },
};

export default function FirstDayPage() {
  return <>
    {coverSources.map(({ media, src }) => <link key={src} rel="preload" as="image" href={src} media={media} fetchPriority="high" />)}
    <link rel="preload" as="image" href={art.arrival.src} fetchPriority="high" />
    <FirstDay />
  </>;
}
