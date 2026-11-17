// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LESSON_SCENES, phraseText } from "../src/features/first-encounters/lesson-one";
import type { LessonSoundCue } from "../src/features/first-encounters/lesson-sounds";

const sfx = vi.hoisted(() => ({ play: vi.fn(), toggleMuted: vi.fn(), unlock: vi.fn(async () => true) }));
vi.mock("../src/features/first-encounters/useLessonSounds", () => ({ useLessonSounds: () => ({ ...sfx, muted: false }) }));
vi.mock("next/dynamic", async () => {
  const { useEffect } = await import("react");
  return { default: () => function Character({ onReady }: { onReady?: () => void }) {
    useEffect(() => { onReady?.(); }, [onReady]); return createElement("span", { "data-character-dummy": true });
  } };
});
// These suites exercise lesson interactions with isolated browser storage.
// Account ownership and synchronization are covered by lesson-account-storage.test.ts.
vi.mock("../src/features/first-encounters/useLessonAccountProgress", () => ({
  useLessonAccountProgress: () => ({ ready: true, storage: window.localStorage, scopeKey: "isolated-lesson", saving: false, error: "", notice: "", refresh: () => {}, reset: async () => {} }),
}));

import { LessonOne } from "../src/features/first-encounters/LessonOne";

class Media extends EventTarget {
  static calls: string[] = []; static current: Media;
  src: string; currentTime = 0; duration = 2; paused = true; ended = false; preload = "";
  constructor(url: string) { super(); this.src = url; }
  play = vi.fn(async () => { Media.current = this; Media.calls.push(this.src); this.paused = false; this.ended = false; this.dispatchEvent(new Event("playing")); });
  pause = vi.fn(() => { this.paused = true; this.dispatchEvent(new Event("pause")); }); load = vi.fn();
  end() { this.currentTime = this.duration; this.ended = true; this.paused = true; this.dispatchEvent(new Event("pause")); this.dispatchEvent(new Event("ended")); }
}
let root: Root, container: HTMLDivElement, frames: Map<number, FrameRequestCallback>, serial: number;
const all = LESSON_SCENES.flatMap(scene => scene.rounds);
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); vi.stubGlobal("Audio", Media); Media.calls = []; sfx.play.mockClear(); sfx.toggleMuted.mockClear();
  frames = new Map(); serial = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++serial, callback); return serial; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
  localStorage.clear(); localStorage.setItem("basedspeak.lesson-one.introduction.v1","done"); localStorage.setItem("basedspeak.lesson-one.mechanics.v1", JSON.stringify({ version: 1, seen: ["bubbles", "join", "speaker", "verb", "build", "messages", "ensemble", "write"] }));
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
async function settle() { for (let pass = 0; pass < 3; pass++) await act(async () => { const callbacks = [...frames.values()]; frames.clear(); for (const callback of callbacks) callback(performance.now()); }); }
async function mount(id = "g1-self", tutorial = false) {
  const scene = LESSON_SCENES.findIndex(scene => scene.rounds.some(round => round.id === id)), round = LESSON_SCENES[scene].rounds.findIndex(round => round.id === id);
  localStorage.setItem("basedspeak.lesson-one.v2", JSON.stringify({ version: 2, scene, round, completed: all.slice(0, all.findIndex(round => round.id === id)).map(round => round.id), supported: [] }));
  if (!tutorial) localStorage.setItem("basedspeak.lesson-one.tutorial.v1", "done");
  await act(async () => root.render(createElement(LessonOne))); await settle();
}
const dialog = () => container.querySelector<HTMLDialogElement>(".lo-tutorial")!;
const next = (scope: ParentNode = container) => scope.querySelector<HTMLButtonElement>(scope === container ? ".lo-footer .lo-next" : ".lo-tutorial-footer .lo-next")!;
const cues = () => sfx.play.mock.calls.map(([cue]) => cue as LessonSoundCue);
const number = (cue: LessonSoundCue) => cues().filter(value => value === cue).length;
function button(label: string, scope: ParentNode = container) { const found = [...scope.querySelectorAll<HTMLButtonElement>("button")].find(element => element.getAttribute("aria-label") === label || element.textContent?.trim() === label); expect(found, label).toBeTruthy(); return found!; }
function source(label: string, scope: ParentNode = container) { const found = [...scope.querySelectorAll<HTMLButtonElement>("[data-lesson-drag-source]")].find(element => element.getAttribute("aria-label") === label); expect(found, label).toBeTruthy(); return found!; }
function target(id: string, scope: ParentNode = container) { const found = scope.querySelector<HTMLElement>(`[data-lesson-drop="${id}"]`); expect(found, id).toBeTruthy(); return found!; }
async function click(element: HTMLElement) { await act(async () => element.click()); await settle(); }
async function place(label: string, id: string, scope: ParentNode = container) { const item = source(label, scope); if (item.getAttribute("aria-pressed") !== "true") await click(item); await click(target(id, scope)); }
async function type(text: string, scope: ParentNode = container) {
  const input = scope.querySelector<HTMLInputElement>('[aria-label="Sua fala em inglês"]')!;
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, text); input.dispatchEvent(new InputEvent("input", { bubbles: true, data: text })); }); await settle(); return input;
}
async function ended(media = Media.current) { await act(async () => media.end()); await settle(); }

describe("semantic UI sound intentions", () => {
  it("accepts I am Anna with one success, preserves the spoken model, and advances once", async () => {
    await mount(); await click(button("Digitar")); sfx.play.mockClear();
    for (const text of ["I", "I am", "I am Anna."]) await type(text);
    expect(cues()).toEqual([]); await click(next()); expect(number("success")).toBe(1); expect(number("retry")).toBe(0);
    expect(container.querySelector(".lo-feedback.is-correct")).not.toBeNull(); expect(container.querySelector(".ls-speech-bubble strong")?.textContent).toBe("I am Ana.");
    expect(Media.calls.at(-1)).toContain("ana-i-am-ana"); sfx.play.mockClear(); await click(next());
    expect(number("advance")).toBe(1); expect(number("success")).toBe(0); expect(container.querySelector<HTMLElement>(".lo-app")!.dataset.round).toBe("g1-listener");
  });

  it("keeps message assignments neutral until Conferir, without interrupting the given speech", async () => {
    await mount("g5-messages"); const speech = Media.current, count = Media.calls.length; sfx.play.mockClear();
    await place("Ana", "message:0"); expect(number("place")).toBe(1); expect(number("success")).toBe(0);
    expect(speech.paused).toBe(false); expect(Media.calls).toHaveLength(count); await place("Maya", "message:1");
    expect(number("place")).toBe(2); expect(number("success")).toBe(0); expect(container.querySelector(".lo-feedback.is-correct")).toBeNull();
    await click(next()); expect(number("success")).toBe(1); expect(container.querySelector(".lo-feedback.is-correct")).not.toBeNull();
  });

  it("uses a soft retry intent for a changed relation and keeps typing silent", async () => {
    await mount("use3-i"); await place("you", "word:pronoun"); await place("am", "word:verb");
    expect(number("place")).toBe(2); expect(number("success")).toBe(0); await click(next()); expect(number("retry")).toBe(1); expect(number("success")).toBe(0);
    await click(button("Digitar")); sfx.play.mockClear(); for (const text of ["I", "I ", "I a", "I am", "I am Sam."]) await type(text);
    expect(cues()).toEqual([]); await click(next()); expect(number("success")).toBe(1); expect(number("retry")).toBe(0);
  });

  it.each(["g1-self", "g2-join", "g2-outside", "g3-i", "use3-i", "g6-ensemble"])("keeps confirmation sounds tied to evaluation in %s", async id => {
    await mount(id); const round = all.find(round => round.id === id)!; sfx.play.mockClear();
    if (round.kind === "bubbles") await place(phraseText(round.expected), "speech");
    else if (round.kind === "join") await place("Ana", "team");
    else if (round.kind === "speaker") await click(container.querySelector<HTMLButtonElement>(`[data-person="${round.speaker}"]`)!);
    else if (round.kind === "verb" || round.kind === "build") {
      if (round.kind === "build") await place(round.expected.pronoun, "word:pronoun"); await place(round.expected.verb, "word:verb");
      expect(number("success")).toBe(0); await click(next());
    } else {
      for (const [index, turn] of round.ensemble!.entries()) await place(phraseText(turn.expected), `turn:${index}`);
      expect(number("place")).toBe(4); expect(number("success")).toBe(0); await click(next());
    }
    expect(number("success")).toBe(1); expect(number("retry")).toBe(0); expect(container.querySelector(".lo-feedback.is-correct")).not.toBeNull();
  });

  it("confirms first listening only after native end and only once per tutorial episode", async () => {
    await mount("g1-self", true); await click(button("Começar com som", dialog())); sfx.play.mockClear();
    await click(dialog().querySelector<HTMLButtonElement>('[data-tutorial-cue="listen"]')!); expect(number("success")).toBe(0);
    const voice = Media.current; await ended(voice); expect(number("success")).toBe(1); await ended(voice); expect(number("success")).toBe(1);
    await click(dialog().querySelector<HTMLButtonElement>('[data-tutorial-cue="listen"]')!); await ended(); expect(number("success")).toBe(1);
  });

  it("uses the same placement, success, retry and advance meanings in tutorial practice", async () => {
    await mount("g1-self", true); await click(button("Começar com som", dialog())); await click(dialog().querySelector<HTMLButtonElement>('[data-tutorial-cue="listen"]')!); await click(next(dialog()));
    await click(dialog().querySelector<HTMLButtonElement>('[data-tutorial-cue="listen"]')!); await click(next(dialog())); sfx.play.mockClear();
    await place("I am Ana.", "person:leo", dialog()); expect(number("success")).toBe(0); await place("I am Ana.", "person:ana", dialog()); expect(number("success")).toBe(1);
    await click(next(dialog())); sfx.play.mockClear(); await place("I", "tutorial:word:pronoun", dialog()); expect(number("place")).toBe(1); expect(number("success")).toBe(0);
    await place("am", "tutorial:word:verb", dialog()); expect(number("success")).toBe(1); await click(next(dialog())); sfx.play.mockClear();
    for (const text of ["Y", "You", "You are Ana."]) await type(text, dialog()); expect(cues()).toEqual([]);
    await click(button("Conferir escrita", dialog())); expect(number("retry")).toBe(1); await type("I am Anna.", dialog()); sfx.play.mockClear(); await click(button("Conferir escrita", dialog())); expect(number("success")).toBe(1);
    await click(next(dialog())); await ended(); sfx.play.mockClear(); await click(next(dialog())); expect(number("advance")).toBe(1); expect(container.querySelector(".lo-tutorial")).toBeNull();
  });
});
