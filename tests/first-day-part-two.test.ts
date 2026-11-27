import { existsSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { pages } from "@/features/first-day/content";
import { partTwoPages, type PartTwoArt } from "@/features/first-day/part-two-content";
import { meaningOf } from "@/features/first-day/WordMeaning";

it("opens all five existing Part 2 bookmarks and ships both crops of every illustration", () => {
  const chapter = pages.slice(7, 12);
  expect(chapter.map(page => page.id)).toEqual([1, 2, 3, 4, 5].map(n => `the-comic-${n}`));
  expect(chapter.map(page => page.kind)).toEqual(["Ação", "Ação", "Tirinha", "Explicação", "Desafio"]);
  const panels = new Set<PartTwoArt>();
  for (const page of partTwoPages) {
    switch (page.kind) {
      case "Ação": panels.add(page.before); panels.add(page.after); break;
      case "Tirinha": page.panels.forEach(panel => panels.add(panel.art)); break;
      case "Explicação": page.examples.forEach(example => panels.add(example.art)); break;
      case "Desafio": {
        expect(page.partialRequest).toBeDefined();
        for (const edition of ["image", "portraitImage"] as const) {
          expect(page.rounds[0].art[edition].src).toMatch(/\/desafio\.webp$/);
          expect(page.partialRequest?.revealArt[edition].src).toMatch(/\/revelacao\.webp$/);
        }
        page.rounds.forEach(round => panels.add(round.art));
        if (page.partialRequest) panels.add(page.partialRequest.revealArt);
        break;
      }
    }
  }
  for (const panel of panels) {
    for (const image of [panel.image, panel.portraitImage]) {
      expect(existsSync(join(process.cwd(), "public", image.src)), image.src).toBe(true);
    }
  }
});

it("pairs every assembled word with a definition and each guided drop with its translation", () => {
  for (const page of partTwoPages) {
    if (page.kind === "Ação") {
      expect([...page.order].sort()).toEqual(page.words.map((_, i) => i));
      expect(page.translations).toHaveLength(page.words.length + 1);
      for (const word of page.words) expect(meaningOf(word), word).toBeTruthy();
    }
    if (page.kind === "Desafio") {
      expect(page.rounds).toHaveLength(1);
      const [round] = page.rounds;
      expect(page.partialRequest?.fixed).toEqual(["Can", "turn", "page?"]);
      expect(round.bank).toEqual(["you", "the"]);
      expect(round.solution.map(i => round.bank[i])).toEqual(["you", "the"]);
      for (const word of round.bank) expect(meaningOf(word), word).toBeTruthy();
    }
  }
});

it("uses the same natural translation for Ana's reaction and the word glossary", () => {
  const scene = partTwoPages.find(page => page.id === "the-comic-2");
  if (scene?.kind !== "Ação") throw new Error("Missing Part 2 reaction");
  expect(scene.replyCaption).toEqual({ en: "Ana smiles.", pt: "Ana dá um sorriso." });
  expect(scene.reply).toMatchObject({ en: "I know, right?", pt: "Pois é, né?" });
  expect(meaningOf("know,")).toContain(scene.reply.pt);
  expect(meaningOf("right?")).toContain(scene.reply.pt);
  expect(meaningOf("right?")).toContain("right here = aqui mesmo");
});
