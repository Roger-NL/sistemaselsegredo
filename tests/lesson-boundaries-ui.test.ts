// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LESSON_SCENES, PERSON_NAMES } from "../src/features/first-encounters/lesson-one";
import { CONCLUSION_QUESTIONS, LESSON_CONCLUSION_STORAGE, conclusionModel } from "../src/features/first-encounters/lesson-conclusion";
import type { LessonSpeechDriver } from "../src/features/first-encounters/lesson-audio";

const sound = vi.hoisted(() => ({ play: vi.fn(), toggleMuted: vi.fn(), unlock: vi.fn(async () => true) }));
vi.mock("../src/features/first-encounters/useLessonSounds", () => ({ useLessonSounds: () => ({ ...sound, muted: false }) }));
vi.mock("next/dynamic", async () => {
  const { useEffect, useRef } = await import("react");
  return { default: () => function Character({ person, speech, pause, onReady }: { person: string; speech?: LessonSpeechDriver; pause?: boolean; onReady?: () => void }) {
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => { onReady?.(); }, [onReady]);
    useEffect(() => {
      ref.current?.setAttribute("data-dummy-speaking", "false");
      return speech?.subscribeFrame(frame => ref.current?.setAttribute("data-dummy-speaking", String(!pause && frame.playing && frame.role === "character" && frame.person === person)));
    }, [person, speech, pause]);
    return createElement("span", { ref, "data-dummy-person": person, "data-dummy-speaking": "false" });
  } };
});
// These suites exercise lesson interactions with isolated browser storage.
// Account ownership and synchronization are covered by lesson-account-storage.test.ts.
vi.mock("../src/features/first-encounters/useLessonAccountProgress", () => ({
  useLessonAccountProgress: () => ({ ready: true, storage: window.localStorage, scopeKey: "isolated-lesson", saving: false, error: "", notice: "", refresh: () => {}, reset: async () => {} }),
}));

import { LessonOne } from "../src/features/first-encounters/LessonOne";

class Media extends EventTarget {
  static calls: string[] = []; static all: Media[] = []; static current: Media; static maxActive = 0;
  src: string; currentTime = 0; duration = 1; paused = true; ended = false; preload = "";
  constructor(url: string) { super(); this.src = url; Media.all.push(this); }
  play = vi.fn(async () => { Media.current = this; Media.calls.push(this.src); this.paused = false; this.ended = false; Media.maxActive = Math.max(Media.maxActive, Media.all.filter(media => !media.paused && !media.ended).length); this.dispatchEvent(new Event("playing")); });
  pause = vi.fn(() => { this.paused = true; this.dispatchEvent(new Event("pause")); }); load = vi.fn();
  end() { this.currentTime = this.duration; this.ended = true; this.paused = true; this.dispatchEvent(new Event("pause")); this.dispatchEvent(new Event("ended")); }
}
const PRACTICE = "basedspeak.lesson-one.v2", INTRO = "basedspeak.lesson-one.introduction.v1", TUTORIAL = "basedspeak.lesson-one.tutorial.v1";
const all = LESSON_SCENES.flatMap(scene => scene.rounds);
const selfModel = conclusionModel(CONCLUSION_QUESTIONS[0]);
const wrongSelf = CONCLUSION_QUESTIONS[0].choices!.find(choice => choice.startsWith("You are "))!;
let root: Root, container: HTMLDivElement, frames: Map<number, FrameRequestCallback>, serial: number;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); vi.stubGlobal("Audio", Media); Media.calls = []; Media.all = []; Media.maxActive = 0; sound.play.mockClear();
  frames = new Map(); serial = 0; vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++serial, callback); return serial; }); vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
  localStorage.clear(); localStorage.setItem("basedspeak.lesson-one.mechanics.v1", JSON.stringify({ version: 1, seen: ["bubbles", "join", "speaker", "verb", "build", "messages", "ensemble", "write"] }));
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
async function settle() { for (let pass = 0; pass < 4; pass++) await act(async () => { const callbacks = [...frames.values()]; frames.clear(); for (const callback of callbacks) callback(performance.now()); }); }
async function mount() { await act(async () => root.render(createElement(LessonOne))); await settle(); }
async function remount() { await act(async () => root.unmount()); root = createRoot(container); await mount(); }
async function click(element: HTMLElement) { expect(element).toBeTruthy(); await act(async () => element.click()); await settle(); }
function button(label: string, scope: ParentNode = container) { const found = [...scope.querySelectorAll<HTMLButtonElement>("button")].find(element => element.getAttribute("aria-label") === label || element.textContent?.trim() === label); expect(found, label).toBeTruthy(); return found!; }
const intro = () => container.querySelector<HTMLDialogElement>('[data-introduction-step]')!;
const conclusion = () => container.querySelector<HTMLElement>('[data-conclusion-phase]')!;
const conclusionNext = () => container.querySelector<HTMLButtonElement>(".lc-footer .lc-next")!;
const savedPractice = () => JSON.parse(localStorage.getItem(PRACTICE)!);
const savedConclusion = () => JSON.parse(localStorage.getItem(LESSON_CONCLUSION_STORAGE)!);
async function ended(media = Media.current) { await act(async () => media.end()); await settle(); }
function seed(id: string | "finished") {
  const index = id === "finished" ? all.length : all.findIndex(round => round.id === id), scene = id === "finished" ? LESSON_SCENES.length : LESSON_SCENES.findIndex(scene => scene.rounds.some(round => round.id === id));
  const round = id === "finished" ? 0 : LESSON_SCENES[scene].rounds.findIndex(round => round.id === id);
  localStorage.setItem(PRACTICE, JSON.stringify({ version: 2, scene, round, completed: all.slice(0, index).map(round => round.id), supported: [] }));
}
async function input(text: string, label = "Sua frase em inglês") {
  const field = container.querySelector<HTMLInputElement>(label === "Sua frase em inglês" ? "#lc-written-answer" : `[aria-label="${label}"]`)!;
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, text); field.dispatchEvent(new InputEvent("input", { bubbles: true, data: text })); }); await settle();
}
async function choose(text: string) { const field = [...container.querySelectorAll<HTMLInputElement>('input[type="radio"]')].find(field => field.value === text)!; await click(field); }

describe("presentation and written conclusion boundaries", () => {
  it("places the presentation before the separate guide and cancels its old narration on skip", async () => {
    await mount(); expect(intro()).toBeTruthy(); expect(container.querySelector(".lo-tutorial")).toBeNull(); expect(Media.calls).toEqual([]); expect(sound.play).not.toHaveBeenCalled();
    await click(button("Começar com som", intro())); const voice = Media.current;
    expect(Media.calls).toHaveLength(1); expect(Media.calls[0]).toContain("introduction-pt");
    // The introduction owns its tap+advance intents; the practice capture must
    // not add a second tap behind the modal.
    expect(sound.play.mock.calls.map(([cue]) => cue)).toEqual(["tap", "advance"]);
    await click(button("Pular apresentação", intro())); expect(voice.paused).toBe(true); expect(intro()).toBeNull(); expect(container.querySelector(".lo-tutorial")).not.toBeNull();
    const count = Media.calls.length; await ended(voice); expect(Media.calls).toHaveLength(count); expect(localStorage.getItem(INTRO)).toBe("done");
    expect(savedPractice()).toMatchObject({ scene: 0, round: 0, completed: [] }); expect(Media.maxActive).toBe(1);
  });

  it("waits for a tap between every sentence, including two speakers on the same screen", async () => {
    await mount(); await click(button("Começar com som", intro()));
    const clips = ["self-preview", "ana-i-am-ana", "leo-you-are-ana",
      "own-team", "ana-we-are-a-team", "other-team", "maya-they-are-a-team", "nina-practice", "nina-rule", "nina-test"];
    for (const [index, clip] of clips.entries()) {
      expect(Media.calls.at(-1)).toContain(clip);
      const scene = intro().dataset.introductionStep;
      await ended();
      expect(Media.calls).toHaveLength(index + 1);
      expect(intro().dataset.introductionStep).toBe(scene);
      if (index < clips.length - 1) await click(button("Avançar", intro()));
    }
    await click(button("Como funciona a aula", intro())); expect(intro()).toBeNull(); expect(container.querySelector(".lo-tutorial")).not.toBeNull(); expect(Media.maxActive).toBe(1);
    expect(savedPractice()).toMatchObject({ scene: 0, round: 0, completed: [] });
  });

  it("resumes the individual utterance silently, including an actor model", async () => {
    await mount(); await click(button("Começar com som", intro())); await click(button("Avançar", intro()));
    const calls = Media.calls.length;
    await remount();
    expect(intro().dataset.introductionBlock).toBe("1");
    expect(intro().dataset.introductionLanguage).toBe("en");
    expect(Media.calls).toHaveLength(calls);
    await click(button("Começar com som", intro())); expect(Media.calls.at(-1)).toContain("ana-i-am-ana");
  });

  it("does not insert the presentation when resuming a middle or completed practice", async () => {
    localStorage.setItem(TUTORIAL, "done"); seed("use3-i"); await mount(); expect(intro()).toBeNull(); expect(container.querySelector<HTMLElement>(".lo-app")!.dataset.round).toBe("use3-i");
    seed("finished"); await remount(); expect(intro()).toBeNull(); expect(conclusion().dataset.conclusionPhase).toBe("theory"); expect(conclusion().dataset.conclusionIndex).toBe("0"); expect(Media.calls).toEqual([]);
  });

  it("moves only the last practice boundary into five silent written pages", async () => {
    localStorage.setItem(INTRO, "done"); localStorage.setItem(TUTORIAL, "done"); seed("use6-they"); await mount();
    const final = LESSON_SCENES.at(-1)!.rounds.at(-1)!;
    expect(final.kind).toBe("messages");
    for (const [index, turn] of final.ensemble!.entries()) {
      await click([...container.querySelectorAll<HTMLButtonElement>("[data-lesson-drag-source]")].find(element => element.getAttribute("aria-label") === PERSON_NAMES[turn.speaker])!);
      await click(container.querySelector<HTMLElement>(`[data-lesson-drop="message:${index}"]`)!);
    }
    await click(container.querySelector<HTMLButtonElement>(".lo-footer .lo-next")!); const voice = Media.current; await click(button("Concluir aula"));
    expect(voice.paused).toBe(true); expect(conclusion().dataset.conclusionPhase).toBe("theory"); const count = Media.calls.length;
    for (let index = 0; index < 5; index++) {
      expect(conclusion().dataset.conclusionIndex).toBe(String(index)); expect(conclusion().dataset.theoryBlock).toBe("0");
      expect(conclusion().querySelector('[lang="en"]')).not.toBeNull();
      await click(conclusionNext()); expect(conclusion().dataset.theoryBlock).toBe("1"); expect(conclusion().dataset.conclusionIndex).toBe(String(index));
      if (index < 4) await click(conclusionNext());
    }
    expect(Media.calls).toHaveLength(count); expect(savedPractice().completed).toHaveLength(29); expect(button("Fazer teste")).toBeTruthy();
  });

  it("preserves the first submitted answer through correction and remount", async () => {
    localStorage.setItem(TUTORIAL, "done"); seed("finished");
    localStorage.setItem(LESSON_CONCLUSION_STORAGE, JSON.stringify({ version: 1, phase: "test", theoryIndex: 4, questionIndex: 0, testStarted: true, attempts: {} }));
    await mount(); await choose(wrongSelf); await click(conclusionNext()); expect(container.querySelector(".lc-feedback.is-retry")).not.toBeNull();
    await choose(selfModel); await click(conclusionNext()); expect(container.querySelector(".lc-feedback.is-correct")).not.toBeNull();
    expect(savedConclusion().attempts.self).toMatchObject({ firstAnswer: wrongSelf, lastAnswer: selfModel }); await remount();
    expect(savedConclusion().attempts.self).toMatchObject({ firstAnswer: wrongSelf, lastAnswer: selfModel }); expect(container.querySelector(".lc-feedback.is-correct")).not.toBeNull(); expect(Media.calls).toEqual([]);
  });

  it("finishes the spoken option before the test sound and keeps the choices editable", async () => {
    localStorage.setItem(TUTORIAL, "done"); seed("finished");
    localStorage.setItem(LESSON_CONCLUSION_STORAGE, JSON.stringify({ version: 1, phase: "test", theoryIndex: 4, questionIndex: 1, testStarted: true,
      attempts: { self: { draft: selfModel, firstAnswer: selfModel, lastAnswer: selfModel } } }));
    await mount();
    const spoken = container.querySelector<HTMLButtonElement>('button[data-audio-text="I am Maya."]')!;
    const nextReading = container.querySelector<HTMLButtonElement>('button[data-audio-text="You are Maya."]')!;
    await click(spoken); const voice = Media.current;
    await choose("I am Maya.");
    let finish!: () => void;
    sound.play.mockReturnValueOnce(new Promise<void>(resolve => { finish = resolve; }));
    await click(conclusionNext());
    expect(voice.paused).toBe(false);
    expect(sound.play).not.toHaveBeenCalled();
    expect(container.querySelector(".lc-feedback.is-retry")).not.toBeNull();
    expect(nextReading.disabled).toBe(true);
    await ended(voice);
    expect(sound.play.mock.calls.map(([cue]) => cue)).toEqual(["retry"]);
    await click(nextReading); expect(Media.calls).toHaveLength(1);
    await choose("You are Maya."); expect(savedConclusion().attempts.listener.draft).toBe("You are Maya.");
    await act(async () => finish());
    expect(nextReading.disabled).toBe(false);
    await click(nextReading); expect(Media.calls).toHaveLength(2);
  });

  it.each(["I am Ana.", "I'm Ana."])("resumes Ana's draft, gives specific guidance and advances with %s", async corrected => {
    localStorage.setItem(TUTORIAL, "done"); seed("finished");
    const attempts = Object.fromEntries(CONCLUSION_QUESTIONS.slice(0, 4).map(q => {
      const value = conclusionModel(q);
      return [q.id, { draft: value, firstAnswer: value, lastAnswer: value }];
    }));
    const alternative = "My name is Ana.";
    localStorage.setItem(LESSON_CONCLUSION_STORAGE, JSON.stringify({ version: 1, phase: "test", theoryIndex: 4, questionIndex: 4, testStarted: true,
      attempts: { ...attempts, "write-self": { draft: alternative, firstAnswer: null, lastAnswer: null } } }));
    await mount();
    expect(container.querySelector("#lesson-title")?.textContent).toContain("I am ou I’m");
    expect(container.querySelector<HTMLInputElement>("#lc-written-answer")?.value).toBe(alternative);
    await click(conclusionNext());
    expect(container.querySelector(".lc-feedback.is-retry")?.textContent).toContain("Essa frase também apresenta Ana.");
    expect(conclusionNext().textContent).toBe("Conferir");
    await input(corrected);
    expect(container.querySelector(".lc-feedback.is-retry")).toBeNull();
    await click(conclusionNext()); await click(button("Próxima pergunta"));
    expect(savedConclusion().questionIndex).toBe(5);
    expect(savedConclusion().attempts["write-self"]).toEqual({ draft: corrected, firstAnswer: alternative, lastAnswer: corrected });
  });

  it("accepts flexible writing and completes without rewriting first answers or resetting practice", async () => {
    localStorage.setItem(TUTORIAL, "done"); seed("finished"); const attempts = Object.fromEntries(CONCLUSION_QUESTIONS.slice(0, 4).map((question, index) => [question.id, { draft: conclusionModel(question), firstAnswer: index === 0 ? wrongSelf : conclusionModel(question), lastAnswer: conclusionModel(question) }]));
    localStorage.setItem(LESSON_CONCLUSION_STORAGE, JSON.stringify({ version: 1, phase: "test", theoryIndex: 4, questionIndex: 4, testStarted: true, attempts }));
    await mount(); await input("im ana"); await click(conclusionNext()); expect(container.querySelector(".lc-feedback.is-correct")).not.toBeNull(); expect(container.querySelector(".lc-feedback")?.textContent).toContain("apóstrofo");
    await click(conclusionNext()); await input("I’m ready"); await click(conclusionNext()); await click(conclusionNext());
    expect(conclusion().dataset.conclusionPhase).toBe("summary"); expect(container.querySelector(".lc-completion h2")?.textContent).toContain("Parabéns"); expect(Media.calls).toHaveLength(1); expect(Media.calls[0]).toContain("revision-pt/nina-completion-congratulations.m4a");
    expect(container.querySelector(".lc-score-details,.lc-summary-actions")).toBeNull();
    expect([...container.querySelectorAll("button")].some(button => /Refazer (teste|prática)/.test(button.textContent ?? ""))).toBe(false);
    expect(savedPractice().completed).toHaveLength(29); expect(savedConclusion().attempts.self.firstAnswer).toBe(wrongSelf);
  });

  it("consumes old review shortcuts and follows presentation, guide and practice before theory", async () => {
    localStorage.setItem(INTRO, "done"); localStorage.setItem(TUTORIAL, "done"); seed("use3-i");
    const previous = savedPractice();
    const previousUrl = window.location.href;
    window.history.replaceState(null, "", "/dev/primeiros-encontros?apresentacao=1&revisao=1&keep=yes#example");
    try {
      await mount(); expect(intro()).toBeTruthy(); expect(window.location.search).toBe("?keep=yes"); expect(window.location.hash).toBe("#example");
      await click(button("Começar com som", intro())); for (let block = 1; block < 10; block++) await click(button("Avançar", intro()));
      await click(button("Como funciona a aula", intro()));
      expect(intro()).toBeNull(); expect(container.querySelector(".lo-tutorial")).not.toBeNull(); expect(container.querySelector('[data-conclusion-phase]')).toBeNull();
      await click(button("Pular tutorial", container.querySelector(".lo-tutorial")!));
      expect(container.querySelector<HTMLElement>(".lo-app")!.dataset.round).toBe("g1-self");
      expect(savedPractice()).toEqual({ ...previous, scene: 0, round: 0 });
      expect(container.querySelector(".lo-menu-review")).toBeNull();
      await remount(); expect(intro()).toBeNull(); expect(container.querySelector('[data-conclusion-phase]')).toBeNull(); expect(savedPractice()).toEqual({ ...previous, scene: 0, round: 0 });
    } finally { window.history.replaceState(null, "", previousUrl); }
  });

  it("resumes the written chapter only when all practice rounds are complete", async () => {
    const previousUrl = window.location.href;
    localStorage.setItem(INTRO, "done"); localStorage.setItem(TUTORIAL, "done");
    try {
      seed("use3-i");
      window.history.replaceState(null, "", "/dev/primeiros-encontros?retomar=conclusao");
      await mount(); expect(conclusion()).toBeNull(); expect(savedPractice().scene).toBeLessThan(12);
      seed("finished"); const progress = savedPractice();
      localStorage.setItem(PRACTICE, JSON.stringify({ ...progress, scene: 0, round: 0 }));
      window.history.replaceState(null, "", "/dev/primeiros-encontros?retomar=conclusao");
      await remount(); expect(conclusion().dataset.conclusionPhase).toBe("theory");
      expect(savedPractice().completed).toHaveLength(29); expect(window.location.search).toBe("");
    } finally { window.history.replaceState(null, "", previousUrl); }
  });

  it("restarts the entire course with a fresh presentation, guide and first-use mechanic", async () => {
    localStorage.setItem(INTRO, "done"); localStorage.setItem(TUTORIAL, "done"); seed("use3-i");
    localStorage.setItem(LESSON_CONCLUSION_STORAGE, JSON.stringify({ version: 1, phase: "test", theoryIndex: 4, questionIndex: 0, testStarted: true, attempts: { self: { draft: selfModel, firstAnswer: selfModel, lastAnswer: selfModel } } }));
    await mount(); await click(button("Abrir percurso da aula")); await click(button("Recomeçar aula do zero", container.querySelector(".lo-menu")!)); await click(button("Recomeçar", container.querySelector('[aria-labelledby="lo-reset-title"]')!));
    expect(savedPractice()).toEqual({ version: 2, scene: 0, round: 0, completed: [], supported: [] });
    for (const key of [INTRO, TUTORIAL, "basedspeak.lesson-one.mechanics.v1", LESSON_CONCLUSION_STORAGE]) expect(localStorage.getItem(key), key).toBeNull();
    expect(intro().dataset.introductionStep).toBe("0"); expect(container.querySelector(".lo-tutorial")).toBeNull(); expect(Media.all.every(media => media.paused)).toBe(true);
    await click(button("Pular apresentação", intro())); expect(container.querySelector(".lo-tutorial")).not.toBeNull();
    await click(button("Pular tutorial", container.querySelector(".lo-tutorial")!));
    expect(container.querySelector<HTMLElement>(".lo-mechanic-coach")?.dataset.lessonMechanic).toBe("bubbles");
    expect(savedPractice()).toMatchObject({ scene: 0, round: 0, completed: [], supported: [] });
  });

  it("routes the clock to exactly one visible rig and closes it on pause and navigation", async () => {
    const speaking = () => [...container.querySelectorAll<HTMLElement>('[data-dummy-speaking="true"]')].map(element => element.dataset.dummyPerson);
    await mount(); expect(speaking()).toEqual([]);
    await click(button("Começar com som", intro())); expect(speaking()).toEqual(["nina"]);
    for (const actor of ["ana", "leo", "nina", "ana", "nina", "maya"]) {
      await ended(); expect(speaking()).toEqual([]);
      await click(button("Avançar", intro())); expect(speaking()).toEqual([actor]);
    }
    const cancelled = Media.current; const count = Media.calls.length;
    await click(button("Pausar apresentação", intro())); expect(speaking()).toEqual([]); expect(cancelled.paused).toBe(true);
    await ended(cancelled); expect(Media.calls).toHaveLength(count); expect(speaking()).toEqual([]);
    await click(button("Repetir apresentação", intro())); expect(speaking()).toEqual(["maya"]);
    await click(button("Avançar", intro())); expect(speaking()).toEqual(["nina"]); expect(intro().dataset.introductionStep).toBe("2");
    await click(button("Avançar", intro())); await click(button("Avançar", intro()));
    await click(button("Como funciona a aula", intro())); expect(speaking()).toEqual([]); expect(Media.all.every(media => media.paused)).toBe(true);
    expect(container.querySelector(".lo-tutorial")).not.toBeNull(); expect(Media.maxActive).toBe(1);
  });

  it("uses one course percentage through practice, completion, reload and full reset", async () => {
    const percent = (scope: ParentNode) => Number(scope.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow"));
    localStorage.setItem(INTRO, "done"); localStorage.setItem(TUTORIAL, "done"); seed("finished");
    await mount(); expect(savedPractice().completed).toHaveLength(29); expect(percent(conclusion())).toBe(78);
    for (let block = 0; block < 10; block++) await click(conclusionNext());
    expect(conclusion().dataset.conclusionPhase).toBe("test"); expect(percent(conclusion())).toBe(88);
    for (const question of CONCLUSION_QUESTIONS) {
      if (question.kind === "choice") await choose(conclusionModel(question)); else await input(conclusionModel(question));
      await click(conclusionNext()); expect(container.querySelector(".lc-feedback.is-correct")).not.toBeNull();
      await click(conclusionNext());
    }
    expect(conclusion().dataset.conclusionPhase).toBe("summary"); expect(percent(conclusion())).toBe(100);
    await remount(); expect(percent(conclusion())).toBe(100); expect(Object.keys(savedConclusion().attempts)).toHaveLength(6); expect(savedPractice().completed).toHaveLength(29);
    await click(button("Abrir percurso da aula")); await click(button("Recomeçar aula do zero", container.querySelector(".lo-menu")!)); await click(button("Recomeçar", container.querySelector('[aria-labelledby="lo-reset-title"]')!));
    expect(percent(intro())).toBe(0); expect(savedPractice().completed).toEqual([]); expect(localStorage.getItem(LESSON_CONCLUSION_STORAGE)).toBeNull(); expect(Media.calls.every(url => url.includes("revision-pt/nina-completion-congratulations.m4a"))).toBe(true); expect(Media.all.every(media => media.paused)).toBe(true);
  });
});
