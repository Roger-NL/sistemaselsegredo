// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LESSON_SCENES, phraseText, type Round } from "../src/features/first-encounters/lesson-one";
import { createWorkspaceStore } from "../src/features/dashboard/workspace-store";
import { emptyGuestLearning } from "../src/features/dashboard/guest-learning";
import type { StudentWorkspace } from "../src/contracts/workspace";
import { accountLesson } from "./helpers/lesson-snapshot";

const editing = vi.hoisted(() => ({ begin: vi.fn(), end: vi.fn() }));

// Keep the real stage and real drag provider. Graphics and media output are replaced;
// autoplay and native media are covered by the dedicated audio suites.
vi.mock("next/dynamic", () => ({ default: () => ({ person, className }: { person: string; className?: string }) => createElement("span", { "data-character-dummy": person, className }) }));

// These suites exercise lesson interactions with isolated browser storage.
// Account ownership and synchronization are covered by lesson-account-storage.test.ts.
vi.mock("../src/features/first-encounters/useLessonAccountProgress", () => ({
  useLessonAccountProgress: () => ({ ready: true, storage: window.localStorage, scopeKey: "isolated-lesson", saving: false, error: "", notice: "", refresh: () => {}, reset: async () => {}, beginEdit: editing.begin, endEdit: editing.end }),
}));

import { LessonOne } from "../src/features/first-encounters/LessonOne";

const STORAGE = "basedspeak.lesson-one.v2";
const OLD_STORAGE = "basedspeak.first-encounters.v1";
const rounds = LESSON_SCENES.flatMap(scene => scene.rounds);
let root: Root;
let container: HTMLDivElement;
let frames: Map<number, FrameRequestCallback>;
let serial: number;
let underPointer: Element[];

beforeEach(() => {
  editing.begin.mockReset(); editing.end.mockReset();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("The local lesson must not make a network request in this test"); }));
  frames = new Map(); serial = 0; underPointer = [];
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++serial, callback); return serial; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  Object.defineProperty(document, "elementsFromPoint", { configurable: true, value: vi.fn(() => underPointer) });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) {
    if (this.open) throw new DOMException("Already open", "InvalidStateError");
    this.open = true;
  } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event("close"));
  } });
  localStorage.clear(); localStorage.setItem("basedspeak.lesson-one.introduction.v1","done");
  localStorage.setItem("basedspeak.lesson-one.tutorial.v1","done");
  localStorage.setItem("basedspeak.lesson-one.mechanics.v1",JSON.stringify({version:1,seen:["bubbles","join","speaker","verb","build","messages","ensemble","write"]}));
  vi.stubGlobal("Audio",class extends EventTarget {
    src:string;currentTime=0;duration=1;paused=true;ended=false;preload="";
    constructor(src:string){super();this.src=src;}
    play=async()=>{this.paused=false;this.dispatchEvent(new Event("playing"));};
    pause=()=>{this.paused=true;this.dispatchEvent(new Event("pause"));};
    load=()=>{};
  });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals();
});

function flushFrames() {
  const callbacks = [...frames.values()]; frames.clear();
  for (const callback of callbacks) callback(performance.now());
}
async function settle() { await act(async () => flushFrames()); }
async function mount() {
  await act(async () => root.render(createElement(LessonOne)));
  await settle(); await settle();
  expect(app().getAttribute("data-ready")).toBe("true");
}
function app(): HTMLElement { return container.querySelector<HTMLElement>(".lo-app")!; }
function currentRound(): string | undefined { return app().dataset.round; }
function footer(): HTMLButtonElement { return container.querySelector<HTMLButtonElement>(".lo-footer .lo-next")!; }
function saved(): { version: number; scene: number; round: number; completed: string[]; supported: string[] } { return JSON.parse(localStorage.getItem(STORAGE)!); }
function source(label: string): HTMLButtonElement {
  const found = [...container.querySelectorAll<HTMLButtonElement>("[data-lesson-drag-source]")].find(element => element.getAttribute("aria-label") === label);
  expect(found, `Drag source ${label} on ${currentRound()}`).toBeTruthy();
  return found!;
}
function target(id: string): HTMLElement {
  const found = [...container.querySelectorAll<HTMLElement>("[data-lesson-drop]")].find(element => element.dataset.lessonDrop === id);
  expect(found, `Drop target ${id} on ${currentRound()}`).toBeTruthy();
  return found!;
}
function person(id: string): HTMLButtonElement {
  const found = container.querySelector<HTMLButtonElement>(`[data-person="${id}"]`);
  expect(found, `Person ${id} on ${currentRound()}`).toBeTruthy();
  return found!;
}
async function click(element: HTMLElement) { await act(async () => element.click()); }
async function place(label: string, destination: string) {
  const item = source(label);
  await click(item);
  expect(item.getAttribute("aria-pressed")).toBe("true");
  await click(target(destination));
}
async function next() { await click(footer()); await settle(); }
function seedAt(id: string) {
  const index = rounds.findIndex(round => round.id === id);
  const sceneIndex = LESSON_SCENES.findIndex(scene => scene.rounds.some(round => round.id === id));
  const roundIndex = LESSON_SCENES[sceneIndex].rounds.findIndex(round => round.id === id);
  localStorage.setItem(STORAGE, JSON.stringify({ version: 2, scene: sceneIndex, round: roundIndex, completed: rounds.slice(0, index).map(round => round.id), supported: [] }));
}
async function pointer(element: EventTarget, type: string, x: number, y: number) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
  Object.defineProperties(event, { pointerId: { value: 7 }, isPrimary: { value: true }, pointerType: { value: "touch" } });
  await act(async () => element.dispatchEvent(event));
}
async function dragInto(item: HTMLElement, destination: HTMLElement) {
  vi.spyOn(item, "getBoundingClientRect").mockReturnValue({ x: 10, y: 20, left: 10, top: 20, right: 150, bottom: 70, width: 140, height: 50, toJSON: () => ({}) });
  item.setPointerCapture = vi.fn(); item.releasePointerCapture = vi.fn(); item.hasPointerCapture = vi.fn(() => true);
  underPointer = [destination];
  await pointer(item, "pointerdown", 25, 35);
  await pointer(document, "pointermove", 225, 135);
  expect(document.querySelector(".lesson-drag-ghost")).not.toBeNull();
  await pointer(document, "pointerup", 225, 135);
  underPointer = [];
  expect(document.querySelector(".lesson-drag-ghost")).toBeNull();
}
async function gradeAndAdvance(round: Round) {
  expect(currentRound()).toBe(round.id);
  switch (round.kind) {
    case "bubbles": {
      // Deliver through the actual nested PersonButton, rather than calling a callback.
      await click(source(phraseText(round.expected)));
      await click(person(round.speaker));
      break;
    }
    case "join":
      await dragInto(source("Ana"), target("team"));
      break;
    case "speaker":
      // Exercise the alternative correct member, not just the stored example speaker.
      await click(person(round.id === "g4-inside" ? "leo" : round.speaker));
      break;
    case "verb":
      await place(round.expected.verb, "word:verb");
      await next();
      break;
    case "build":
      await place(round.expected.pronoun, "word:pronoun");
      await place(round.expected.verb, "word:verb");
      await next();
      break;
    case "messages":
      for (const [index, turn] of round.ensemble!.entries()) await place({ ana: "Ana", leo: "Leo", maya: "Maya", sam: "Sam", nina: "Nina" }[turn.speaker], `message:${index}`);
      expect(container.querySelector(".lo-feedback.is-correct")).toBeNull();
      await next();
      break;
    case "ensemble":
      for (const [index, turn] of round.ensemble!.entries()) await place(phraseText(turn.expected), `turn:${index}`);
      expect(container.querySelector(".lo-feedback.is-correct")).toBeNull();
      await next();
      break;
  }
  expect(container.querySelector(".lo-feedback.is-correct"), round.id).not.toBeNull();
  expect(footer().disabled, round.id).toBe(false);
  await next();
}

describe("the actual twelve-scene lesson UI", () => {
  it.each([false, true])("releases an abandoned draft on unmount while preserving pending writes=%s", async pendingWrite => {
    let server: StudentWorkspace = { account: { id: "draft-owner", name: "Ana", email: "ana@example.test", role: "student", status: "active" }, learning: emptyGuestLearning(), activities: [], conversations: [], liveClass: null };
    let writes = 0;
    const store = createWorkspaceStore(async (_url, init) => {
      if (init?.method === "PUT") {
        writes++;
        server = { ...server, learning: { ...server.learning, ...JSON.parse(String(init.body)), saveVersion: server.learning.saveVersion + 1 } };
        return Response.json({ learning: server.learning });
      }
      return Response.json(server);
    }, undefined, () => undefined);
    await store.load();
    const generation = store.getSnapshot().generation;
    editing.begin.mockImplementation(() => { store.beginEdit(generation); });
    editing.end.mockImplementation(() => { store.endEdit(generation); });
    try {
      await mount();
      await click(container.querySelector<HTMLButtonElement>(".lo-write-toggle")!);
      const field = container.querySelector<HTMLInputElement>('[aria-label="Sua fala em inglês"]')!;
      await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, "im ana");
        field.dispatchEvent(new Event("input", { bubbles: true }));
      });
      expect(store.hasPendingChanges()).toBe(true);
      if (pendingWrite) store.stage("lessonSnapshot", accountLesson(10), generation);
      await act(async () => root.render(null));
      expect(store.hasPendingChanges()).toBe(pendingWrite);
      expect(writes).toBe(0);
      if (pendingWrite) {
        await store.flush();
        expect(writes).toBe(1);
        expect(server.learning.lessonSnapshot).toBe(accountLesson(10));
        expect(store.hasPendingChanges()).toBe(false);
      }
    } finally { store.reset(); }
  });

  it("marks an unsaved writing draft as editing and releases it when explicitly discarded", async () => {
    await mount();
    const toggle = container.querySelector<HTMLButtonElement>(".lo-write-toggle")!;
    await click(toggle);
    editing.begin.mockClear(); editing.end.mockClear();
    const field = container.querySelector<HTMLInputElement>('[aria-label="Sua fala em inglês"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, "im ana");
      field.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(editing.begin).toHaveBeenCalledOnce();
    expect(editing.end).not.toHaveBeenCalled();
    await click(container.querySelector<HTMLButtonElement>('[aria-label="Refazer atividade"]')!);
    expect(editing.end).toHaveBeenCalledOnce();
    expect(field.isConnected).toBe(false);
  });

  it("completes every round through real click/drop controls, including joining, words, messages and the full ensemble", async () => {
    await mount();
    const visited: string[] = [];
    for (const scene of LESSON_SCENES) {
      expect(app().dataset.scene).toBe(scene.id);
      for (const round of scene.rounds) {
        visited.push(currentRound()!);
        await gradeAndAdvance(round);
      }
    }
    expect(visited).toEqual(rounds.map(round => round.id));
    expect(app().dataset.finished).toBe("true");
    expect(container.querySelector('[data-conclusion-phase="theory"]')).not.toBeNull();
    expect(saved()).toMatchObject({ version: 2, scene: 12, round: 0, completed: rounds.map(round => round.id), supported: [] });
    expect(container.querySelector(".lc-english")?.textContent).toBe("I am");
  });

  it("keeps a wrong I/you relation on the same round and permits a meaningful retry", async () => {
    await mount();
    await click(source("You are Ana."));
    await click(person("ana"));
    expect(container.querySelector(".lo-feedback.is-retry")).not.toBeNull();
    await next();
    expect(currentRound()).toBe("g1-self");
    expect(saved().completed).toEqual([]);
    expect(container.querySelector(".lo-feedback")?.textContent).toContain("I se refere ao próprio falante");
    await click(source("I am Ana."));
    await click(person("ana"));
    expect(container.querySelector(".lo-feedback.is-correct")).not.toBeNull();
    await next();
    expect(currentRound()).toBe("g1-listener");
    expect(saved().completed).toEqual(["g1-self"]);
  });

  it("accepts I are as understood meaning, records form support and continues without rewriting", async () => {
    seedAt("g3-i"); await mount();
    await place("are", "word:verb");
    await next();
    expect(currentRound()).toBe("g3-i");
    expect(container.querySelector(".lo-feedback.is-correct")?.textContent).toContain("Você se fez entender");
    expect(container.querySelector(".lo-feedback")?.textContent).toContain("I am Ana.");
    expect(saved().supported).toContain("g3-i");
    expect(container.querySelector("input")).toBeNull();
    expect(footer().textContent).toContain("Continuar");
    await next();
    expect(currentRound()).toBe("g3-you");
    expect(saved().completed).toContain("g3-i");
  });

  it("ignores the old course storage and resumes only contiguous v2 progress after remount", async () => {
    localStorage.setItem(OLD_STORAGE, JSON.stringify({ version: 1, position: 36, passed: ["finished"] }));
    await mount();
    expect(currentRound()).toBe("g1-self");
    await gradeAndAdvance(rounds[0]);
    expect(currentRound()).toBe("g1-listener");
    const actual = saved();
    await act(async () => root.unmount());
    root = createRoot(container);
    await mount();
    expect(currentRound()).toBe("g1-listener");
    expect(saved().completed).toEqual(actual.completed);
    await act(async () => root.unmount());
    root = createRoot(container);
    localStorage.setItem(STORAGE, JSON.stringify({ version: 2, scene: 11, round: 99, completed: [rounds[0].id, rounds[1].id, rounds[5].id], supported: ["missing-round"] }));
    await mount();
    expect(app().dataset.scene).toBe("lesson-02");
    expect(currentRound()).toBe("use1-self");
    expect(saved()).toMatchObject({ scene: 1, round: 0, completed: [rounds[0].id, rounds[1].id], supported: [] });
  });

  it("keeps the native menu closed by default and blocks later games until their preceding use is complete", async () => {
    await mount();
    const menu = container.querySelector<HTMLDialogElement>(".lo-menu")!;
    expect(menu.open).toBe(false);
    await click(container.querySelector<HTMLButtonElement>('[aria-label="Abrir percurso da aula"]')!);
    expect(menu.open).toBe(true);
    let links = [...menu.querySelectorAll<HTMLButtonElement>("nav button")];
    expect(links.map(link => link.disabled)).toEqual([false, true, true, true, true, true]);
    await click(links[5]);
    expect(currentRound()).toBe("g1-self");
    await click(menu.querySelector<HTMLButtonElement>('[aria-label="Fechar percurso"]')!);
    expect(menu.open).toBe(false);
    for (const round of rounds.slice(0, 4)) await gradeAndAdvance(round);
    await click(container.querySelector<HTMLButtonElement>('[aria-label="Abrir percurso da aula"]')!);
    links = [...menu.querySelectorAll<HTMLButtonElement>("nav button")];
    expect(links.map(link => link.disabled)).toEqual([false, false, true, true, true, true]);
    await click(links[4]);
    expect(app().dataset.scene).toBe("lesson-03");
    await click(links[0]);
    expect(menu.open).toBe(false);
    expect(currentRound()).toBe("g1-self");
    expect(saved().completed).toEqual(rounds.slice(0, 4).map(round => round.id));
  });
});
