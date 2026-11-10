// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AutoFit } from "@/components/core/AutoFit";
import { fittedSize } from "@/components/core/fit-size";

let root: Root, container: HTMLElement;
let available: { width: number; height: number }, heights: Record<string, number>;
let naturalWidth: number, bodyFont: number, targetSize: number, autoHeight: boolean;
let frames: Map<number, FrameRequestCallback>, serial: number;
let observers: { notify: () => void; disconnect: ReturnType<typeof vi.fn> }[];
let viewport: EventTarget;
const area = () => container.querySelector<HTMLElement>(".auto-fit")!;
const scale = () => Number(area().style.getPropertyValue("--fit-scale"));
const height = () => parseFloat(area().style.getPropertyValue("--fit-height"));
const density = () => area().dataset.fitDensity;
function contentHeight(element: HTMLElement) {
  const density = element.closest<HTMLElement>(".auto-fit")?.dataset.fitDensity ?? "comfortable";
  return heights[density] + (element.querySelector("details[open]") ? 160 : 0);
}
async function flush() {
  await act(async () => { await Promise.resolve(); });
  let guard = 0;
  while (frames.size) {
    expect(++guard).toBeLessThan(6);
    const work = [...frames.values()]; frames.clear();
    await act(async () => work.forEach(callback => callback(0)));
  }
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  available = { width: 400, height: 500 }; heights = { comfortable: 420, compact: 320, tight: 280 };
  naturalWidth = 400; bodyFont = 16; targetSize = 52; autoHeight = false;
  frames = new Map(); serial = 0; observers = []; viewport = new EventTarget();
  vi.stubGlobal("visualViewport", viewport);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++serial, callback); return serial; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("ResizeObserver", class {
    notify: () => void; disconnect = vi.fn();
    constructor(notify: () => void) { this.notify = notify; observers.push(this); }
    observe() {}
  });
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(function (this: HTMLElement) {
    return (this.hidden ? [] : [{}]) as unknown as DOMRectList;
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.matches(".auto-fit-content") ? contentHeight(this) : targetSize;
  });
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.matches(".auto-fit-content") ? available.width : targetSize;
  });
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => available.width);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    if (autoHeight && this.matches(".auto-fit")) {
      const natural = contentHeight(this.querySelector<HTMLElement>(".auto-fit-content")!);
      return Math.min(available.height, this.dataset.fitted ? parseFloat(this.style.getPropertyValue("--fit-height")) : natural);
    }
    return available.height;
  });
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.matches(".auto-fit-content") ? contentHeight(this) : 0;
  });
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(() => naturalWidth);
  vi.spyOn(window, "getComputedStyle").mockImplementation(() => ({ fontSize: `${bodyFont}px`, visibility: "visible" }) as CSSStyleDeclaration);
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Unexpected network call"); }));
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals();
});
async function mount() {
  await act(async () => root.render(createElement(AutoFit, { className: "test-reading" },
    createElement("p", null, "Três opções, com texto legível."),
    createElement("input", { defaultValue: "Resposta preservada", "aria-label": "Resposta" }),
    createElement("details", null, createElement("summary", null, "Ajuda"), createElement("p", null, "Mais conteúdo")),
    createElement("button", { type: "button" }, "Escolher"),
  )));
  await flush();
}

describe("measured short-content fitting (synthetic DOM geometry, not browser visual QA)", () => {
  it("reduces spacing before scale, then restores comfortable spacing on growth", async () => {
    await mount(); expect(density()).toBe("comfortable"); expect(scale()).toBe(1);
    available.height = 340; viewport.dispatchEvent(new Event("resize")); await flush();
    expect(density()).toBe("compact"); expect(scale()).toBe(1);
    available.height = 265; viewport.dispatchEvent(new Event("resize")); await flush();
    expect(density()).toBe("tight"); expect(scale()).toBeCloseTo(265 / 280); expect(height()).toBe(265);
    expect(area().dataset.fitOverflow).toBe("false");
    available.height = 500; viewport.dispatchEvent(new Event("resize")); await flush();
    expect(density()).toBe("comfortable"); expect(scale()).toBe(1); expect(area().hasAttribute("data-fitted")).toBe(false);
    expect(container.querySelector("input")!.value).toBe("Resposta preservada");
  });
  it("measures auto-height parents in natural flow so a previously scaled area can grow back", async () => {
    autoHeight = true; available.height = 265; await mount(); expect(scale()).toBeLessThan(1);
    available.height = 500; observers[0].notify(); await flush();
    expect(scale()).toBe(1); expect(density()).toBe("comfortable"); expect(height()).toBe(420);
  });
  it("preserves the full painted height and real scrolling if the readable minimum cannot fit", async () => {
    available.height = 180; await mount();
    expect(scale()).toBeCloseTo(14 / 16); expect(height()).toBe(245);
    expect(area().dataset.fitOverflow).toBe("true");
    expect(height()).toBeGreaterThan(available.height); // Never clip 245px of real content into 180px.
  });
  it("never scales 44px targets or 14px body text below their floors", async () => {
    available.height = 200; targetSize = 44; await mount(); expect(scale()).toBe(1);
    targetSize = 60; bodyFont = 14; viewport.dispatchEvent(new Event("resize")); await flush(); expect(scale()).toBe(1);
  });
  it("contains unpainted transform overflow but reserves full painted width, aligned left when wider than the viewport", async () => {
    naturalWidth = 500; available.height = 265; await mount();
    expect(area().dataset.fitted).toBe("true"); expect(area().dataset.fitOverflow).toBe("true");
    expect(parseFloat(area().style.getPropertyValue("--fit-width"))).toBeGreaterThan(available.width);
    expect(area().style.getPropertyValue("--fit-left")).toBe("0px");
    expect(area().style.getPropertyValue("--fit-natural-width")).toBe("400px");
  });
  it("refits translated text, expanded help and late content changes without remounting inputs or submitting", async () => {
    available.height = 340; await mount();
    const input = container.querySelector("input"), details = container.querySelector("details")!;
    await act(async () => { details.open = true; }); await flush();
    expect(area().dataset.fitOverflow).toBe("true");
    await act(async () => { details.open = false; container.querySelector("p")!.textContent = "Uma tradução mais longa"; }); await flush();
    expect(density()).toBe("compact"); expect(area().dataset.fitOverflow).toBe("false");
    heights.compact = 380; heights.tight = 300;
    await act(async () => { container.querySelector("p")!.append(document.createElement("font")); }); await flush();
    expect(density()).toBe("tight"); expect(container.querySelector("input")).toBe(input);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("coalesces observer notifications, stays idle after unchanged measurements and cleans up on unmount", async () => {
    await mount();
    for (let i = 0; i < 40; i++) observers[0].notify();
    expect(frames.size).toBe(1); await flush(); expect(frames.size).toBe(0);
    observers[0].notify(); await flush(); expect(frames.size).toBe(0);
    viewport.dispatchEvent(new Event("resize")); expect(frames.size).toBe(1);
    const disconnect = observers[0].disconnect;
    await act(async () => root.unmount()); expect(disconnect).toHaveBeenCalledOnce(); expect(frames.size).toBe(0);
    root = createRoot(container);
  });
});

describe("painted bounds across the verified geometry matrix", () => {
  it.each([[320,568],[375,667],[390,665],[393,852],[430,932],[667,375],[844,390],[1024,600],[1440,900]])(
    "%i × %i uses available bounds without pretending unreadable content fits", (width, height) => {
      const size = { width: width - 32, height: Math.max(1, height - 180) };
      const fit = fittedSize(size, { width: size.width, height: 280 }, .9);
      expect(fit.scale).toBeGreaterThanOrEqual(.9); expect(fit.scale).toBeLessThanOrEqual(1);
      expect(fit.height).toBeCloseTo(280 * fit.scale, 5);
      expect(fit.overflow).toBe(fit.height > size.height);
    },
  );
  it("handles empty, invalid and unavailable geometry safely", () => {
    expect(fittedSize({width:0,height:0},{width:0,height:0},.85)).toEqual({scale:1,width:0,height:0,overflow:false});
    expect(fittedSize({width:300,height:100},{width:300,height:200},NaN).scale).toBe(1);
  });
  it("does not create a one-pixel scroll from floating-point residue in an exact fit", () => {
    for (const [height, natural] of [[474,523],[454,524],[448,525]]) {
      const fit = fittedSize({width:1000,height},{width:1000,height:natural},.85);
      expect(fit.height).toBe(height); expect(fit.overflow).toBe(false);
    }
    for (let height = 180; height < 1000; height += 7) for (let natural = height; natural < height + 100; natural += 3) {
      const fit = fittedSize({width:1000,height},{width:1000,height:natural},.7);
      if (fit.scale > .7) expect(fit.height).toBeLessThanOrEqual(height);
    }
  });
});
