import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Retrospective } from "@/features/demo/components/Retrospective";
import { createDemo } from "@/features/demo/model/reducer";
import { lessons } from "@/features/theory/content";
import { completeStep, decodeProgress, emptyProgress, isCorrect, studySteps } from "@/features/theory/progress";

describe("cafeteria study", () => {
  it("offers study after the retrospective without requiring feedback submission", () => {
    for (const reviewView of ["thanks", "done"] as const) {
      const state = { ...createDemo("beginner", "study-bridge", 0), nodeId: "end", reviewView };
      const markup = renderToStaticMarkup(createElement(Retrospective, { state, setView: () => {}, replaying: false, onReplayChange: () => {} }));
      expect(markup).toContain('href="/demo/estudo"');
      expect(markup).toContain("Entender minha conversa");
    }
  });
  it("has usable exercises with unambiguous IDs and solutions", () => {
    expect(lessons).toHaveLength(8);
    expect(studySteps).toHaveLength(24);
    expect(new Set(studySteps.map(({ step }) => step.id)).size).toBe(24);
    for (const { step } of studySteps) {
      const game = step.practice;
      expect(step.body.length).toBeGreaterThan(80);
      expect(step.detail.length).toBeGreaterThan(40);
      const solution = game.kind === "write" ? game.answers[0] : game.answer;
      expect(isCorrect(game, solution)).toBe(true);
      expect(isCorrect(game, "")).toBe(false);
      if (game.kind === "choice") expect(game.options).toContain(game.answer);
      if (game.kind === "order") expect(game.tokens.slice().sort()).toEqual(game.answer.split(" ").sort());
    }
  });
  it("restores only known progress without touching the narrative session", () => {
    expect(decodeProgress("broken")).toEqual(emptyProgress);
    expect(decodeProgress('{"version":2}')).toEqual(emptyProgress);
    const id = studySteps[0].step.id;
    const restored = decodeProgress(JSON.stringify({ version: 1, position: 999, completed: [id, id, "unknown"], supported: [id, "unknown"] }));
    expect(restored).toEqual({ version: 1, position: 23, completed: [id], supported: [id] });
  });
  it("distinguishes model consultation from a later independent retry", () => {
    const id = studySteps[0].step.id;
    const supported = completeStep(emptyProgress, id, true);
    expect(supported.completed).toEqual([id]);
    expect(supported.supported).toEqual([id]);
    expect(completeStep(supported, id, false).supported).toEqual([]);
    expect(completeStep(supported, "unknown", false)).toBe(supported);
  });
  it("accepts punctuation, capitalization and equivalent contractions, while preserving meaning", () => {
    const game = { kind: "write" as const, prompt: "", answers: ["No, it's not mine."], hint: "", explanation: "" };
    expect(isCorrect(game, " NO, it’s not mine! ")).toBe(true);
    expect(isCorrect(game, "No, it is not mine")).toBe(true);
    expect(isCorrect(game, "No, it is mine")).toBe(false);
  });
});
