import { describe, expect, it } from "vitest";
import { appendEvent, chosenPhrase, freshSnapshot, responseFor, restoreSnapshot, scenes, type JourneyEvent } from "../src/features/bookshop-prototype/content";
import { freshGuide, restoreGuide } from "../src/features/bookshop-prototype/onboarding";

const route: JourneyEvent[] = [
  { sceneId: "seat", option: 1 },
  { sceneId: "name", option: 0 },
  { sceneId: "book", option: 1 },
  { sceneId: "bookmark", assisted: true },
  { sceneId: "invitation", option: 0 },
  { sceneId: "note", assisted: false },
];

describe("bookshop local prototype progression", () => {
  it("restores the actual phrase choices and assistance", () => {
    const completed = route.reduce(appendEvent, freshSnapshot());
    const restored = restoreSnapshot(JSON.stringify(completed));
    expect(restored.events).toEqual(route);
    expect(chosenPhrase(scenes[0], restored.events[0])?.en).toBe("Can I sit with you?");
    expect(chosenPhrase(scenes[2], restored.events[2])?.en).toBe("What's it about?");
  });

  it("rejects duplicate clicks and attempts to skip to a later scene", () => {
    const first = appendEvent(freshSnapshot(), route[0]);
    expect(appendEvent(first, route[0])).toBe(first);
    expect(appendEvent(first, route[4])).toBe(first);
    expect(first.events).toHaveLength(1);
  });

  it("accepts both valid ways to speak and rejects an unknown option", () => {
    for (const option of [0, 1] as const) {
      const result = appendEvent(freshSnapshot(), { sceneId: "seat", option });
      expect(result.events[0].option).toBe(option);
      expect(responseFor(scenes[0], result.events[0]).en).toBe("Sure! I'm Lara.");
    }
    const original = freshSnapshot();
    expect(appendEvent(original, { sceneId: "seat", option: 2 } as unknown as JourneyEvent)).toBe(original);
  });

  it("does not credit a supplied model as a phrase authored by the learner", () => {
    expect(chosenPhrase(scenes[5], { sceneId: "note", assisted: true })).toBeNull();
    expect(chosenPhrase(scenes[5], { sceneId: "note", assisted: false })?.en).toBe("See you tomorrow!");
    expect(responseFor(scenes[3], { sceneId: "bookmark", assisted: true }).en).toBe("Here it is.");
  });

  it("recovers a partial note only at the note scene", () => {
    const beforeNote = route.slice(0, 5).reduce(appendEvent, freshSnapshot());
    expect(restoreSnapshot(JSON.stringify({ ...beforeNote, noteDraft: [1] })).noteDraft).toEqual([1]);
    expect(restoreSnapshot(JSON.stringify({ ...beforeNote, noteDraft: [1, 1] })).noteDraft).toEqual([]);
    expect(restoreSnapshot(JSON.stringify({ ...freshSnapshot(), noteDraft: [0] })).noteDraft).toEqual([]);
  });

  it("handles malformed and out-of-order snapshots without entering a broken scene", () => {
    for (const raw of ["bad JSON", "null", "{}", JSON.stringify({ version: 1, started: true, events: [route[1]] })]) {
      expect(restoreSnapshot(raw)).toEqual(freshSnapshot());
    }
  });
});

describe("bookshop guided presentation recovery", () => {
  it("resumes an unfinished guide independently of the story", () => {
    expect(restoreGuide(JSON.stringify({ version: 1, dismissed: false, step: 3 }))).toEqual({ version: 1, dismissed: false, step: 3 });
    expect(restoreGuide(JSON.stringify({ version: 1, dismissed: true, step: 5 }))).toEqual({ version: 1, dismissed: true, step: 5 });
  });

  it("recovers safely from invalid guide positions and malformed storage", () => {
    for (const raw of [null, "null", "{}", "bad", JSON.stringify({ version: 1, dismissed: false, step: 6 }), JSON.stringify({ version: 1, dismissed: false, step: -1 })]) {
      expect(restoreGuide(raw)).toEqual(freshGuide());
    }
  });
});
