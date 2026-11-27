// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { pages } from "@/features/first-day/content";
import { chapterOpeningAt, createFirstDayProgressStore, resetFirstDayProgress } from "@/features/first-day/first-day-progress";

const storageKey = "basedspeak:first-day:v1";
const exerciseProgress = {
  counts: { "ask-to-sit": 5, "meet-ana": 2 },
  attempts: { "close-the-door": { placed: [0, 1, 2, 3, 4], result: "correct", translated: true } },
};

afterEach(() => localStorage.removeItem(storageKey));

function savedReading(pageId: string | null) {
  localStorage.setItem(storageKey, JSON.stringify({
    pageId, ...exerciseProgress, sound: true, readingLanguage: "pt-BR",
  }));
  return createFirstDayProgressStore();
}

it("clears the first part from the cover and persists the change", () => {
  const store = savedReading(null);
  store.update(progress => resetFirstDayProgress(progress, 1));

  expect(createFirstDayProgressStore().getSnapshot()).toEqual({
    position: 0, tutorialSeen: true, counts: {}, attempts: {}, sound: true, readingLanguage: "pt-BR",
  });
});

it("keeps the current page when a different part is reset", () => {
  const store = savedReading("see-you-4");
  const previous = store.getSnapshot();
  store.update(progress => resetFirstDayProgress(progress, 1));

  expect(store.getSnapshot()).toEqual({ ...previous, counts: {}, attempts: {} });
  expect(previous).toMatchObject(exerciseProgress);
});

it.each([1, 2, 3, 4] as const)("returns to the start of Part %s when resetting that part from within it", part => {
  const partPages = pages.filter(page => page.part === part);
  const store = savedReading(partPages.at(-1)!.id);
  store.update(progress => resetFirstDayProgress(progress, part));

  const firstPosition = pages.indexOf(partPages[0]) + 1;
  expect(store.getSnapshot().position).toBe(firstPosition);
  expect(createFirstDayProgressStore().getSnapshot().position).toBe(firstPosition);
  if (part !== 1) expect(store.getSnapshot()).toMatchObject(exerciseProgress);
});

it("goes back to the cover and preserves the settings when all parts are reset", () => {
  const store = savedReading("close-the-door");
  store.update(progress => resetFirstDayProgress(progress, "all"));

  expect(createFirstDayProgressStore().getSnapshot()).toEqual({
    position: 0, tutorialSeen: false, counts: {}, attempts: {}, sound: true, readingLanguage: "pt-BR",
  });
});


it("remembers opening the prologue even before the first lesson page", () => {
  const store = createFirstDayProgressStore();
  expect(store.getSnapshot().tutorialSeen).toBe(false);
  store.update(current => ({ ...current, tutorialSeen: true }));
  expect(createFirstDayProgressStore().getSnapshot()).toMatchObject({ position: 0, tutorialSeen: true });
});

it("offers the prologue to an older cover-only save with just audio preferences", () => {
  localStorage.setItem(storageKey, JSON.stringify({ pageId: null, sound: false }));
  expect(createFirstDayProgressStore().getSnapshot()).toMatchObject({ sound: false, tutorialSeen: false });
});

it("retains the page turn between the two challenge rounds and resets Part 2 independently", () => {
  const store = savedReading("the-comic-5");
  store.update(previous => ({
    ...previous,
    counts: { ...previous.counts, "the-comic-1": 4 },
    attempts: { ...previous.attempts, "the-comic-5": { round: 1, placed: [] } },
  }));
  const resumed = createFirstDayProgressStore();
  expect(resumed.getSnapshot().attempts["the-comic-5"]).toMatchObject({ round: 1, placed: [] });
  expect(resumed.getSnapshot().counts["the-comic-1"]).toBe(4);
  resumed.update(previous => resetFirstDayProgress(previous, 2));
  expect(createFirstDayProgressStore().getSnapshot()).toMatchObject({
    position: 8, ...exerciseProgress,
  });
  expect(resumed.getSnapshot().attempts["the-comic-5"]).toBeUndefined();
  expect(resumed.getSnapshot().counts["the-comic-1"]).toBeUndefined();
});

it("checks a resumed challenge against the solution for its own word bank", () => {
  const store = savedReading("the-comic-5");
  store.update(previous => ({ ...previous, attempts: {
    "the-comic-5": { round: 1, placed: [2, 0, 3], result: "correct" },
  } }));
  expect(createFirstDayProgressStore().getSnapshot().attempts["the-comic-5"].result).toBe("correct");
  store.update(previous => ({ ...previous, attempts: {
    "the-comic-5": { round: 1, placed: [0, 1, 2], result: "correct" },
  } }));
  expect(createFirstDayProgressStore().getSnapshot().attempts["the-comic-5"].result).toBe("incorrect");
});

it("restores the Part 2 opening without changing the exercise bookmark", () => {
  localStorage.setItem(storageKey, JSON.stringify({
    pageId: "the-comic-1", partTwoOpening: true, ...exerciseProgress,
  }));
  const store = createFirstDayProgressStore();
  expect(store.getSnapshot()).toMatchObject({
    position: 8, chapterOpening: 2, ...exerciseProgress,
  });
  store.update(previous => ({ ...previous, readingLanguage: "pt-BR" }));
  expect(JSON.parse(localStorage.getItem(storageKey)!)).toMatchObject({ pageId: "the-comic-1", chapterOpening: 2 });

  store.update(previous => resetFirstDayProgress(previous, 2));
  expect(createFirstDayProgressStore().getSnapshot().chapterOpening).toBeUndefined();
});

it("keeps the Part 3 opening at its own first page and clears it when Part 3 is reset", () => {
  const store = savedReading("meet-leo-1");
  const opening = chapterOpeningAt(store.getSnapshot().position);
  expect(opening).toBe(3);
  store.update(previous => ({ ...previous, chapterOpening: opening }));
  expect(createFirstDayProgressStore().getSnapshot()).toMatchObject({ chapterOpening: 3, ...exerciseProgress });

  store.update(previous => resetFirstDayProgress(previous, 2));
  expect(store.getSnapshot().chapterOpening).toBe(3);
  store.update(previous => resetFirstDayProgress(previous, 3));
  expect(createFirstDayProgressStore().getSnapshot().chapterOpening).toBeUndefined();

  localStorage.setItem(storageKey, JSON.stringify({ pageId: "meet-leo-2", chapterOpening: 3 }));
  expect(createFirstDayProgressStore().getSnapshot().chapterOpening).toBeUndefined();
});

it("restores the completed lesson and preserves it when an earlier chapter is reset", () => {
  const finalPage = pages.at(-1);
  if (finalPage?.part !== 4 || finalPage.kind !== "Desafio") throw new Error("Final chapter challenge is missing");

  const store = savedReading(finalPage.id);
  store.update(previous => ({ ...previous, lessonFinished: true, attempts: {
    ...previous.attempts, [finalPage.id]: { round: 1, placed: finalPage.rounds[1].solution, result: "correct" },
  } }));
  const resumed = createFirstDayProgressStore();
  expect(resumed.getSnapshot()).toMatchObject({ position: pages.length, lessonFinished: true });

  resumed.update(previous => resetFirstDayProgress(previous, 3));
  expect(createFirstDayProgressStore().getSnapshot().lessonFinished).toBe(true);
  resumed.update(previous => resetFirstDayProgress(previous, 4));
  expect(createFirstDayProgressStore().getSnapshot().lessonFinished).toBeUndefined();
  expect(resumed.getSnapshot().attempts[finalPage.id]).toBeUndefined();
});

it("reopens the final challenge when a saved completion does not match the solution", () => {
  const store = savedReading("see-you-5");
  store.update(previous => ({ ...previous, lessonFinished: true, attempts: {
    ...previous.attempts, "see-you-5": { round: 1, placed: [0], result: "correct" },
  } }));

  const snapshot = createFirstDayProgressStore().getSnapshot();
  expect(snapshot.lessonFinished).toBeUndefined();
  expect(snapshot.attempts["see-you-5"]).toMatchObject({ result: "incorrect", round: 1 });
});
