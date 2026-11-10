// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/superuser/TestControls", () => ({ TestControls: () => null }));
import { Presentation } from "@/features/onboarding/Presentation";
import { presentationFrames } from "@/features/onboarding/content";

let root: Root, container: HTMLElement;
let viewport: EventTarget & { height: number };
let naturalHeight: number, descriptionSize: number, controlsHeight: number;
let observers: { notify: () => void; disconnect: ReturnType<typeof vi.fn> }[];

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("innerHeight", 806);
  viewport = Object.assign(new EventTarget(), { height: 806 });
  vi.stubGlobal("visualViewport", viewport);
  window.scrollTo = vi.fn();
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Unexpected network request"); }));
  naturalHeight = 510;
  descriptionSize = 16;
  controlsHeight = 193;
  observers = [];
  vi.stubGlobal("ResizeObserver", class {
    notify: () => void;
    disconnect = vi.fn();
    constructor(notify: () => void) { this.notify = notify; observers.push(this); }
    observe() {}
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.matches(".presentation-stage") ? naturalHeight : 0;
  });
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    if (!this.matches(".presentation-stage-area")) return 0;
    return parseFloat(this.closest<HTMLElement>(".presentation")!.style.getPropertyValue("--presentation-height")) - controlsHeight;
  });
  vi.spyOn(window, "getComputedStyle").mockImplementation(() => ({ fontSize: `${descriptionSize}px` }) as CSSStyleDeclaration);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const area = () => container.querySelector<HTMLElement>(".presentation-stage-area")!;
const scale = () => Number(area().style.getPropertyValue("--presentation-scale"));
const fittedHeight = () => parseFloat(area().style.getPropertyValue("--presentation-stage-height"));
const notify = () => observers.at(-1)!.notify();
async function mount() {
  await act(async () => root.render(createElement(Presentation, { onFinish: vi.fn() })));
  notify(); // The browser reports the grid area after the viewport height has changed.
}

describe("presentation resizing with navigation outside the fitted scene", () => {
  it("fits after a browser banner appears and returns to normal when it closes", async () => {
    await mount();
    expect(scale()).toBe(1);
    viewport.height = 660;
    viewport.dispatchEvent(new Event("resize"));
    notify();
    expect(scale()).toBeCloseTo(467 / 510);
    expect(fittedHeight()).toBeLessThanOrEqual(467);
    for (const selector of [".presentation-header", ".presentation-footer", ".presentation-next", ".presentation-back"]) {
      expect(area().contains(container.querySelector(selector))).toBe(false);
    }
    viewport.height = 806;
    viewport.dispatchEvent(new Event("resize"));
    notify();
    expect(scale()).toBe(1);
    expect(fittedHeight()).toBe(510);
  });

  it("refits every scene after navigation and reacts to growing text or a wrapping header", async () => {
    await mount();
    for (let i = 0; i < presentationFrames.length; i++) {
      if (i > 0) {
        naturalHeight = 530 + i * 10;
        await act(async () => container.querySelector<HTMLButtonElement>(".presentation-next")!.click());
      }
      expect(fittedHeight()).toBeLessThanOrEqual(613);
      expect(container.querySelector("h1")?.textContent).toBe(presentationFrames[i].title.replace("|", ""));
    }
    naturalHeight = 650;
    controlsHeight = 233;
    notify();
    expect(fittedHeight()).toBeLessThanOrEqual(573);
    expect(scale()).toBeCloseTo(573 / 650);
  });

  it("handles window resize without VisualViewport and retains readable content in exceptionally short windows", async () => {
    vi.stubGlobal("visualViewport", undefined);
    await mount();
    vi.stubGlobal("innerHeight", 640);
    window.dispatchEvent(new Event("resize"));
    notify();
    expect(fittedHeight()).toBeLessThanOrEqual(447);
    descriptionSize = 13;
    vi.stubGlobal("innerHeight", 400);
    window.dispatchEvent(new Event("resize"));
    notify();
    expect(scale() * descriptionSize).toBeGreaterThanOrEqual(12);
    expect(fittedHeight()).toBeGreaterThan(207); // Only the central area needs scrolling now.
    expect(container.querySelector(".presentation-footer")?.contains(container.querySelector(".presentation-next"))).toBe(true);
  });

  it("releases observers and viewport listeners on unmount", async () => {
    const remove = vi.spyOn(viewport, "removeEventListener");
    await mount();
    await act(async () => root.unmount());
    expect(observers.every(observer => observer.disconnect.mock.calls.length === 1)).toBe(true);
    expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(container.children).toHaveLength(0);
  });
});
