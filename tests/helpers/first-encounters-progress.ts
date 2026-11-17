import { LESSON_SCENES } from "@/features/first-encounters/lesson-one";
import { EMPTY_LESSON_DASHBOARD_INPUT, type LessonDashboardInput } from "@/features/first-encounters/lesson-dashboard";
import { CONCLUSION_QUESTIONS, conclusionModel, createConclusionState, setConclusionDraft, submitConclusionAnswer } from "@/features/first-encounters/lesson-conclusion";
import { encodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";

export function lessonInput(count = 0): LessonDashboardInput {
  if (!count) return { ...EMPTY_LESSON_DASHBOARD_INPUT };
  const all = LESSON_SCENES.flatMap(scene => scene.rounds);
  const scene = count === all.length ? LESSON_SCENES.length : LESSON_SCENES.findIndex(scene => scene.rounds.some(round => round.id === all[count].id));
  const round = count === all.length ? 0 : LESSON_SCENES[scene].rounds.findIndex(round => round.id === all[count].id);
  return { introduction: "done", guide: "done", lesson: JSON.stringify({ version: 2, scene, round, completed: all.slice(0, count).map(round => round.id), supported: [] }), conclusion: null };
}
export function completeLessonInput(): LessonDashboardInput {
  let conclusion = createConclusionState();
  for (const question of CONCLUSION_QUESTIONS) conclusion = submitConclusionAnswer(setConclusionDraft(conclusion, question, conclusionModel(question)), question);
  return { ...lessonInput(29), conclusion: JSON.stringify({ ...conclusion, phase: "summary", testStarted: true }) };
}
export const completeLessonSnapshot = () => encodeLessonAccountSnapshot(completeLessonInput());
