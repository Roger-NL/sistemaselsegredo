import { statSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { pages } from "@/features/first-day/content";
import { dialogue, firstDayVoiceUrl, narration, wordVoices, type FirstDayVoiceClip } from "@/features/first-day/narration";
import { prologue } from "@/features/first-day/prologue";
import { firstDayWordTimes } from "@/features/first-day/first-day-word-times";
import { matchingWords } from "@/features/first-day/ReadAlongText";

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

it("places the timed words of every Part 1 recording in transcript order", () => {
  const recordings = { ...narration, ...dialogue };
  for (const [id, times] of Object.entries(firstDayWordTimes)) {
    const { text } = recordings[id as keyof typeof recordings];
    expect(times, id).toHaveLength(text.split(/\s+/).length);
    let previousEnd = 0;
    for (const [start, end] of times) {
      expect(start, id).toBeGreaterThanOrEqual(previousEnd);
      expect(end, id).toBeGreaterThan(start);
      previousEnd = end;
    }
  }
});

it("follows the meaning across both languages without crossing narration clips", () => {
  expect(matchingWords("lunchtime-pt", { clip: "lunchtime", index: 0 })).toEqual([0, 1]);
  expect(matchingWords("lunchtime", { clip: "lunchtime-pt", index: 3 })).toEqual([3, 4]);
  expect(matchingWords("empty-chair-pt", { clip: "lunchtime", index: 6 })).toBeUndefined();
  expect(matchingWords("empty-chair-pt", { clip: "empty-chair", index: 8 })).toEqual([6, 7]);
  expect(matchingWords("rafael-intro-pt", { clip: "rafael-intro", index: 4 })).toBe(0);
  expect(matchingWords("example-seat-pt", { clip: "example-seat", index: 2 })).toBe(1);
});
