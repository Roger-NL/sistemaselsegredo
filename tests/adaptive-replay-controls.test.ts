// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DemoAudioContext, type DemoAudio } from "@/features/demo/audio/use-demo-audio";
import { ConversationHistory } from "@/features/demo/components/ConversationHistory";
import { ConversationReplay } from "@/features/demo/components/ConversationReplay";
import { createDemo } from "@/features/demo/model/reducer";

let root: Root;
let container: HTMLElement;
let audio: DemoAudio;
let viewport: EventTarget & { width: number; height: number };
const nativeShow = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal");
const nativeClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close");
const recorded = () => ({ ...createDemo("less", "adaptive-review", 0), transcript: [
  { id: "question", nodeId: "p1.lucas", part: 1, role: "character" as const, audioId: "C01" as const },
  { id: "answer", nodeId: "p2.send", part: 2, role: "you" as const, audioId: "U01" as const, written: "No, it isn't mine." },
] });
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  viewport = Object.assign(new EventTarget(), { width: 390, height: 844 });
  vi.stubGlobal("visualViewport", viewport);
  window.matchMedia = vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })) as unknown as typeof window.matchMedia;
  audio = { playback: { source: null, status: "idle", progress: 0 }, replay: vi.fn(async () => {}),
    pause: vi.fn(), resume: vi.fn(async () => {}), stop: vi.fn(), release: vi.fn(), setPlaybackRate: vi.fn() };
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable:true, value:function (this:HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable:true, value:function (this:HTMLDialogElement) { this.open = false; } });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root?.unmount()); container?.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals();
  for (const [name, descriptor] of [["showModal", nativeShow], ["close", nativeClose]] as const) {
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else delete (HTMLDialogElement.prototype as unknown as Record<string,unknown>)[name];
  }
});
function button(text: string) {
  const found = [...container.querySelectorAll<HTMLButtonElement>("button")].find(element => element.textContent?.includes(text));
  expect(found).toBeDefined(); return found!;
}
async function resize() {
  for (const height of [390, 568, 844]) await act(async () => { viewport.height = height; viewport.dispatchEvent(new Event("resize")); window.dispatchEvent(new Event("resize")); });
}

describe("recorded conversation controls with adaptive reading", () => {
  it("keeps review position, literal answers and model audio through viewport changes", async () => {
    const state = recorded(); const original = JSON.stringify(state); const close = vi.fn();
    await act(async () => root.render(createElement(DemoAudioContext.Provider, { value: audio }, createElement(ConversationReplay, { state, onClose: close }))));
    const next = button("Próxima fala");
    expect(next.closest(".auto-fit")).toBeNull();
    expect(button("Sair da revisão").closest(".auto-fit")).toBeNull();
    await act(async () => next.click());
    expect(container.querySelector("h1")?.textContent).toBe("No, it isn't mine.");
    await resize();
    expect(container.querySelector("h1")?.textContent).toBe("No, it isn't mine.");
    expect(audio.replay).not.toHaveBeenCalled(); expect(close).not.toHaveBeenCalled();
    await act(async () => button("Ouvir modelo").click());
    expect(audio.replay).toHaveBeenCalledWith("U01", expect.any(String));
    expect(JSON.stringify(state)).toBe(original);
  });

  it("keeps history Close and pager outside the fitted speech, without changing progress", async () => {
    const state = recorded(); const original = JSON.stringify(state);
    await act(async () => root.render(createElement(DemoAudioContext.Provider, { value: audio }, createElement(ConversationHistory, { state, lines: state.transcript }))));
    await act(async () => button("Conversa até aqui").click());
    expect(container.querySelector("dialog")?.open).toBe(true);
    expect(button("Anterior").closest(".auto-fit")).toBeNull();
    expect(button("Fechar").closest(".auto-fit")).toBeNull();
    expect(container.querySelector(".history-line p[lang=en]")?.textContent).toBe("No, it isn't mine.");
    await act(async () => button("Anterior").click());
    await act(async () => button("Ver significado").click());
    const text = container.querySelector(".history-line")?.textContent;
    await resize();
    expect(container.querySelector(".history-line")?.textContent).toBe(text);
    expect(audio.replay).not.toHaveBeenCalled(); expect(JSON.stringify(state)).toBe(original);
    await act(async () => button("Fechar").click());
    expect(container.querySelector("dialog")?.open).toBe(false);
  });
});
