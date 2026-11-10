// @vitest-environment jsdom
import { act, createElement, type FormEvent } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { audio } from "@/features/demo/content/media";
import { catalog } from "@/features/demo/content/catalog";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { sceneReadingGroup } from "@/features/demo/model/scene-conversation";
import { practice } from "@/features/demo/model/practice";
import { decodeSnapshot, encodeSnapshot } from "@/features/demo/session/storage";
import { PROFILES, type DemoState, type SupportProfile } from "@/features/demo/model/types";

const mocks = vi.hoisted(() => ({ remember: vi.fn() }));
vi.mock("@/features/demo/session/browser", () => ({ remember: mocks.remember }));
import { DemoExperience } from "@/features/demo/DemoExperience";
import { SceneFrame } from "@/features/demo/components/SceneFrame";

let root: Root, container: HTMLDivElement;
let rootDisposed = false;
const request = vi.fn(), constructAudio = vi.fn();
beforeEach(() => {
  vi.clearAllMocks(); mocks.remember.mockReturnValue(true);
  rootDisposed = false;
  localStorage.clear();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  vi.stubGlobal("fetch", request);
  vi.stubGlobal("Audio", constructAudio);
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function(this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function(this: HTMLDialogElement) { this.open = false; } });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { if (!rootDisposed) await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

/** Reach real persisted states rather than manufacturing the history being tested. */
function reach(profile: SupportProfile, nodeId: string, activity = false) {
  let state = createDemo(profile, "scene-composition", 0);
  for (let step = 0; step < 300; step++) {
    if (state.nodeId === nodeId && (!activity || (!sceneReadingGroup(state) && state.phase !== "present"))) {
      expect(decodeSnapshot(encodeSnapshot(state))).toEqual(state);
      return state;
    }
    const node = catalog[state.nodeId];
    if (sceneReadingGroup(state) || node.kind === "scene" || state.phase === "present") state = transition(state, { at: node.id, type: "CONTINUE_SCENE" });
    else if (node.kind === "choice") state = transition(state, { at: node.id, type: "CHOOSE", choice: node.choices[0].id });
    else if (node.kind === "comprehension") state = transition(state, { at: node.id, type: "ANSWER_MEANING", correct: true });
    else if (node.kind === "response") {
      if (state.phase === "recall") state = transition(state, { at: node.id, type: "CHECK" });
      if (state.phase === "build") for (const block of practice(node, state.activityProfile).answer) state = transition(state, { at: node.id, type: "PLACE_BLOCK", block });
      if (state.phase === "write") state = transition(state, { at: node.id, type: "TYPE", text: audio[node.response].text });
      if (state.phase === "select") state = transition(state, { at: node.id, type: "RECOGNIZE", response: node.response });
      state = transition(state, { at: node.id, type: "SEND_RESPONSE" });
    } else throw new Error("SCENE_COMPOSITION_TARGET_NOT_REACHED");
  }
  throw new Error("SCENE_COMPOSITION_TARGET_NOT_REACHED");
}
async function mount(state: DemoState) { await act(async () => root.render(createElement(DemoExperience, { initial: state, generation: 1 }))); }
function saved(): DemoState { return mocks.remember.mock.calls.at(-1)![0] as DemoState; }
async function click(button: HTMLButtonElement) { expect(button).toBeDefined(); await act(async () => button.click()); }
function assertNoVoiceRequest() { expect(request).not.toHaveBeenCalled(); expect(constructAudio).not.toHaveBeenCalled(); }

describe("one coherent scene and activity composition", () => {
  for (const profile of PROFILES) it(`keeps the part-three question, illustration and actions together in ${profile}`, async () => {
    const initial = reach(profile, "p3.intent");
    await mount(initial);
    const frame = container.querySelector(".scene-frame")!;
    expect(frame.classList.contains("scene-composition")).toBe(true);
    const prompt = [...frame.querySelectorAll<HTMLHeadingElement>("h1")].find(heading => !heading.classList.contains("audio-sr-only"));
    expect(prompt?.textContent).toBe("O que você quer fazer?");
    expect(prompt?.closest(".activity-content")).not.toBeNull();
    expect(frame.querySelector(".scene-art img")).not.toBeNull();
    const actions = frame.querySelector(".activity-actions")!;
    expect([...actions.querySelectorAll("button")].map(button => button.textContent)).toEqual([
      "Perguntar o que ele pediu", "Dizer que está tudo bem",
    ]);
    expect(actions.closest(".scene-frame")).toBe(frame);
    expect(prompt?.closest(".scene-frame")).toBe(frame);
    expect(saved()).toEqual(initial);
    assertNoVoiceRequest();
  });

  for (const profile of PROFILES) it(`keeps history an explicit dialog without changing the current ${profile} activity`, async () => {
    const initial = reach(profile, "p3.intent");
    await mount(initial);
    const dialog = container.querySelector<HTMLDialogElement>(".history-dialog")!;
    expect(dialog.open).toBe(false);
    expect(container.querySelectorAll(".history-line")).toHaveLength(1);
    expect(container.querySelector(".history-line")?.closest("dialog")).toBe(dialog);
    await click(container.querySelector<HTMLButtonElement>(".conversation-history > button")!);
    expect(dialog.open).toBe(true);
    const latest = dialog.querySelector(".history-line p[lang=en]")!.textContent;
    const previous = dialog.querySelector<HTMLButtonElement>(".pager button")!;
    expect(previous.disabled).toBe(false);
    await click(previous);
    expect(dialog.querySelector(".history-line p[lang=en]")!.textContent).not.toBe(latest);
    expect(dialog.querySelectorAll(".history-line")).toHaveLength(1);
    await click(dialog.querySelector<HTMLButtonElement>('[aria-label="Fechar conversa"]')!);
    expect(dialog.open).toBe(false);
    expect(saved()).toEqual(initial);
    expect(mocks.remember).toHaveBeenCalledOnce();
    expect(container.querySelectorAll(".activity-actions .choices > button")).toHaveLength(2);
    assertNoVoiceRequest();
  });

  for (const profile of PROFILES) for (const choice of ["ask", "okay"] as const) it(`keeps the ${choice} choice handler and journal in ${profile}`, async () => {
    const initial = reach(profile, "p3.intent");
    const node = catalog[initial.nodeId];
    if (node.kind !== "choice") throw new Error("CHOICE_EXPECTED");
    const selected = node.choices.find(item => item.id === choice)!;
    await mount(initial);
    await click([...container.querySelectorAll<HTMLButtonElement>(".activity-actions .choices button")].find(button => button.textContent === selected.label)!);
    const after = saved();
    expect(after.nodeId).toBe(selected.next);
    expect(after.journal.slice(initial.journal.length)).toEqual([{ at: "p3.intent", type: "CHOOSE", choice }]);
    expect(after.decisions["p3.intent"]).toBe(choice);
    expect(after.evidence).toEqual(initial.evidence);
    expect(after.transcript.filter(line => line.role === "you")).toEqual(initial.transcript.filter(line => line.role === "you"));
    expect(decodeSnapshot(encodeSnapshot(after))).toEqual(after);
    assertNoVoiceRequest();
  });

  it("retains native external form submission without sending or playing before the explicit submit", async () => {
    const initial = reach("less", "p3.ask", true);
    expect(initial.phase).toBe("write");
    await mount(initial);
    const frame = container.querySelector(".scene-frame")!;
    const form = frame.querySelector<HTMLFormElement>("#written-response-form")!;
    const send = frame.querySelector<HTMLButtonElement>('button[type="submit"][form="written-response-form"]')!;
    expect(send.form).toBe(form);
    expect(form.contains(send)).toBe(false);
    expect(send.disabled).toBe(true);
    expect(saved()).toEqual(initial);
    const input = form.querySelector<HTMLInputElement>("#written-answer")!;
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    await act(async () => { setValue.call(input, audio.U02.text); input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); });
    expect(send.disabled).toBe(false);
    expect(saved().nodeId).toBe("p3.ask");
    expect(saved().evidence).toEqual(initial.evidence);
    assertNoVoiceRequest();
    await click(send);
    const after = saved();
    expect(after.nodeId).toBe("p4.order");
    expect(after.evidence).toHaveLength(initial.evidence.length + 1);
    expect(after.transcript.filter(line => line.nodeId === "p3.ask" && line.role === "you")).toHaveLength(1);
    expect(after.journal.at(-1)).toEqual({ at: "p3.ask", type: "SEND_RESPONSE" });
    expect(frame.querySelector(".scene-art img")).not.toBeNull();
    assertNoVoiceRequest();
  });
});

/** Deliberately synthetic boxes: these exercise measurement arithmetic and
 * cleanup in jsdom, without claiming to render or measure browser layout. */
async function measuredFrame(unified: boolean) {
  const pending = new Map<number, FrameRequestCallback>();
  let serial = 0;
  const frameRequest = vi.fn((callback: FrameRequestCallback) => { const id = ++serial; pending.set(id, callback); return id; });
  const frameCancel = vi.fn((id: number) => { pending.delete(id); });
  vi.stubGlobal("requestAnimationFrame", frameRequest);
  vi.stubGlobal("cancelAnimationFrame", frameCancel);
  const viewport = Object.assign(new EventTarget(), { width: unified ? 1440 : 390, height: 900 });
  vi.stubGlobal("visualViewport", viewport);
  const observers: { notify: () => void; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];
  vi.stubGlobal("ResizeObserver", class {
    observe = vi.fn();
    disconnect = vi.fn();
    notify: () => void;
    constructor(callback: ResizeObserverCallback) {
      this.notify = () => callback([], this as unknown as ResizeObserver);
      observers.push(this);
    }
  });
  const metrics = { rootHeight: 600, actionsHeight: 160 };
  vi.stubGlobal("getComputedStyle", vi.fn((element: Element) => ({
    display: element.classList.contains("scene-grid") && unified ? "contents" : "grid",
    gridTemplateColumns: unified ? "500px 500px" : "390px",
    paddingTop: element.classList.contains("conversation-panel") ? "0px" : unified ? "12px" : "4px",
    paddingBottom: element.classList.contains("conversation-panel") ? "0px" : unified ? "12px" : "4px",
    rowGap: unified ? "0px" : "8px",
  }) as unknown as CSSStyleDeclaration));
  const submit = vi.fn();
  const props = {
    activityKey: "synthetic-scene-metrics", intro: null,
    artwork: createElement("aside", { className: "scene-column" }, "Illustration"),
    actions: createElement("button", { type: "submit", form: "composition-metric-form" }, "Enviar"),
    children: createElement("div", { className: "activity-content" },
      createElement("form", { id: "composition-metric-form", onSubmit: (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); submit(); } },
        createElement("input", { name: "response", defaultValue: "Draft remains here" }))),
  };
  await act(async () => root.render(createElement(SceneFrame, props)));
  const frame = container.querySelector<HTMLElement>(".scene-frame")!;
  const scene = container.querySelector<HTMLElement>(".scene-grid")!;
  const actions = container.querySelector<HTMLElement>(".activity-actions")!;
  const reading = container.querySelector<HTMLElement>(".activity-content")!;
  const box = (element: HTMLElement, height: () => number, width: number) => {
    Object.defineProperties(element, {
      clientHeight: { configurable: true, get: height },
      scrollHeight: { configurable: true, get: height },
      clientWidth: { configurable: true, value: width },
    });
    vi.spyOn(element, "getBoundingClientRect").mockImplementation(() => ({
      x: 0, y: 0, top: 0, left: 0, bottom: height(), right: width, height: height(), width, toJSON: () => ({}),
    }));
  };
  box(frame, () => metrics.rootHeight, unified ? 1100 : 390);
  box(scene, () => unified ? 0 : 480, unified ? 0 : 390);
  box(actions, () => metrics.actionsHeight, unified ? 500 : 390);
  box(reading, () => unified ? 210 : 200, unified ? 500 : 390);
  const flushFrames = async () => {
    let count = 0;
    await act(async () => {
      while (pending.size) {
        if (++count > 12) throw new Error("UNBOUNDED_SCENE_MEASUREMENT");
        const [id, callback] = pending.entries().next().value!;
        pending.delete(id); callback(count * 16);
      }
    });
    return count;
  };
  return { frame, scene, actions, metrics, viewport, pending, observers, frameCancel, flushFrames, submit };
}

describe("synthetic SceneFrame measurements", () => {
  it("uses the outer box for display:contents, reserves changing controls and cleans observers and queued frames", async () => {
    const measured = await measuredFrame(true);
    expect(measured.scene.clientHeight).toBe(0);
    expect(measured.scene.clientWidth).toBe(0);
    await measured.flushFrames();
    expect(measured.scene.style.getPropertyValue("--scene-panel-space")).toBe("416px");
    expect(measured.observers).toHaveLength(1);
    const observer = measured.observers[0];
    expect(observer.observe).toHaveBeenCalledTimes(5);
    expect(observer.observe).toHaveBeenCalledWith(measured.actions);
    measured.metrics.actionsHeight = 220;
    observer.notify(); await measured.flushFrames();
    expect(measured.scene.style.getPropertyValue("--scene-panel-space")).toBe("356px");
    observer.notify();
    const queued = [...measured.pending.keys()];
    expect(queued).toHaveLength(1);
    await act(async () => root.unmount()); rootDisposed = true;
    expect(observer.disconnect).toHaveBeenCalledOnce();
    expect(measured.frameCancel).toHaveBeenCalledWith(queued[0]);
    expect(measured.pending.size).toBe(0);
    window.dispatchEvent(new Event("resize")); measured.viewport.dispatchEvent(new Event("resize"));
    expect(measured.pending.size).toBe(0);
  });

  it("uses the stacked grid without subtracting its already external controls a second time", async () => {
    const measured = await measuredFrame(false);
    await measured.flushFrames();
    expect(measured.scene.style.getPropertyValue("--scene-art-height")).toBe("260px");
    expect(measured.scene.style.getPropertyValue("--scene-panel-space")).toBe("204px");
    measured.metrics.actionsHeight = 220;
    measured.observers[0].notify(); await measured.flushFrames();
    expect(measured.scene.style.getPropertyValue("--scene-panel-space")).toBe("204px");
  });

  it("coalesces viewport changes, recomputes from the capped frame and preserves the draft and native submit control", async () => {
    const measured = await measuredFrame(true);
    await measured.flushFrames();
    const input = measured.frame.querySelector<HTMLInputElement>("input")!;
    const button = measured.frame.querySelector<HTMLButtonElement>(".activity-actions button")!;
    measured.metrics.rootHeight = 360; measured.viewport.height = 420;
    for (let count = 0; count < 5; count++) {
      window.dispatchEvent(new Event("resize")); measured.viewport.dispatchEvent(new Event("resize"));
    }
    expect(measured.pending.size).toBe(1);
    expect(await measured.flushFrames()).toBeLessThanOrEqual(4);
    expect(measured.scene.style.getPropertyValue("--scene-panel-space")).toBe("176px");
    expect(measured.scene.dataset.density).toBe("tight");
    measured.metrics.rootHeight = 600; measured.viewport.height = 900;
    measured.viewport.dispatchEvent(new Event("resize")); await measured.flushFrames();
    expect(measured.scene.style.getPropertyValue("--scene-panel-space")).toBe("416px");
    expect(measured.scene.dataset.density).toBe("comfortable");
    expect(measured.frame.querySelector("input")).toBe(input);
    expect(input.value).toBe("Draft remains here");
    expect(measured.frame.querySelector(".activity-actions button")).toBe(button);
    expect(button.form).toBe(measured.frame.querySelector("form"));
    expect(measured.submit).not.toHaveBeenCalled(); assertNoVoiceRequest();
  });
});
