import { getConclusionQuestions, LESSON_CONCLUSION_STORAGE, evaluateConclusionAnswer, isConclusionComplete, restoreConclusionState } from "./lesson-conclusion";
import { LESSON_JOURNEY_STAGES, getLessonJourney } from "./lesson-journey";
import type { LessonJourneyStage } from "./lesson-journey";
import { LESSON_PROGRESS_STORAGE, restoreLessonProgress } from "./lesson-progress";
import { INTRODUCTION_POSITION_STORAGE, TUTORIAL_POSITION_STORAGE, restorePosition } from "./lesson-position";
import { LESSON_MECHANICS_STORAGE } from "./lesson-mechanics";

export const LESSON_DEMO_HREF = "/demo";
export const LESSON_DASHBOARD_STORAGE = {
  introduction: "basedspeak.lesson-one.introduction.v1",
  guide: "basedspeak.lesson-one.tutorial.v1",
  lesson: LESSON_PROGRESS_STORAGE,
  conclusion: LESSON_CONCLUSION_STORAGE,
  introPosition: INTRODUCTION_POSITION_STORAGE,
  guidePosition: TUTORIAL_POSITION_STORAGE,
} as const;
export type LessonDashboardInput = {
  introduction: string | null; guide: string | null; lesson: string | null; conclusion: string | null;
  introPosition?: string | null; guidePosition?: string | null;
};
export const EMPTY_LESSON_DASHBOARD_INPUT: LessonDashboardInput = { introduction: null, guide: null, lesson: null, conclusion: null };

/** Reads saved evidence only. It never marks a stage complete or writes progress. */
export function getLessonDashboardSnapshot(raw: LessonDashboardInput = EMPTY_LESSON_DASHBOARD_INPUT) {
  const lesson = restoreLessonProgress(raw.lesson);
  const conclusion = restoreConclusionState(raw.conclusion);
  const lessonCompleted = lesson.completed.length;
  const testCompleted = getConclusionQuestions(conclusion).filter(question => {
    const answer = conclusion.attempts[question.id]?.lastAnswer;
    return answer != null && evaluateConclusionAnswer(question, answer).correct;
  }).length;
  let stage: LessonJourneyStage = "introduction";
  let completed = restorePosition(raw.introPosition ?? null, 3);
  if (lessonCompleted >= 29) {
    if (isConclusionComplete(conclusion)) { stage = "test"; completed = 6; }
    else if (conclusion.testStarted) { stage = "test"; completed = testCompleted; }
    else { stage = "theory"; completed = conclusion.theoryIndex; }
  } else if (lessonCompleted > 0 || lesson.scene > 0 || lesson.round > 0) {
    stage = "lesson"; completed = lessonCompleted;
  } else if (raw.introduction === "done" && raw.guide === "done") {
    stage = "lesson"; completed = 0;
  } else if (raw.introduction === "done") {
    stage = "guide"; completed = restorePosition(raw.guidePosition ?? null, 6);
  }
  const journey = getLessonJourney(stage, completed);
  const status = journey.percent === 100 ? "complete" : journey.completedUnits === 0 ? "new" : "in-progress";
  const href = status === "complete" ? `${LESSON_DEMO_HREF}?apresentacao=1`
    : stage === "theory" || stage === "test" ? `${LESSON_DEMO_HREF}?retomar=conclusao` : LESSON_DEMO_HREF;
  const currentIndex = LESSON_JOURNEY_STAGES.findIndex(item => item.id === stage);
  return { stage, completed, percent: journey.percent, completedUnits: journey.completedUnits, totalUnits: journey.totalUnits,
    lessonCompleted, testCompleted: lessonCompleted >= 29 ? testCompleted : 0, status,
    ctaLabel: status === "new" ? "Começar demo" : status === "complete" ? "Rever aula" : "Continuar aula",
    href,
    steps: journey.segments.map((item, index) => ({ ...item,
      status: index < currentIndex || item.completed === item.units ? "done" as const : index === currentIndex ? "current" as const : "upcoming" as const,
    })),
  };
}
export type LessonDashboardSnapshot = ReturnType<typeof getLessonDashboardSnapshot>;

/** Explicit local-demo reset; account, messages and sound preferences are preserved. */
export function resetLessonDashboardProgress(storage: Pick<Storage, "removeItem">) {
  for (const key of Object.values(LESSON_DASHBOARD_STORAGE)) storage.removeItem(key);
  storage.removeItem(LESSON_MECHANICS_STORAGE);
}
