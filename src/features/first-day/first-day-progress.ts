import { pages, type FirstDayPage } from "./content";
import { getSequelSteps, type SequelPage } from "./sequel-content";
import { sequelWordBank } from "./sequel-word-bank";

export type ChallengeAttempt = {
  placed: readonly number[];
  result?: "correct" | "incorrect";
  translated?: boolean;
  round?: 0 | 1;
  language?: "en" | "pt-BR";
};

type FirstDayProgress = {
  position: number;
  chapterOpening?: ComicChapter;
  lessonFinished?: true;
  demoCompleted?: true;
  tutorialSeen: boolean;
  counts: Record<string, number>;
  attempts: Record<string, ChallengeAttempt>;
  frames?: Record<string, number>;
  sound: boolean;
  readingLanguage: "en" | "pt-BR";
};

export type FirstDayResetTarget = FirstDayPage["part"] | "all";
export type ComicChapter = Exclude<FirstDayPage["part"], 1>;

export function chapterOpeningAt(position: number): ComicChapter | undefined {
  const page = pages[position - 1];
  if (page && page.part !== 1 && pages[position - 2]?.part !== page.part) return page.part;
}

function legacySequelStepCount(page: SequelPage) {
  if (page.kind === "Desafio") return page.exercises.length;
  return page.id === "meet-leo-v2-greetings" || page.id === "borrow-comic-v2-request" ? 1 : 0;
}

const storageKey = "basedspeak:first-day:v1";
export const firstDayReviewHref = "/first-day?rever=1";
const partTwoRequestVersion = 3;
const partFourRequestVersion = 1;
const sequelActivityVersion = 2;
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
    const savedFrames = readObject(saved.frames);
    const counts: FirstDayProgress["counts"] = {};
    const attempts: FirstDayProgress["attempts"] = {};
    const frames: Record<string, number> = {};
    const legacySequel = saved.sequelActivityVersion !== 1 && saved.sequelActivityVersion !== sequelActivityVersion;
    const legacyPhrases = saved.sequelActivityVersion !== sequelActivityVersion;

    for (const page of pages) {
      if ("edition" in page) {
        const steps = getSequelSteps(page);
        const panels = page.kind === "História" ? page.panels : page.kind === "Desafio" ? page.closing : undefined;
        const frame = savedFrames[page.id];
        if (panels && isIntegerBetween(frame, 0, panels.length - 1)) frames[page.id] = frame;
        // The previous edition's existing exercises are still the first steps.
        // A save from that edition cannot include the newly interactive lines.
        const savedStepLimit = legacySequel ? legacySequelStepCount(page) : steps.length;
        const count = savedCounts[page.id];
        if (isIntegerBetween(count, 1, savedStepLimit)) counts[page.id] = count;
        if (page.id === "borrow-comic-v2-challenge" && saved.partFourRequestVersion !== partFourRequestVersion) continue;
        const completed = counts[page.id] ?? 0;
        const exercise = completed < savedStepLimit ? steps[completed]?.exercise : undefined;
        const { language, placed } = readObject(savedAttempts[page.id]);
        if (exercise?.mode === "assemble" && (language === "en" || language === "pt-BR")) {
          const lang = language === "en" ? "en" : "pt";
          const bank = sequelWordBank(exercise.bank[lang], exercise.solution[lang]);
          const maxLength = legacyPhrases ? exercise.solution[lang].length : bank.order.length;
          const maxIndex = (legacyPhrases ? exercise.bank[lang].length : bank.words.length) - 1;
          if (Array.isArray(placed) && placed.length > 0 && placed.length <= maxLength
            && placed.every(index => isIntegerBetween(index, 0, maxIndex))
            && new Set(placed).size === placed.length) {
            attempts[page.id] = { language, placed: legacyPhrases ? placed.flatMap(index => bank.groups[index]) : placed };
          }
        }
        continue;
      }
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

    // Readers who reached the old ending resume before the new borrowing scene.
    const legacyPart = typeof saved.pageId === "string"
      ? /^meet-leo-\d+$/.test(saved.pageId) ? 3 : /^see-you-\d+$/.test(saved.pageId) ? 4 : undefined
      : undefined;
    const position = pages.findIndex(page => legacyPart ? page.part === legacyPart : page.id === saved.pageId) + 1;
    const readingLanguage = saved.readingLanguage === "pt-BR" ? "pt-BR" : initialProgress.readingLanguage;
    // Older saves recorded the lesson but not the prologue.
    const tutorialSeen = typeof saved.tutorialSeen === "boolean" ? saved.tutorialSeen
      : position > 0 || Object.keys(counts).length > 0 || Object.keys(attempts).length > 0;
    const opening = chapterOpeningAt(position);
    const savedOpening = legacyPart ?? saved.chapterOpening ?? (saved.partTwoOpening === true ? 2 : undefined);
    const finalPage = pages.at(-1);
    const finishedAtEnd = position === pages.length && saved.lessonFinished === true;
    const demoCompleted = finalPage && "edition" in finalPage && counts[finalPage.id] === getSequelSteps(finalPage).length
      && (saved.demoCompleted === true || finishedAtEnd);
    return {
      position, tutorialSeen, counts, attempts, sound: saved.sound !== false, readingLanguage,
      ...(Object.keys(frames).length > 0 && { frames }),
      ...(opening !== undefined && opening === savedOpening && { chapterOpening: opening }),
      ...(demoCompleted && { demoCompleted: true as const }),
      ...(demoCompleted && finishedAtEnd && { lessonFinished: true as const }),
    };
  } catch {
    return initialProgress;
  }
}

export function resetFirstDayProgress(progress: FirstDayProgress, target: FirstDayResetTarget): FirstDayProgress {
  if (target === "all") return { ...initialProgress, readingLanguage: progress.readingLanguage, sound: progress.sound };

  const { frames: previousFrames, ...state } = progress;
  const counts = { ...progress.counts };
  const attempts = { ...progress.attempts };
  const frames = { ...previousFrames };
  for (const page of pages) {
    if (page.part !== target) continue;
    delete counts[page.id];
    delete attempts[page.id];
    delete frames[page.id];
  }

  const position = pages[progress.position - 1]?.part === target
    ? pages.findIndex(page => page.part === target) + 1
    : progress.position;
  const resetEnding = target === pages.at(-1)?.part;
  return { ...state, position, counts, attempts,
    ...(Object.keys(frames).length > 0 && { frames }),
    chapterOpening: target === progress.chapterOpening ? undefined : progress.chapterOpening,
    lessonFinished: resetEnding ? undefined : progress.lessonFinished,
    demoCompleted: resetEnding ? undefined : progress.demoCompleted };
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
        window.localStorage.setItem(storageKey, JSON.stringify({ ...answers, pageId, partTwoRequestVersion, partFourRequestVersion, sequelActivityVersion }));
      } catch {
        // Keep the lesson usable if storage is disabled or full.
      }
      subscribers.forEach(listener => listener());
    },
  };
}
