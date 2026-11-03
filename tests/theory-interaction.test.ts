// @vitest-environment jsdom
import { act, createElement, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { WorkspaceState } from "@/features/dashboard/workspace-store";

const mocks = vi.hoisted(() => ({
  state: null as WorkspaceState | null,
  session: { status: "empty", state: null },
  stage: vi.fn(), sound: vi.fn(), beginEdit: vi.fn(), endEdit: vi.fn(),
}));
vi.mock("@/components/navigation/AppHeader", () => ({ AppHeader: () => createElement("header", null, "BasedSpeak") }));
vi.mock("@/features/dashboard/use-student-workspace", () => ({ useStudentWorkspace: () => ({ ...mocks.state!, refresh: vi.fn() }) }));
vi.mock("@/features/dashboard/workspace-store", () => ({ studentWorkspace: { stage: mocks.stage, beginEdit: mocks.beginEdit, endEdit: mocks.endEdit } }));
vi.mock("@/features/demo/session/browser", () => ({ subscribe: () => () => {}, getBrowserSnapshot: () => mocks.session, getServerSnapshot: () => mocks.session }));
vi.mock("@/components/interaction/sounds", () => ({ playInteractionSound: mocks.sound }));
import { StudyCard, TheoryExperience } from "@/features/theory/TheoryExperience";
import { studySteps, emptyProgress, isCorrect } from "@/features/theory/progress";

let root: Root, container: HTMLElement;
const completed = vi.fn(), next = vi.fn();
beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  document.body.innerHTML = '<div id="root"></div>';
  window.scrollTo = vi.fn();
  window.history.replaceState(null, "", "/demo/estudo?practice=1");
  root = createRoot(container = document.getElementById("root")!);
  mocks.state = { status: "ready", generation: 1, saving: false, error: "", notice: "", conflict: null, workspace: {
    account: { id: "admin-local", name: "ADM", email: "qa@example.invalid", role: "manager", status: "active" },
    learning: { revision: 0, saveVersion: 0, demoSnapshot: null, studySnapshot: JSON.stringify({ ...emptyProgress, position: 1 }), demoPercent: 0, studyCompleted: 0, studyTotal: 24, updatedAt: null },
    activities: [], conversations: [], liveClass: null,
  } };
});
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });
async function click(text: string) {
  const button = [...container.querySelectorAll("button")].find(b => b.textContent === text);
  expect(button, text).toBeDefined(); await act(async () => button!.click());
}
async function card(id: string) {
  const step = studySteps.find(item => item.step.id === id)!.step;
  await act(async () => root.render(createElement(StudyCard, { key: id, step, publishedAudio: {}, headingRef: createRef<HTMLHeadingElement>(), onComplete: completed, onNext: next })));
  await click("Experimentar"); return step;
}
async function fill(index: number, value: string) {
  const input = container.querySelectorAll<HTMLInputElement>("input.study-gap")[index];
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function piece(label: string) {
  const button = container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
  expect(button, label).not.toBeNull();
  await act(async () => button!.click());
}

describe("purposeful piece activities", () => {
  it("waits for a complete assembly and preserves a rejected draft until the learner replaces the verb", async () => {
    await card("did-order");
    const check = () => [...container.querySelectorAll("button")].find(button => button.textContent === "Conferir")!;
    expect(check().disabled).toBe(true);
    await piece("Usar What"); expect(check().disabled).toBe(true);
    for (const word of ["did", "you", "ordered?"]) await piece(`Usar ${word}`);
    expect(completed).not.toHaveBeenCalled();
    expect(check().disabled).toBe(false);
    await click("Conferir");
    expect(completed).not.toHaveBeenCalled();
    expect(container.querySelectorAll(".study-piece-placed")).toHaveLength(4);
    await piece("Devolver ordered? ao banco");
    expect(check().disabled).toBe(true);
    await piece("Usar order?"); await click("Conferir");
    expect(completed).toHaveBeenCalledExactlyOnceWith(false);
    expect(mocks.sound).toHaveBeenLastCalledWith("correct");
  });
  it("lets a learner try and replace a contextual reply before grading it", async () => {
    await card("really-too");
    expect(container.querySelector('.study-piece-board[data-mode="reply"]')).not.toBeNull();
    expect(container.querySelector(".study-piece-cue")?.textContent).toContain("I like it.");
    await piece("Usar Really?");
    expect(completed).not.toHaveBeenCalled();
    await click("Conferir"); expect(completed).not.toHaveBeenCalled();
    await piece("Usar Me too."); await click("Conferir");
    expect(completed).toHaveBeenCalledExactlyOnceWith(false);
  });
  it("places every phrase model in the same order it teaches", async () => {
    for (const { step } of studySteps) {
      if (step.practice.kind !== "order") continue;
      await card(step.id); await click("Consultar um modelo e continuar com apoio");
      const words = [...container.querySelectorAll(".study-piece-placed")].map(button => button.getAttribute("aria-label")!.replace(/^Devolver (.*) ao banco$/, "$1"));
      expect(words.join(" ")).toBe(step.practice.answer);
      expect(words).toHaveLength(step.practice.tokens.length);
    }
  });
});

describe("writing in the sentence", () => {
  it("places four independent inputs in their phrases and keeps the actual drafts through hint, error and correction", async () => {
    await card("mine-your");
    const inputs = [...container.querySelectorAll<HTMLInputElement>("input")];
    expect(inputs).toHaveLength(4);
    expect(container.textContent).not.toContain("separadas por espaços");
    expect(container.textContent).not.toContain("Sua resposta em inglês");
    for (const input of inputs) expect(input.closest(".study-gap-row")?.querySelector("small")).not.toBeNull();
    for (const [index, value] of ["mine", "mine", "your", "yours"].entries()) await fill(index, value);
    await click("Quero uma pista");
    expect(completed).not.toHaveBeenCalled();
    expect(inputs.map(input => input.value)).toEqual(["mine", "mine", "your", "yours"]);
    await click("Conferir");
    expect(mocks.sound).toHaveBeenLastCalledWith("retry");
    expect(completed).not.toHaveBeenCalled();
    expect(inputs.map(input => input.getAttribute("aria-invalid"))).toEqual(["true", "false", "false", "false"]);
    expect(inputs.map(input => input.value)).toEqual(["mine", "mine", "your", "yours"]);
    await fill(0, "my"); await click("Conferir");
    expect(completed).toHaveBeenCalledExactlyOnceWith(false);
    expect(mocks.sound).toHaveBeenLastCalledWith("correct");
    expect(inputs.every(input => input.disabled)).toBe(true);
  });
  it("cannot move two words into one field to compensate for an empty or wrong field", () => {
    const practice = studySteps.find(x => x.step.id === "mine-your")!.step.practice;
    expect(isCorrect(practice, ["my mine", "", "your", "yours"])).toBe(false);
    expect(isCorrect(practice, ["my mine", "your", "yours"])).toBe(false);
    expect(isCorrect(practice, ["my", "mine", "yours", "your"])).toBe(false);
    expect(isCorrect(practice, ["my", "mine", "your", "yours"])).toBe(true);
  });
  it("completes model answers in each sentence and keeps model consultation distinct from a later retry", async () => {
    await card("mine-your"); await fill(0, "mine");
    await click("Consultar um modelo e continuar com apoio");
    expect([...container.querySelectorAll<HTMLInputElement>("input")].map(i => i.value)).toEqual(["my", "mine", "your", "yours"]);
    expect(completed).toHaveBeenCalledExactlyOnceWith(true);
    await click("Tentar outra vez");
    expect([...container.querySelectorAll<HTMLInputElement>("input")].every(i => i.value === "" && !i.disabled)).toBe(true);
    for (const [index, value] of ["my", "mine", "your", "yours"].entries()) await fill(index, value);
    await click("Conferir"); expect(completed).toHaveBeenLastCalledWith(false);
  });
  for (const [id, wrong, right] of [["its-not", "n.o.t", "not"], ["im-tired", "Im", "I am"], ["you-too-bye", "Me", "You"]]) {
    it(`${id}: checks the missing part while preserving the sentence and accepted contractions`, async () => {
      await card(id); expect(container.querySelectorAll("input.study-gap")).toHaveLength(1);
      await fill(0, wrong); await click("Conferir"); expect(completed).not.toHaveBeenCalled();
      await fill(0, right); await click("Conferir"); expect(completed).toHaveBeenCalledExactlyOnceWith(false);
    });
  }
});

describe("help and deliberate navigation", () => {
  it("shows a purpose and one current action from explanation through the checked response", async () => {
    const step = studySteps.find(item => item.step.id === "mine-your")!.step;
    await act(async () => root.render(createElement(StudyCard, { step, publishedAudio: {}, headingRef: createRef<HTMLHeadingElement>(), onComplete: completed, onNext: next })));
    expect(container.querySelector(".study-step-intent")?.textContent).toBe(step.goal);
    expect(container.querySelector(".study-task-path [aria-current=step]")?.textContent).toContain("Entenda");
    await click("Experimentar");
    expect(container.querySelector(".study-task-path [aria-current=step]")?.textContent).toContain("Complete");
    expect(completed).not.toHaveBeenCalled();
    await click("Consultar um modelo e continuar com apoio");
    expect(container.querySelector(".study-task-path [aria-current=step]")?.textContent).toContain("Confira");
    expect(completed).toHaveBeenCalledExactlyOnceWith(true);
    await click("Rever explicação");
    expect(container.querySelectorAll(".study-task-path [aria-current=step]")).toHaveLength(1);
    expect(container.querySelector(".study-task-path [aria-current=step]")?.textContent).toContain("Entenda");
  });
  it("offers a clear voluntary hint on every practice without recording a completed task or model consultation", async () => {
    for (const { step } of studySteps) {
      await card(step.id); await click("Quero uma pista");
      expect(container.querySelector(".study-hint")?.textContent).toBe(step.practice.hint);
      expect(step.practice.hint.length).toBeGreaterThan(45);
      expect(completed).not.toHaveBeenCalled();
    }
  });
  it("opens the saved step directly on the return link and lets an administrator move on without completing it", async () => {
    // Next can render the destination before committing the browser URL.
    window.history.replaceState(null, "", "/demo");
    await act(async () => root.render(createElement(TheoryExperience, { publishedAudio: {}, resumeStudy: true })));
    expect(container.querySelector(".study-card h1")?.textContent).toBe("Meu, seu — sem repetir");
    await click("Avançar sem concluir (ADM)");
    expect(mocks.stage).toHaveBeenCalledTimes(1);
    const [key, raw, generation] = mocks.stage.mock.calls[0];
    expect(key).toBe("studySnapshot"); expect(generation).toBe(1);
    expect(JSON.parse(raw)).toEqual({ ...emptyProgress, position: 2 });
    expect(container.querySelector(".study-completion")).toBeNull();
  });
  it("ends local editing when leaving a practice and keeps the saved point of return", async () => {
    await act(async () => root.render(createElement(TheoryExperience, { publishedAudio: {}, resumeStudy: true })));
    await click("Experimentar");
    expect(mocks.beginEdit).toHaveBeenCalledWith(1);
    mocks.endEdit.mockClear();
    await click("Blocos");
    expect(mocks.endEdit).toHaveBeenCalledExactlyOnceWith(1);
    expect(container.querySelector(".study-card")).toBeNull();
    await click("Começar a descobrir");
    expect(container.querySelector(".study-card h1")?.textContent).toBe("Meu, seu — sem repetir");
    expect(JSON.parse(mocks.stage.mock.calls[0][1])).toEqual({ ...emptyProgress, position: 1 });
  });
  it("does not expose the admin skip to students or guest visitors", async () => {
    for (const guest of [false, true]) {
      if (guest) mocks.state = { ...mocks.state!, status: "unauthenticated", guestLearning: mocks.state!.workspace!.learning, workspace: null };
      else mocks.state!.workspace!.account.role = "student";
      await act(async () => root.render(createElement(TheoryExperience, { publishedAudio: {}, resumeStudy: true, key: String(guest) })));
      expect(container.querySelector(".study-card")).not.toBeNull();
      expect(container.querySelector(".study-admin-skip")).toBeNull();
    }
  });
});
