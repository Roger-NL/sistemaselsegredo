import type { Metadata } from "next";
import { FirstDay } from "@/features/first-day/FirstDay";
import { coverSources, pages, partOnePortraitMedia, storyImage, usesCleanReading } from "@/features/first-day/content";

export const metadata: Metadata = {
  title: "First Day",
  description: "Leia First Day. Monte suas primeiras frases em inglês e converse com Ana no gibi interativo da BasedSpeak.",
  alternates: { canonical: "/first-day" },
};

export default function FirstDayPage() {
  const openingScenes = pages.slice(0, 2).filter(usesCleanReading);
  const desktopMedia = `not all and ${partOnePortraitMedia}`;
  return <>
    {coverSources.map(({ media, src }) => <link key={src} rel="preload" as="image" href={src} media={media} fetchPriority="high" />)}
    {openingScenes.flatMap((page, index) => [true, false].map(portrait => {
      const image = storyImage(page, portrait);
      return <link key={image.src} rel="preload" as="image" href={image.src}
        media={portrait ? partOnePortraitMedia : desktopMedia} fetchPriority={index === 0 ? "high" : "low"} />;
    }))}
    <FirstDay />
  </>;
}
