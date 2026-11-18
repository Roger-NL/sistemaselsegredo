// @vitest-environment jsdom
import { act, createElement, StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLessonSoundsEngine, LESSON_SOUNDS_STORAGE } from "../src/features/first-encounters/lesson-sounds";
import type { LessonSoundCue, LessonSoundsOptions } from "../src/features/first-encounters/lesson-sounds";
import { useLessonSounds } from "../src/features/first-encounters/useLessonSounds";

class FakeParam {
  value = 0;
  setValueAtTime = vi.fn((value: number, time: number) => { void time; this.value = value; return this; });
  linearRampToValueAtTime = vi.fn((value: number, time: number) => { void time; this.value = value; return this; });
  exponentialRampToValueAtTime = vi.fn((value: number, time: number) => { void time; this.value = value; return this; });
  cancelScheduledValues = vi.fn();
}
class FakeGain {
  gain = new FakeParam();
  connect = vi.fn();
  disconnect = vi.fn();
}
class FakeOscillator {
  type = "sine";
  frequency = new FakeParam();
  onended: (() => void) | null = null;
  connect = vi.fn();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
  end() { this.onended?.(); }
}
class FakeContext {
  state: AudioContextState = "running";
  currentTime = 12;
  destination = {};
  gains: FakeGain[] = [];
  oscillators: FakeOscillator[] = [];
  resume = vi.fn(async () => { this.state = "running"; });
  close = vi.fn();
  createGain = vi.fn(() => { const gain = new FakeGain(); this.gains.push(gain); return gain; });
  createOscillator = vi.fn(() => { const oscillator = new FakeOscillator(); this.oscillators.push(oscillator); return oscillator; });
  element() { return this as unknown as AudioContext; }
}
function deferred() {
  let resolve!: () => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<void>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
function fixture(options: LessonSoundsOptions = {}) {
  const audio = new FakeContext();
  const cues: LessonSoundCue[] = [];
  let gesture = false;
  let hidden = false;
  const preference = new Map<string, string>();
  const storage = { getItem: vi.fn((key: string) => preference.get(key) ?? null), setItem: vi.fn((key: string, value: string) => { preference.set(key, value); }) };
  const createContext = vi.fn(() => audio.element());
  const engine = createLessonSoundsEngine({ createContext, hasGesture: () => gesture, isHidden: () => hidden,
    getStorage: () => storage, onCue: cue => cues.push(cue), ...options });
  const scope = engine.createScope();
  const cleanup = scope.mount();
  return { engine, scope, cleanup, audio, cues, createContext, storage, preference,
    gesture: (value = true) => { gesture = value; }, hidden: (value = true) => { hidden = value; } };
}
const flush = () => vi.advanceTimersByTimeAsync(17);

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("local confirmation sound channel", () => {
  it("creates no context on mount, autoplay or a blocked unlock, then reuses the gesture-created context", async () => {
    const f = fixture();
    f.scope.play("success"); await flush();
    expect(await f.scope.unlock()).toBe(false);
    expect(f.createContext).not.toHaveBeenCalled();
    f.gesture(); f.scope.play("tap"); await flush();
    expect(f.createContext).toHaveBeenCalledOnce(); expect(f.cues).toEqual(["tap"]);
    f.gesture(false); await vi.advanceTimersByTimeAsync(100); f.scope.play("success"); await flush();
    expect(f.cues).toEqual(["tap", "success"]); expect(f.createContext).toHaveBeenCalledOnce();
    f.cleanup();
  });

  it("replaces generic click and placement with exactly one successful outcome", async () => {
    const f = fixture(); f.gesture();
    f.scope.play("tap"); f.scope.play("place"); f.scope.play("success"); f.scope.play("tap");
    await flush(); expect(f.cues).toEqual(["success"]);
    expect(f.audio.oscillators).toHaveLength(2);
    f.scope.play("place"); f.scope.play("tap"); await flush();
    expect(f.cues).toEqual(["success"]);
    f.cleanup();
  });

  it("releases the next voice after the last audible note, including a generic tap coalesced into the result", async () => {
    const f = fixture(); f.gesture();
    const startVoice = vi.fn();
    f.scope.play("tap");
    f.scope.play("success")!.then(startVoice);
    await flush();
    expect(f.cues).toEqual(["success"]);
    f.audio.oscillators[0].end(); await Promise.resolve();
    expect(startVoice).not.toHaveBeenCalled();
    f.audio.oscillators[1].end(); await Promise.resolve();
    expect(startVoice).toHaveBeenCalledOnce(); f.cleanup();
  });

  it("keeps a stalled audio unlock from blocking speech or emitting a late result", async () => {
    const f = fixture(); f.gesture(); f.audio.state = "suspended";
    const resumed = deferred();
    f.audio.resume.mockImplementation(() => resumed.promise.then(() => { f.audio.state = "running"; }));
    const result = f.scope.play("success");
    await vi.advanceTimersByTimeAsync(1000); await result;
    resumed.resolve(); await flush();
    expect(f.cues).toEqual([]); f.cleanup();
  });

  it("lets retry replace a provisional placement and advance replace a generic click", async () => {
    const f = fixture(); f.gesture();
    f.scope.play("place"); f.scope.play("retry"); await flush();
    expect(f.cues).toEqual(["retry"]);
    await vi.advanceTimersByTimeAsync(100);
    f.scope.play("tap"); f.scope.play("advance"); await flush();
    expect(f.cues).toEqual(["retry", "advance"]);
    f.cleanup();
  });

  it("drops duplicate synthetic clicks but allows a later deliberate identical action", async () => {
    const f = fixture(); f.gesture();
    f.scope.play("tap"); await flush();
    f.scope.play("tap"); await flush(); expect(f.cues).toEqual(["tap"]);
    await vi.advanceTimersByTimeAsync(100);
    f.scope.play("tap"); await flush(); expect(f.cues).toEqual(["tap", "tap"]);
    f.cleanup();
  });

  it("shares one channel across scopes and preserves a parent's final advance when tutorial unmounts", async () => {
    const f = fixture(); f.gesture();
    const parent = f.engine.createScope(); const releaseParent = parent.mount();
    f.scope.play("tap"); parent.play("advance"); f.cleanup(); await flush();
    expect(f.cues).toEqual(["advance"]); expect(f.audio.close).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(100); parent.play("place"); await flush();
    expect(f.cues).toEqual(["advance", "place"]); expect(f.createContext).toHaveBeenCalledOnce();
    releaseParent();
  });

  it("cancels only the departing owner's pending request", async () => {
    const f = fixture(); f.gesture();
    const sibling = f.engine.createScope(); const release = sibling.mount();
    f.scope.play("success"); f.cleanup(); await flush(); expect(f.cues).toEqual([]);
    sibling.play("place"); await flush(); expect(f.cues).toEqual(["place"]);
    release();
  });

  it("waits for a suspended context without emitting a stale request after unmount", async () => {
    const f = fixture(); f.gesture(); f.audio.state = "suspended";
    const resume = deferred(); f.audio.resume.mockImplementation(() => resume.promise.then(() => { f.audio.state = "running"; }));
    f.scope.play("tap"); f.scope.play("success"); await flush();
    expect(f.audio.resume).toHaveBeenCalledOnce(); expect(f.cues).toEqual([]);
    f.cleanup(); resume.resolve(); await Promise.resolve(); await flush();
    expect(f.cues).toEqual([]); expect(f.audio.oscillators).toHaveLength(0);
  });

  it("silently handles rejected browser unlock and permits retry in a later gesture", async () => {
    const f = fixture(); f.gesture(); f.audio.state = "suspended";
    f.audio.resume.mockRejectedValueOnce(new DOMException("gesture required", "NotAllowedError"));
    f.scope.play("tap"); await flush(); expect(f.cues).toEqual([]);
    f.scope.play("success"); await flush(); expect(f.cues).toEqual(["success"]);
    expect(f.audio.resume).toHaveBeenCalledTimes(2); f.cleanup();
  });

  it("does not resume a suspended context without a new gesture", async () => {
    const f = fixture(); f.gesture(); f.scope.play("tap"); await flush();
    f.audio.state = "suspended"; f.gesture(false);
    await vi.advanceTimersByTimeAsync(100); f.scope.play("advance"); await flush();
    expect(f.audio.resume).not.toHaveBeenCalled(); expect(f.cues).toEqual(["tap"]);
    f.cleanup();
  });

  it("persists mute for SFX only, cancels pending tones and does not create an audio context while muted", async () => {
    const f = fixture(); f.gesture();
    const changed = vi.fn(); const unsubscribe = f.engine.subscribe(changed);
    f.scope.play("success"); f.engine.toggleMuted(); await flush();
    expect(f.engine.getMuted()).toBe(true); expect(f.cues).toEqual([]);
    expect(f.storage.setItem).toHaveBeenCalledWith(LESSON_SOUNDS_STORAGE, "true");
    f.scope.play("advance"); await flush(); expect(f.cues).toEqual([]);
    f.engine.toggleMuted(); f.scope.play("place"); await flush();
    expect(f.cues).toEqual(["place"]); expect(changed).toHaveBeenCalledTimes(2);
    unsubscribe(); f.cleanup();
    const fresh = createLessonSoundsEngine({ getStorage: () => ({ getItem: () => "true", setItem: vi.fn() }), createContext: f.createContext, hasGesture: () => true });
    const scope = fresh.createScope(); const release = scope.mount(); const count = f.createContext.mock.calls.length;
    scope.play("tap"); await flush(); expect(f.createContext).toHaveBeenCalledTimes(count); release();
  });

  it("syncs mute from another tab and fades active SFX without touching voiced media", async () => {
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause");
    const f = fixture(); f.gesture(); f.scope.play("success"); await flush();
    window.dispatchEvent(new StorageEvent("storage", { key: LESSON_SOUNDS_STORAGE, newValue: "true" }));
    expect(f.engine.getMuted()).toBe(true);
    expect(f.audio.gains[1].gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 12.006);
    expect(pause).not.toHaveBeenCalled(); f.cleanup();
  });

  it("cancels hidden-page pending and active effects with no replay on return", async () => {
    const f = fixture(); f.gesture(); f.scope.play("tap"); await flush();
    f.scope.play("success"); f.hidden(); document.dispatchEvent(new Event("visibilitychange"));
    await flush(); expect(f.cues).toEqual(["tap"]);
    expect(f.audio.oscillators[0].stop).toHaveBeenLastCalledWith(12.008);
    f.hidden(false); document.dispatchEvent(new Event("visibilitychange")); await flush();
    expect(f.cues).toEqual(["tap"]); f.cleanup();
  });

  it("uses bounded quiet sine envelopes with a zero start and release, and disconnects ended nodes", async () => {
    const f = fixture(); f.gesture(); f.scope.play("success"); await flush();
    expect(f.audio.gains[0].gain.setValueAtTime).toHaveBeenCalledWith(0.28, 12);
    for (const oscillator of f.audio.oscillators) expect(oscillator.type).toBe("sine");
    const first = f.audio.oscillators[0].start.mock.calls[0][0] as number;
    const last = f.audio.oscillators[1].stop.mock.calls[0][0] as number;
    expect(last - first).toBeCloseTo(0.252, 5);
    const envelopes = f.audio.gains.slice(2);
    envelopes.forEach(envelope => {
      expect(envelope.gain.setValueAtTime.mock.calls[0][0]).toBe(0);
      expect(envelope.gain.linearRampToValueAtTime.mock.calls.at(-1)?.[0]).toBe(0);
      expect(envelope.gain.exponentialRampToValueAtTime.mock.calls[0][0]).toBeGreaterThan(0);
    });
    f.audio.oscillators.forEach(oscillator => oscillator.end());
    expect(f.audio.gains[1].disconnect).toHaveBeenCalledOnce();
    f.audio.oscillators.forEach(oscillator => expect(oscillator.disconnect).toHaveBeenCalledOnce());
    f.cleanup();
  });

  it("keeps the hook reusable under Strict Mode and broadcasts one persisted mute to both owners", async () => {
    const f = fixture(); f.cleanup(); f.gesture();
    const controls: ReturnType<typeof useLessonSounds>[] = [];
    function Owner({ index }: { index: number }) {
      const sounds = useLessonSounds(f.engine);
      useEffect(() => { controls[index] = sounds; }, [index, sounds]);
      return createElement("span", null, sounds.muted ? "muted" : "audible");
    }
    const container = document.createElement("div"); document.body.append(container);
    const root = createRoot(container);
    await act(async () => { root.render(createElement(StrictMode, null, createElement(Owner, { index: 0 }), createElement(Owner, { index: 1 }))); });
    await act(async () => { controls[0].toggleMuted(); });
    expect(container.textContent).toBe("mutedmuted");
    await act(async () => { controls[1].toggleMuted(); controls[0].play("tap"); await flush(); });
    expect(f.cues).toEqual(["tap"]); expect(f.createContext).toHaveBeenCalledOnce();
    await act(async () => { root.unmount(); });
    expect(f.audio.close).not.toHaveBeenCalled(); container.remove();
  });
});
