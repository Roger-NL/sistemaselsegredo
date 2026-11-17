// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CONCLUSION_QUESTIONS, LESSON_CONCLUSION_STORAGE, conclusionModel, createConclusionState, setConclusionDraft, submitConclusionAnswer } from "../src/features/first-encounters/lesson-conclusion";
import { LESSON_SCENES } from "../src/features/first-encounters/lesson-one";
const sound = vi.hoisted(() => ({ play: vi.fn() }));
vi.mock("../src/features/first-encounters/useLessonSounds", () => ({ useLessonSounds: () => ({ ...sound, muted: false }) }));
import { LessonConclusion } from "../src/features/first-encounters/LessonConclusion";

beforeEach(() => { vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); localStorage.clear(); sound.play.mockClear(); });
afterEach(() => { localStorage.clear(); vi.unstubAllGlobals(); });

it("restarts a later test question immediately, persists the empty test and preserves completed practice", async () => {
  const practice = JSON.stringify({ version: 2, scene: 12, round: 0, completed: LESSON_SCENES.flatMap(scene => scene.rounds.map(round => round.id)), supported: [] });
  localStorage.setItem("basedspeak.lesson-one.v2", practice);
  let state = createConclusionState();
  for (const question of CONCLUSION_QUESTIONS.slice(0, 4)) state = submitConclusionAnswer(setConclusionDraft(state, question, conclusionModel(question)), question);
  state = submitConclusionAnswer(setConclusionDraft(state, CONCLUSION_QUESTIONS[4], "I are Ana"), CONCLUSION_QUESTIONS[4]);
  localStorage.setItem(LESSON_CONCLUSION_STORAGE, JSON.stringify({ ...state, phase: "test", questionIndex: 4, testStarted: true }));
  const onReturnToPractice = vi.fn(), onRestartPractice = vi.fn();
  const host = document.createElement("div"); document.body.append(host);
  let root = createRoot(host);
  const render = async () => { await act(async () => { root.render(createElement(LessonConclusion, { onReturnToPractice, onRestartPractice })); }); };
  try {
    await render();
    expect(host.querySelector<HTMLInputElement>("#lc-written-answer")?.value).toBe("I are Ana");
    expect(host.querySelector(".lc-feedback.is-retry")).not.toBeNull();
    const restart = [...host.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent?.includes("Recomeçar teste do zero"))!;
    expect(restart).toBeTruthy();
    await act(async () => restart.click());
    expect(host.querySelector("[data-conclusion-index]")?.getAttribute("data-conclusion-index")).toBe("0");
    expect(host.querySelector("[data-conclusion-phase]")?.getAttribute("data-conclusion-phase")).toBe("test");
    expect(host.querySelectorAll('input[type="radio"]:checked')).toHaveLength(0);
    expect(host.querySelector(".lc-feedback.is-retry,.lc-feedback.is-correct")).toBeNull();
    expect(JSON.parse(localStorage.getItem(LESSON_CONCLUSION_STORAGE)!)).toMatchObject({ phase: "test", questionIndex: 0, testStarted: true, attempts: {} });
    expect(localStorage.getItem("basedspeak.lesson-one.v2")).toBe(practice);
    expect(onReturnToPractice).not.toHaveBeenCalled(); expect(onRestartPractice).not.toHaveBeenCalled();
    expect(sound.play).toHaveBeenCalledWith("advance");
    await act(async () => root.unmount()); root = createRoot(host); await render();
    expect(host.querySelector("[data-conclusion-index]")?.getAttribute("data-conclusion-index")).toBe("0");
    expect(JSON.parse(localStorage.getItem(LESSON_CONCLUSION_STORAGE)!).attempts).toEqual({});
    expect(localStorage.getItem("basedspeak.lesson-one.v2")).toBe(practice);
  } finally { await act(async () => root.unmount()); host.remove(); }
});
