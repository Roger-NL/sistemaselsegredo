// @vitest-environment jsdom
import { act, createElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AutoFit } from "@/components/core/AutoFit";
import { SceneFrame } from "@/features/demo/components/SceneFrame";

let root: Root, container: HTMLDivElement;
let gridHeight: number, transform: number, frames: Map<number, FrameRequestCallback>, serial: number;
let viewport: EventTarget & { width: number; height: number };
type Observation = { element: Element; size: string | null };
let observers: { observations: Observation[]; callback: ResizeObserverCallback; disconnected: boolean }[];
const area = () => container.querySelector<HTMLElement>(".activity-body")!;
const scene = () => container.querySelector<HTMLElement>(".scene-grid")!;
const selected = () => container.querySelector(".selected-piece") !== null;
function innerHeight() {
  const heights: Record<string, number> = { comfortable: 320, compact: 280, tight: 260 };
  return (heights[area()?.dataset.fitDensity ?? "comfortable"] ?? 320) + (selected() ? 4 : 0);
}
const stageHeight = () => innerHeight() + 12; // Real .auto-fit-content padding: 6px per side.
const paintedHeight = () => area()?.hasAttribute("data-fitted") ? parseFloat(area().style.getPropertyValue("--fit-height")) || stageHeight() : stageHeight();
const budget = () => parseFloat(scene()?.style.getPropertyValue("--scene-panel-space")) || gridHeight;
function boxHeight(element: HTMLElement): number {
  if (element.matches(".scene-frame")) return gridHeight + 60;
  if (element.matches(".scene-grid")) return gridHeight;
  if (element.matches(".scene-intro-slot")) return 0;
  if (element.matches(".activity-actions")) return 60;
  if (element.matches(".activity-content")) return innerHeight();
  if (element.matches(".auto-fit-content")) return stageHeight();
  if (element.matches(".auto-fit-size")) return paintedHeight();
  if (element.matches(".activity-body,.conversation-panel")) return Math.min(budget(), paintedHeight());
  return 52;
}
type SelectionKind = "pieces" | "choices";
function Board({ kind }: { kind: SelectionKind }) {
  const [chosen, choose] = useState(false);
  if (kind === "choices") return createElement("div", { className: "activity-content" },
    createElement("p", null, "Escolha uma resposta."),
    createElement("div", { className: "choices" }, createElement("button", { className: "choose-option", "aria-pressed": chosen, onClick: () => choose(!chosen) }, "Sim, claro.")),
    createElement("p", { className: chosen ? "selected-piece" : undefined }, chosen ? "Resposta escolhida." : "Escolha uma opção."),
    createElement("input", { defaultValue: "Rascunho preservado", "aria-label": "Rascunho" }));
  return createElement("div", { className: "activity-content" },
    createElement("p", null, "Sim, claro."),
    createElement("div", { className: "answer" }, chosen ? createElement("button", { className: "selected-piece", onClick: () => choose(false) }, "Yeah,") : "Sua resposta aparece aqui"),
    createElement("div", { className: "blocks" }, createElement("button", { className: "choose-piece", disabled: chosen, onClick: () => choose(true) }, "Yeah,"), createElement("button", { type: "button" }, "sure.")),
    createElement("input", { defaultValue: "Rascunho preservado", "aria-label": "Rascunho" }));
}
beforeEach(() => {
  gridHeight = 500; transform = 1; serial = 0; frames = new Map(); observers = [];
  viewport = Object.assign(new EventTarget(), { width: 390, height: 844 });
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("visualViewport", viewport);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++serial, callback); return serial; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Unexpected network request"); }));
  vi.stubGlobal("ResizeObserver", class {
    record: (typeof observers)[number];
    constructor(callback: ResizeObserverCallback) { this.record = { observations: [], callback, disconnected: false }; observers.push(this.record); }
    observe(element: Element) { this.record.observations.push({ element, size: null }); }
    disconnect() { this.record.disconnected = true; this.record.observations.length = 0; }
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) { return boxHeight(this); });
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) { return boxHeight(this); });
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLElement) { return boxHeight(this); });
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) { return this.matches("button,input") ? 52 : 354; });
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => 354);
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(() => 354);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(() => ([{}]) as unknown as DOMRectList);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const height = boxHeight(this) * (this.matches(".activity-content,.auto-fit-content") ? transform : 1);
    return { x: 0, y: 0, left: 0, top: 0, right: 354, bottom: height, width: 354, height, toJSON: () => ({}) };
  });
  vi.spyOn(window, "getComputedStyle").mockImplementation(element => ({
    display: "grid", gridTemplateColumns: "354px", paddingTop: "0px", paddingBottom: "0px",
    rowGap: element.classList.contains("scene-grid") ? "10px" : "0px", fontSize: "16px", visibility: "visible",
  }) as CSSStyleDeclaration);
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function fingerprint() {
  return [scene().style.getPropertyValue("--scene-art-height"), scene().style.getPropertyValue("--scene-panel-space"), scene().dataset.density,
    area().dataset.fitDensity, area().style.getPropertyValue("--fit-scale"), area().style.getPropertyValue("--fit-height"), area().dataset.fitOverflow].join("|");
}
/** Deliver ResizeObserver only when an observed layout box changes. Keep the
 * real jsdom MutationObserver, so React text/piece changes also schedule work. */
async function settle() {
  let idle = 0;
  const trace: string[] = [];
  for (let turn = 0; turn < 24; turn++) {
    await act(async () => { await Promise.resolve(); });
    let deliveries = 0;
    await act(async () => {
      for (const observer of observers) {
        if (observer.disconnected) continue;
        const changed = observer.observations.filter(observation => {
          const size = `${observation.element.clientWidth}:${boxHeight(observation.element as HTMLElement)}`;
          if (size === observation.size) return false;
          observation.size = size; return true;
        });
        if (changed.length) { deliveries++; observer.callback(changed.map(item => ({ target: item.element })) as ResizeObserverEntry[], {} as ResizeObserver); }
      }
    });
    const work = [...frames.values()]; frames.clear();
    await act(async () => { work.forEach(callback => callback(turn * 16)); await Promise.resolve(); });
    trace.push(fingerprint());
    idle = !deliveries && !work.length && !frames.size ? idle + 1 : 0;
    if (idle >= 3) return trace;
  }
  throw new Error(`SCENE_FIT_DID_NOT_SETTLE:\n${trace.join("\n")}`);
}
async function mount(kind: SelectionKind = "pieces") {
  const props = {
    activityKey: "p8.accept:selection", intro: null,
    artwork: createElement("aside", { className: "scene-column" }, createElement("figure", { className: "scene-art has-balloon" })),
    actions: createElement("button", { type: "button" }, "Enviar"),
    children: createElement(AutoFit, { className: "activity-body" }, createElement(Board, { kind })),
  };
  await act(async () => root.render(createElement(SceneFrame, props)));
}

describe("coupled scene fitting settles after selection (synthetic layout, no browser visual claims)", () => {
  it.each(["pieces", "choices"] as const)("reserves wrapper padding and stabilizes %s without a density cascade after selection", async kind => {
    await mount(kind); await settle();
    expect(area().dataset.fitDensity).toBe("comfortable");
    expect(area().style.getPropertyValue("--fit-scale")).toBe("1");
    expect(scene().style.getPropertyValue("--scene-panel-space")).toBe("332px");
    expect(scene().style.getPropertyValue("--scene-art-height")).toBe("158px");
    const selector = kind === "pieces" ? ".choose-piece" : ".choose-option";
    const bank = container.querySelector<HTMLButtonElement>(selector)!, input = container.querySelector("input");
    await act(async () => bank.click()); const placed = await settle();
    expect(selected()).toBe(true);
    expect(area().dataset.fitDensity, fingerprint()).toBe("comfortable");
    expect(scene().style.getPropertyValue("--scene-panel-space")).toBe("336px");
    expect(scene().style.getPropertyValue("--scene-art-height")).toBe("154px");
    expect(new Set(placed.slice(-3)).size).toBe(1);
    await act(async () => (kind === "pieces" ? container.querySelector<HTMLButtonElement>(".selected-piece")! : bank).click()); await settle();
    expect(scene().style.getPropertyValue("--scene-panel-space")).toBe("332px");
    expect(container.querySelector(selector)).toBe(bank); expect(container.querySelector("input")).toBe(input);
    expect(input!.value).toBe("Rascunho preservado"); expect(fetch).not.toHaveBeenCalled();
  });

  it("ignores a fractional painted transform and recovers comfortable density after the viewport grows again", async () => {
    await mount(); await settle();
    const natural = fingerprint(); transform = 1.001;
    window.dispatchEvent(new Event("resize")); await settle();
    expect(fingerprint()).toBe(natural);
    gridHeight = 350; viewport.height = 600; viewport.dispatchEvent(new Event("resize")); await settle();
    expect(area().dataset.fitDensity).toBe("tight");
    const scale = Number(area().style.getPropertyValue("--fit-scale"));
    expect(16 * scale).toBeGreaterThanOrEqual(14); expect(52 * scale).toBeGreaterThanOrEqual(44);
    gridHeight = 500; viewport.height = 844; viewport.dispatchEvent(new Event("resize")); const grown = await settle();
    expect(area().dataset.fitDensity).toBe("comfortable"); expect(area().style.getPropertyValue("--fit-scale")).toBe("1");
    expect(scene().style.getPropertyValue("--scene-panel-space")).toBe("332px");
    expect(new Set(grown.slice(-3)).size).toBe(1); expect(frames.size).toBe(0);
  });
});
