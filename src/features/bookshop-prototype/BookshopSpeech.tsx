"use client";

import type { Phrase } from "./content";
import { BookshopAudioButton } from "./BookshopAudioButton";

export function BookshopSpeech({ phrase, speaker, label }: { phrase: Phrase; speaker: "Ben" | "Lara" | "Modelo"; label?: string }) {
  return (
    <div className={"bs-line " + (speaker === "Ben" ? "is-ben" : speaker === "Lara" ? "is-lara" : "is-model")}>
      <span className="bs-speaker">{label ?? (speaker === "Ben" ? "Você · Ben" : speaker)}</span>
      <div className="bs-speech-heading">
        <div className="bs-speech-copy">
          <p className="bs-english" lang="en" translate="no">{phrase.en}</p>
          <p className="bs-translation">{phrase.pt}</p>
        </div>
        <BookshopAudioButton text={phrase.en} speaker={speaker === "Ben" ? "ben" : speaker === "Lara" ? "lara" : "model"} compact />
      </div>
    </div>
  );
}
