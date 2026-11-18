// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LESSON_SCENES, phraseText, type PersonId } from "../src/features/first-encounters/lesson-one";
import { LESSON_MECHANICS, LESSON_MECHANICS_STORAGE, type LessonMechanicId } from "../src/features/first-encounters/lesson-mechanics";
import { getGuidedLessonAudioClip } from "../src/features/first-encounters/lesson-mechanics-audio";
import { getLessonAudioClip } from "../src/features/first-encounters/lesson-audio";
import catalog from "../src/features/first-encounters/lesson-one-audio.json";
let actorMounts: Record<string, number> = {};

vi.mock("next/dynamic", async () => {
  const { useEffect } = await import("react");
  return { default: () => function Character({ person, onReady }: { person: string; onReady?: () => void }) {
    useEffect(() => { actorMounts[person] = (actorMounts[person] ?? 0) + 1; }, [person]);
    useEffect(() => { onReady?.(); }, [onReady]); return createElement("span", { "data-character-dummy": person });
  } };
});
// These suites exercise lesson interactions with isolated browser storage.
// Account ownership and synchronization are covered by lesson-account-storage.test.ts.
vi.mock("../src/features/first-encounters/useLessonAccountProgress", () => ({
  useLessonAccountProgress: () => ({ ready: true, storage: window.localStorage, scopeKey: "isolated-lesson", saving: false, error: "", notice: "", refresh: () => {}, reset: async () => {} }),
}));

import { LessonOne } from "../src/features/first-encounters/LessonOne";

class Media extends EventTarget {
  static calls: string[] = [];
  static current: Media;
  static blocked = false;
  static failURL: string | null = null;
  src: string; currentTime = 0; duration = 5; paused = true; ended = false; preload = "";
  constructor(url: string) { super(); this.src = url; }
  play = vi.fn(async () => {
    Media.current = this; Media.calls.push(this.src);
    if (Media.blocked) { Media.blocked = false; throw new DOMException("gesture required", "NotAllowedError"); }
    if (Media.failURL === this.src) { Media.failURL = null; throw new Error("network"); }
    this.paused = false; this.ended = false; this.dispatchEvent(new Event("playing"));
  });
  pause = vi.fn(() => { this.paused = true; this.dispatchEvent(new Event("pause")); });
  load = vi.fn();
  end() { this.currentTime = this.duration; this.ended = true; this.paused = true; this.dispatchEvent(new Event("pause")); this.dispatchEvent(new Event("ended")); }
}
let root: Root, container: HTMLDivElement, frames: Map<number, FrameRequestCallback>, serial: number;
const rounds = LESSON_SCENES.flatMap(scene => scene.rounds);
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); vi.stubGlobal("Audio", Media); Media.calls = []; Media.blocked = false; Media.failURL = null; actorMounts = {};
  frames = new Map(); serial = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++serial, callback); return serial; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
  localStorage.clear(); localStorage.setItem("basedspeak.lesson-one.introduction.v1","done"); localStorage.setItem("basedspeak.lesson-one.tutorial.v1", "done");
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
async function settle() {
  for (let pass = 0; pass < 3; pass++) await act(async () => { const callbacks = [...frames.values()]; frames.clear(); for (const callback of callbacks) callback(performance.now()); });
}
async function mount(id = "g1-self", seen: LessonMechanicId[] | null = []) {
  const scene = LESSON_SCENES.findIndex(scene => scene.rounds.some(round => round.id === id));
  const round = LESSON_SCENES[scene].rounds.findIndex(round => round.id === id);
  localStorage.setItem("basedspeak.lesson-one.v2", JSON.stringify({ version: 2, scene, round, completed: rounds.slice(0, rounds.findIndex(round => round.id === id)).map(round => round.id), supported: [] }));
  if (seen !== null) localStorage.setItem(LESSON_MECHANICS_STORAGE, JSON.stringify({ version: 1, seen }));
  await act(async () => root.render(createElement(LessonOne))); await settle();
}
const app = () => container.querySelector<HTMLElement>(".lo-app")!;
const next = () => container.querySelector<HTMLButtonElement>(".lo-footer .lo-next")!;
function button(label: string) {
  const found = [...container.querySelectorAll<HTMLButtonElement>("button")].find(element => element.textContent?.trim() === label || element.getAttribute("aria-label") === label);
  expect(found, label).toBeTruthy(); return found!;
}
function source(label: string) {
  const found = [...container.querySelectorAll<HTMLButtonElement>("[data-lesson-drag-source]")].find(element => element.getAttribute("aria-label") === label);
  expect(found, label).toBeTruthy(); return found!;
}
function target(id: string) { const found = container.querySelector<HTMLElement>(`[data-lesson-drop="${id}"]`); expect(found, id).toBeTruthy(); return found!; }
async function click(element: HTMLElement) { await act(async () => element.click()); await settle(); }
async function pointer(element: EventTarget, type = "pointerdown", x = 25, y = 35) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y });
  Object.defineProperties(event, { pointerId: { value: 7 }, isPrimary: { value: true }, pointerType: { value: "mouse" } });
  await act(async () => element.dispatchEvent(event)); await settle();
}
async function select(label: string) { const element = source(label); await pointer(element); await pointer(element, "pointerup"); await click(element); }
async function press(element: HTMLElement) { await pointer(element); await pointer(element, "pointerup"); await click(element); }
async function place(label: string, id: string) { await select(label); await click(target(id)); }
async function ended(media = Media.current) { await act(async () => media.end()); await settle(); }
const guides = () => Media.calls.filter(url => Object.values(LESSON_MECHANICS).some(guide => guide.url === url));
const first: { id: LessonMechanicId; round: string }[] = [
  { id: "bubbles", round: "g1-self" }, { id: "join", round: "g2-join" }, { id: "speaker", round: "g2-outside" },
  { id: "verb", round: "g3-i" }, { id: "build", round: "use3-i" }, { id: "messages", round: "g5-messages" }, { id: "speaker", round: "g6-ensemble" },
];

describe("activity guidance on the actual controls", () => {
  it.each(first)("shows $id once in $round, lets input interrupt it, and rejects its stale ended callback", async ({ id, round }) => {
    await mount(round); expect(app().dataset.mechanicGuide).toBe(id); expect(Media.calls).toEqual([LESSON_MECHANICS[id].url]); const guide = Media.current;
    if (id === "bubbles") await place("You are Ana.", "speech");
    else if (id === "join") await place("Maya", "team");
    else if (id === "speaker") { const person = container.querySelector<HTMLButtonElement>(`[data-person="${round === "g6-ensemble" ? "nina" : "ana"}"]`)!; await pointer(person); await click(person); }
    else if (id === "verb") await place("are", "word:verb");
    else if (id === "build") await place("you", "word:pronoun");
    else if (id === "messages") await place("Ana", "message:0");
    expect(guide.paused).toBe(true); expect(app().dataset.mechanicGuide).toBeUndefined(); expect(Media.calls).toHaveLength(1);
    await ended(guide); expect(Media.calls).toHaveLength(1); expect(container.querySelector(".lo-feedback.is-correct")).toBeNull();
    expect(JSON.parse(localStorage.getItem(LESSON_MECHANICS_STORAGE)!).seen).toContain(id);
  });

  it("keeps a real pointer session alive when grabbing the source cancels its guide", async () => {
    await mount(); const element = source("You are Ana.");
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({ x: 10, y: 20, left: 10, top: 20, right: 110, bottom: 70, width: 100, height: 50, toJSON: () => ({}) });
    element.setPointerCapture = vi.fn(); element.releasePointerCapture = vi.fn(); element.hasPointerCapture = vi.fn(() => true);
    Object.defineProperty(document, "elementsFromPoint", { configurable: true, value: vi.fn(() => [target("speech")]) });
    await pointer(element); expect(element.isConnected).toBe(true); expect(app().dataset.mechanicGuide).toBeUndefined();
    await pointer(document, "pointermove", 125, 135); expect(element.getAttribute("data-lesson-dragging")).toBe("true");
    await pointer(document, "pointerup", 125, 135); expect(container.querySelector(".lo-feedback.is-retry")).not.toBeNull(); expect(Media.calls).toHaveLength(1);
    expect(document.querySelector(".lesson-drag-ghost")).toBeNull();
  });

  it.each(["g2-join", "g2-outside", "g5-messages", "g6-ensemble", "use6-i"])("requires a separate tap to hear the English prompt after the guide for %s", async id => {
    await mount(id); const round = rounds.find(round => round.id === id)!;
    const prompt = round.ensemble?.[0] ?? round;
    expect(Media.calls).toHaveLength(1);
    await ended(); expect(Media.calls).toEqual([LESSON_MECHANICS[round.kind].url]);
    await press(container.querySelector<HTMLButtonElement>("[data-audio-main]")!);
    expect(Media.calls.at(-1)).toBe(catalog[`nina:${phraseText(prompt.expected)}` as keyof typeof catalog]);
    expect(app().dataset.round).toBe(id); expect(container.querySelector(".lo-feedback.is-correct")).toBeNull(); expect(next().disabled).toBe(true);
  });

  it("repeats only through Como fazer and leaves the current draft untouched", async () => {
    await mount("g3-i"); await place("are", "word:verb"); const before = Media.calls.length;
    await click(button("Como fazer")); expect(Media.calls).toHaveLength(before + 1); expect(Media.calls.at(-1)).toBe(LESSON_MECHANICS.verb.url);
    expect(target("word:verb").textContent).toBe("are"); const count = Media.calls.length; await ended(); expect(Media.calls).toHaveLength(count);
    expect(next().disabled).toBe(false); expect(container.querySelector(".lo-feedback.is-correct")).toBeNull();
  });

  it("does not repeat the automatic guide on Back or Refazer", async () => {
    await mount("g1-listener"); await place("You are Ana.", "speech"); await click(next()); expect(app().dataset.round).toBe("use1-self");
    await click(button("Voltar")); expect(app().dataset.round).toBe("g1-listener"); expect(app().dataset.mechanicGuide).toBeUndefined();
    await click(button("Refazer atividade")); expect(guides()).toEqual([LESSON_MECHANICS.bubbles.url]); expect(next().disabled).toBe(true);
  });

  it("reuses the learned speaker control for the final decision and only repeats its guide on request", async () => {
    await mount("g6-ensemble", ["speaker"]);
    expect(guides()).toEqual([]); expect(Media.calls).toEqual([catalog["nina:You are Nina."]]);
    expect(container.querySelector(".lo-turns,.lo-ensemble-bank")).toBeNull();
    const prompt = Media.current; await press(button("Como fazer"));
    expect(prompt.paused).toBe(true); expect(guides()).toEqual([LESSON_MECHANICS.speaker.url]);
    const guide = Media.current; const leo = container.querySelector<HTMLButtonElement>('[data-person="leo"]')!;
    await pointer(leo); await click(leo);
    expect(guide.paused).toBe(false); expect(app().dataset.mechanicGuide).toBeUndefined();
    expect(container.querySelector(".lo-feedback.is-correct")).not.toBeNull();
    expect(Media.current).toBe(guide);
    await ended(guide);
    expect(Media.calls.at(-1)).toBe(catalog["leo:You are Nina."]);
    const calls = Media.calls.length; await ended(guide); expect(Media.calls).toHaveLength(calls);
  });

  it.each(["I am Sam.", "I are Sam."])("keeps direct text %s during its first guide and shows the spoken canonical model after grading", async text => {
    await mount("use3-i", ["build"]); await click(button("Digitar")); expect(app().dataset.mechanicGuide).toBe("write"); const guide = Media.current;
    const input = container.querySelector<HTMLInputElement>('[aria-label="Sua fala em inglês"]')!;
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, text); input.dispatchEvent(new InputEvent("input", { bubbles: true, data: text, inputType: "insertText" })); }); await settle();
    expect(input.value).toBe(text); expect(guide.paused).toBe(true); expect(app().dataset.mechanicGuide).toBeUndefined(); expect(Media.calls).toHaveLength(1);
    await ended(guide); expect(Media.calls).toHaveLength(1); expect(container.querySelector(".lo-feedback.is-correct")).toBeNull();
    await click(next()); expect(Media.calls).toHaveLength(2); expect(Media.calls.at(-1)).toContain("sam-i-am-sam");
    expect(container.querySelector(".ls-speech-bubble strong")?.textContent).toBe("I am Sam."); expect(input.value).toBe(text);
  });

  it("retains the blocked guide intent and retries it without starting a competing English prompt", async () => {
    Media.blocked = true; await mount("g2-join"); expect(Media.calls).toEqual([LESSON_MECHANICS.join.url]);
    await click(button("Ativar som")); expect(Media.calls).toEqual([LESSON_MECHANICS.join.url, LESSON_MECHANICS.join.url]);
    await select("Ana"); await ended(Media.current); expect(Media.calls).toHaveLength(2);
  });

  it("pauses a PT guide through the main audio control and replays that guide without opening an example", async () => {
    await mount(); const guide = Media.current, main = container.querySelector<HTMLButtonElement>("[data-audio-main]")!;
    await press(main); expect(guide.paused).toBe(true); expect(Media.calls).toEqual([LESSON_MECHANICS.bubbles.url]);
    expect(app().dataset.mechanicGuide).toBe("bubbles"); expect(container.querySelector(".lo-model-dialog[open]")).toBeNull();
    await press(main); expect(Media.calls).toEqual([LESSON_MECHANICS.bubbles.url, LESSON_MECHANICS.bubbles.url]);
    expect(Media.current.paused).toBe(false); expect(container.querySelector(".lo-model-dialog[open]")).toBeNull(); expect(next().disabled).toBe(true);
  });

  it("lets an English option replace the guide and pause without restarting itself or selecting an answer", async () => {
    await mount(); const option = container.querySelector<HTMLButtonElement>('[data-audio-person="nina"][data-audio-text="I am Ana."]:not([data-audio-main])')!;
    await press(option); const english = Media.current; expect(english.src).toContain("nina-i-am-ana"); expect(app().dataset.mechanicGuide).toBeUndefined();
    const count = Media.calls.length; await press(option); expect(english.paused).toBe(true); expect(Media.calls).toHaveLength(count);
    expect(source("I am Ana.").getAttribute("aria-pressed")).toBe("false"); expect(next().disabled).toBe(true);
  });

  it("retries a failed first PT guide through the inline retry control", async () => {
    Media.failURL = LESSON_MECHANICS.bubbles.url; await mount(); expect(Media.calls).toEqual([LESSON_MECHANICS.bubbles.url]);
    await press(button("Tentar novamente")); expect(Media.calls).toEqual([LESSON_MECHANICS.bubbles.url, LESSON_MECHANICS.bubbles.url]);
    expect(Media.current.paused).toBe(false); expect(app().dataset.mechanicGuide).toBe("bubbles"); expect(container.querySelector(".lo-model-dialog[open]")).toBeNull();
  });

  it("retries a failed English preview as English instead of replacing it with the PT guide", async () => {
    await mount(); const option = container.querySelector<HTMLButtonElement>('[data-audio-person="nina"][data-audio-text="I am Ana."]:not([data-audio-main])')!;
    const english = catalog["nina:I am Ana."]; Media.failURL = english; await press(option); await press(button("Tentar novamente"));
    expect(Media.calls).toEqual([LESSON_MECHANICS.bubbles.url, english, english]); expect(app().dataset.mechanicGuide).toBeUndefined(); expect(Media.current.paused).toBe(false);
  });

  it("recovers from malformed seen storage and persists a valid first-use record", async () => {
    localStorage.setItem(LESSON_MECHANICS_STORAGE, "{broken"); await mount("g1-self", null);
    expect(app().dataset.mechanicGuide).toBe("bubbles"); expect(Media.calls).toEqual([LESSON_MECHANICS.bubbles.url]);
    expect(JSON.parse(localStorage.getItem(LESSON_MECHANICS_STORAGE)!)).toEqual({ version: 1, seen: ["bubbles"] });
  });

  it("keeps actor identity mounted while Next and Back exchange the speaker", async () => {
    await mount("g1-self", Object.keys(LESSON_MECHANICS) as LessonMechanicId[]); expect(actorMounts).toMatchObject({ ana: 1, leo: 1 });
    await place("I am Ana.", "speech"); const anaVoice = Media.current; expect(anaVoice.src).toContain("ana-i-am-ana");
    await click(next()); expect(app().dataset.round).toBe("g1-listener"); expect(anaVoice.paused).toBe(true);
    await place("You are Ana.", "speech"); const leoVoice = Media.current; expect(leoVoice.src).toContain("leo-you-are-ana");
    await click(button("Voltar")); expect(app().dataset.round).toBe("g1-self"); expect(leoVoice.paused).toBe(true);
    expect(actorMounts).toMatchObject({ ana: 1, leo: 1 }); expect(next().disabled).toBe(true); expect(source("I am Ana.").disabled).toBe(false);
  });

  it("does not skip an ungraded round when Continue is clicked twice rapidly", async () => {
    await mount("g1-self", Object.keys(LESSON_MECHANICS) as LessonMechanicId[]); await place("I am Ana.", "speech");
    const control = next(); await act(async () => { control.click(); control.click(); }); await settle();
    expect(app().dataset.round).toBe("g1-listener"); expect(next().disabled).toBe(true); expect(source("You are Ana.").disabled).toBe(false);
    expect(JSON.parse(localStorage.getItem("basedspeak.lesson-one.v2")!).completed).toEqual(["g1-self"]);
  });

  it("keeps the ordinary English catalog at 26 exact entries and adds only explicit narrator clips", () => {
    expect(Object.keys(catalog)).toHaveLength(26);
    for (const [key, url] of Object.entries(catalog)) {
      const split = key.indexOf(":"), person = key.slice(0, split) as PersonId, text = key.slice(split + 1);
      expect(getGuidedLessonAudioClip(person, text)).toBe(url);
    }
    for (const guide of Object.values(LESSON_MECHANICS)) {
      expect(getGuidedLessonAudioClip("nina", guide.text)).toBe(guide.url); expect(getGuidedLessonAudioClip("ana", guide.text)).toBeUndefined();
      expect(getLessonAudioClip("nina", guide.text)).toBeUndefined();
    }
  });
});
