// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LESSON_SCENES, phraseText } from "../src/features/first-encounters/lesson-one";

const audio = vi.hoisted(() => ({
  snapshot: { playingKey: null as string | null, error: null as string | null, blocked: false },
  subscribers: new Set<() => void>(), scope: "", play: vi.fn(), request: vi.fn(), pause: vi.fn(), stop: vi.fn(), has: vi.fn(() => true),
}));
vi.mock("next/dynamic", () => ({ default: () => ({ person }: { person: string }) => createElement("span", { "data-character-dummy": person }) }));
vi.mock("../src/features/first-encounters/useLessonAudio", async () => {
  const { useLayoutEffect, useSyncExternalStore } = await import("react");
  return { useLessonAudio: (scope: string) => {
    const state = useSyncExternalStore(callback => { audio.subscribers.add(callback); return () => audio.subscribers.delete(callback); }, () => audio.snapshot);
    useLayoutEffect(() => { audio.scope = scope; audio.stop(); return () => audio.stop(); }, [scope]);
    return { ...state, play: audio.play, request: audio.request, pause: audio.pause, stop: audio.stop, has: audio.has,
      unlock: async()=>false, resume:async()=>false, speech:undefined };
  } };
});
// These suites exercise lesson interactions with isolated browser storage.
// Account ownership and synchronization are covered by lesson-account-storage.test.ts.
vi.mock("../src/features/first-encounters/useLessonAccountProgress", () => ({
  useLessonAccountProgress: () => ({ ready: true, storage: window.localStorage, scopeKey: "isolated-lesson", saving: false, error: "", notice: "", refresh: () => {}, reset: async () => {} }),
}));

import { LessonOne } from "../src/features/first-encounters/LessonOne";

const STORAGE = "basedspeak.lesson-one.v2";
let root: Root, container: HTMLDivElement, frames: Map<number, FrameRequestCallback>, serial: number;
function publish(playingKey: string | null, error: string | null = null) {
  audio.snapshot = { playingKey, error, blocked:false }; for (const notify of audio.subscribers) notify();
}
beforeEach(() => {
  vi.clearAllMocks(); audio.subscribers.clear(); audio.snapshot = { playingKey: null, error: null, blocked:false };
  audio.play.mockImplementation(async (person: string, text: string) => publish(`${person}:${text}`));
  audio.request.mockImplementation(async(person:string,text:string)=>{await audio.play(person,text);return true;});
  audio.pause.mockImplementation(() => publish(null)); audio.stop.mockImplementation(() => publish(null));
  audio.has.mockReturnValue(true);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  frames = new Map(); serial = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++serial, callback); return serial; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event("close")); } });
  localStorage.clear(); localStorage.setItem("basedspeak.lesson-one.introduction.v1","done"); container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  localStorage.setItem("basedspeak.lesson-one.tutorial.v1","done");
  localStorage.setItem("basedspeak.lesson-one.mechanics.v1",JSON.stringify({version:1,seen:["bubbles","join","speaker","verb","build","messages","ensemble","write"]}));
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
async function flush() { await act(async () => { const callbacks = [...frames.values()]; frames.clear(); for (const callback of callbacks) callback(performance.now()); }); }
async function mount(id = "g1-self") {
  const all = LESSON_SCENES.flatMap(scene => scene.rounds);
  const scene = LESSON_SCENES.findIndex(s => s.rounds.some(round => round.id === id));
  const round = LESSON_SCENES[scene].rounds.findIndex(round => round.id === id);
  localStorage.setItem(STORAGE, JSON.stringify({ version: 2, scene, round, completed: all.slice(0, all.findIndex(round => round.id === id)).map(round => round.id), supported: [] }));
  await act(async () => root.render(createElement(LessonOne))); await flush(); await flush();
}
async function click(element: HTMLElement) { await act(async () => element.click()); }
function main() { return container.querySelector<HTMLButtonElement>("[data-audio-main]")!; }
function footer() { return container.querySelector<HTMLButtonElement>(".lo-footer .lo-next")!; }
function source(label: string) { return [...container.querySelectorAll<HTMLButtonElement>("[data-lesson-drag-source]")].find(button => button.getAttribute("aria-label") === label)!; }
function target(id: string) { return [...container.querySelectorAll<HTMLElement>("[data-lesson-drop]")].find(element => element.dataset.lessonDrop === id)!; }
function preview(text: string, parent = ".lo-phrase-bank") { return [...container.querySelectorAll<HTMLButtonElement>(`${parent} [data-audio-text]`)].find(button => button.dataset.audioText === text)!; }
async function place(text: string, id: string) { await click(source(text)); await click(target(id)); }
function noGrade() { expect(container.querySelector(".lo-feedback.is-correct,.lo-feedback.is-retry")).toBeNull(); }

describe("lesson audio without answer or identity shortcuts", () => {
  it("does not autoplay and reads both visible options with the same neutral narrator without selecting", async () => {
    await mount(); expect(audio.play).not.toHaveBeenCalled();
    await click(preview("I am Ana."));
    expect(audio.play).toHaveBeenLastCalledWith("nina", "I am Ana.");
    expect(source("I am Ana.").getAttribute("aria-pressed")).toBe("false"); noGrade();
    expect(main().textContent).toContain("Pausar"); await click(main()); expect(audio.pause).toHaveBeenCalledOnce();
    await click(preview("You are Ana.")); expect(audio.play).toHaveBeenLastCalledWith("nina", "You are Ana."); noGrade();
    expect(container.querySelector("button button")).toBeNull();
  });

  it("makes listening to a model explicit support and keeps the production answer unplayed until requested", async () => {
    await mount("use3-i");
    expect(main().getAttribute("aria-label")).toBe("Ouvir exemplo narrado"); expect(main().hasAttribute("data-audio-text")).toBe(false);
    expect(audio.play).not.toHaveBeenCalled(); await click(main());
    expect(container.querySelector<HTMLDialogElement>(".lo-model-dialog")!.open).toBe(true);
    expect(audio.play).toHaveBeenLastCalledWith("nina", "I am Ana.");
    expect(JSON.parse(localStorage.getItem(STORAGE)!).supported).toContain("use3-i"); noGrade();
    expect([...container.querySelectorAll(".lo-model-audio [data-audio-person]")].every(button => button.getAttribute("data-audio-person") === "nina")).toBe(true);
  });

  it("previews a complete valid learner phrase neutrally, then uses the actor after acceptance", async () => {
    await mount("use3-i");
    await place("I", "word:pronoun"); expect(main().hasAttribute("data-audio-text")).toBe(false);
    await place("am", "word:verb"); await click(main()); expect(audio.play).toHaveBeenLastCalledWith("nina", "I am Sam."); noGrade();
    await click(footer()); expect(container.querySelector(".lo-feedback.is-correct")).not.toBeNull();
    expect(main().getAttribute("aria-label")).toBe("Ouvir fala de Sam");
    await click(main()); expect(audio.play).toHaveBeenLastCalledWith("sam", "I am Sam.");
  });

  it("never reads I are before grading and reads the corrected model after understood meaning", async () => {
    await mount("g3-i"); await place("are", "word:verb");
    expect(main().getAttribute("aria-label")).toBe("Ouvir exemplo narrado"); expect(main().hasAttribute("data-audio-text")).toBe(false);
    expect(audio.play).not.toHaveBeenCalled(); await click(footer());
    expect(container.querySelector(".lo-feedback.is-correct")).not.toBeNull(); await click(main());
    expect(audio.play).toHaveBeenLastCalledWith("ana", "I am Ana.");
    expect(audio.play.mock.calls.some(([, text]) => text === "I are Ana.")).toBe(false);
  });

  it("keeps anonymous A/B messages neutral and listening never assigns a selected person", async () => {
    await mount("g5-messages"); await click(source("Ana"));
    const buttons = [...container.querySelectorAll<HTMLButtonElement>(".lo-message-audio")]; expect(buttons).toHaveLength(2);
    await click(buttons[0]); expect(audio.play).toHaveBeenLastCalledWith("nina", "We are a team.");
    expect([...container.querySelectorAll(".lo-message-sender")].map(element => element.textContent)).toEqual(["Quem enviou?", "Quem enviou?"]);
    expect(source("Ana").getAttribute("aria-pressed")).toBe("true");
    await click(buttons[1]); expect(audio.play).toHaveBeenLastCalledWith("nina", "They are a team."); noGrade();
    expect(target("message:0").getAttribute("role")).toBe("button");
  });

  it("does not identify a speaker by voice before choice and accepts Leo's valid alternative voice", async () => {
    await mount("g4-inside"); await click(main()); expect(audio.play).toHaveBeenLastCalledWith("nina", "We are a team.");
    await click(container.querySelector<HTMLButtonElement>('[data-person="leo"]')!);
    expect(main().getAttribute("aria-label")).toBe("Ouvir fala de Leo");
    await click(main()); expect(audio.play).toHaveBeenLastCalledWith("leo", "We are a team.");
  });

  it("keeps all ensemble option previews neutral and gives the accepted active turn its own voice", async () => {
    await mount("g6-ensemble");
    expect([...container.querySelectorAll(".lo-ensemble-bank [data-audio-person]")].every(button => button.getAttribute("data-audio-person") === "nina")).toBe(true);
    const round = LESSON_SCENES[10].rounds[0];
    for (const [index, turn] of round.ensemble!.entries()) await place(phraseText(turn.expected), `turn:${index}`);
    noGrade(); await click(footer()); await click(main()); expect(audio.play).toHaveBeenLastCalledWith("sam", "They are a team.");
  });

  it("offers a plain retry after playback failure without grading or advancing", async () => {
    await mount(); audio.play.mockImplementation(async () => publish(null, "Não foi possível reproduzir esta fala. Tente novamente."));
    await click(preview("I am Ana."));
    const retry = container.querySelector<HTMLButtonElement>(".lo-workbench .lo-audio-error button")!; expect(retry.textContent).toBe("Tentar novamente");
    await click(retry); expect(audio.play).toHaveBeenCalledTimes(2); noGrade();
    expect(container.querySelector(".lo-app")!.getAttribute("data-round")).toBe("g1-self");
  });

  it("stops preview playback before grading and changes audio scope when advancing", async () => {
    await mount(); await click(preview("I am Ana.")); await place("I am Ana.", "speech");
    expect(audio.snapshot.playingKey).toBeNull(); await click(footer()); await flush();
    expect(audio.scope).toMatch(/:g1-listener:activity$/); expect(audio.play).toHaveBeenCalledTimes(1);
  });
});
