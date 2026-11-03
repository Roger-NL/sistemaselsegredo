import type { Metadata } from "next";
import { TheoryExperience } from "@/features/theory/TheoryExperience";
import { pageAudioCatalog } from "@/server/speech/published";
import "@/features/theory/theory.css";

export const metadata: Metadata = { title: "Entenda sua primeira conversa", description: "Explore as palavras, expressões e estruturas da conversa da cafeteria. Explicações claras, exemplos e prática no momento certo." };

export default async function StudyPage({ searchParams }: { searchParams: Promise<{ practice?: string | string[] }> }) {
  const params = await searchParams;
  return <TheoryExperience publishedAudio={pageAudioCatalog()} resumeStudy={params.practice === "1"} />;
}
