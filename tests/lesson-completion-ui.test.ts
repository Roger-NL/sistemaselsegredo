// @vitest-environment jsdom
import { act, createElement, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONCLUSION_QUESTIONS, LESSON_CONCLUSION_STORAGE, conclusionModel, createConclusionState, setConclusionDraft, submitConclusionAnswer } from "../src/features/first-encounters/lesson-conclusion";
import type { LessonSpeechDriver } from "../src/features/first-encounters/lesson-audio";
import type { IntroductionScene } from "../src/features/first-encounters/lesson-introduction";
import type { PersonId } from "../src/features/first-encounters/lesson-one";

const sounds = vi.hoisted(() => ({ play: vi.fn(), unlock: vi.fn() }));
const characters = vi.hoisted(() => ({ readyImmediately: true, ready: null as ((person: PersonId) => void) | null }));
vi.mock("../src/features/first-encounters/useLessonSounds", () => ({ useLessonSounds: () => sounds }));
vi.mock("../src/features/first-encounters/IntroductionStage", async () => {
  const { useEffect, useRef } = await import("react");
  return { IntroductionStage: function Stage({ scene, modelIndex, speech, onCharacterReady }: {
    scene: IntroductionScene; modelIndex: number | null; speech: LessonSpeechDriver; onCharacterReady: (person: PersonId) => void;
  }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { characters.ready = onCharacterReady; if (characters.readyImmediately) for (const person of ["nina", "ana", "leo", "maya"] as const) onCharacterReady(person); }, [onCharacterReady]);
    useEffect(() => speech.subscribeFrame(frame => {
      if (!ref.current) return;
      ref.current.dataset.speaking = String(frame.playing);
      ref.current.dataset.voice = frame.person ?? "";
      ref.current.dataset.role = frame.role;
    }), [speech]);
    return createElement("div", { ref, "data-completion-stage": modelIndex === null ? "nina" : scene.models[modelIndex].speaker });
  } };
});
import { LessonConclusion, type LessonCompletionProps } from "../src/features/first-encounters/LessonConclusion";
import { LessonStorageContext } from "../src/features/first-encounters/lesson-storage";
import type { LessonCompletionReceipt } from "../src/features/first-encounters/useLessonAccountProgress";

class Media extends EventTarget {
  static all: Media[] = []; static calls: string[] = []; static current: Media; static maxActive = 0;
  src: string; currentTime = 0; duration = 2; paused = true; ended = false; preload = "";
  constructor(url: string) { super(); this.src = url; Media.all.push(this); }
  play = vi.fn(async () => { this.paused = false; this.ended = false; Media.current = this; Media.calls.push(this.src);
    Media.maxActive = Math.max(Media.maxActive, Media.all.filter(audio => !audio.paused && !audio.ended).length); this.dispatchEvent(new Event("playing")); });
  pause = vi.fn(() => { this.paused = true; this.dispatchEvent(new Event("pause")); });
  load = vi.fn();
  end() { this.currentTime = this.duration; this.ended = true; this.paused = true; this.dispatchEvent(new Event("pause")); this.dispatchEvent(new Event("ended")); }
}

let root: Root, host: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); vi.stubGlobal("Audio", Media);
  vi.stubGlobal("requestAnimationFrame", () => 1); vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("A completion must not generate or request remote speech."); }));
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  Media.all = []; Media.calls = []; Media.maxActive = 0; sounds.play.mockClear(); characters.readyImmediately = true; characters.ready = null; localStorage.clear();
  let saved = createConclusionState();
  for (const question of CONCLUSION_QUESTIONS) saved = submitConclusionAnswer(setConclusionDraft(saved, question, conclusionModel(question)), question);
  localStorage.setItem(LESSON_CONCLUSION_STORAGE, JSON.stringify({ ...saved, phase: "summary", testStarted: true, theoryIndex: 4, questionIndex: 5 }));
  localStorage.setItem("basedspeak.lesson-one.v2", "practice-is-preserved");
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); localStorage.clear(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
function completion(overrides: Partial<LessonCompletionProps> = {}): LessonCompletionProps {
  return { verify: vi.fn(async () => "guest-local" as const), leave: vi.fn(), version: 0, account: false, saving: false, error: "", ...overrides };
}
async function mount(props = completion()) {
  await act(async () => root.render(createElement(LessonConclusion, { onReturnToPractice: vi.fn(), completion: props })));
}
async function click(selector: string) { const button = host.querySelector<HTMLButtonElement>(selector); expect(button).not.toBeNull(); await act(async () => button!.click()); }
async function end() { await act(async () => Media.current.end()); }

describe("lesson completion", () => {
  it("celebrates first and plays one recap example per explicit advance", async () => {
    characters.readyImmediately = false;
    await mount();
    expect(host.querySelector(".lc-achievement")?.textContent).toContain("Parabéns!");
    expect(host.querySelector(".lc-recap")).toBeNull();
    expect(Media.calls).toHaveLength(0);
    await act(async () => characters.ready?.("nina"));
    expect(Media.calls).toHaveLength(1);
    await end();
    expect(Media.calls).toHaveLength(1);
    await click(".lc-completion-actions button");
    expect(host.querySelector(".lc-recap-english")?.textContent).toBe("I am Ana.");
    expect(Media.calls.at(-1)).toContain("ana-i-am-ana.m4a");
    const count = Media.calls.length;
    await end();
    expect(Media.calls.length).toBe(count);
    expect(host.querySelector(".lc-recap-position")?.textContent).toMatch(/^Fala 1 de/);
    const advance = () => Array.from(host.querySelectorAll<HTMLButtonElement>(".lc-recap-controls button")).find(button => button.textContent === "Avançar");
    await act(async () => advance()!.click());
    expect(Media.calls.at(-1)).toContain("leo-you-are-ana.m4a");
    expect(Media.maxActive).toBe(1);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows completion before the CTA and checks the account again before leaving", async () => {
    let rejectSave!: (error: Error) => void;
    const verify = vi.fn<() => Promise<LessonCompletionReceipt>>().mockResolvedValue("account");
    const props = completion({ account: true, verify });
    await mount(props);
    expect(host.querySelector("h1")?.textContent).toBe("Aula 1 concluída!");
    expect(host.textContent).toContain("49 de 49 etapas salvas na sua conta.");
    expect(host.querySelector(".lc-complete")?.textContent).toBe("Voltar ao meu painel");
    expect(props.leave).not.toHaveBeenCalled();
    verify.mockImplementationOnce(() => new Promise((_, reject) => { rejectSave = reject; }));
    const before = localStorage.getItem(LESSON_CONCLUSION_STORAGE);
    await end();
    await click(".lc-complete"); await click(".lc-complete");
    expect(verify).toHaveBeenCalledTimes(2);
    expect(host.textContent).not.toContain("etapas salvas na sua conta");
    expect(host.querySelector<HTMLButtonElement>(".lc-complete")?.disabled).toBe(true);
    expect(host.textContent).toContain("Confirmando seu avanço…");
    expect(Media.all.every(audio => audio.paused)).toBe(true);
    await act(async () => rejectSave(new Error("not saved")));
    expect(host.querySelector<HTMLButtonElement>(".lc-complete")?.disabled).toBe(false);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Não foi possível confirmar seu avanço");
    expect(host.querySelector(".lc-complete")?.textContent).toBe("Tentar confirmar novamente");
    expect(localStorage.getItem(LESSON_CONCLUSION_STORAGE)).toBe(before);
    expect(localStorage.getItem("basedspeak.lesson-one.v2")).toBe("practice-is-preserved");
    await click(".lc-complete"); expect(props.leave).not.toHaveBeenCalled();
    await click(".lc-complete"); expect(props.leave).toHaveBeenCalledExactlyOnceWith("/dashboard");
  });

  it("warns the visitor before leaving if local persistence becomes unavailable", async () => {
    const verify = vi.fn<() => Promise<LessonCompletionReceipt>>().mockResolvedValueOnce("guest-local").mockResolvedValue("guest-session");
    const props = completion({ verify });
    await mount(props);
    expect(host.querySelector(".lc-complete")?.textContent).toBe("Entrar ou criar conta");
    expect(host.textContent).toContain("Avanço salvo neste navegador. No painel, você pode levá-lo para uma conta sem progresso.");
    await click(".lc-complete"); expect(props.leave).not.toHaveBeenCalled();
    expect(host.textContent).toContain("apenas nesta sessão. Ao sair, você poderá perdê-lo.");
    expect(host.textContent).not.toContain("salvo neste navegador");
    await click(".lc-complete"); expect(props.leave).toHaveBeenCalledExactlyOnceWith("/comecar?modo=entrar");
  });

  it("does not claim a save or enable departure while verification is outstanding", async () => {
    let resolve!: (receipt: LessonCompletionReceipt) => void;
    const props = completion({ verify: vi.fn(() => new Promise<LessonCompletionReceipt>(done => { resolve = done; })) });
    await mount(props);
    expect(host.querySelector("h1")?.textContent).toBe("Aula 1 concluída!");
    expect(host.querySelector<HTMLButtonElement>(".lc-complete")?.disabled).toBe(true);
    expect(host.textContent).not.toContain("salvo neste navegador");
    await act(async () => resolve("guest-local"));
    expect(host.querySelector<HTMLButtonElement>(".lc-complete")?.disabled).toBe(false);
    expect(props.leave).not.toHaveBeenCalled();
  });

  it("discards a late confirmation after a new version arrives or the summary unmounts", async () => {
    const verify = vi.fn<() => Promise<LessonCompletionReceipt>>().mockResolvedValueOnce("account");
    let previous!: (receipt: LessonCompletionReceipt) => void;
    let current!: (receipt: LessonCompletionReceipt) => void;
    verify.mockImplementationOnce(() => new Promise(done => { previous = done; }));
    verify.mockImplementationOnce(() => new Promise(done => { current = done; }));
    const props = completion({ account: true, verify });
    await mount(props);
    await click(".lc-complete");
    await mount({ ...props, version: 1 });
    await act(async () => previous("account"));
    expect(host.textContent).not.toContain("etapas salvas na sua conta");
    expect(props.leave).not.toHaveBeenCalled();
    await act(async () => { root.unmount(); root = createRoot(host); current("account"); });
    expect(props.leave).not.toHaveBeenCalled();
  });

  it("keeps optional practice independent of saved answers and leaves the achievement available", async () => {
    await mount();
    const before = localStorage.getItem(LESSON_CONCLUSION_STORAGE);
    await click(".lc-completion-actions button:last-child");
    expect(host.textContent).toContain("Como Nina pergunta");
    await click('input[value="Are you ready?"]');
    await click('button[form="lc-answer-form"]');
    expect(host.textContent).toContain("Isso mesmo.");
    expect(localStorage.getItem(LESSON_CONCLUSION_STORAGE)).toBe(before);
    await click(".lc-back");
    expect(host.querySelector(".lc-achievement")).not.toBeNull();
  });

  it.each(["teoria", "teste", "extras"] as const)("keeps %s isolated from new, partial and completed account records", async section => {
    for (const saved of [null, JSON.stringify(createConclusionState()), localStorage.getItem(LESSON_CONCLUSION_STORAGE)]) {
      const storage = { getItem: vi.fn(() => saved), setItem: vi.fn(), removeItem: vi.fn() };
      const props = completion();
      await act(async () => root.render(createElement(LessonStorageContext.Provider, { value: storage },
        createElement(LessonConclusion, { key: String(saved), section, completion: props, onReturnToPractice: vi.fn() }))));
      if (section === "teoria") await click(".lc-next");
      else {
        await click('input[type="radio"]');
        await click('button[form="lc-answer-form"]');
        await click(".lc-test-restart");
      }
      expect(storage.getItem).not.toHaveBeenCalled();
      expect(storage.setItem).not.toHaveBeenCalled();
      expect(storage.removeItem).not.toHaveBeenCalled();
      expect(props.verify).not.toHaveBeenCalled();
    }
  });

  it("starts the real Nina clip once through the Strict Mode effect remount", async () => {
    await act(async () => root.render(createElement(StrictMode, null, createElement(LessonConclusion, { onReturnToPractice: vi.fn(), completion: completion() }))));
    expect(Media.calls).toHaveLength(1);
    expect(Media.calls[0]).toContain("revision-pt/nina-completion-congratulations.m4a");
    expect(Media.maxActive).toBe(1);
  });
});
