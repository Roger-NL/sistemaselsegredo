// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LessonDragProvider, DragSource, DropTarget } from "../src/features/first-encounters/LessonDrag";
import { LessonTaskTransition } from "../src/features/first-encounters/LessonTaskTransition";

class Motion {
  resolve!: () => void;
  reject!: (reason: Error) => void;
  finished = new Promise<void>((done, fail) => { this.resolve = done; this.reject = fail; });
  finish = vi.fn(() => this.resolve());
  cancel = vi.fn(() => this.reject(new Error("cancelled")));
}
type RecordedMotion = { node: HTMLElement; frames: Keyframe[]; options: KeyframeAnimationOptions; motion: Motion };
let root: Root, container: HTMLElement, reduce = false;
let motions: RecordedMotion[] = [];
const clicked = vi.fn(), onDrop = vi.fn();
const phrase = { id: "test:phrase", kind: "phrase" as const, value: "Hello", label: "Hello" };
function Tree({ task = "one", order = 0, enabled = true }: { task?: string; order?: number; enabled?: boolean }) {
  return createElement(LessonDragProvider, { onDrop }, [
    createElement(DragSource, { key: "source", item: phrase }, "Hello"),
    createElement(LessonTaskTransition, { key: "transition", transitionKey: task, order, enabled },
      createElement("section", null,
        createElement("div", { className: "ls-stage-content" }, task, createElement("div", { className: "ls-speech-anchor", id: "nested-anchor" }, "nested")),
        createElement("div", { className: "ls-speech-anchor", id: "speech" }, "speech"),
        createElement("div", { className: "ls-world" }, createElement("canvas", { "data-actor": "ana" })),
        createElement("div", { className: "lo-workbench" }, createElement(DropTarget, { id: "answer", label: "Answer" }, createElement("button", { onClick: clicked }, "Use the new task"))),
      )),
    createElement("footer", { key: "footer" }, "Stable navigation"),
  ]);
}
async function render(task = "one", order = 0, enabled = true) { await act(async () => root.render(createElement(Tree, { task, order, enabled }))); }
async function pointer() { await act(async () => document.dispatchEvent(new Event("pointerdown", { bubbles: true }))); }

beforeEach(() => {
  vi.clearAllMocks(); motions = []; reduce = false;
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  window.matchMedia = vi.fn().mockImplementation(() => ({ matches: reduce, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  Object.defineProperty(HTMLElement.prototype, "animate", { configurable: true, value: function (this: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions) {
    const motion = new Motion(); motions.push({ node: this, frames, options, motion }); return motion as unknown as Animation;
  } });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount()); container.remove();
  Reflect.deleteProperty(HTMLElement.prototype, "animate"); vi.unstubAllGlobals();
});

describe("task motion without replacing the stage", () => {
  it("keeps initial content still, then moves only guide, speech and choices together", async () => {
    await render(); expect(motions).toHaveLength(0);
    const actor = container.querySelector("canvas"), footer = container.querySelector("footer");
    await render("two", 1);
    expect(motions.map(item => item.node.className)).toEqual(["ls-stage-content", "ls-speech-anchor", "lo-workbench"]);
    expect(motions.every(item => item.options.duration === 260)).toBe(true);
    expect(motions[0].frames[0].transform).toContain("12px"); expect(motions[2].frames[0].transform).toContain("8px");
    expect(container.querySelector("canvas")).toBe(actor); expect(container.querySelector("footer")).toBe(footer);
    expect(container.querySelectorAll("canvas")).toHaveLength(1);
    expect(motions.some(item => item.node.id === "nested-anchor")).toBe(false);
    expect(container.querySelector("[data-lesson-transitioning]")?.getAttribute("data-lesson-transitioning")).toBe("true");
  });

  it("does not disable new controls while motion is running", async () => {
    await render(); await render("two", 1);
    const button = container.querySelector<HTMLButtonElement>(".lo-workbench button")!;
    expect(button.disabled).toBe(false); expect(button.closest("[inert]")).toBeNull();
    await act(async () => button.click()); expect(clicked).toHaveBeenCalledOnce();
  });

  it("cancels an old DnD selection on a new task without remounting its actor", async () => {
    await render(); const actor = container.querySelector("canvas");
    await act(async () => container.querySelector<HTMLButtonElement>("[data-lesson-drag-source]")!.click());
    expect(container.querySelector("[data-lesson-drag-source]")?.getAttribute("aria-pressed")).toBe("true");
    await render("two", 1);
    expect(container.querySelector("[data-lesson-drag-source]")?.getAttribute("aria-pressed")).toBe("false");
    expect(container.querySelector("canvas")).toBe(actor); expect(onDrop).not.toHaveBeenCalled();
  });

  it("settles motion before pointer interaction and reverses direction for Back", async () => {
    await render(); await render("two", 1);
    const first = motions.slice(); await pointer();
    expect(first.every(item => item.motion.finish.mock.calls.length === 1 && item.motion.cancel.mock.calls.length === 1)).toBe(true);
    expect(container.querySelector(".lo-workbench")?.getAttribute("style")).not.toContain("will-change: transform");
    await render("one", 0);
    expect(motions[3].frames[0].transform).toContain("-12px");
    expect(container.querySelector("[data-lesson-transition-direction]")?.getAttribute("data-lesson-transition-direction")).toBe("back");
  });

  it("cancels rapid programmatic switches and ignores stale completion callbacks", async () => {
    await render(); await render("two", 1); const first = motions.slice();
    await render("three", 2); expect(first.every(item => item.motion.cancel.mock.calls.length === 1)).toBe(true);
    expect(motions).toHaveLength(6);
    await act(async () => { for (const item of first) item.motion.resolve(); });
    expect(container.querySelector("[data-lesson-transitioning]")?.getAttribute("data-lesson-transitioning")).toBe("true");
    await act(async () => { for (const item of motions.slice(3)) item.motion.resolve(); });
    expect(container.querySelector("[data-lesson-transitioning]")?.getAttribute("data-lesson-transitioning")).toBe("false");
  });

  it("preserves the existing speech-anchor transform instead of moving its baseline", async () => {
    await render(); const speech = container.querySelector<HTMLElement>("#speech")!; speech.style.transform = "translateX(-50%)";
    await render("two", 1);
    const motion = motions.find(item => item.node === speech)!;
    expect(motion.frames[0].transform).toBe("translateX(12px) translateX(-50%)");
    expect(motion.frames[1].transform).toBe("translateX(-50%)");
  });

  it("uses opacity alone for reduced motion and stays instant for keyboard navigation", async () => {
    reduce = true; await render(); await render("two", 1);
    expect(motions).toHaveLength(3); expect(motions.every(item => item.frames.every(frame => frame.transform === undefined))).toBe(true);
    expect(motions.every(item => item.options.duration === 160)).toBe(true);
    await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
    await render("three", 2); expect(motions).toHaveLength(3);
    await pointer(); reduce = false; await render("four", 3); expect(motions).toHaveLength(6);
  });

  it("skips disabled/initial restoration and restores temporary rendering hints on cleanup", async () => {
    await render("one", 0, false); await render("restored", 5, true); expect(motions).toHaveLength(0);
    await render("next", 6, true); const guide = container.querySelector<HTMLElement>(".ls-stage-content")!;
    expect(guide.style.willChange).toBe("transform, opacity");
    await render("another", 7, false); expect(guide.style.willChange).toBe("");
    expect(container.querySelector("[data-lesson-transitioning]")?.getAttribute("data-lesson-transitioning")).toBe("false");
  });
});
