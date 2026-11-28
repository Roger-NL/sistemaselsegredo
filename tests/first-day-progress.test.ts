// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { pages } from "@/features/first-day/content";
import { chapterOpeningAt, createFirstDayProgressStore, resetFirstDayProgress } from "@/features/first-day/first-day-progress";
import { getSequelSteps } from "@/features/first-day/sequel-content";
import { sequelWordBank } from "@/features/first-day/sequel-word-bank";

const storageKey = "basedspeak:first-day:v1";
const exerciseProgress = {
  counts: { "ask-to-sit": 5, "meet-ana": 2 },
  attempts: { "close-the-door": { placed: [0, 1, 2, 3, 4], result: "correct", translated: true } },
};

afterEach(() => localStorage.removeItem(storageKey));

it("migrates a placed phrase into its individual words in the current final challenge round", () => {
  const finalPage = pages.at(-1)!;
  if (!("edition" in finalPage)) throw new Error("Final sequel challenge is missing");
  const { bank, solution } = getSequelSteps(finalPage)[2].exercise;
  const wordBank = sequelWordBank(bank.pt, solution.pt);
  localStorage.setItem(storageKey, JSON.stringify({
    pageId: finalPage.id,
    counts: { [finalPage.id]: 2 },
    sequelActivityVersion: 1,
    attempts: { [finalPage.id]: { placed: [1], language: "pt-BR" } },
  }));
  expect(createFirstDayProgressStore().getSnapshot()).toMatchObject({
    counts: { [finalPage.id]: 2 },
    attempts: { [finalPage.id]: { placed: wordBank.groups[1], language: "pt-BR" } },
  });
  expect(wordBank.groups[1].map(index => wordBank.words[index])).toEqual(["Valeu,", "pessoal!"]);
});

it("drops the old Part 4 word indexes and retains completion and other answers", () => {
  const pageId = "borrow-comic-v2-challenge";
  const oldAttempt = { language: "en", placed: [2, 1] };
  const saved = { pageId, sequelActivityVersion: 2, attempts: { ...exerciseProgress.attempts, [pageId]: oldAttempt } };
  localStorage.setItem(storageKey, JSON.stringify(saved));
  const store = createFirstDayProgressStore();
  expect(store.getSnapshot().attempts[pageId]).toBeUndefined();
  expect(store.getSnapshot().attempts["close-the-door"]?.result).toBe("correct");
  store.update(previous => ({ ...previous, attempts: { ...previous.attempts, [pageId]: { language: "en", placed: [3, 1] } } }));
  expect(createFirstDayProgressStore().getSnapshot().attempts[pageId]?.placed).toEqual([3, 1]);

  localStorage.setItem(storageKey, JSON.stringify({ ...saved, counts: { [pageId]: 1 } }));
  expect(createFirstDayProgressStore().getSnapshot().counts[pageId]).toBe(1);
});

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
  const store = savedReading(pages.at(-1)!.id);
  const previous = store.getSnapshot();
  store.update(progress => resetFirstDayProgress(progress, 1));

  expect(store.getSnapshot()).toEqual({ ...previous, counts: {}, attempts: {} });
  expect(previous).toMatchObject(exerciseProgress);
});

it.each([1, 2, 3, 4, 5] as const)("returns to the start of Part %s when resetting that part from within it", part => {
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

it("retains a partly filled request and resets Part 2 independently", () => {
  const store = savedReading("the-comic-5");
  store.update(previous => ({
    ...previous,
    counts: { ...previous.counts, "the-comic-1": 4 },
    attempts: { ...previous.attempts, "the-comic-5": { round: 0, placed: [0] } },
  }));
  const resumed = createFirstDayProgressStore();
  expect(resumed.getSnapshot().attempts["the-comic-5"]).toMatchObject({ round: 0, placed: [0] });
  expect(resumed.getSnapshot().counts["the-comic-1"]).toBe(4);
  resumed.update(previous => resetFirstDayProgress(previous, 2));
  expect(createFirstDayProgressStore().getSnapshot()).toMatchObject({
    position: 8, ...exerciseProgress,
  });
  expect(resumed.getSnapshot().attempts["the-comic-5"]).toBeUndefined();
  expect(resumed.getSnapshot().counts["the-comic-1"]).toBeUndefined();
});

it("checks a resumed request against the solution for its own word bank", () => {
  const store = savedReading("the-comic-5");
  store.update(previous => ({ ...previous, attempts: {
    "the-comic-5": { round: 0, placed: [0, 1], result: "correct" },
  } }));
  expect(createFirstDayProgressStore().getSnapshot().attempts["the-comic-5"].result).toBe("correct");
  store.update(previous => ({ ...previous, attempts: {
    "the-comic-5": { round: 0, placed: [1, 0], result: "correct" },
  } }));
  expect(createFirstDayProgressStore().getSnapshot().attempts["the-comic-5"].result).toBe("incorrect");
});

it.each([
  [undefined, { round: 1, placed: [2, 0, 3], result: "correct" }, true],
  [undefined, { round: 1, placed: [] }, false],
  [2, { round: 0, placed: [2, 0], result: "correct" }, true],
  [2, { round: 0, placed: [0, 2], result: "incorrect" }, false],
] as const)("migrates Part 2 progress from version %s with attempt %j", (partTwoRequestVersion, before, complete) => {
  localStorage.setItem(storageKey, JSON.stringify({
    pageId: "the-comic-5",
    partTwoRequestVersion,
    attempts: { ...exerciseProgress.attempts, "the-comic-5": before },
  }));
  const { attempts } = createFirstDayProgressStore().getSnapshot();
  expect(attempts["the-comic-5"]).toEqual(complete
    ? { round: 0, placed: [0, 1], result: "correct", translated: false } : undefined);
  expect(attempts["close-the-door"]).toMatchObject(exerciseProgress.attempts["close-the-door"]);
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
  const partPages = pages.filter(page => page.part === 3);
  const store = savedReading(partPages[0].id);
  const opening = chapterOpeningAt(store.getSnapshot().position);
  expect(opening).toBe(3);
  store.update(previous => ({ ...previous, chapterOpening: opening }));
  expect(createFirstDayProgressStore().getSnapshot()).toMatchObject({ chapterOpening: 3, ...exerciseProgress });

  store.update(previous => resetFirstDayProgress(previous, 2));
  expect(store.getSnapshot().chapterOpening).toBe(3);
  store.update(previous => resetFirstDayProgress(previous, 3));
  expect(createFirstDayProgressStore().getSnapshot().chapterOpening).toBeUndefined();

  localStorage.setItem(storageKey, JSON.stringify({ pageId: partPages[1].id, chapterOpening: 3 }));
  expect(createFirstDayProgressStore().getSnapshot().chapterOpening).toBeUndefined();
});

it.each([["meet-leo-3", 3], ["see-you-5", 4]] as const)(
  "migrates the old bookmark %s to the opening of Part %s without dropping earlier answers",
  (pageId, chapterOpening) => {
    localStorage.setItem(storageKey, JSON.stringify({
      pageId, lessonFinished: true, partTwoRequestVersion: 3,
      counts: { ...exerciseProgress.counts, "the-comic-1": 4, "meet-leo-1": 2, "see-you-1": 2 },
      attempts: {
        ...exerciseProgress.attempts,
        "the-comic-5": { round: 0, placed: [0, 1], result: "correct" },
        "meet-leo-5": { round: 1, placed: [0], result: "correct" },
        "see-you-5": { round: 1, placed: [0], result: "correct" },
      },
    }));
    const position = pages.findIndex(page => page.part === chapterOpening) + 1;
    const snapshot = createFirstDayProgressStore().getSnapshot();
    expect(snapshot).toMatchObject({ position, chapterOpening });
    expect(snapshot.lessonFinished).toBeUndefined();
    expect(snapshot.counts).toEqual({ ...exerciseProgress.counts, "the-comic-1": 4 });
    expect(snapshot.attempts).toEqual({
      ...exerciseProgress.attempts,
      "the-comic-5": { round: 0, placed: [0, 1], result: "correct", translated: false },
    });
  },
);

function finalChallenge() {
  const page = pages.at(-1);
  if (page?.part !== 5 || !("edition" in page) || page.kind !== "Desafio") {
    throw new Error("Final chapter challenge is missing");
  }
  return page;
}

it("restores the completed introduction interaction and lets Part 3 reset it independently", () => {
  const introduction = pages.find(page => page.id === "meet-leo-v2-greetings");
  if (!introduction) throw new Error("Introduction interaction is missing");

  const store = savedReading(introduction.id);
  store.update(previous => ({ ...previous, counts: { ...previous.counts, [introduction.id]: 1 } }));
  const resumed = createFirstDayProgressStore();
  expect(resumed.getSnapshot().counts[introduction.id]).toBe(1);
  resumed.update(previous => resetFirstDayProgress(previous, 3));
  expect(createFirstDayProgressStore().getSnapshot().counts).toEqual(exerciseProgress.counts);
});

it("keeps completed sequel exercises while opening a previously finished lesson at the new reply", () => {
  const finalPage = finalChallenge();
  localStorage.setItem(storageKey, JSON.stringify({
    ...exerciseProgress,
    pageId: finalPage.id,
    lessonFinished: true,
    counts: {
      ...exerciseProgress.counts,
      "meet-leo-v2-greetings": 1,
      "borrow-comic-v2-request": 1,
      [finalPage.id]: 3,
    },
  }));
  const snapshot = createFirstDayProgressStore().getSnapshot();
  expect(snapshot).toMatchObject({
    position: pages.length,
    counts: {
      ...exerciseProgress.counts,
      "meet-leo-v2-greetings": 1,
      "borrow-comic-v2-request": 1,
      [finalPage.id]: 3,
    },
    attempts: exerciseProgress.attempts,
  });
  expect(snapshot.lessonFinished).toBeUndefined();
});

it("resumes the new shared goodbye assembly after a reload", () => {
  const finalPage = finalChallenge();
  const store = savedReading(finalPage.id);
  store.update(previous => ({
    ...previous,
    counts: { ...previous.counts, [finalPage.id]: 3 },
    attempts: { ...previous.attempts, [finalPage.id]: { language: "pt-BR", placed: [1] } },
    frames: { "meet-leo-v2-greetings": 1, [finalPage.id]: 1 },
  }));
  const resumed = createFirstDayProgressStore();
  expect(resumed.getSnapshot()).toMatchObject({
    counts: { [finalPage.id]: 3 },
    attempts: { [finalPage.id]: { language: "pt-BR", placed: [1] } },
    frames: { "meet-leo-v2-greetings": 1, [finalPage.id]: 1 },
  });
  resumed.update(previous => resetFirstDayProgress(previous, 5));
  expect(createFirstDayProgressStore().getSnapshot().frames).toEqual({ "meet-leo-v2-greetings": 1 });
});

it("discards out of bounds panel cursors and restores the last illustration", () => {
  const finalPage = finalChallenge();
  const store = savedReading(finalPage.id);
  store.update(previous => ({
    ...previous,
    counts: { ...previous.counts, [finalPage.id]: getSequelSteps(finalPage).length },
    frames: {
      "meet-leo-v2-arrival": 1,
      "meet-leo-v2-greetings": 2,
      "meet-leo-v2-strip": 0,
      [finalPage.id]: 2,
    },
  }));
  expect(createFirstDayProgressStore().getSnapshot().frames).toEqual({
    "meet-leo-v2-arrival": 1, [finalPage.id]: 2,
  });
});

it("restores the completed lesson and preserves it when an earlier chapter is reset", () => {
  const finalPage = finalChallenge();
  const store = savedReading(finalPage.id);
  store.update(previous => ({ ...previous, lessonFinished: true, counts: {
    ...previous.counts, [finalPage.id]: getSequelSteps(finalPage).length,
  } }));
  const resumed = createFirstDayProgressStore();
  expect(resumed.getSnapshot()).toMatchObject({ position: pages.length, lessonFinished: true, demoCompleted: true });

  resumed.update(previous => resetFirstDayProgress(previous, 4));
  expect(resumed.getSnapshot().lessonFinished).toBe(true);
  expect(resumed.getSnapshot().demoCompleted).toBe(true);
  resumed.update(previous => resetFirstDayProgress(previous, 5));
  expect(resumed.getSnapshot().lessonFinished).toBeUndefined();
  expect(resumed.getSnapshot().demoCompleted).toBeUndefined();
  expect(resumed.getSnapshot().counts[finalPage.id]).toBeUndefined();
});

it("remembers a completed demo after reopening the beginning to review it", () => {
  const finalPage = finalChallenge();
  const store = savedReading(finalPage.id);
  store.update(previous => ({ ...previous, lessonFinished: true, counts: { [finalPage.id]: getSequelSteps(finalPage).length } }));
  const resumed = createFirstDayProgressStore();
  resumed.update(previous => ({ ...previous, position: 1, lessonFinished: undefined }));

  const reviewed = createFirstDayProgressStore().getSnapshot();
  expect(reviewed).toMatchObject({ position: 1, demoCompleted: true });
  expect(reviewed.lessonFinished).toBeUndefined();
  expect(resetFirstDayProgress(reviewed, "all").demoCompleted).toBeUndefined();
});

it.each([1, 2, 3])("restores %s completed steps without finishing the final challenge", count => {
  const finalPage = finalChallenge();
  expect(getSequelSteps(finalPage)).toHaveLength(4);
  const store = savedReading(finalPage.id);
  store.update(previous => ({ ...previous, lessonFinished: true, counts: {
    ...previous.counts, [finalPage.id]: count,
  } }));

  const snapshot = createFirstDayProgressStore().getSnapshot();
  expect(snapshot.lessonFinished).toBeUndefined();
  expect(snapshot.demoCompleted).toBeUndefined();
  expect(snapshot.counts[finalPage.id]).toBe(count);
});

it("drops an invalid final challenge step count and saved completion", () => {
  const finalPage = finalChallenge();
  const store = savedReading(finalPage.id);
  store.update(previous => ({ ...previous, lessonFinished: true, counts: {
    ...previous.counts, [finalPage.id]: getSequelSteps(finalPage).length + 1,
  } }));

  const snapshot = createFirstDayProgressStore().getSnapshot();
  expect(snapshot.lessonFinished).toBeUndefined();
  expect(snapshot.counts[finalPage.id]).toBeUndefined();
});
