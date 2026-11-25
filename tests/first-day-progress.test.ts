// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { pages } from "@/features/first-day/content";
import { createFirstDayProgressStore, resetFirstDayProgress } from "@/features/first-day/first-day-progress";

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
