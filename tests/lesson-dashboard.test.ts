import { expect, it } from "vitest";
import { LESSON_SCENES } from "../src/features/first-encounters/lesson-one";
import { CONCLUSION_QUESTIONS, conclusionModel, createConclusionState, setConclusionDraft, submitConclusionAnswer } from "../src/features/first-encounters/lesson-conclusion";
import { EMPTY_LESSON_DASHBOARD_INPUT, LESSON_DASHBOARD_STORAGE, LESSON_DEMO_HREF, getLessonDashboardSnapshot, resetLessonDashboardProgress } from "../src/features/first-encounters/lesson-dashboard";
import { LESSON_MECHANICS_STORAGE } from "../src/features/first-encounters/lesson-mechanics";

const rounds = LESSON_SCENES.flatMap(scene => scene.rounds.map(round => round.id));
const practice = (count: number) => JSON.stringify({ version: 2, scene: count === 29 ? 12 : 0, round: 0, completed: rounds.slice(0, count), supported: [] });

it("derives the real local49-step journey, saved cursors, honest completion and quiz retake without writing progress", () => {
  const blank = { ...EMPTY_LESSON_DASHBOARD_INPUT };
  expect(getLessonDashboardSnapshot(blank)).toMatchObject({ stage: "introduction", completed: 0, percent: 0, ctaLabel: "Começar demo", href: LESSON_DEMO_HREF });
  expect(getLessonDashboardSnapshot({ ...blank, introPosition: '{"version":1,"index":2}' })).toMatchObject({ completed: 2, percent: 4, ctaLabel: "Continuar aula" });
  expect(getLessonDashboardSnapshot({ ...blank, introduction: "done", guidePosition: '{"version":1,"index":4}' })).toMatchObject({ stage: "guide", completed: 4, percent: 14 });
  expect(getLessonDashboardSnapshot({ ...blank, introduction: "done", guide: "done" })).toMatchObject({ stage: "lesson", completed: 0, percent: 18 });
  expect(getLessonDashboardSnapshot({ ...blank, lesson: practice(10) })).toMatchObject({ stage: "lesson", completed: 10, percent: 39, ctaLabel: "Continuar aula" });
  const completedPractice = { ...blank, lesson: practice(29) };
  expect(getLessonDashboardSnapshot(completedPractice)).toMatchObject({ stage: "theory", percent: 78, href: `${LESSON_DEMO_HREF}?retomar=conclusao` });
  let conclusion = { ...createConclusionState(), phase: "test" as const, testStarted: true };
  expect(getLessonDashboardSnapshot({ ...completedPractice, conclusion: JSON.stringify(conclusion) })).toMatchObject({ stage: "test", percent: 88, href: `${LESSON_DEMO_HREF}?retomar=conclusao` });
  for (const question of CONCLUSION_QUESTIONS) conclusion = submitConclusionAnswer(setConclusionDraft(conclusion, question, conclusionModel(question)), question) as typeof conclusion;
  const complete = getLessonDashboardSnapshot({ ...completedPractice, conclusion: JSON.stringify(conclusion) });
  expect(complete).toMatchObject({ stage: "test", completed: 6, percent: 100, ctaLabel: "Rever aula", href: `${LESSON_DEMO_HREF}?apresentacao=1` });
  expect(complete.steps.every(step => step.status === "done")).toBe(true);
  expect(getLessonDashboardSnapshot({ ...completedPractice, conclusion: JSON.stringify({ ...createConclusionState(), phase: "test", testStarted: true }) })).toMatchObject({ percent: 88, ctaLabel: "Continuar aula" });
  expect(getLessonDashboardSnapshot({ ...blank, conclusion: JSON.stringify(conclusion) }).percent).toBe(0);
  expect(getLessonDashboardSnapshot({ ...blank, lesson: "{bad", conclusion: "null", introPosition: '{"version":3,"index":99}' }).percent).toBe(0);
  expect(blank).toEqual(EMPTY_LESSON_DASHBOARD_INPUT);
});

it("resets the local demo without deleting account data, messages or sound preferences", () => {
  const unrelated = { "basedspeak.account": "Roger", "basedspeak.messages": "saved conversation", "basedspeak.lesson-sounds.muted": "true" };
  const saved = new Map(Object.entries(unrelated));
  for (const key of [...Object.values(LESSON_DASHBOARD_STORAGE), LESSON_MECHANICS_STORAGE]) saved.set(key, "saved demo progress");
  resetLessonDashboardProgress({ removeItem: key => { saved.delete(key); } });
  expect(Object.fromEntries(saved)).toEqual(unrelated);
  expect(getLessonDashboardSnapshot()).toMatchObject({ percent: 0, status: "new", ctaLabel: "Começar demo" });
});
