// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWorkspaceStore } from "../src/features/dashboard/workspace-store";
import { GUEST_LEARNING_KEY } from "../src/features/dashboard/guest-learning";
import { LessonStorageContext, createLessonStorage, type LessonStorage } from "../src/features/first-encounters/lesson-storage";
import { LESSON_MECHANICS_STORAGE } from "../src/features/first-encounters/lesson-mechanics";
import { decodeLessonAccountSnapshot } from "../src/features/first-encounters/lesson-account-snapshot";
import catalog from "../src/features/first-encounters/lesson-one-audio.json";
import { LESSON_SCENES } from "../src/features/first-encounters/lesson-one";

vi.mock("../src/features/first-encounters/AnimatedCharacter", async () => {
  const { useEffect } = await import("react");
  return { AnimatedCharacter: function Character({ onReady }: { onReady?: () => void }) {
    useEffect(() => { onReady?.(); }, [onReady]);
    return createElement("span", { "data-ready-guide": "nina" });
  } };
});
vi.mock("next/dynamic", async () => {
  const { useEffect } = await import("react");
  return { default: () => function Character({ onReady }: { onReady?: () => void }) {
    useEffect(() => { onReady?.(); }, [onReady]); return createElement("span", { "data-stage-character": true });
  } };
});
vi.mock("../src/features/first-encounters/useLessonAccountProgress", () => ({
  useLessonAccountProgress: () => ({ ready: true, storage: window.localStorage, scopeKey: "isolated-word-coach", saving: false, error: "", notice: "", refresh: () => {}, reset: async () => {} }),
}));

import { LessonWordCoach, WORD_MEANINGS } from "../src/features/first-encounters/LessonWordCoach";
import { LessonOne } from "../src/features/first-encounters/LessonOne";

class Media extends EventTarget {
  static instances: Media[] = [];
  static calls: string[] = [];
  static current: Media;
  currentTime = 0; duration = 2; paused = true; ended = false; preload = "";
  constructor(readonly src: string) { super(); Media.instances.push(this); }
  play = vi.fn(async () => { Media.current = this; Media.calls.push(this.src); this.paused = false; this.ended = false; this.dispatchEvent(new Event("playing")); });
  pause = vi.fn(() => { this.paused = true; this.dispatchEvent(new Event("pause")); });
  load = vi.fn();
  end() { this.currentTime = this.duration; this.ended = true; this.paused = true; this.dispatchEvent(new Event("pause")); this.dispatchEvent(new Event("ended")); }
}

let root: Root, host: HTMLDivElement, frames: Map<number, FrameRequestCallback>, serial: number;
const open = vi.fn(), pieceClick = vi.fn();
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); vi.stubGlobal("Audio", Media);
  frames = new Map(); serial = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++serial, callback); return serial; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
  Media.instances = []; Media.calls = []; open.mockClear(); pieceClick.mockClear(); localStorage.clear();
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

async function guestStorage() {
  const request = vi.fn(async (_url: string, init?: RequestInit) => {
    expect(init?.method ?? "GET").toBe("GET");
    return Response.json({ error: "No account in this test" }, { status: 401 });
  });
  const store = createWorkspaceStore(request, () => localStorage, () => undefined);
  await store.load();
  expect(store.getSnapshot().status).toBe("unauthenticated");
  expect(store.getSnapshot().workspace).toBeNull();
  return { store, request, storage: createLessonStorage(store, store.getSnapshot().generation) };
}
async function render(storage: LessonStorage, word: string, enabled = true) {
  await act(async () => root.render(createElement(LessonStorageContext.Provider, { value: storage },
    createElement("button", { type: "button", "data-drag-kind": "word", "aria-label": word, onClick: pieceClick }, word),
    createElement(LessonWordCoach, { enabled, onOpen: open }))));
}
async function tap(word: string) {
  const piece = host.querySelector<HTMLButtonElement>(`[data-drag-kind="word"][aria-label="${word}"]`)!;
  await act(async () => { piece.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true })); });
  await act(async () => piece.click());
}
async function end(media = Media.current) { await act(async () => media.end()); }
async function settle() {
  for (let pass = 0; pass < 3; pass++) await act(async () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(performance.now())); });
}

describe("first contact with a word uses existing local recordings and survives guest restoration", () => {
  it.each(["I", "you", "we", "they", "am", "are"])("explains %s once, waits for a tap before its English model, and remembers it without an account", async word => {
    const first = await guestStorage();
    first.storage.setItem(LESSON_MECHANICS_STORAGE, JSON.stringify({ version: 1, seen: ["build"] }));
    await render(first.storage, word); await tap(word);
    const meaning = WORD_MEANINGS[word], guide = `/first-encounters/audio/revision-pt/nina-word-${word.toLowerCase()}.m4a`;
    const panel = host.querySelector<HTMLElement>(`[aria-label="Entenda ${word}"]`)!;
    expect(panel).not.toBeNull(); expect(panel.textContent).toContain(meaning.meaning);
    expect(panel.textContent).toContain(meaning.explanation); expect(panel.querySelector('[lang="en"]')?.textContent).toBe(word);
    expect(panel.querySelector(".lo-word-coach-example [lang=en]")?.textContent).toBe(meaning.example);
    expect(open).toHaveBeenCalledOnce(); expect(pieceClick).toHaveBeenCalledOnce();
    expect(Media.calls).toEqual([guide]);
    await end();
    expect(Media.calls).toEqual([guide]);
    await act(async () => panel.querySelector<HTMLButtonElement>('[aria-label="Ouvir exemplo da palavra"]')!.click());
    expect(Media.calls).toEqual([guide, catalog[`nina:${meaning.example}` as keyof typeof catalog]]);
    expect(Media.instances.filter(media => !media.paused)).toHaveLength(1);
    expect(JSON.parse(first.storage.getItem(LESSON_MECHANICS_STORAGE)!)).toEqual({ version: 1, seen: ["build"], words: [word] });
    const persisted = JSON.parse(localStorage.getItem(GUEST_LEARNING_KEY)!);
    expect(JSON.parse(decodeLessonAccountSnapshot(persisted.lessonSnapshot)!.mechanics!)).toEqual({ version: 1, seen: ["build"], words: [word] });

    await act(async () => root.render(null));
    expect(Media.instances.every(media => media.paused)).toBe(true);
    const restored = await guestStorage();
    await render(restored.storage, word); await tap(word);
    expect(host.querySelector(".lo-word-coach")).toBeNull();
    expect(open).toHaveBeenCalledOnce(); expect(pieceClick).toHaveBeenCalledTimes(2); expect(Media.calls).toHaveLength(2);
    expect(first.request).toHaveBeenCalledOnce(); expect(restored.request).toHaveBeenCalledOnce();
    first.store.reset(); restored.store.reset();
  });

  it("cancels a running explanation when disabled and ignores its old natural-end callback", async () => {
    const guest = await guestStorage(); await render(guest.storage, "we"); await tap("we");
    const pending = Media.current; expect(Media.calls).toHaveLength(1);
    await render(guest.storage, "we", false);
    expect(host.querySelector(".lo-word-coach")).toBeNull(); expect(pending.paused).toBe(true);
    await end(pending); expect(Media.calls).toHaveLength(1);
    await render(guest.storage, "we", true);
    expect(host.querySelector(".lo-word-coach")).toBeNull(); expect(Media.calls).toHaveLength(1);
    guest.store.reset();
  });

  it("lets the lesson cancel the coach before another channel starts, while explicit review remains available", async () => {
    const guest = await guestStorage(); await render(guest.storage, "you"); await tap("you");
    const original = Media.current;
    await act(async () => document.dispatchEvent(new Event("lesson-stop-word-coach")));
    expect(original.paused).toBe(true); expect(host.querySelector(".lo-word-coach")).toBeNull();
    await end(original); expect(Media.calls).toHaveLength(1);
    await tap("you"); expect(host.querySelector(".lo-word-coach")).toBeNull(); expect(Media.calls).toHaveLength(1);
    await act(async () => document.dispatchEvent(new CustomEvent("lesson-explain-word", { detail: "you" })));
    expect(host.querySelector('[aria-label="Entenda you"]')).not.toBeNull();
    expect(Media.calls).toHaveLength(2); expect(open).toHaveBeenCalledTimes(2);
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Fechar explicação da palavra"]')!.click());
    expect(Media.current.paused).toBe(true); expect(host.querySelector(".lo-word-coach")).toBeNull();
    guest.store.reset();
  });

  it("keeps first-touch help open after the active mechanic guide yields, and preserves the real touch placement", async () => {
    localStorage.setItem("basedspeak.lesson-one.introduction.v1", "done");
    localStorage.setItem("basedspeak.lesson-one.tutorial.v1", "done");
    const rounds = LESSON_SCENES.flatMap(scene => scene.rounds), index = rounds.findIndex(round => round.id === "g3-i");
    localStorage.setItem("basedspeak.lesson-one.v2", JSON.stringify({ version: 2, scene: 4, round: 0, completed: rounds.slice(0, index).map(round => round.id), supported: [] }));
    localStorage.setItem(LESSON_MECHANICS_STORAGE, JSON.stringify({ version: 1, seen: ["bubbles", "join", "speaker"] }));
    await act(async () => root.render(createElement(LessonOne))); await settle();
    expect(host.querySelector<HTMLElement>(".lo-app")?.dataset.mechanicGuide).toBe("verb");
    const guide = Media.current, piece = host.querySelector<HTMLButtonElement>('[data-lesson-drag-source][aria-label="am"]')!;
    expect(piece).not.toBeNull();
    for (const type of ["pointerdown", "pointerup"]) {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: 20, clientY: 30 });
      Object.defineProperties(event, { pointerId: { value: 7 }, pointerType: { value: "touch" }, isPrimary: { value: true } });
      await act(async () => piece.dispatchEvent(event));
    }
    await act(async () => piece.click()); await settle();
    expect(guide.paused).toBe(true); expect(host.querySelector('[aria-label="Entenda am"]')).not.toBeNull();
    expect(Media.calls.at(-1)).toContain("/lesson-one/nina-en-"); await end(Media.current);
    expect(piece.isConnected).toBe(true); expect(piece.getAttribute("aria-pressed")).toBe("true");
    expect(JSON.parse(localStorage.getItem(LESSON_MECHANICS_STORAGE)!).words).toEqual(["am"]);
    const count = Media.calls.length; await end(guide); expect(Media.calls).toHaveLength(count);
    await act(async () => host.querySelector<HTMLElement>('[data-lesson-drop="word:verb"]')!.click());
    expect(host.querySelector(".lo-feedback.is-correct")).toBeNull();
    await act(async () => host.querySelector<HTMLButtonElement>(".lo-footer .lo-next")!.click()); await settle();
    expect(host.querySelector(".lo-feedback.is-correct")).not.toBeNull(); expect(host.querySelector(".lo-word-coach")).toBeNull();
    expect(Media.calls.at(-1)).toBe(catalog["ana:I am Ana."]); expect(Media.instances.filter(media => !media.paused)).toHaveLength(1);
  });
});
