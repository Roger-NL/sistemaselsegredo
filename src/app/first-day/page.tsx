import type { Metadata } from "next";
import { FirstDay } from "@/features/first-day/FirstDay";
import { art, cleanReadingArt, cleanReadingMedia, coverSources, pages, storyImage, usesCleanReading } from "@/features/first-day/content";

export const metadata: Metadata = {
  title: "First Day",
  description: "Leia First Day. Monte suas primeiras frases em inglês e converse com Ana no gibi interativo da BasedSpeak.",
  alternates: { canonical: "/first-day" },
};

export default function FirstDayPage() {
  const secondPage = pages[1];
  const otherLayouts = `not all and ${cleanReadingMedia}`;
  return <>
    {coverSources.map(({ media, src }) => <link key={src} rel="preload" as="image" href={src} media={media} fetchPriority="high" />)}
    <link rel="preload" as="image" href={cleanReadingArt.src} media={cleanReadingMedia} fetchPriority="high" />
    <link rel="preload" as="image" href={art.arrival.src} media={otherLayouts} fetchPriority="high" />
    {usesCleanReading(secondPage) && <>
      <link rel="preload" as="image" href={storyImage(secondPage, true).src} media={cleanReadingMedia} fetchPriority="low" />
      <link rel="preload" as="image" href={storyImage(secondPage, false).src} media={otherLayouts} fetchPriority="low" />
    </>}
    <FirstDay />
  </>;
}
