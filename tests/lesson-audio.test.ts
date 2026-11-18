// @vitest-environment jsdom
import { act, createElement, StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLessonAudioController, createLessonSpeechEnvelope, sampleLessonSpeechEnvelope, getLessonAudioClip, getLessonAudioCoverage, getLessonAudioKey, getLessonAudioRequirements, validateLessonAudioCatalog, type LessonSpeechEnvelope } from "../src/features/first-encounters/lesson-audio";
import { useLessonAudio } from "../src/features/first-encounters/useLessonAudio";

const { catalog } = vi.hoisted(() => ({ catalog: {
  "ana:I am Ana.": "/first-encounters/audio/lesson-one/ana-i-am-ana.mp3",
  "leo:You are Ana.": "/first-encounters/audio/lesson-one/leo-you-are-ana.mp3",
} }));
vi.mock("../src/features/first-encounters/lesson-one-audio.json", () => ({ default: catalog }));

function deferred<T = void>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
class FakeAudio extends EventTarget {
  currentTime = 0;
  preload = "";
  paused = true;
  ended = false;
  duration = 1;
  pending: Promise<void>[] = [];
  constructor(readonly url: string) { super(); }
  play = vi.fn(() => (this.pending.shift() ?? Promise.resolve()).then(() => { this.paused = false; }));
  pause = vi.fn(() => { this.paused = true; });
  load = vi.fn();
  emit(type: string) { this.dispatchEvent(new Event(type)); }
  element() { return this as unknown as HTMLAudioElement; }
}
function fixture(options: Parameters<typeof createLessonAudioController>[0] = {}) {
  const elements: FakeAudio[] = [];
  const createAudio = vi.fn((url: string) => { const audio = new FakeAudio(url); elements.push(audio); return audio.element(); });
  return { controller: createLessonAudioController({ catalog, createAudio, ...options }), elements, createAudio };
}

beforeEach(() => vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("recorded lesson audio catalog", () => {
  it("matches the full person and exact utterance, without inventing a fallback", () => {
    expect(getLessonAudioKey("ana", "I am Ana.")).toBe("ana:I am Ana.");
    expect(getLessonAudioClip("ana", "I am Ana.")).toBe(catalog["ana:I am Ana."]);
    expect(getLessonAudioClip("leo", "I am Ana.")).toBeUndefined();
    expect(getLessonAudioClip("ana", "I am Ana")).toBeUndefined();
    expect(getLessonAudioClip("ana", "I am Ana.", { "ana:I am Ana.": "https://voice.example/generate" })).toBeUndefined();
    expect(getLessonAudioClip("ana", "I am Ana.", { "ana:I am Ana.": "/first-encounters/audio/lesson-one/leo-i-am-ana.mp3" })).toBeUndefined();
    expect(getLessonAudioClip("ana", "I am Ana.", { "ana:I am Ana.": "/first-encounters/audio/lesson-one/ana-i-am-ana.m4a" })).toBe("/first-encounters/audio/lesson-one/ana-i-am-ana.m4a");
    expect(getLessonAudioClip("ana", "I am Ana.", { "ana:I am Ana.": "/first-encounters/audio/lesson-one/ana-i-am-ana.wav" })).toBe("/first-encounters/audio/lesson-one/ana-i-am-ana.wav");
  });

  it("reports malformed catalogs and limits paths to the intended local media", () => {
    expect(validateLessonAudioCatalog(catalog)).toEqual({ valid: true, errors: [], entries: 2 });
    expect(validateLessonAudioCatalog([]).valid).toBe(false);
    const report = validateLessonAudioCatalog({ "missing-person": "x", "ana:": "x", "ana:I am Ana.": "/api/generate" });
    expect(report.valid).toBe(false); expect(report.errors).toHaveLength(3);
  });

  it("covers deduplicated correct models, alternative valid speakers and anonymous Nina reading", () => {
    const requirements = getLessonAudioRequirements();
    expect(requirements.map(item => item.key)).toEqual(expect.arrayContaining(["maya:Are you ready?", "nina:Are you ready?", "ana:We are ready.", "nina:They are friends."]));
    expect(requirements.map(item => item.key)).toContain("leo:We are a team.");
    expect(requirements.map(item => item.key)).toContain("nina:We are a team.");
    expect(requirements.map(item => item.key)).toContain("nina:They are a team.");
    expect(requirements.map(item => item.key)).toContain("nina:I am Ana.");
    expect(requirements.map(item => item.key)).toContain("nina:You are Sam.");
    expect(requirements.map(item => item.key)).toContain("leo:You are Ana.");
    expect(requirements.map(item => item.key)).toContain("nina:You are Nina.");
    expect(requirements.map(item => item.key)).toContain("nina:I am Nina.");
    expect(requirements.map(item => item.key)).toContain("leo:You are Nina.");
    expect(requirements.map(item => item.key)).toContain("leo:They are a team.");
    expect(requirements.map(item => item.key)).not.toContain("maya:I am Nina.");
    expect(new Set(requirements.map(item => item.key)).size).toBe(requirements.length);
    const complete = Object.fromEntries(requirements.map((item, index) => [item.key, `/first-encounters/audio/lesson-one/${item.person}-clip-${index}.mp3`]));
    expect(getLessonAudioCoverage(complete).complete).toBe(true);
    expect(getLessonAudioCoverage(complete).missing).toEqual([]);
    delete complete[requirements[0].key];
    expect(getLessonAudioCoverage(complete).missing).toEqual([requirements[0]]);
  });

  it("covers the lesson models and keeps every recording backed by a local asset", () => {
    const readCatalog = (name: string) => JSON.parse(readFileSync(resolve("src/features/first-encounters", name), "utf8"));
    const published = { ...readCatalog("lesson-one-audio.json"), ...readCatalog("lesson-vocabulary-audio.json") };
    expect(validateLessonAudioCatalog(published).valid).toBe(true);
    expect(getLessonAudioCoverage(published).missing).toEqual([]);
    expect(getLessonAudioClip("nina", "ready")).toBeDefined();
    for (const [key, url] of Object.entries(published as Record<string, string>)) {
      expect(existsSync(resolve("public", url.slice(1))), key).toBe(true);
    }
  });
});

describe("media lifecycle and races", () => {
  it("creates nothing until play, reuses one Audio per URL, and starts repeats from zero", async () => {
    const { controller, elements, createAudio } = fixture();
    expect(createAudio).not.toHaveBeenCalled(); expect(controller.has("ana", "I am Ana.")).toBe(true);
    await controller.play("ana", "I am Ana.");
    expect(controller.getSnapshot().playingKey).toBe("ana:I am Ana.");
    elements[0].currentTime = 1.2;
    await controller.play("ana", "I am Ana.");
    expect(createAudio).toHaveBeenCalledOnce(); expect(elements[0].currentTime).toBe(0);
    expect(elements[0].preload).toBe("none"); expect(elements[0].play).toHaveBeenCalledTimes(2);
    controller.dispose();
  });

  it("keeps a replay active when its cached element receives a stale pause event", async () => {
    const { controller, elements } = fixture();
    await controller.play("ana", "I am Ana.");
    await controller.play("ana", "I am Ana.");
    elements[0].dispatchEvent(new Event("pause"));
    expect(controller.getSnapshot().playingKey).toBe("ana:I am Ana.");
    controller.dispose();
  });

  it("reports actual playback, clears on ended, and retains pause position until a replay", async () => {
    const { controller, elements } = fixture();
    await controller.play("ana", "I am Ana.");
    elements[0].currentTime = 0.5; controller.pause();
    expect(elements[0].paused).toBe(true); expect(elements[0].currentTime).toBe(0.5);
    expect(controller.getSnapshot().playingKey).toBeNull();
    await controller.play("ana", "I am Ana."); elements[0].emit("ended");
    expect(controller.getSnapshot()).toEqual({ playingKey: null, error: null, blocked: false });
    controller.dispose();
  });

  it("does not mark pending playback as playing and stops an old late promise after B starts", async () => {
    const { controller, elements } = fixture();
    const a = deferred();
    // Creation occurs synchronously, while playback settles in a later microtask.
    const first = controller.play("ana", "I am Ana.");
    await first;
    elements[0].pending.push(a.promise);
    const pendingA = controller.play("ana", "I am Ana.");
    expect(controller.getSnapshot().playingKey).toBeNull();
    await controller.play("leo", "You are Ana.");
    a.resolve(); await pendingA;
    expect(controller.getSnapshot().playingKey).toBe("leo:You are Ana.");
    expect(elements[0].paused).toBe(true); expect(elements[1].paused).toBe(false);
    controller.dispose();
  });

  it("does not let a stale promise pause a newer replay of the same cached element", async () => {
    const { controller, elements } = fixture();
    await controller.play("ana", "I am Ana.");
    const old = deferred(); elements[0].pending.push(old.promise);
    const olderRequest = controller.play("ana", "I am Ana.");
    await controller.play("ana", "I am Ana.");
    const pauses = elements[0].pause.mock.calls.length;
    old.resolve(); await olderRequest;
    expect(elements[0].pause).toHaveBeenCalledTimes(pauses);
    expect(elements[0].paused).toBe(false);
    expect(controller.getSnapshot().playingKey).toBe("ana:I am Ana.");
    controller.dispose();
  });

  it("stops a pending request permanently when moving away, without stale state or errors", async () => {
    const { controller, elements } = fixture();
    await controller.play("ana", "I am Ana.");
    const pending = deferred(); elements[0].pending.push(pending.promise);
    const play = controller.play("ana", "I am Ana.");
    controller.stop(); pending.resolve(); await play;
    expect(controller.getSnapshot()).toEqual({ playingKey: null, error: null, blocked: false });
    expect(elements[0].paused).toBe(true); expect(elements[0].currentTime).toBe(0);
    controller.dispose();
  });

  it("ignores A rejection and old events after B takes over", async () => {
    const { controller, elements } = fixture();
    await controller.play("ana", "I am Ana.");
    const pending = deferred(); elements[0].pending.push(pending.promise);
    const old = controller.play("ana", "I am Ana.");
    await controller.play("leo", "You are Ana.");
    elements[0].emit("error"); elements[0].emit("ended");
    pending.reject(new Error("aborted")); await old;
    expect(controller.getSnapshot()).toEqual({ playingKey: "leo:You are Ana.", error: null, blocked: false });
    controller.dispose();
  });

  it("allows network failure retry on the same cached element, with no task lock", async () => {
    const { controller, elements, createAudio } = fixture();
    await controller.play("ana", "I am Ana."); elements[0].emit("error");
    expect(controller.getSnapshot().error).toMatch(/Tente novamente/);
    expect(controller.getSnapshot().playingKey).toBeNull();
    await controller.play("ana", "I am Ana.");
    expect(elements[0].load).toHaveBeenCalledOnce(); expect(createAudio).toHaveBeenCalledOnce();
    expect(controller.getSnapshot()).toEqual({ playingKey: "ana:I am Ana.", error: null, blocked: false });
    controller.dispose();
  });

  it("stops previous playback for an unavailable phrase and can retry a blocked play", async () => {
    const { controller, elements } = fixture();
    await controller.play("ana", "I am Ana.");
    await controller.play("maya", "I am Maya.");
    expect(elements[0].paused).toBe(true); expect(controller.getSnapshot().error).toMatch(/não tem áudio/);
    const denied = deferred(); elements[0].pending.push(denied.promise);
    const attempt = controller.play("ana", "I am Ana."); denied.reject(new Error("NotAllowedError")); await attempt;
    expect(controller.getSnapshot().error).toMatch(/Tente novamente/);
    await controller.play("ana", "I am Ana."); expect(controller.getSnapshot().error).toBeNull();
    controller.dispose();
  });
});

describe("hook scene boundaries", () => {
  it("stops on a scope change, hidden document, pagehide and unmount", async () => {
    const elements: FakeAudio[] = [];
    vi.stubGlobal("Audio", function Audio(url: string) { const audio = new FakeAudio(url); elements.push(audio); return audio.element(); });
    let hook!: ReturnType<typeof useLessonAudio>;
    function Reader({ scope }: { scope: string }) {
      const audio = useLessonAudio(scope);
      useEffect(() => { hook = audio; }, [audio]);
      return createElement("output", null, audio.playingKey ?? "idle");
    }
    const node = document.createElement("div"), root = createRoot(node);
    await act(async () => root.render(createElement(Reader, { scope: "round-a" })));
    expect(elements).toHaveLength(0);
    await act(async () => hook.play("ana", "I am Ana."));
    expect(node.textContent).toBe("ana:I am Ana.");
    await act(async () => root.render(createElement(Reader, { scope: "round-b" })));
    expect(elements[0].paused).toBe(true); expect(node.textContent).toBe("idle");
    await act(async () => hook.play("ana", "I am Ana."));
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    await act(async () => document.dispatchEvent(new Event("visibilitychange")));
    expect(elements[0].paused).toBe(true); expect(node.textContent).toBe("idle");
    await act(async () => hook.play("ana", "I am Ana."));
    await act(async () => window.dispatchEvent(new Event("pagehide")));
    expect(elements[0].paused).toBe(true);
    await act(async () => hook.play("ana", "I am Ana."));
    await act(async () => root.unmount()); expect(elements[0].paused).toBe(true);
  });

  it("remains usable after React Strict Mode's cleanup/remount", async () => {
    const elements: FakeAudio[] = [];
    vi.stubGlobal("Audio", function Audio(url: string) { const audio = new FakeAudio(url); elements.push(audio); return audio.element(); });
    let hook!: ReturnType<typeof useLessonAudio>;
    function Reader() {
      const audio = useLessonAudio("round");
      useEffect(() => { hook = audio; }, [audio]);
      return createElement("output", null, audio.playingKey ?? "idle");
    }
    const node = document.createElement("div"), root = createRoot(node);
    await act(async () => root.render(createElement(StrictMode, null, createElement(Reader))));
    await act(async () => hook.play("ana", "I am Ana."));
    expect(node.textContent).toBe("ana:I am Ana."); expect(elements).toHaveLength(1);
    await act(async () => root.unmount());
  });
});

describe("autoplay policy and completion", () => {
  it("separates blocked autoplay from errors and retries the pending clip synchronously on activation", async () => {
    const { controller, elements } = fixture();
    await controller.play("ana", "I am Ana.");
    const denied = deferred(); elements[0].pending.push(denied.promise);
    const complete = vi.fn();
    const attempt = controller.request("ana", "I am Ana.", { autoplay: true, role: "character", onEnded: complete });
    denied.reject(new DOMException("gesture required", "NotAllowedError"));
    expect(await attempt).toBe(false);
    expect(controller.getSnapshot()).toEqual({ playingKey: null, error: null, blocked: true });
    expect(controller.speech.getFrame()).toMatchObject({ playing: false, level: 0, person: null });
    const before = elements[0].play.mock.calls.length;
    const activate = controller.unlock();
    expect(elements[0].play).toHaveBeenCalledTimes(before + 1);
    expect(await activate).toBe(true);
    expect(controller.getSnapshot().blocked).toBe(false);
    expect(controller.speech.getFrame()).toMatchObject({ role: "character", person: "ana", text: "I am Ana." });
    expect(elements[0].load).not.toHaveBeenCalled();
    elements[0].ended = true; elements[0].paused = true; elements[0].currentTime = elements[0].duration;
    elements[0].emit("pause");
    elements[0].emit("ended"); elements[0].emit("ended");
    expect(complete).toHaveBeenCalledOnce();
    controller.dispose();
  });

  it("cannot resurrect a blocked clip after a scope stop or a newer request", async () => {
    const { controller, elements } = fixture();
    await controller.play("ana", "I am Ana.");
    const denied = deferred(); elements[0].pending.push(denied.promise);
    const old = controller.request("ana", "I am Ana.", { autoplay: true });
    await controller.request("leo", "You are Ana.", { role: "character" });
    denied.reject(new DOMException("old policy rejection", "NotAllowedError")); await old;
    expect(controller.getSnapshot()).toEqual({ playingKey: "leo:You are Ana.", error: null, blocked: false });
    controller.stop(); expect(await controller.unlock()).toBe(false);
    expect(controller.getSnapshot().playingKey).toBeNull();
    controller.dispose();
  });

  it("resumes a paused real position and never calls onEnded for pause, stop or error", async () => {
    const { controller, elements } = fixture();
    const complete = vi.fn();
    await controller.request("ana", "I am Ana.", { role: "character", onEnded: complete });
    elements[0].currentTime = .35; controller.pause();
    expect(controller.speech.getFrame().level).toBe(0);
    expect(await controller.resume()).toBe(true); expect(elements[0].currentTime).toBe(.35);
    controller.stop(); elements[0].emit("ended"); expect(complete).not.toHaveBeenCalled();
    await controller.request("ana", "I am Ana.", { onEnded: complete });
    elements[0].emit("error"); elements[0].emit("ended"); expect(complete).not.toHaveBeenCalled();
    expect(controller.speech.getFrame()).toMatchObject({ playing: false, level: 0 });
    controller.dispose();
  });

  it("runs only the current natural-end callback, allowing the callback to start the next clip", async () => {
    const { controller, elements } = fixture();
    const oldComplete = vi.fn(), nextComplete = vi.fn();
    await controller.request("ana", "I am Ana.", { onEnded: oldComplete });
    await controller.request("leo", "You are Ana.", { onEnded: nextComplete });
    elements[0].emit("ended"); expect(oldComplete).not.toHaveBeenCalled();
    elements[1].emit("ended"); expect(nextComplete).toHaveBeenCalledOnce();
    const sequence = vi.fn(() => { void controller.request("leo", "You are Ana."); });
    await controller.request("ana", "I am Ana.", { onEnded: sequence });
    elements[0].emit("ended"); await Promise.resolve(); await Promise.resolve();
    expect(sequence).toHaveBeenCalledOnce(); expect(controller.getSnapshot().playingKey).toBe("leo:You are Ana.");
    controller.dispose();
  });
});

describe("speech envelope and the real media clock", () => {
  const envelope: LessonSpeechEnvelope = { duration: .6, binSeconds: .2, levels: new Float32Array([0, 1, .25]) };

  it("derives normalized RMS from actual channel samples and leaves silence at zero", () => {
    const samples = Float32Array.from({ length: 100 }, (_, i) => i >= 20 && i < 40 ? .1 : i >= 60 && i < 80 ? .2 : 0);
    const analyzed = createLessonSpeechEnvelope({ numberOfChannels: 2, length: 100, sampleRate: 1000, duration: .1, getChannelData: () => samples });
    expect(analyzed.levels[0]).toBe(0); expect(analyzed.levels[2]).toBe(0); expect(analyzed.levels[4]).toBe(0);
    expect(analyzed.levels[1]).toBeGreaterThan(0); expect(analyzed.levels[1]).toBeLessThan(analyzed.levels[3]);
    expect(sampleLessonSpeechEnvelope(analyzed, .07)).toBe(1);
    expect(sampleLessonSpeechEnvelope(analyzed, .099)).toBe(0);
    expect(sampleLessonSpeechEnvelope(analyzed, .1)).toBe(0);
    expect(sampleLessonSpeechEnvelope(analyzed, Number.NaN)).toBe(0);
  });

  it("broadcasts currentTime-driven levels without notifying React's discrete snapshot at frame frequency", async () => {
    const callbacks = new Map<number, FrameRequestCallback>(); let handle = 0;
    const requestFrame = vi.fn((callback: FrameRequestCallback) => { callbacks.set(++handle, callback); return handle; });
    const cancelFrame = vi.fn((id: number) => { callbacks.delete(id); });
    const decoder = vi.fn(async () => envelope);
    const { controller, elements } = fixture({ decodeEnvelope: decoder, requestFrame, cancelFrame });
    const frameListener = vi.fn(), discreteListener = vi.fn();
    const unsubscribe = controller.speech.subscribeFrame(frameListener); controller.subscribe(discreteListener);
    expect(requestFrame).not.toHaveBeenCalled();
    await controller.request("ana", "I am Ana.", { role: "character" });
    const notifications = discreteListener.mock.calls.length;
    elements[0].currentTime = .21;
    const fire = () => { const entry = callbacks.entries().next().value!; callbacks.delete(entry[0]); entry[1](999999); };
    fire();
    expect(frameListener.mock.lastCall?.[0]).toMatchObject({ time: .21, level: 1, role: "character", envelopeReady: true });
    fire(); expect(controller.speech.getFrame().time).toBe(.21);
    elements[0].currentTime = .41; fire(); expect(controller.speech.getFrame().level).toBe(.25);
    expect(discreteListener).toHaveBeenCalledTimes(notifications);
    controller.pause(); expect(callbacks.size).toBe(0);
    expect(frameListener.mock.lastCall?.[0]).toMatchObject({ playing: false, level: 0, person: null });
    await controller.resume(); expect(decoder).toHaveBeenCalledOnce();
    elements[0].emit("waiting"); expect(callbacks.size).toBe(0); expect(controller.speech.getFrame().level).toBe(0);
    elements[0].paused = false; elements[0].emit("playing"); expect(callbacks.size).toBe(1);
    elements[0].emit("ended"); expect(callbacks.size).toBe(0); expect(controller.speech.getFrame().level).toBe(0);
    unsubscribe(); controller.dispose();
  });

  it("never lets late analysis of A drive B, and caches the local decoded envelope per URL", async () => {
    const a = deferred<LessonSpeechEnvelope | null>();
    const decoder = vi.fn((url: string) => url.includes("ana-") ? a.promise : Promise.resolve(envelope));
    const { controller } = fixture({ decodeEnvelope: decoder });
    await controller.request("ana", "I am Ana.", { role: "character" });
    expect(controller.speech.getFrame().envelopeReady).toBe(false);
    await controller.request("leo", "You are Ana.", { role: "character" });
    a.resolve(envelope); await Promise.resolve(); await Promise.resolve();
    expect(controller.speech.getFrame()).toMatchObject({ person: "leo", envelopeReady: true });
    await controller.request("ana", "I am Ana.");
    expect(decoder).toHaveBeenCalledTimes(2);
    expect(controller.speech.getFrame()).toMatchObject({ role: "narration", person: "ana" });
    controller.dispose();
  });

  it("keeps audible playback usable if local envelope analysis fails, with no fake mouth movement", async () => {
    const { controller } = fixture({ decodeEnvelope: vi.fn(async () => { throw new Error("analysis unsupported"); }) });
    expect(await controller.request("ana", "I am Ana.", { role: "character" })).toBe(true);
    expect(controller.getSnapshot()).toEqual({ playingKey: "ana:I am Ana.", error: null, blocked: false });
    expect(controller.speech.getFrame()).toMatchObject({ envelopeReady: false, level: 0 });
    controller.stop(); expect(controller.speech.getFrame()).toMatchObject({ playing: false, level: 0 });
    controller.dispose();
  });
});
