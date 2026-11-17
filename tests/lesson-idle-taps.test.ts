// @vitest-environment jsdom
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LessonStage, type LessonStageProps } from "../src/features/first-encounters/LessonStage";
import { DragSource, LessonDragProvider } from "../src/features/first-encounters/LessonDrag";
import { LESSON_SCENES, type PersonId } from "../src/features/first-encounters/lesson-one";
import type { LessonSpeechDriver, LessonSpeechFrame } from "../src/features/first-encounters/lesson-audio";

vi.mock("next/dynamic", () => ({ default: () => function Character({ person, cue, cueKey }: { person: string; cue: string; cueKey: number }) {
  return createElement("div", { "data-rendered-person": person, "data-rendered-cue": cue, "data-rendered-key": cueKey });
} }));

let root: Root, container: HTMLElement;
const onPersonClick = vi.fn(), onDrop = vi.fn();
const initial = LESSON_SCENES[0].rounds[0];
const phrase = { id: "test:phrase", kind: "phrase" as const, value: "I am Ana.", label: "I am Ana." };
function ui(props: Partial<LessonStageProps> = {}, withPhrase = false): ReactNode {
  return createElement(LessonDragProvider, { onDrop }, [
    withPhrase ? createElement(DragSource, { key: "phrase", item: phrase }, "I am Ana.") : null,
    createElement(LessonStage, { key: "stage", round: initial, onPersonClick, ...props }),
  ]);
}
async function render(props: Partial<LessonStageProps> = {}, withPhrase = false) { await act(async () => root.render(ui(props, withPhrase))); }
function person(id: PersonId) { return container.querySelector<HTMLButtonElement>(`[data-person="${id}"]`)!; }
function cue(id: PersonId) { return container.querySelector<HTMLElement>(`[data-rendered-person="${id}"]`)!; }
async function click(element: HTMLElement, detail = 1) { await act(async () => element.dispatchEvent(new MouseEvent("click", { bubbles: true, detail }))); }
async function time(ms: number) { await act(async () => { vi.advanceTimersByTime(ms); }); }
function driver() {
  let frame: LessonSpeechFrame = { playbackId: 1, key: null, person: null, text: null, role: "narration", playing: false, time: 0, duration: 0, level: 0, envelopeReady: false };
  const listeners = new Set<(value: LessonSpeechFrame) => void>();
  const speech: LessonSpeechDriver = { getFrame: () => frame, subscribeFrame: listener => { listeners.add(listener); listener(frame); return () => { listeners.delete(listener); }; } };
  return { speech, emit: (playing: boolean) => { frame = { ...frame, playing, person: playing ? "nina" : null }; for (const listener of listeners) listener(frame); } };
}

beforeEach(() => {
  vi.useFakeTimers(); vi.clearAllMocks(); vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("optional idle character reactions", () => {
  it("plays the native nod on a free click and returns to idle without a course drop", async () => {
    await render({ allowIdleTaps: true });
    await click(person("ana"));
    expect(cue("ana").dataset.renderedCue).toBe("yes");
    expect(Number(cue("ana").dataset.renderedKey)).toBeLessThan(0);
    expect(cue("leo").dataset.renderedCue).toBe("idle");
    expect(onPersonClick).toHaveBeenCalledExactlyOnceWith("ana"); expect(onDrop).not.toHaveBeenCalled();
    await time(1100); expect(cue("ana").dataset.renderedCue).toBe("idle");
  });

  it("leaves quiz choices unchanged by default while preserving their click handler", async () => {
    await render(); await click(person("ana"));
    expect(cue("ana").dataset.renderedCue).toBe("idle");
    expect(onPersonClick).toHaveBeenCalledExactlyOnceWith("ana"); expect(onDrop).not.toHaveBeenCalled();
  });

  it("does not react to phrase delivery and does not block the meaningful drop", async () => {
    await render({ allowIdleTaps: true }, true);
    await click(container.querySelector('[data-lesson-drag-source="test:phrase"]')!);
    expect(person("ana").closest("[data-drop-available]")?.getAttribute("data-drop-available")).toBe("true");
    await click(person("ana"));
    expect(cue("ana").dataset.renderedCue).toBe("idle");
    expect(onDrop).toHaveBeenCalledExactlyOnceWith(phrase, "person:ana");
    expect(onPersonClick).toHaveBeenCalledExactlyOnceWith("ana");
  });

  it("keeps draggable candidate images as selections rather than idle reactions", async () => {
    const round = LESSON_SCENES[2].rounds[0];
    await render({ round, allowIdleTaps: true });
    await click(container.querySelector('[data-lesson-drag-source="person:ana"]')!);
    expect(cue("ana").dataset.renderedCue).toBe("idle");
    expect(onPersonClick).toHaveBeenCalledExactlyOnceWith("ana"); expect(onDrop).not.toHaveBeenCalled();
    expect(container.querySelector('[data-lesson-drag-source="person:ana"]')?.getAttribute("aria-pressed")).toBe("true");
  });

  it("refuses taps during any speech and cancels a nod when narration starts", async () => {
    const { speech, emit } = driver(); emit(true);
    await render({ allowIdleTaps: true, speech }); await click(person("ana"));
    expect(cue("ana").dataset.renderedCue).toBe("idle");
    await act(async () => emit(false)); await click(person("ana"));
    expect(cue("ana").dataset.renderedCue).toBe("yes");
    await act(async () => emit(true));
    expect(cue("ana").dataset.renderedCue).toBe("idle");
    await time(1200); expect(cue("ana").dataset.renderedCue).toBe("idle");
  });

  it("can acknowledge a completed old cue, but a new authored cue takes priority", async () => {
    const oldCue = { person: "ana" as const, name: "self-point" as const, key: 7 };
    await render({ allowIdleTaps: true, cue: oldCue });
    expect(cue("ana").dataset.renderedCue).toBe("self-point");
    await click(person("ana")); expect(cue("ana").dataset.renderedCue).toBe("yes");
    await time(1100); expect(cue("ana").dataset.renderedCue).toBe("idle");
    await click(person("ana"));
    await render({ allowIdleTaps: true, cue: { ...oldCue, name: "wave", key: 8 } });
    expect(cue("ana").dataset.renderedCue).toBe("wave");
    await time(1200); expect(cue("ana").dataset.renderedCue).toBe("wave");
  });

  it("uses one native click for touch and keyboard, with a short reaction cooldown", async () => {
    await render({ allowIdleTaps: true });
    await act(async () => { person("ana").dispatchEvent(new Event("pointerdown", { bubbles: true })); person("ana").dispatchEvent(new Event("pointerup", { bubbles: true })); });
    expect(cue("ana").dataset.renderedCue).toBe("idle");
    await click(person("ana")); const first = cue("ana").dataset.renderedKey;
    expect(onPersonClick).toHaveBeenCalledTimes(1);
    await click(person("ana")); expect(cue("ana").dataset.renderedKey).toBe(first);
    await time(201); await click(person("ana"), 0);
    expect(cue("ana").dataset.renderedKey).not.toBe(first);
    expect(person("ana").tagName).toBe("BUTTON"); expect(onPersonClick).toHaveBeenCalledTimes(3);
  });

  it("resets permissions without remounting the visual and clears its timers on unmount", async () => {
    await render({ allowIdleTaps: true }); const visual = cue("ana");
    await click(person("ana"));
    await render({ allowIdleTaps: false }); expect(cue("ana").dataset.renderedCue).toBe("idle");
    await render({ allowIdleTaps: true }); expect(cue("ana")).toBe(visual); expect(cue("ana").dataset.renderedCue).toBe("idle");
    await click(person("ana")); expect(cue("ana").dataset.renderedCue).toBe("yes");
    await render({ allowIdleTaps: true, round: { ...initial, id: "another-round" } });
    expect(cue("ana").dataset.renderedCue).toBe("idle"); expect(vi.getTimerCount()).toBe(0);
  });
});
