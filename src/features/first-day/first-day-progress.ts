import { pages } from "./content";

export type ChallengeAttempt = {
  placed: readonly number[];
  result?: "correct" | "incorrect";
  translated?: boolean;
};

type FirstDayProgress = {
  position: number;
  counts: Record<string, number>;
  attempts: Record<string, ChallengeAttempt>;
  sound: boolean;
};

const storageKey = "basedspeak:first-day:v1";
const initialProgress: FirstDayProgress = { position: -1, counts: {}, attempts: {}, sound: false };

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
        const attempt = readObject(savedAttempts[page.id]);
        const savedWords: unknown = attempt.placed;
        const placed = Array.isArray(savedWords) && savedWords.length <= page.words.length
          && savedWords.every(word => isIntegerBetween(word, 0, page.words.length - 1))
          && new Set(savedWords).size === savedWords.length ? savedWords as number[] : [];
        const translated = attempt.translated === true;
        const checked = placed.length === page.words.length
          && (attempt.result === "correct" || attempt.result === "incorrect");
        const result = checked
          ? (placed.every((index, slot) => page.words[index] === page.words[slot]) ? "correct" : "incorrect")
          : undefined;
        if (placed.length || translated) attempts[page.id] = { placed, result, translated };
      }
    }

    const position = saved.pageId === undefined ? -1 : pages.findIndex(page => page.id === saved.pageId) + 1;
    return { position, counts, attempts, sound: saved.sound === true };
  } catch {
    return initialProgress;
  }
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
    update(updater: (previous: FirstDayProgress) => FirstDayProgress) {
      const next = snapshot = updater(getSnapshot());
      const { position, ...answers } = next;
      const pageId = position === 0 ? null : pages[position - 1]?.id;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify({ ...answers, pageId }));
      } catch {
        // Keep the lesson usable if storage is disabled or full.
      }
      subscribers.forEach(listener => listener());
    },
  };
}
