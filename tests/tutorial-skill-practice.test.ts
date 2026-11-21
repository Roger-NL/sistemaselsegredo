// @vitest-environment jsdom
import { act, createElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LessonDragProvider, type DragItem } from "../src/features/first-encounters/LessonDrag";
import { TutorialSkillPractice, applyTutorialWordDrop, evaluateTutorialWriting, type TutorialWordDraft, type TutorialWritingState } from "../src/features/first-encounters/TutorialSkillPractice";

const wordI: DragItem = { id: "tutorial:word:I", kind: "word", value: "I", label: "I" };
const wordAm: DragItem = { id: "tutorial:word:am", kind: "word", value: "am", label: "am" };

describe("the local tutorial word draft", () => {
  it("places each tutorial token in its own slot without mutating the previous draft", () => {
    const start: TutorialWordDraft = {};
    const first = applyTutorialWordDrop(start, wordI, "tutorial:word:pronoun");
    expect(start).toEqual({}); expect(first).toEqual({ pronoun: "I" });
    const complete = applyTutorialWordDrop(first, wordAm, "tutorial:word:verb");
    expect(first).toEqual({ pronoun: "I" }); expect(complete).toEqual({ pronoun: "I", verb: "am" });
    expect(applyTutorialWordDrop(complete, wordAm, "tutorial:word:verb")).toBe(complete);
  });

  it("rejects another activity's items, wrong slot, wrong type and wrong value", () => {
    const current: TutorialWordDraft = { pronoun: "I" };
    for (const [item, target] of [
      [wordAm, "tutorial:word:pronoun"], [wordI, "tutorial:word:verb"],
      [{ ...wordI, id: "word:I" }, "tutorial:word:pronoun"],
      [{ ...wordI, kind: "phrase" }, "tutorial:word:pronoun"],
      [{ ...wordAm, value: "are" }, "tutorial:word:verb"],
      [wordAm, "word:verb"],
    ] as [DragItem, string][]) expect(applyTutorialWordDrop(current, item, target)).toBe(current);
  });
});

describe("meaning first in the writing controls rehearsal", () => {
  it.each(["I am Ana.", " i   am  ana! ", "I’m Ana", "i'm ana", "im ana", "iam ana", "i m ana", "I am Anna."])("accepts the intended introduction and keeps a valid visible model: %s", value => {
    expect(evaluateTutorialWriting(value)).toEqual({ correct: true, note: expect.stringContaining("I am Ana") });
  });

  it("acknowledges an understandable form error while explicitly correcting the model", () => {
    expect(evaluateTutorialWriting("I are Ana.")).toEqual({ correct: true, note: "A ideia ficou clara. A forma que vamos praticar é I am Ana." });
    expect(evaluateTutorialWriting("I Ana").correct).toBe(true);
  });

  it.each(["", "  ", "You are Ana.", "We are a team.", "I am Maya.", "banana", "I am Ana and Leo", "IamAna"])("keeps a retry for the wrong relationship, name or garbage: %s", value => {
    expect(evaluateTutorialWriting(value).correct).toBe(false);
    expect(evaluateTutorialWriting(value).note.length).toBeGreaterThan(0);
  });
});

let root: Root, container: HTMLElement;
const interaction = vi.fn();
const events: string[] = [];
function Harness({ kind }: { kind: "words" | "write" }) {
  const [words, setWords] = useState<TutorialWordDraft>({});
  const [writing, setWriting] = useState<TutorialWritingState>({ text: "", result: null });
  return createElement(LessonDragProvider, { onDrop: (item, target) => setWords(current => applyTutorialWordDrop(current, item, target)) },
    createElement(TutorialSkillPractice, { kind, words, writing, onWordsChange: setWords, onReadWord: vi.fn(), onReadModel: vi.fn(),
      onWritingChange: next => { events.push("change"); setWriting(next); }, onInteraction: () => { events.push("interaction"); interaction(); } }));
}
async function render(kind: "words" | "write") { await act(async () => root.render(createElement(Harness, { kind }))); }
async function click(el: Element) { await act(async () => el.dispatchEvent(new MouseEvent("click", { bubbles: true }))); }
async function input(value: string) {
  const el = container.querySelector<HTMLInputElement>("input")!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

beforeEach(() => {
  vi.clearAllMocks(); events.length = 0; vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });

describe("the shared controls without the lesson controller", () => {
  it("uses real two-click word delivery, then Refazer clears both slots locally", async () => {
    localStorage.setItem("basedspeak.lesson-one.v2", "unchanged lesson progress");
    await render("words");
    await act(async () => container.querySelector('[data-lesson-drag-source="tutorial:word:I"]')!.dispatchEvent(new Event("pointerdown", { bubbles: true })));
    expect(interaction).toHaveBeenCalled();
    await click(container.querySelector('[data-lesson-drag-source="tutorial:word:I"]')!);
    await click(container.querySelector('[data-lesson-drop="tutorial:word:pronoun"]')!);
    await click(container.querySelector('[data-lesson-drag-source="tutorial:word:am"]')!);
    await click(container.querySelector('[data-lesson-drop="tutorial:word:verb"]')!);
    expect(container.querySelectorAll(".tsp-word-slot.is-filled")).toHaveLength(2);
    await click(container.querySelector('[aria-label="Refazer montagem"]')!);
    expect(container.querySelectorAll(".tsp-word-slot.is-filled")).toHaveLength(0);
    expect(localStorage.getItem("basedspeak.lesson-one.v2")).toBe("unchanged lesson progress");
  });

  it("preserves field changes before stopping narration, accepts im ana, and erases without remounting", async () => {
    await render("write");
    const field = container.querySelector<HTMLInputElement>("input")!;
    expect(container.querySelector('[aria-label="Conferir escrita"]')?.hasAttribute("disabled")).toBe(true);
    await input("im ana");
    expect(events.slice(0, 2)).toEqual(["change", "interaction"]);
    await click(container.querySelector('[aria-label="Conferir escrita"]')!);
    expect(container.querySelector('[role="status"]')?.textContent).toContain("I am Ana");
    expect(container.querySelector(".tsp-result.is-correct")).not.toBeNull();
    await click(container.querySelector('[aria-label="Apagar o que escrevi"]')!);
    expect(container.querySelector("input")).toBe(field); expect(field.value).toBe(""); expect(document.activeElement).toBe(field);
    expect(container.querySelector('.tsp-result[role="status"]')).toBeNull();
  });

  it("keeps incorrect meaning retryable and submits a corrected draft by the form's Enter path", async () => {
    await render("write"); await input("you are ana");
    await click(container.querySelector('[aria-label="Conferir escrita"]')!);
    expect(container.querySelector(".tsp-result.is-retry")).not.toBeNull();
    await input("I are Ana"); expect(container.querySelector('.tsp-result[role="status"]')).toBeNull();
    await act(async () => container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    expect(container.querySelector(".tsp-result.is-correct")?.textContent).toContain("A forma que vamos praticar é I am Ana");
    expect(container.querySelector('[aria-label="Conferir escrita"]')?.hasAttribute("disabled")).toBe(true);
  });
});
