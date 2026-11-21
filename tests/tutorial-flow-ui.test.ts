// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/dynamic", async () => {
  const { useEffect } = await import("react");
  return { default: () => function Character({ onReady }: { onReady?: () => void }) {
    useEffect(() => { onReady?.(); }, [onReady]);
    return createElement("span", { "data-character-dummy": true });
  } };
});
// These suites exercise lesson interactions with isolated browser storage.
// Account ownership and synchronization are covered by lesson-account-storage.test.ts.
vi.mock("../src/features/first-encounters/useLessonAccountProgress", () => ({
  useLessonAccountProgress: () => ({ ready: true, storage: window.localStorage, scopeKey: "isolated-lesson", saving: false, error: "", notice: "", refresh: () => {}, reset: async () => {} }),
}));

import { getTutorialAudioClip } from "../src/features/first-encounters/tutorial-audio";
import { LessonOne } from "../src/features/first-encounters/LessonOne";
import { LESSON_TUTORIAL_STORAGE } from "../src/features/first-encounters/LessonTutorial";

class Media extends EventTarget {
  static calls: string[] = [];
  static instances: Media[] = [];
  static current: Media;
  src: string; currentTime = 0; duration = 3; paused = true; ended = false; preload = "";
  constructor(url: string) { super(); this.src = url; Media.instances.push(this); }
  play = vi.fn(async () => {
    Media.calls.push(this.src); Media.current = this; this.paused = false; this.ended = false;
    this.dispatchEvent(new Event("playing"));
  });
  pause = vi.fn(() => { this.paused = true; this.dispatchEvent(new Event("pause")); });
  load = vi.fn();
  end() { this.currentTime = this.duration; this.ended = true; this.paused = true; this.dispatchEvent(new Event("pause")); this.dispatchEvent(new Event("ended")); }
}
let root: Root, container: HTMLDivElement, frames: Map<number, FrameRequestCallback>, serial: number;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); vi.stubGlobal("Audio", Media);
  Media.calls = []; Media.instances = []; frames = new Map(); serial = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++serial, callback); return serial; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
  localStorage.clear(); localStorage.setItem("basedspeak.lesson-one.introduction.v1","done");localStorage.setItem("basedspeak.lesson-one.mechanics.v1",JSON.stringify({version:1,seen:["bubbles","join","speaker","verb","build","messages","ensemble","write"]}));
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
async function settle() {
  for (let pass = 0; pass < 3; pass++) await act(async () => { const callbacks = [...frames.values()]; frames.clear(); for (const callback of callbacks) callback(performance.now()); });
}
const dialog = () => container.querySelector<HTMLDialogElement>(".lo-tutorial")!;
const episode = () => dialog().dataset.tutorialEpisode;
const next = () => dialog().querySelector<HTMLButtonElement>(".lo-tutorial-footer .lo-next")!;
const listen = () => dialog().querySelector<HTMLButtonElement>('[data-tutorial-cue="listen"]')!;
const button = (label: string) => {
  const found = [...dialog().querySelectorAll<HTMLButtonElement>("button")].find(element => element.textContent?.trim() === label || element.getAttribute("aria-label") === label);
  expect(found, label).toBeTruthy(); return found!;
};
const source = (id: string) => dialog().querySelector<HTMLButtonElement>(`[data-lesson-drag-source="${id}"]`)!;
const target = (id: string) => dialog().querySelector<HTMLElement>(`[data-lesson-drop="${id}"]`)!;
async function click(element: HTMLElement) { expect(element).toBeTruthy(); await act(async () => element.click()); await settle(); }
async function pointer(element: EventTarget, type = "pointerdown") {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: 25, clientY: 35 });
  Object.defineProperties(event, { pointerId: { value: 7 }, isPrimary: { value: true }, pointerType: { value: "mouse" } });
  await act(async () => element.dispatchEvent(event)); await settle();
}
async function learnerClick(element: HTMLElement) { await pointer(element); await pointer(element, "pointerup"); await click(element); }
async function ended(media = Media.current) { await act(async () => media.end()); await settle(); }
async function mount() { await act(async () => root.render(createElement(LessonOne))); await settle(); }
async function toDrag() {
  await mount(); await click(button("Começar com som")); await click(listen()); await ended(); await click(next());
  expect(episode()).toBe("repeat"); await click(listen()); await ended(); await click(next()); expect(episode()).toBe("drag");
}
async function placePhrase() { await learnerClick(source("tutorial:phrase")); await learnerClick(target("person:ana")); }
async function placeWords() {
  await learnerClick(source("tutorial:word:I")); await learnerClick(target("tutorial:word:pronoun"));
  await learnerClick(source("tutorial:word:am")); await learnerClick(target("tutorial:word:verb"));
}
async function type(text: string) {
  const input = dialog().querySelector<HTMLInputElement>('[aria-label="Sua fala em inglês"]')!;
  await pointer(input); await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, text);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }); await settle(); return input;
}

describe("six useful tutorial scenes", () => {
  it("starts silently and repeats English in place three times without trapping navigation", async () => {
    await mount(); expect(episode()).toBe("welcome"); expect(Media.calls).toEqual([]);
    await click(button("Começar com som")); expect(Media.calls.at(-1)).toContain("nina-welcome");
    await ended(); expect(episode()).toBe("welcome"); const before = Media.calls.length;
    await click(listen()); expect(episode()).toBe("welcome"); expect(Media.calls).toHaveLength(before + 1);
    await click(next()); expect(episode()).toBe("repeat");
    for (let repeat = 0; repeat < 3; repeat++) {
      const count = Media.calls.length; await click(listen());
      expect(episode()).toBe("repeat"); expect(Media.calls).toHaveLength(count + 1); expect(Media.calls.at(-1)).toContain("ana-i-am-ana");
      expect(dialog().querySelector("[data-caption-key]")!.getAttribute("data-caption-key")).toBe("ana:I am Ana.");
      await ended(); expect(episode()).toBe("repeat"); expect(Media.calls).toHaveLength(count + 1);
    }
    await click(button("Repetir fala")); expect(Media.calls.at(-1)).toContain("ana-i-am-ana"); expect(episode()).toBe("repeat");
    await click(next()); expect(episode()).toBe("drag");
    await click(button("Voltar")); expect(episode()).toBe("repeat"); expect(Media.calls.at(-1)).toContain("nina-repeat");
  });

  it("restores the guide in place while keeping the completed repeat action", async () => {
    await mount(); await click(button("Começar com som")); await click(listen()); await click(next()); await click(listen());
    const before = Media.calls.length; await click(button("Ouvir orientação"));
    expect(Media.calls).toHaveLength(before + 1); expect(Media.calls.at(-1)).toContain("nina-repeat"); expect(episode()).toBe("repeat");
    expect(dialog().querySelector("[data-caption-key]")!.getAttribute("data-caption-key")).not.toBe("ana:I am Ana.");
    await click(next()); expect(episode()).toBe("drag");
  });

  it("restarts the visible English caption when the same utterance is repeated in place", async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    await mount(); await click(button("Começar com som")); await click(listen()); await ended(); await click(next()); await click(listen());
    Media.current.currentTime = .55; await settle();
    const prefix = dialog().querySelector(".lo-tutorial-typed")!.textContent!; expect(prefix.length).toBeGreaterThan(0);
    await ended(); expect(dialog().querySelector(".lo-tutorial-typed")!.textContent).toBe("I am Ana.");
    const before = Media.calls.length; await click(listen());
    expect(Media.calls).toHaveLength(before + 1); expect(episode()).toBe("repeat"); expect(Media.current.currentTime).toBe(0);
    expect(dialog().querySelector(".lo-tutorial-typed")!.textContent!.length).toBeLessThan(prefix.length);
  });

  it("pauses a partial caption and repeats the same clip from its beginning", async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    await mount(); await click(button("Começar com som")); Media.current.currentTime = .7; await settle();
    const caption = dialog().querySelector(".lo-tutorial-typed")!, prefix = caption.textContent;
    expect(prefix!.length).toBeGreaterThan(0); await click(button("Pausar explicação")); await settle(); expect(caption.textContent).toBe(prefix);
    await click(button("Repetir fala")); expect(Media.calls).toHaveLength(2); expect(Media.calls[0]).toBe(Media.calls[1]); expect(Media.instances).toHaveLength(1);
    expect(dialog().querySelector(".lo-tutorial-typed")!.textContent!.length).toBeLessThan(prefix!.length);
  });

  it.each(["playing", "ended"])("allows practice while the drag guide is %s and keeps all later activities independent", async phase => {
    await toDrag(); const guide = Media.current, before = Media.calls.length; if (phase === "ended") await ended();
    expect(source("tutorial:phrase").disabled).toBe(false); await learnerClick(source("tutorial:phrase")); expect(guide.paused).toBe(true);
    await learnerClick(target("person:leo")); expect(dialog().dataset.tutorialPlaced).toBe("false"); expect(episode()).toBe("drag");
    if (source("tutorial:phrase").getAttribute("aria-pressed") !== "true") await learnerClick(source("tutorial:phrase"));
    expect(Media.calls.at(-1)).toBe(getTutorialAudioClip("ana", "I am Ana."));
    const selectedCount = Media.calls.length; expect(selectedCount).toBeGreaterThan(before);
    await learnerClick(target("person:ana")); expect(dialog().dataset.tutorialPlaced).toBe("true"); expect(episode()).toBe("drag"); expect(Media.calls).toHaveLength(selectedCount);
    await ended(guide); expect(episode()).toBe("drag"); expect(Media.calls).toHaveLength(selectedCount);
    await learnerClick(button("I am Ana.")); expect(Media.calls.at(-1)).toBe(getTutorialAudioClip("ana", "I am Ana."));
    await click(next()); expect(episode()).toBe("word-pieces"); expect(next().disabled).toBe(true);
    await click(button("Voltar")); expect(episode()).toBe("drag"); expect(dialog().dataset.tutorialPlaced).toBe("true");
    const count = Media.calls.length; await click(button("Refazer treino")); expect(dialog().dataset.tutorialPlaced).toBe("false"); expect(Media.calls).toHaveLength(count);
  });

  it("lets keyboard selection interrupt a demonstration and complete its own scene", async () => {
    await toDrag(); const guide = Media.current, before = Media.calls.length, phrase = source("tutorial:phrase");
    await act(async () => phrase.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })));
    expect(guide.paused).toBe(true); await click(phrase);
    const ana = target("person:ana").querySelector<HTMLButtonElement>("button")!;
    await act(async () => ana.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }))); await click(ana);
    expect(episode()).toBe("drag"); expect(dialog().dataset.tutorialPlaced).toBe("true"); expect(Media.calls.slice(before)).toEqual([getTutorialAudioClip("ana", "I am Ana.")]);
  });

  it("composes, resets and writes with explicit checking, then preserves states without solving the lesson", async () => {
    await toDrag(); await placePhrase(); await click(next()); expect(episode()).toBe("word-pieces"); expect(next().disabled).toBe(true);
    const wordsGuide = Media.current, beforeWords = Media.calls.length;
    await learnerClick(source("tutorial:word:I")); await learnerClick(target("tutorial:word:pronoun")); expect(wordsGuide.paused).toBe(true); expect(next().disabled).toBe(true);
    await learnerClick(source("tutorial:word:am")); await learnerClick(target("tutorial:word:verb")); expect(next().disabled).toBe(false); expect(Media.calls.slice(beforeWords)).toEqual([getTutorialAudioClip("nina", "I"), getTutorialAudioClip("nina", "am")]);
    await learnerClick(source("tutorial:word:I")); expect(source("tutorial:word:I").getAttribute("aria-pressed")).toBe("true");
    await click(button("Refazer montagem")); expect(next().disabled).toBe(true); expect(Media.calls.slice(beforeWords)).toEqual([getTutorialAudioClip("nina", "I"), getTutorialAudioClip("nina", "am"), getTutorialAudioClip("nina", "I")]);
    expect(source("tutorial:word:I").getAttribute("aria-pressed")).toBe("false"); expect(dialog().querySelector('[data-drop-available="true"]')).toBeNull(); await placeWords();
    await click(next()); expect(episode()).toBe("write-check"); expect(next().disabled).toBe(true);
    const writingGuide = Media.current; await learnerClick(dialog().querySelector(".tsp-model button")!);
    expect(Media.calls.at(-1)).toBe(getTutorialAudioClip("ana", "I am Ana."));
    const beforeWriting = Media.calls.length; const input = await type("I am Ana."); expect(writingGuide.paused).toBe(true);
    await click(button("Apagar o que escrevi")); expect(input.value).toBe(""); expect(next().disabled).toBe(true);
    await type("You are Ana."); await click(button("Conferir escrita")); expect(next().disabled).toBe(true);
    await type("im ana"); await click(button("Conferir escrita")); expect(next().disabled).toBe(false); expect(Media.calls).toHaveLength(beforeWriting);
    await click(button("Voltar")); expect(episode()).toBe("word-pieces"); expect(next().disabled).toBe(false);
    await click(next()); expect(episode()).toBe("write-check"); expect(dialog().querySelector<HTMLInputElement>('[aria-label="Sua fala em inglês"]')!.value).toBe("im ana"); expect(next().disabled).toBe(false);
    await click(next()); expect(episode()).toBe("success"); const finalCount = Media.calls.length; await ended(); expect(episode()).toBe("success"); expect(Media.calls).toHaveLength(finalCount);
    await click(next()); expect(container.querySelector(".lo-tutorial")).toBeNull();
    expect(container.querySelector<HTMLElement>(".lo-app")!.dataset.round).toBe("g1-self"); expect(container.querySelector(".lo-feedback.is-correct")).toBeNull();
    expect(container.querySelector<HTMLButtonElement>(".lo-footer .lo-next")!.disabled).toBe(true); expect(localStorage.getItem(LESSON_TUTORIAL_STORAGE)).toBe("done");
  });

  it("keeps text delivered by an input event while narration is active, without requiring pointer or key events first", async () => {
    await toDrag(); await placePhrase(); await click(next()); await placeWords(); await click(next());
    expect(episode()).toBe("write-check"); const guide = Media.current, before = Media.calls.length;
    expect(guide.paused).toBe(false); const input = dialog().querySelector<HTMLInputElement>('[aria-label="Sua fala em inglês"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "I am Ana.");
      input.dispatchEvent(new InputEvent("input", { bubbles: true, data: "I am Ana.", inputType: "insertText" }));
    }); await settle();
    expect(input.value).toBe("I am Ana."); expect(guide.paused).toBe(true); expect(button("Apagar o que escrevi").disabled).toBe(false);
    expect(next().disabled).toBe(true); await click(button("Conferir escrita")); expect(next().disabled).toBe(false); expect(Media.calls).toHaveLength(before);
  });

  it("can skip and reopen the tutorial without changing the real round", async () => {
    await mount(); await click(button("Pular tutorial")); expect(Media.calls).toEqual([]);
    const reopen = container.querySelector<HTMLButtonElement>('[aria-label="Como funciona a aula"]')!;
    await click(reopen); expect(episode()).toBe("welcome"); await click(button("Fechar tutorial"));
    expect(container.querySelector<HTMLElement>(".lo-app")!.dataset.round).toBe("g1-self"); expect(container.querySelector<HTMLButtonElement>(".lo-footer .lo-next")!.disabled).toBe(true);
  });
});
