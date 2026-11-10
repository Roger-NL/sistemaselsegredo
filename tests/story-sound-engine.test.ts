// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StorySound } from "@/components/interaction/story-sounds";

const param = () => ({ setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
const gainNode = () => ({ gain: param(), connect: vi.fn(), disconnect: vi.fn() });
class Source {
  type = "sine";
  buffer: AudioBuffer | null = null;
  frequency = param();
  connect = vi.fn(); disconnect = vi.fn(); start = vi.fn(); stop = vi.fn();
  onended: (() => void) | null = null;
}
class Context {
  state = "running"; currentTime = 10; sampleRate = 24000; destination = {};
  sources: Source[] = [];
  gains: ReturnType<typeof gainNode>[] = [];
  resume = vi.fn(async () => { this.state = "running"; });
  createOscillator() { const source = new Source(); this.sources.push(source); return source; }
  createBufferSource() { return this.createOscillator(); }
  createBuffer(_channels: number, length: number) { return { getChannelData: () => new Float32Array(length) }; }
  createGain() { const gain = gainNode(); this.gains.push(gain); return gain; }
  createBiquadFilter() { return { type: "bandpass", Q: param(), frequency: param(), connect: vi.fn(), disconnect: vi.fn() }; }
}
let contexts: Context[], sounds: typeof import("@/components/interaction/sounds");
beforeEach(async () => {
  vi.resetModules(); localStorage.clear(); contexts = [];
  vi.stubGlobal("AudioContext", class extends Context { constructor() { super(); contexts.push(this); } });
  sounds = await import("@/components/interaction/sounds");
});
afterEach(() => { sounds.stopInteractionSounds(); vi.unstubAllGlobals(); });

describe("short, cancellable story soundscapes", () => {
  for (const cue of ["story-enter", "story-surprise", "story-relief", "story-settle"] as StorySound[]) {
    it(`${cue} layers fade in/out at a restrained level and stop with the existing mute`, async () => {
      expect(contexts).toHaveLength(0); // Loading a page never starts a sound.
      await sounds.playInteractionSound(cue);
      const context = contexts[0];
      expect(context.sources.length).toBeGreaterThan(1);
      const duration = Math.max(...context.sources.map(source => source.stop.mock.calls[0][0])) - context.currentTime;
      expect(duration).toBeLessThanOrEqual(cue === "story-enter" ? 1.2 : 0.6);
      if (cue === "story-enter" || cue === "story-surprise") expect(context.sources.some(source => source.buffer)).toBe(true);
      for (const gain of context.gains) {
        expect(gain.gain.exponentialRampToValueAtTime.mock.calls[0][0]).toBeLessThanOrEqual(0.045);
        expect(gain.gain.exponentialRampToValueAtTime.mock.calls.at(-1)?.[0]).toBe(0.0001);
      }
      sounds.saveInteractionSoundsMuted(true);
      context.sources.forEach(source => expect(source.stop).toHaveBeenLastCalledWith());
      const count = context.sources.length;
      await sounds.playInteractionSound(cue);
      expect(context.sources).toHaveLength(count);
    });
  }
  it("shares one context and cancels every old air/tone layer on a rapid next action or speech stop", async () => {
    await sounds.playInteractionSound("story-enter");
    const first = [...contexts[0].sources];
    await sounds.playInteractionSound("story-surprise");
    expect(contexts).toHaveLength(1);
    first.forEach(source => expect(source.stop).toHaveBeenLastCalledWith());
    sounds.stopInteractionSounds();
    contexts[0].sources.forEach(source => expect(source.stop).toHaveBeenLastCalledWith());
  });
  it("does not emit a stale accent if muted while audio permission is pending", async () => {
    let release!: () => void;
    vi.stubGlobal("AudioContext", class extends Context {
      state = "suspended";
      constructor() { super(); contexts.push(this); }
      resume = vi.fn(() => new Promise<void>(resolve => { release = () => { this.state = "running"; resolve(); }; }));
    });
    const pending = sounds.playInteractionSound("story-surprise");
    sounds.saveInteractionSoundsMuted(true); release(); await pending;
    expect(contexts[0].sources).toHaveLength(0);
  });
  it("never blocks the story when audio is absent or denied", async () => {
    vi.stubGlobal("AudioContext", undefined);
    await expect(sounds.playInteractionSound("story-enter")).resolves.toBeUndefined();
    vi.stubGlobal("AudioContext", class { constructor() { throw new Error("blocked"); } });
    await expect(sounds.playInteractionSound("story-surprise")).resolves.toBeUndefined();
    expect(contexts).toHaveLength(0);
  });
});

it("reduces every story tone and air layer to half its original gain", async () => {
  const { renderStorySound } = await import("@/components/interaction/story-sounds");
  const original = new Context();
  renderStorySound(original as unknown as AudioContext, "story-enter", new Set());
  await sounds.playInteractionSound("story-enter");
  expect(contexts[0].gains).toHaveLength(original.gains.length);
  contexts[0].gains.forEach((gain, i) => expect(gain.gain.exponentialRampToValueAtTime.mock.calls[0][0]).toBe(original.gains[i].gain.exponentialRampToValueAtTime.mock.calls[0][0] * 0.5));
});
