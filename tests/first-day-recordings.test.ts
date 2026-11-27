import { statSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { pages } from "@/features/first-day/content";
import { dialogue, firstDayVoiceUrl, narration, wordVoices, type FirstDayVoiceClip } from "@/features/first-day/narration";
import { prologue } from "@/features/first-day/prologue";

it("keeps the introduction pieces, spoken line and Portuguese translation in sync", () => {
  const page = pages.find(page => page.id === "meet-ana");
  if (page?.part !== 1 || page.kind !== "Ação" || !page.translationVoice) throw new Error("Missing bilingual introduction");
  expect(page.words.join(" ")).toBe("I’m Rafael, by the way.");
  expect(dialogue[page.voice].text).toBe(page.words.join(" "));
  expect(narration[page.translationVoice].text).toBe(page.translations.at(-1));
});

it("ships a recording for every selectable word and every locally recorded line", () => {
  const clips = new Set<FirstDayVoiceClip>(Object.values(wordVoices));
  for (const panel of Object.values(prologue)) {
    clips.add(panel.audio);
    for (const piece of panel.pieces) clips.add(piece.voice);
  }
  clips.add("tutorial-door-en");
  clips.add("tutorial-door-pt");
  for (const id of Object.keys({ ...dialogue, ...narration }) as Array<keyof typeof dialogue | keyof typeof narration>) {
    if (firstDayVoiceUrl(id).startsWith("/first-day-part-one/audio/")) clips.add(id);
  }
  for (const clip of clips) {
    const pathname = firstDayVoiceUrl(clip);
    expect(statSync(join(process.cwd(), "public", pathname)).size, pathname).toBeGreaterThan(0);
  }
});
