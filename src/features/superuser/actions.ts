import type { LearningProgress } from "@/contracts/workspace";
import { LESSON_SCENES } from "@/features/first-encounters/lesson-one";
import { createLessonProgress, restoreLessonProgress } from "@/features/first-encounters/lesson-progress";
import { CONCLUSION_QUESTIONS, getConclusionQuestions, conclusionModel, createConclusionState, restoreConclusionState, isConclusionComplete } from "@/features/first-encounters/lesson-conclusion";
import { decodeLessonAccountSnapshot, encodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";
import { EMPTY_LESSON_DASHBOARD_INPUT, getLessonDashboardSnapshot } from "@/features/first-encounters/lesson-dashboard";

// Kept as input compatibility values; Aula 1 has one common learning path.
export const PROFILES = ["beginner", "some", "less"] as const;
export const REVIEW_VIEWS = ["end", "moments", "thanks", "feedback", "done"] as const;
export const testActions = ["reset-all", "reset-real", "reset-presentation", "complete-presentation", "reset-demo", "start-demo", "back", "forward", "next-part", "jump-part", "jump-node", "complete-part", "complete-demo", "complete-all", "profile", "review", "reset-study", "study-position", "study-complete", "study-uncomplete", "complete-study"] as const;
export type TestAction = { action: typeof testActions[number]; profile?: typeof PROFILES[number]; part?: number; node?: string; step?: number; view?: typeof REVIEW_VIEWS[number] };
const rounds = LESSON_SCENES.flatMap((scene, sceneIndex) => scene.rounds.map((round, roundIndex) => ({ id: round.id, sceneId: scene.id, scene: sceneIndex, round: roundIndex })));

/** Owner-only simulation uses the new course and always remains testMode. */
export function applyTestAction(previous: LearningProgress, input: TestAction): LearningProgress {
  const testMode = input.action !== "reset-real";
  if (input.action === "reset-all" || input.action === "reset-real") return { ...previous, testMode, lessonSnapshot: null, demoSnapshot: null, studySnapshot: null, demoPercent: 0, studyCompleted: 0, studyTotal: 49 };
  const snapshot = decodeLessonAccountSnapshot(previous.lessonSnapshot ?? null);
  const progress = { ...(snapshot?.progress ?? EMPTY_LESSON_DASHBOARD_INPUT) };
  let lesson = restoreLessonProgress(progress.lesson);
  let conclusion = restoreConclusionState(progress.conclusion);
  const current = lesson.scene >= LESSON_SCENES.length ? rounds.length : Math.max(0, rounds.findIndex(item => item.scene === lesson.scene && item.round === lesson.round));
  function practice(count: number, cursor = count) {
    const completed = Math.max(0, Math.min(rounds.length, count));
    const target = rounds[Math.max(0, Math.min(rounds.length, cursor))];
    lesson = { version: 2, scene: target?.scene ?? LESSON_SCENES.length, round: target?.round ?? 0, completed: rounds.slice(0, completed).map(item => item.id), supported: [] };
    progress.introduction = "done"; progress.guide = "done";
    if (completed < rounds.length) conclusion = createConclusionState();
  }
  function completeWritten() {
    practice(rounds.length);
    conclusion = { ...createConclusionState(), phase: "summary", theoryIndex: 4, questionIndex: 5, testStarted: true,
      attempts: Object.fromEntries(CONCLUSION_QUESTIONS.map(question => { const answer = conclusionModel(question); return [question.id, { draft: answer, firstAnswer: answer, lastAnswer: answer }]; })) };
  }
  switch (input.action) {
    case "reset-presentation": progress.introduction = null; progress.introPosition = null; break;
    case "complete-presentation": progress.introduction = "done"; progress.introPosition = JSON.stringify({ version: 1, index: 2 }); break;
    case "reset-demo": lesson = createLessonProgress(); conclusion = createConclusionState(); break;
    case "start-demo": practice(0); break;
    case "reset-study": conclusion = createConclusionState(); break;
    case "complete-demo": practice(rounds.length); break;
    case "complete-all": case "complete-study": completeWritten(); break;
    case "jump-part": practice(rounds.filter(item => item.scene < (input.part! - 1) * 2).length); break;
    case "complete-part": practice(rounds.filter(item => item.scene < input.part! * 2).length); break;
    case "jump-node": practice(rounds.findIndex(item => item.id === input.node || item.sceneId === input.node)); break;
    case "back": practice(lesson.completed.length, Math.max(0, current - 1)); break;
    case "forward": practice(Math.max(lesson.completed.length, Math.min(rounds.length, current + 1)), Math.min(rounds.length, current + 1)); break;
    case "next-part": practice(rounds.filter(item => item.scene < Math.min(12, (Math.floor(lesson.scene / 2) + 1) * 2)).length); break;
    case "review": if (input.view === "done") completeWritten(); else { practice(rounds.length); conclusion = createConclusionState(); } break;
    case "study-position": case "study-complete": case "study-uncomplete": {
      practice(rounds.length);
      const step = input.step!;
      const index = Math.min(5, Math.max(0, step - 5));
      conclusion = { ...conclusion, phase: step < 5 ? "theory" : "test", theoryIndex: Math.min(4, step), theoryBlock: 0, questionIndex: index, testStarted: step >= 5 };
      if (input.action === "study-complete" && step < 5) {
        conclusion.theoryIndex = Math.min(4, step + 1);
        if (step === 4) { conclusion.phase = "test"; conclusion.testStarted = true; }
      }
      if (input.action === "study-position" && step >= 5) {
        for (const question of getConclusionQuestions(conclusion).slice(0, index)) { const answer = conclusionModel(question); conclusion.attempts[question.id] = { draft: answer, firstAnswer: answer, lastAnswer: answer }; }
      }
      if (input.action === "study-complete" && step >= 5) {
        for (const question of getConclusionQuestions(conclusion).slice(0, index + 1)) { const answer = conclusionModel(question); conclusion.attempts[question.id] = { draft: answer, firstAnswer: answer, lastAnswer: answer }; }
        if (isConclusionComplete(conclusion)) conclusion.phase = "summary";
      }
      if (input.action === "study-uncomplete") {
        for (const question of getConclusionQuestions(conclusion).slice(step < 5 ? 0 : index)) delete conclusion.attempts[question.id];
      }
      break;
    }
    case "profile": break;
  }
  progress.lesson = JSON.stringify(lesson); progress.conclusion = JSON.stringify(conclusion);
  const derived = getLessonDashboardSnapshot(progress);
  return { ...previous, testMode, lessonSnapshot: encodeLessonAccountSnapshot(progress, snapshot?.mechanics), demoPercent: derived.percent, studyCompleted: derived.completedUnits, studyTotal: derived.totalUnits };
}

/** Full resets return to a fresh account introduction. */
export function testActionDestination(action: TestAction["action"]) {
  return action === "reset-all" || action === "reset-real" ? "/dashboard" : null;
}
