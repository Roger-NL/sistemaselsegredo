import { describe, expect, it } from "vitest";
import { getSequelSteps, sequelPages } from "@/features/first-day/sequel-content";
import { sequelBalloonPrints, sequelSpeechBeats, sequelSpeechSplit } from "@/features/first-day/sequel-balloon-layout";
import { sequelHintSlots, sequelPlacementWithHints, sequelWordBank } from "@/features/first-day/sequel-word-bank";
import { sequelWordTranslation } from "@/features/first-day/sequel-word-translations";

function challenge(part: 3 | 4 | 5) {
  const page = sequelPages.find(page => page.part === part && page.kind === "Desafio");
  if (page?.kind !== "Desafio") throw new Error(`Missing challenge for Part ${part}`);
  return page;
}

describe("the last three parts of First Day", () => {
  it.each([3, 4, 5] as const)("keeps the teaching sequence in Part %s", part => {
    const chapter = sequelPages.filter(page => page.part === part);
    expect(chapter.map(page => page.kind)).toEqual([
      ...Array(part === 5 ? 3 : 2).fill("História"),
      "Tirinha", "Explicação", "Desafio",
    ]);
    expect(chapter.find(page => page.kind === "Tirinha")?.panels).toHaveLength(3);
  });

  it("only offers lines from Part 3 in the greeting challenge", () => {
    const lines = sequelPages.flatMap(page => page.part === 3 && page.kind === "História"
      ? page.panels.flatMap(({ line }) => line ? [line] : []) : []);
    const exercise = challenge(3).exercises[0];
    expect(exercise.solution.pt.map(index => exercise.bank.pt[index])).toEqual(["Prazer em te conhecer."]);
    for (const lang of ["pt", "en"] as const) {
      expect(exercise.bank[lang].every(option => lines.some(line => line[lang].includes(option)))).toBe(true);
    }
  });

  it("makes every Léo and Rafael story panel an assembly in scene order", () => {
    for (const page of sequelPages) {
      if (page.kind !== "História") continue;
      const speakers = page.panels.flatMap(({ line }, index) =>
        line?.speaker === "Léo" || line?.speaker === "Rafael" ? [index] : []);
      const steps = getSequelSteps(page);
      expect(steps.map(step => step.panelIndex)).toEqual(speakers);
      expect(steps.every(step => step.exercise.mode === "assemble")).toBe(true);
    }
  });

  it("gives every speaking panel both sets of anchors and preserves split dialogue verbatim", () => {
    for (const page of sequelPages) {
      const panels = page.kind === "História" ? page.panels : page.kind === "Desafio" ? page.closing : undefined;
      for (const { line, art } of panels ?? []) {
        if (!line) continue;
        const id = art.image.src.split("/").at(-1)?.slice(0, -5) ?? "";
        expect(sequelBalloonPrints[id]?.desktop.mouth, id).toBeDefined();
        expect(sequelBalloonPrints[id]?.portrait.mouth, id).toBeDefined();
        const beats = sequelSpeechBeats[id];
        if (beats) {
          for (const lang of ["en", "pt"] as const) expect(beats.map(beat => beat[lang]).join(" "), id).toBe(line[lang]);
        }
      }
    }
  });

  it("splits the farewell at a word boundary and keeps the earlier rounds in one balloon", () => {
    const page = challenge(5);
    const line = page.closing?.[0].line;
    const exerciseSplits = (lang: "en" | "pt") => page.exercises.map(({ bank, solution }) => {
      const { words, order } = sequelWordBank(bank[lang], solution[lang]);
      return sequelSpeechSplit("v2-rafael-despede", lang, line?.[lang], order.map(index => words[index]));
    });
    expect(exerciseSplits("en")).toEqual([0, 0, 6]);
    expect(exerciseSplits("pt")).toEqual([0, 0, 5]);
    expect(sequelWordTranslation(line!.en, "en", 6)).toBe("Valeu, pessoal! Tenho que ir.");
    expect(sequelWordTranslation(line!.en, "en", 7, 6)).toBe("Até…");
  });

  it("offers individual words and translates every assembly in both directions", () => {
    for (const page of sequelPages) {
      for (const { exercise } of getSequelSteps(page)) {
        if (exercise.mode !== "assemble") continue;
        for (const lang of ["en", "pt"] as const) {
          const other = lang === "en" ? "pt" : "en";
          const { words, order } = sequelWordBank(exercise.bank[lang], exercise.solution[lang]);
          expect(words.every(word => /^\S+$/.test(word))).toBe(true);
          const original = exercise.solution[lang].map(index => exercise.bank[lang][index]).join(" ");
          expect(order.map(index => words[index]).join(" ")).toBe(original);
          expect(sequelWordTranslation(original, lang, 0)).toBe("");
          expect(sequelWordTranslation(original, lang, 1), original).not.toBe("");
          expect(sequelWordTranslation(original, lang, order.length), original).toBe(
            exercise.solution[other].map(index => exercise.bank[other][index]).join(" "),
          );
        }
      }
    }
  });

  it("provides three hints in each long balloon and includes the next hint in the translation prefix", () => {
    const hints = sequelHintSlots([8, 20]);
    expect([...hints]).toEqual([1, 4, 6, 9, 14, 18]);
    const answer = Array.from({ length: 20 }, (_, index) => index);
    expect(sequelPlacementWithHints([], answer, hints)).toEqual([]);
    expect(sequelPlacementWithHints([0], answer, hints)).toEqual([0, 1]);
    expect(sequelPlacementWithHints([0, 1, 2], answer, hints)).toEqual([0, 1, 2]);
    expect([...sequelHintSlots([6])]).toEqual([]);
    expect(sequelWordTranslation("Hello, Leo! Nice to meet you.", "en", 1)).toBe("Olá,");
  });

  it("practices borrowing in Part 4 and ends Part 5 in story order", () => {
    const sentences = (part: 4 | 5) => getSequelSteps(challenge(part)).map(({ exercise: { bank, solution } }) =>
      solution.pt.map(index => bank.pt[index]).join(" "));
    expect(sentences(4)).toEqual(["Você me emprestaria seu gibi hoje, Léo?"]);
    expect(sentences(5)).toEqual([
      "Amanhã, na hora do almoço", "Aqui mesmo", "Valeu, pessoal! Tenho que ir. Mas até amanhã, hein?", "Tchau! Até amanhã!",
    ]);
    expect(getSequelSteps(challenge(5)).map(step => step.panelIndex)).toEqual([0, 0, 0, 1]);
    expect(sequelPages.find(page => page.part === 5 && page.kind === "Explicação")?.caption.pt).toContain("Tenho que ir");
    expect(challenge(5).closing?.map(panel => panel.line?.pt)).toEqual([
      "Valeu, pessoal! Tenho que ir. Mas até amanhã, hein?", "Tchau! Até amanhã!", undefined,
    ]);
  });

  it("leaves two hints in a new borrowing request", () => {
    const { bank, solution, prefilled } = challenge(4).exercises[0];
    const { words, order } = sequelWordBank(bank.en, solution.en);
    const sentence = order.map(index => words[index]).join(" ");
    expect(sentence).toBe("Would you lend me your comic today, Leo?");
    expect(prefilled?.en.map(slot => words[order[slot]])).toEqual(["Would", "your"]);
    expect(order.length - prefilled!.en.length).toBe(6);
    const storyLines = sequelPages.filter(page => page.part === 4 && page.kind === "História")
      .flatMap(page => page.kind === "História" ? page.panels.map(panel => panel.line?.en) : []);
    expect(storyLines.every(line => !line?.includes(sentence))).toBe(true);
  });
});
