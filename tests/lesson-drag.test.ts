// @vitest-environment jsdom
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DragSource, DropTarget, LessonDragProvider, useLessonDrag, type DragItem } from "@/features/first-encounters/LessonDrag";

const item: DragItem = { id: "hello", kind: "phrase", value: "Hello!", label: "Hello!" };
let root: Root, container: HTMLElement;
const onDrop = vi.fn();
let targetUnderPointer: Element[];
let reads = 0;

function Reader() {
  const { selected, cancel } = useLessonDrag(); reads++;
  return createElement("div", null, createElement("output", null, selected?.id ?? "none"), createElement("button", { onClick: cancel, id: "cancel" }, "Cancelar"));
}
function ui(options: { source?: boolean; nested?: boolean; disabled?: boolean; targetDisabled?: boolean; accept?: DragItem["kind"][]; callback?: typeof onDrop } = {}) {
  return createElement(LessonDragProvider, { onDrop: options.callback ?? onDrop }, [
    options.source === false ? null : createElement(DragSource, { key: "source", item, disabled: options.disabled }, "Hello!"),
    createElement(DropTarget, { key: "target", id: "person:ana", label: "Ana", disabled: options.targetDisabled, accept: options.accept ?? ["phrase"] }, options.nested ? createElement("button", { id: "person", onClick: nestedClick }, "Ana") : "Ana"),
    createElement(Reader, { key: "reader" }),
  ]);
}
const nestedClick = vi.fn();
async function render(node: ReactNode = ui()) { await act(async () => root.render(node)); }
function source() { return container.querySelector<HTMLButtonElement>("[data-lesson-drag-source]")!; }
function target() { return container.querySelector<HTMLElement>("[data-lesson-drop]")!; }
function selected() { return container.querySelector("output")?.textContent; }
async function click(element: HTMLElement, detail = 0) {
  await act(async () => element.dispatchEvent(new MouseEvent("click", { bubbles: true, detail })));
}
async function pointer(element: EventTarget, type: string, x: number, y: number, extra = {}) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, ...extra });
  Object.defineProperties(event, { pointerId: { value: 7 }, isPrimary: { value: true }, pointerType: { value: "touch" } });
  await act(async () => element.dispatchEvent(event));
}
function geometry() {
  vi.spyOn(source(), "getBoundingClientRect").mockReturnValue({ x: 10, y: 20, left: 10, top: 20, right: 110, bottom: 70, width: 100, height: 50, toJSON: () => ({}) });
  source().setPointerCapture = vi.fn(); source().releasePointerCapture = vi.fn(); source().hasPointerCapture = vi.fn(() => true);
}

beforeEach(() => {
  vi.clearAllMocks(); reads = 0;
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  document.body.innerHTML = '<div id="root"></div>';
  container = document.getElementById("root")!; root = createRoot(container);
  targetUnderPointer = [];
  Object.defineProperty(document, "elementsFromPoint", { configurable: true, value: vi.fn(() => targetUnderPointer) });
});
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });

describe("lesson direct manipulation", () => {
  it("selects an item and places it by two clicks exactly once", async () => {
    await render();
    await click(source()); expect(source().getAttribute("aria-pressed")).toBe("true"); expect(selected()).toBe("hello");
    await click(target());
    expect(onDrop).toHaveBeenCalledExactlyOnceWith(item, "person:ana"); expect(selected()).toBe("none");
    await click(target()); expect(onDrop).toHaveBeenCalledTimes(1);
  });

  it("consumes touch travel on a draggable while leaving normal page and text-field gestures available", async () => {
    await render();
    const outside = document.createElement("div"), field = document.createElement("input");
    document.body.append(outside, field);
    const gesture = (element: HTMLElement) => { const event = new Event("touchmove", { bubbles: true, cancelable: true }); element.dispatchEvent(event); return event.defaultPrevented; };
    expect(gesture(source())).toBe(true);
    expect(gesture(outside)).toBe(false);
    expect(gesture(field)).toBe(false);
    geometry(); await pointer(source(), "pointerdown", 25, 35);
    expect(gesture(document.body)).toBe(true);
    await pointer(document, "pointercancel", 25, 35);
    expect(gesture(document.body)).toBe(false);
    outside.remove(); field.remove();
  });

  it("keeps keyboard alternatives and Escape available", async () => {
    await render();
    expect(target().getAttribute("role")).toBe("button"); expect(target().tabIndex).toBe(0);
    await click(source());
    await act(async () => target().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })));
    expect(onDrop).toHaveBeenCalledTimes(1);
    await click(source());
    await act(async () => target().dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true })));
    expect(onDrop).toHaveBeenCalledTimes(2);
    await click(source());
    await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })));
    expect(selected()).toBe("none"); expect(onDrop).toHaveBeenCalledTimes(2);
  });

  it("places through a nested PersonButton without another nested button or double activation", async () => {
    await render(ui({ nested: true }));
    expect(target().getAttribute("role")).toBe("group"); expect(target().hasAttribute("tabindex")).toBe(false);
    expect(target().querySelectorAll("button")).toHaveLength(1);
    await click(source()); await click(container.querySelector("#person")!);
    expect(nestedClick).toHaveBeenCalledOnce(); expect(onDrop).toHaveBeenCalledExactlyOnceWith(item, "person:ana");
  });

  it("disables placement without disabling independent actions of a nested person button", async () => {
    await render(ui({ nested: true, targetDisabled: true }));
    expect(target().getAttribute("role")).toBe("group");
    expect(target().hasAttribute("aria-disabled")).toBe(false);
    await click(source()); await click(container.querySelector("#person")!);
    expect(nestedClick).toHaveBeenCalledOnce(); expect(onDrop).not.toHaveBeenCalled();
  });

  it("tracks pointer coordinates 1:1 without rendering on every move; releases one delivery", async () => {
    await render(); geometry(); targetUnderPointer = [target()];
    const button = source();
    await pointer(button, "pointerdown", 25, 35);
    expect(button.setPointerCapture).toHaveBeenCalledWith(7);
    await pointer(document, "pointermove", 125, 135);
    const ghost = document.querySelector<HTMLElement>(".lesson-drag-ghost")!;
    expect(ghost.style.transform).toBe("translate3d(110px, 120px, 0)");
    expect(target().getAttribute("data-lesson-drop-active")).toBe("true");
    const afterStart = reads;
    for (let x = 130; x < 150; x++) await pointer(document, "pointermove", x, 135);
    expect(reads).toBe(afterStart);
    expect(ghost.style.transform).toBe("translate3d(134px, 120px, 0)");
    await pointer(document, "pointerup", 149, 135);
    expect(onDrop).toHaveBeenCalledExactlyOnceWith(item, "person:ana");
    expect(document.querySelector(".lesson-drag-ghost")).toBeNull(); expect(selected()).toBe("none");
    expect(button.releasePointerCapture).toHaveBeenCalledWith(7);
    await click(button, 1); expect(selected()).toBe("none"); expect(onDrop).toHaveBeenCalledTimes(1);
    await click(button, 0); expect(selected()).toBe("hello");
  });

  it("does not grade an outside drop, an incompatible target, or pointercancel", async () => {
    await render(ui({ accept: ["person"] })); geometry();
    targetUnderPointer = [target()];
    await pointer(source(), "pointerdown", 25, 35); await pointer(document, "pointermove", 125, 135); await pointer(document, "pointerup", 125, 135);
    expect(onDrop).not.toHaveBeenCalled(); expect(selected()).toBe("none");
    expect(document.querySelector(".lesson-drag-ghost")).toBeNull();
    await click(source()); await click(target()); expect(selected()).toBe("hello"); expect(onDrop).not.toHaveBeenCalled();
    await pointer(source(), "pointerdown", 25, 35); await pointer(document, "pointermove", 125, 135); await pointer(document, "pointercancel", 125, 135);
    expect(selected()).toBe("none"); expect(onDrop).not.toHaveBeenCalled();
    expect(document.querySelector(".lesson-drag-ghost")).toBeNull();
    targetUnderPointer = [];
    await pointer(source(), "pointerdown", 25, 35); await pointer(document, "pointermove", 125, 135); await pointer(document, "pointerup", 125, 135);
    expect(onDrop).not.toHaveBeenCalled();
  });

  it("cancels a drag and click selection when its source disappears between rounds", async () => {
    await render(); geometry(); targetUnderPointer = [target()];
    await click(source()); await render(ui({ source: false })); expect(selected()).toBe("none");
    await render(); geometry();
    await pointer(source(), "pointerdown", 25, 35); await pointer(document, "pointermove", 125, 135);
    await render(ui({ source: false }));
    expect(document.querySelector(".lesson-drag-ghost")).toBeNull(); expect(selected()).toBe("none");
    await pointer(document, "pointerup", 125, 135); expect(onDrop).not.toHaveBeenCalled();
  });

  it("ignores release after the source DOM disappears before React cleanup", async () => {
    await render(); geometry(); targetUnderPointer = [target()];
    const button = source(), parent = button.parentElement!, nextSibling = button.nextSibling;
    await pointer(button, "pointerdown", 25, 35); await pointer(document, "pointermove", 125, 135);
    // A new round can move another target beneath the pointer before passive cleanup.
    button.remove();
    await pointer(document, "pointerup", 125, 135);
    expect(onDrop).not.toHaveBeenCalled(); expect(selected()).toBe("none");
    expect(document.querySelector(".lesson-drag-ghost")).toBeNull();
    parent.insertBefore(button, nextSibling);
  });

  it("uses the current round callback and keeps a disabled source inert", async () => {
    await render(); await click(source());
    const nextRound = vi.fn(); await render(ui({ callback: nextRound })); await click(target());
    expect(nextRound).toHaveBeenCalledExactlyOnceWith(item, "person:ana"); expect(onDrop).not.toHaveBeenCalled();
    await render(ui({ disabled: true })); await click(source()); expect(selected()).toBe("none");
  });

  it("scopes hit testing to its own provider even when target IDs repeat", async () => {
    const otherDrop = vi.fn();
    await render(createElement("div", null, ui(), createElement(LessonDragProvider, { onDrop: otherDrop },
      createElement(DropTarget, { id: "person:ana", label: "Other Ana" }, "Other Ana"))));
    geometry(); targetUnderPointer = [container.querySelectorAll("[data-lesson-drop]")[1]];
    await pointer(source(), "pointerdown", 25, 35); await pointer(document, "pointermove", 125, 135); await pointer(document, "pointerup", 125, 135);
    expect(onDrop).not.toHaveBeenCalled(); expect(otherDrop).not.toHaveBeenCalled();
  });
});
