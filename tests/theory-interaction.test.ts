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
import { studySteps, emptyProgress, isCorrect, decodeProgress, type StudyProgress } from "@/features/theory/progress";

let root: Root, container: HTMLElement;
const completed = vi.fn(), next = vi.fn(), acknowledged = vi.fn();
const practiceIds = ["mine-your", "did-order", "careful-close", "do-you-like", "im-tired", "can-sit", "have-go", "you-too-bye"];
beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.stage.mockReset().mockReturnValue(true);
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
async function openDisclosure(selector: string, label: string) {
  const details = container.querySelector<HTMLDetailsElement>(selector);
  expect(details, label).not.toBeNull();
  const summary = details!.querySelector("summary")!;
  expect(summary.textContent).toBe(label);
  if (!details!.open) await act(async () => summary.click());
  expect(details!.open).toBe(true);
  return details!;
}
async function help() { return openDisclosure("details.study-support", "Ajuda"); }
async function lesson(id: string) {
  const step = studySteps.find(item => item.step.id === id)!.step;
  await act(async () => root.render(createElement(StudyCard, { key: id, step, publishedAudio: {}, headingRef: createRef<HTMLHeadingElement>(), onComplete: completed, onNext: next, onAcknowledge: acknowledged })));
  return step;
}
async function card(id: string) {
  const step = await lesson(id);
  expect(step.mode).toBe("practice");
  expect(container.querySelector(".study-reason p")?.textContent).toBe(step.why);
  expect(container.querySelector(".study-reason")?.closest("details")).toBeNull();
  await click("Praticar"); return step;
}
function setProgress(progress: StudyProgress) {
  mocks.state!.workspace!.learning.studySnapshot = JSON.stringify(progress);
  mocks.state!.workspace!.learning.studyCompleted = progress.completed.length;
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

describe("teaching before occasional practice", () => {
  it("keeps the saved IDs and version while offering eight practices among twenty-four teaching steps", () => {
    expect(studySteps.map(({ step }) => step.id)).toEqual([
      "this-yours", "mine-your", "its-not", "did-order", "iced-coffee", "and-you",
      "really-too", "sorry-okay", "careful-close", "like-it", "do-you-like", "like-here",
      "im-tired", "learning", "work-job", "sit-me", "yeah-sure", "can-sit",
      "stay-longer", "have-go", "break-quiet", "keep-touch", "nice-talking", "you-too-bye",
    ]);
    expect(studySteps.filter(({ step }) => step.mode === "practice").map(({ step }) => step.id)).toEqual(practiceIds);
    const legacy = { version: 1 as const, position: 6, completed: ["this-yours", "really-too", "mine-your"], supported: ["really-too", "mine-your"] };
    expect(decodeProgress(JSON.stringify(legacy))).toEqual(legacy);
  });
  it("shows each reading step's reason and available examples, and records only explicit acknowledgement", async () => {
    const explanations = studySteps.filter(({ step }) => step.mode === "explain");
    expect(explanations).toHaveLength(16);
    for (const { step } of explanations) {
      await lesson(step.id);
      const previousAcknowledgements = acknowledged.mock.calls.length;
      expect(container.querySelector(".study-reason p")?.textContent).toBe(step.why);
      expect(container.querySelector(".study-reason")?.closest("details")).toBeNull();
      const examples = [...container.querySelectorAll(".study-examples li")];
      expect(examples).toHaveLength(step.examples?.length ?? 0);
      for (const [index, example] of (step.examples ?? []).entries()) {
        expect(examples[index].textContent).toContain(example.text);
        expect(examples[index].textContent).toContain(example.meaning);
      }
      if (step.examples) expect(container.querySelector(".study-examples")?.closest("details")).toBeNull();
      expect(container.querySelector("form,.study-piece-board,.study-task-path,.study-support")).toBeNull();
      const labels = [...container.querySelectorAll("button")].map(button => button.textContent);
      expect(labels).not.toContain("Praticar");
      expect(labels).not.toContain("Conferir");
      expect(labels).not.toContain("Ver modelo");
      await openDisclosure("details.study-deeper", "Mais detalhes");
      expect(acknowledged).toHaveBeenCalledTimes(previousAcknowledgements);
      expect(completed).not.toHaveBeenCalled();
      await click("Entendi, continuar");
      expect(acknowledged).toHaveBeenCalledTimes(previousAcknowledgements + 1);
      expect(completed).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(container.querySelector(".study-card")?.getAttribute("data-feedback")).toBe("none");
    }
    expect(mocks.sound).not.toHaveBeenCalledWith("correct");
  });
  it("saves acknowledgement and the next position atomically while preserving historical model consultation", async () => {
    const legacy: StudyProgress = { version: 1, position: 6, completed: ["this-yours", "really-too"], supported: ["really-too"] };
    setProgress(legacy);
    mocks.stage.mockImplementation((_key, raw) => { setProgress(JSON.parse(raw)); return true; });
    await act(async () => root.render(createElement(TheoryExperience, { publishedAudio: {}, resumeStudy: true })));
    expect(container.querySelector(".study-card h1")?.textContent).toBe("Sério? Eu também!");
    expect(mocks.stage).not.toHaveBeenCalled();
    await openDisclosure("details.study-deeper", "Mais detalhes");
    expect(mocks.stage).not.toHaveBeenCalled();
    await click("Entendi, continuar");
    expect(mocks.stage).toHaveBeenCalledTimes(1);
    const [key, raw, generation] = mocks.stage.mock.calls[0];
    expect(key).toBe("studySnapshot"); expect(generation).toBe(1);
    expect(JSON.parse(raw)).toEqual({ ...legacy, position: 7 });
    expect(mocks.sound).not.toHaveBeenCalledWith("correct");
    await act(async () => root.render(createElement(TheoryExperience, { publishedAudio: {}, resumeStudy: true })));
    expect(container.querySelector(".study-card h1")?.textContent).toBe("Pequenas gentilezas");
  });
  it("adds a newly acknowledged explanation to completed without adding a model consultation", async () => {
    setProgress(emptyProgress);
    await act(async () => root.render(createElement(TheoryExperience, { publishedAudio: {}, resumeStudy: true })));
    await click("Entendi, continuar");
    expect(mocks.stage).toHaveBeenCalledTimes(1);
    expect(JSON.parse(mocks.stage.mock.calls[0][1])).toEqual({ ...emptyProgress, position: 1, completed: ["this-yours"] });
  });
  it("keeps the current explanation and saved progress when staging acknowledgement is refused", async () => {
    setProgress({ ...emptyProgress, position: 22 });
    const saved = mocks.state!.workspace!.learning.studySnapshot;
    mocks.stage.mockReturnValue(false);
    await act(async () => root.render(createElement(TheoryExperience, { publishedAudio: {}, resumeStudy: true })));
    await click("Entendi, continuar");
    expect(mocks.stage).toHaveBeenCalledTimes(1);
    expect(mocks.state!.workspace!.learning.studySnapshot).toBe(saved);
    expect(container.querySelector(".study-card h1")?.textContent).toBe(studySteps[22].step.title);
    expect(container.querySelector(".study-shell")?.getAttribute("data-view")).toBe("study");
    expect(container.querySelector(".study-finished")).toBeNull();
  });
  it("lets administrators skip an explanation without acknowledging it", async () => {
    setProgress(emptyProgress);
    await act(async () => root.render(createElement(TheoryExperience, { publishedAudio: {}, resumeStudy: true })));
    await click("Avançar sem concluir (ADM)");
    expect(mocks.stage).toHaveBeenCalledTimes(1);
    expect(JSON.parse(mocks.stage.mock.calls[0][1])).toEqual({ ...emptyProgress, position: 1 });
    expect(mocks.sound).not.toHaveBeenCalledWith("correct");
  });
});

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
  for (const [id, wrong, right] of [["careful-close", "That was close.", "Careful!"], ["have-go", "I can go.", "I have to go."]]) {
    it(`${id}: lets a learner replace a semantic choice before completing the practice`, async () => {
      await card(id);
      expect(container.querySelector(".study-piece-board")).toBeNull();
      const choose = async (answer: string) => {
        const option = [...container.querySelectorAll<HTMLInputElement>('input[type="radio"]')].find(input => input.value === answer);
        expect(option).toBeDefined();
        await act(async () => option!.click());
      };
      await choose(wrong);
      expect(completed).not.toHaveBeenCalled();
      await click("Conferir"); expect(completed).not.toHaveBeenCalled();
      expect(container.querySelector(".study-card")?.getAttribute("data-feedback")).toBe("retry");
      await choose(right); await click("Conferir");
      expect(completed).toHaveBeenCalledExactlyOnceWith(false);
      expect(acknowledged).not.toHaveBeenCalled();
    });
  }
  it("places every phrase model in the same order it teaches", async () => {
    for (const { step } of studySteps) {
      if (step.mode !== "practice" || step.practice.kind !== "order") continue;
      await card(step.id);
      const previousCompletions = completed.mock.calls.length;
      await help();
      expect(completed).toHaveBeenCalledTimes(previousCompletions);
      await click("Ver modelo");
      const words = [...container.querySelectorAll(".study-piece-placed")].map(button => button.getAttribute("aria-label")!.replace(/^Devolver (.*) ao banco$/, "$1"));
      expect(words.join(" ")).toBe(step.practice.answer);
      expect(words).toHaveLength(step.practice.tokens.length);
      expect(completed).toHaveBeenCalledTimes(previousCompletions + 1);
      expect(completed).toHaveBeenLastCalledWith(true);
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
    await help();
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
    await help();
    expect(completed).not.toHaveBeenCalled();
    await click("Ver modelo");
    expect([...container.querySelectorAll<HTMLInputElement>("input")].map(i => i.value)).toEqual(["my", "mine", "your", "yours"]);
    expect(completed).toHaveBeenCalledExactlyOnceWith(true);
    await click("Tentar outra vez");
    expect([...container.querySelectorAll<HTMLInputElement>("input")].every(i => i.value === "" && !i.disabled)).toBe(true);
    for (const [index, value] of ["my", "mine", "your", "yours"].entries()) await fill(index, value);
    await click("Conferir"); expect(completed).toHaveBeenLastCalledWith(false);
  });
  for (const [id, wrong, right] of [["im-tired", "Im", "I am"], ["you-too-bye", "Me", "You"]]) {
    it(`${id}: checks the missing part while preserving the sentence and accepted contractions`, async () => {
      await card(id); expect(container.querySelectorAll("input.study-gap")).toHaveLength(1);
      await fill(0, wrong); await click("Conferir"); expect(completed).not.toHaveBeenCalled();
      await fill(0, right); await click("Conferir"); expect(completed).toHaveBeenCalledExactlyOnceWith(false);
    });
  }
});

describe("help and deliberate navigation", () => {
  it("teaches the reason and contrasts before the optional practice action", async () => {
    const step = await lesson("mine-your");
    expect(container.querySelector(".study-reason p")?.textContent).toBe(step.why);
    expect(container.querySelector(".study-reason")?.closest("details")).toBeNull();
    expect(container.querySelectorAll(".study-examples li")).toHaveLength(step.examples!.length);
    expect(container.querySelector(".study-examples")?.closest("details")).toBeNull();
    expect(container.querySelector(".study-step-intent")).toBeNull();
    expect(container.querySelector(".study-task-path [aria-current=step]")?.textContent).toContain("Entenda");
    await click("Praticar");
    expect(container.querySelector(".study-task-path")?.classList.contains("study-sr-only")).toBe(true);
    expect(container.querySelector(".study-task-path [aria-current=step]")?.textContent).toContain("Complete");
    expect(completed).not.toHaveBeenCalled();
    await help(); await click("Ver modelo");
    expect(container.querySelector(".study-task-path [aria-current=step]")?.textContent).toContain("Confira");
    expect(completed).toHaveBeenCalledExactlyOnceWith(true);
    expect(container.querySelector(".study-support")).toBeNull();
    const result = await openDisclosure("details.study-result-detail", "Entender a resposta");
    expect(result.querySelector("p")?.textContent).toBe(step.practice.explanation);
    await click("Rever explicação");
    expect(container.querySelector(".study-quote [lang=en]")?.textContent).toBe(step.phrase);
    expect(container.querySelector(".study-task-path")?.classList.contains("study-sr-only")).toBe(true);
    expect(container.querySelectorAll(".study-task-path [aria-current=step]")).toHaveLength(1);
    expect(container.querySelector(".study-task-path [aria-current=step]")?.textContent).toContain("Entenda");
  });
  it("offers a clear voluntary hint on every practice without recording a completed task or model consultation", async () => {
    expect(studySteps.filter(({ step }) => step.mode === "practice").map(({ step }) => step.id)).toEqual(practiceIds);
    for (const { step } of studySteps) {
      if (step.mode !== "practice") continue;
      await card(step.id);
      expect(container.querySelector<HTMLDetailsElement>(".study-support")?.open).toBe(false);
      const support = await help();
      expect(support.querySelector(".study-hint")?.textContent).toBe(step.practice.hint);
      expect(support.querySelector("small")?.textContent).toBe("Ver o modelo registra esta prática com apoio.");
      expect(step.practice.hint.length).toBeGreaterThan(45);
      expect(completed).not.toHaveBeenCalled();
      expect(container.querySelector(".study-card")?.getAttribute("data-feedback")).toBe("none");
      expect(container.querySelector(".study-next")).toBeNull();
      await act(async () => support.querySelector("summary")!.click());
      expect(support.open).toBe(false);
      expect(completed).not.toHaveBeenCalled();
    }
  });
  it("lets help return to the explanation and back while keeping an ungraded draft", async () => {
    await card("mine-your"); await fill(0, "mine");
    await help(); await click("Rever explicação");
    expect(container.querySelector(".study-quote")).not.toBeNull();
    expect(completed).not.toHaveBeenCalled();
    await click("Praticar");
    expect(container.querySelector<HTMLInputElement>("input.study-gap")?.value).toBe("mine");
    expect(container.querySelector(".study-card")?.getAttribute("data-feedback")).toBe("none");
    expect(completed).not.toHaveBeenCalled();
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
    await click("Praticar");
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
