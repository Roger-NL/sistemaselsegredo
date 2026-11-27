import { pages, type FirstDayPage } from "./content";

export type ChallengeAttempt = {
  placed: readonly number[];
  result?: "correct" | "incorrect";
  translated?: boolean;
  round?: 0 | 1;
};

type FirstDayProgress = {
  position: number;
  chapterOpening?: ComicChapter;
  lessonFinished?: true;
  tutorialSeen: boolean;
  counts: Record<string, number>;
  attempts: Record<string, ChallengeAttempt>;
  sound: boolean;
  readingLanguage: "en" | "pt-BR";
};

export type FirstDayResetTarget = FirstDayPage["part"] | "all";
export type ComicChapter = Exclude<FirstDayPage["part"], 1>;

export function chapterOpeningAt(position: number): ComicChapter | undefined {
  const page = pages[position - 1];
  if (page && page.part !== 1 && page.kind !== "Em preparação" && pages[position - 2]?.part !== page.part) return page.part;
}

const storageKey = "basedspeak:first-day:v1";
const partTwoRequestVersion = 3;
const initialProgress: FirstDayProgress = {
  position: 0, tutorialSeen: false, counts: {}, attempts: {}, sound: true, readingLanguage: "en",
};

function readObject(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function isIntegerBetween(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
}

function readProgress(): FirstDayProgress {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === null) return initialProgress;
    const saved = readObject(JSON.parse(raw));
    const savedCounts = readObject(saved.counts);
    const savedAttempts = readObject(saved.attempts);
    const counts: FirstDayProgress["counts"] = {};
    const attempts: FirstDayProgress["attempts"] = {};

    for (const page of pages) {
      if (page.kind === "Ação") {
        const count = savedCounts[page.id];
        if (isIntegerBetween(count, 1, page.words.length)) counts[page.id] = count;
      }
      if (page.kind === "Desafio") {
        let attempt = readObject(savedAttempts[page.id]);
        if (page.part === 2 && page.partialRequest && saved.partTwoRequestVersion !== partTwoRequestVersion) {
          // Old banks used different words or indexes. Keep completed challenges and discard unfinished attempts.
          const words = attempt.placed;
          const wasPartialRequest = saved.partTwoRequestVersion === 2;
          const oldSolution = wasPartialRequest ? [2, 0] : [2, 0, 3];
          const completed = attempt.round === (wasPartialRequest ? 0 : 1) && attempt.result === "correct"
            && Array.isArray(words) && words.length === oldSolution.length && oldSolution.every((word, slot) => words[slot] === word);
          attempt = completed ? { round: 0, placed: page.rounds[0].solution, result: "correct" } : {};
        }
        const round = page.part !== 1 && page.rounds.length === 2 && attempt.round === 1 ? 1 : 0;
        const task = page.part === 1 ? undefined : page.rounds[round];
        const bank = page.part === 1 ? page.words : task?.bank;
        if (!bank) continue;
        const count = task ? task.solution.length : bank.length;
        const savedWords: unknown = attempt.placed;
        const placed = Array.isArray(savedWords) && savedWords.length <= count
          && savedWords.every(word => isIntegerBetween(word, 0, bank.length - 1))
          && new Set(savedWords).size === savedWords.length ? savedWords as number[] : [];
        const translated = attempt.translated === true;
        const checked = placed.length === count
          && (attempt.result === "correct" || attempt.result === "incorrect");
        const result = checked
          ? (placed.every((index, slot) => bank[index] === bank[task?.solution[slot] ?? slot]) ? "correct" : "incorrect")
          : undefined;
        if (placed.length || translated || (task && round === 1)) {
          attempts[page.id] = { placed, result, translated, ...(task && { round }) };
        }
      }
    }

    const position = saved.pageId === undefined ? 0 : pages.findIndex(page => page.id === saved.pageId) + 1;
    const readingLanguage = saved.readingLanguage === "pt-BR" ? "pt-BR" : initialProgress.readingLanguage;
    // Older saves recorded the lesson but not the prologue.
    const tutorialSeen = typeof saved.tutorialSeen === "boolean" ? saved.tutorialSeen
      : position > 0 || Object.keys(counts).length > 0 || Object.keys(attempts).length > 0;
    const opening = chapterOpeningAt(position);
    const savedOpening = saved.chapterOpening ?? (saved.partTwoOpening === true ? 2 : undefined);
    const currentPage = pages[position - 1];
    const finalAttempt = attempts[currentPage?.id];
    const lessonFinished = currentPage?.part === 4 && position === pages.length && saved.lessonFinished === true
      && finalAttempt?.round === 1 && finalAttempt.result === "correct";
    return {
      position, tutorialSeen, counts, attempts, sound: saved.sound !== false, readingLanguage,
      ...(opening !== undefined && opening === savedOpening && { chapterOpening: opening }),
      ...(lessonFinished && { lessonFinished: true as const }),
    };
  } catch {
    return initialProgress;
  }
}

export function resetFirstDayProgress(progress: FirstDayProgress, target: FirstDayResetTarget): FirstDayProgress {
  if (target === "all") return { ...initialProgress, readingLanguage: progress.readingLanguage, sound: progress.sound };

  const counts = { ...progress.counts };
  const attempts = { ...progress.attempts };
  for (const page of pages) {
    if (page.part !== target) continue;
    delete counts[page.id];
    delete attempts[page.id];
  }

  const position = pages[progress.position - 1]?.part === target
    ? pages.findIndex(page => page.part === target) + 1
    : progress.position;
  return { ...progress, position, counts, attempts,
    chapterOpening: target === progress.chapterOpening ? undefined : progress.chapterOpening,
    lessonFinished: target === 4 ? undefined : progress.lessonFinished };
}

export function createFirstDayProgressStore() {
  let snapshot: FirstDayProgress | undefined;
  const subscribers = new Set<() => void>();
  const getSnapshot = () => snapshot ??= readProgress();

  return {
    getSnapshot,
    getServerSnapshot: () => initialProgress,
    subscribe(listener: () => void) {
      subscribers.add(listener);
      return () => { subscribers.delete(listener); };
    },
    refresh() {
      snapshot = readProgress();
      subscribers.forEach(listener => listener());
    },
    update(updater: (previous: FirstDayProgress) => FirstDayProgress) {
      const next = snapshot = updater(getSnapshot());
      const { position, ...answers } = next;
      const pageId = position === 0 ? null : pages[position - 1]?.id;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify({ ...answers, pageId, partTwoRequestVersion }));
      } catch {
        // Keep the lesson usable if storage is disabled or full.
      }
      subscribers.forEach(listener => listener());
    },
  };
}
