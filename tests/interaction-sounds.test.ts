// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Root } from "react-dom/client";

type Sounds = typeof import("@/components/interaction/sounds");
const preferenceKey = "basedspeak.interface-sounds.v1";
type FakeOscillator = {
  type: string;
  frequency: { setValueAtTime: ReturnType<typeof vi.fn>; exponentialRampToValueAtTime: ReturnType<typeof vi.fn> };
  connect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  onended: (() => void) | null;
};
let contexts: FakeAudioContext[];
let initialState: AudioContextState;
let resumeWait: Promise<void> | undefined;
let resumeFailure: Error | undefined;
class FakeAudioContext {
  state = initialState;
  currentTime = 4;
  destination = {};
  oscillators: FakeOscillator[] = [];
  gains: { gain: { setValueAtTime: ReturnType<typeof vi.fn>; exponentialRampToValueAtTime: ReturnType<typeof vi.fn> }; connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];
  constructor() { contexts.push(this); }
  resume = vi.fn(async () => {
    if (resumeFailure) throw resumeFailure;
    if (resumeWait) await resumeWait;
    this.state = "running";
  });
  createOscillator = vi.fn(() => {
    const oscillator: FakeOscillator = { type: "sine", frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn(), stop: vi.fn(), disconnect: vi.fn(), onended: null };
    this.oscillators.push(oscillator);
    return oscillator as unknown as OscillatorNode;
  });
  createGain = vi.fn(() => {
    const gain = { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() };
    this.gains.push(gain);
    return gain as unknown as GainNode;
  });
}
let sounds: Sounds;
let root: Root | undefined;
let act: typeof import("react")["act"] | undefined;
beforeEach(async () => {
  vi.resetModules();
  contexts = []; initialState = "running"; resumeWait = undefined; resumeFailure = undefined;
  localStorage.clear(); document.body.innerHTML = "";
  vi.stubGlobal("AudioContext", FakeAudioContext);
  vi.stubGlobal("webkitAudioContext", undefined);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  sounds = await import("@/components/interaction/sounds");
});
afterEach(async () => {
  if (root && act) await act(async () => root!.unmount());
  root = undefined; act = undefined;
  sounds.stopInteractionSounds();
  vi.restoreAllMocks(); vi.unstubAllGlobals();
});

function frequencies(context: FakeAudioContext) {
  return context.oscillators.map(node => node.frequency.setValueAtTime.mock.calls[0][0] as number);
}
function totalDuration(context: FakeAudioContext) {
  return Math.max(...context.oscillators.map(node => node.stop.mock.calls[0][0] as number)) - context.currentTime;
}

describe("short local interaction audio", () => {
  it("does not create or start an audio context on import or mount; only a button interaction starts it", async () => {
    expect(contexts).toHaveLength(0);
    // Import React and its renderer after resetModules so hooks share one instance.
    const react = await import("react"); act = react.act;
    const { createRoot } = await import("react-dom/client");
    const { InteractionSounds } = await import("@/components/interaction/InteractionSounds");
    document.body.innerHTML = '<div id="root"></div><button id="interact">Abrir uma pista</button>';
    root = createRoot(document.getElementById("root")!);
    await act(async () => root!.render(react.createElement(InteractionSounds)));
    expect(contexts).toHaveLength(0);
    await act(async () => document.getElementById("interact")!.click());
    expect(contexts).toHaveLength(1);
    expect(contexts[0].oscillators).toHaveLength(1);
    expect(contexts[0].oscillators[0].start).toHaveBeenCalledOnce();
  });

  it("makes a brief click and a separate forward signal, without creating a context per interaction", async () => {
    await sounds.playInteractionSound("click");
    const context = contexts[0];
    expect(context.oscillators).toHaveLength(1);
    expect(totalDuration(context)).toBeGreaterThan(0);
    expect(totalDuration(context)).toBeLessThan(0.05);
    const clicked = context.oscillators[0];
    await sounds.playInteractionSound("advance");
    expect(contexts).toHaveLength(1);
    expect(clicked.stop).toHaveBeenLastCalledWith(); // The superseded cue is stopped now.
    expect(clicked.disconnect).toHaveBeenCalledOnce();
    const forward = context.oscillators.slice(1);
    expect(forward.length).toBeGreaterThan(1);
    expect(forward.every(node => node.start.mock.calls[0][0] >= context.currentTime)).toBe(true);
    expect(Math.max(...forward.map(node => node.stop.mock.calls[0][0] as number)) - context.currentTime).toBeLessThan(0.3);
  });

  it("plays layered bell overtones and trailing reflections with a gentle, bounded tail", async () => {
    await sounds.playInteractionSound("presentation-welcome");
    const context = contexts[0];
    expect(context.oscillators.length).toBeGreaterThanOrEqual(8);
    expect(totalDuration(context)).toBeGreaterThan(0.8);
    expect(totalDuration(context)).toBeLessThan(1.3);
    const pitches = frequencies(context);
    expect(Math.max(...pitches)).toBeGreaterThan(2000);
    expect(new Set(context.oscillators.map(node => node.start.mock.calls[0][0])).size).toBeGreaterThan(3);
    for (const gain of context.gains) {
      expect(gain.gain.exponentialRampToValueAtTime.mock.calls[0][0]).toBeLessThanOrEqual(0.025);
      expect(gain.gain.exponentialRampToValueAtTime.mock.calls.at(-1)?.[0]).toBe(0.0001);
    }
  });

  it("gives the nine frames distinct musical signatures, all under a second and a half", async () => {
    const { presentationFrames } = await import("@/features/onboarding/content");
    const signatures: string[] = [];
    let previousCount = 0;
    for (const frame of presentationFrames) {
      await sounds.playInteractionSound(frame.sound);
      const nodes = contexts[0].oscillators.slice(previousCount);
      expect(nodes.length).toBeGreaterThan(3);
      const end = Math.max(...nodes.map(node => node.stop.mock.calls[0][0] as number));
      expect(end - contexts[0].currentTime).toBeLessThan(1.5);
      signatures.push(JSON.stringify(nodes.map(node => [node.frequency.setValueAtTime.mock.calls[0][0], node.start.mock.calls[0][0]])));
      previousCount = contexts[0].oscillators.length;
    }
    expect(new Set(signatures).size).toBe(9);
  });

  it("cancels the previous presentation cue on rapid navigation, and mute stops every layer", async () => {
    await sounds.playInteractionSound("presentation");
    const context = contexts[0], previous = [...context.oscillators];
    await sounds.playInteractionSound("presentation");
    expect(contexts).toHaveLength(1);
    expect(context.oscillators).toHaveLength(previous.length * 2);
    for (const node of previous) expect(node.stop).toHaveBeenLastCalledWith();
    sounds.saveInteractionSoundsMuted(true);
    for (const node of context.oscillators) expect(node.stop).toHaveBeenLastCalledWith();
    await sounds.playInteractionSound("presentation");
    expect(context.oscillators).toHaveLength(previous.length * 2);
  });

  it("distinguishes a rising correct signal from a falling retry signal and keeps both under half a second", async () => {
    await sounds.playInteractionSound("correct");
    const context = contexts[0], correct = frequencies(context), count = context.oscillators.length;
    expect(correct.length).toBeGreaterThan(1);
    expect(correct.slice(1).every((value, index) => value > correct[index])).toBe(true);
    expect(totalDuration(context)).toBeLessThan(0.4);
    await sounds.playInteractionSound("retry");
    const retry = frequencies(context).slice(count);
    expect(retry.length).toBeGreaterThan(1);
    expect(retry.slice(1).every((value, index) => value < retry[index])).toBe(true);
    const retryEnd = Math.max(...context.oscillators.slice(count).map(node => node.stop.mock.calls[0][0] as number));
    expect(retryEnd - context.currentTime).toBeLessThan(0.4);
    for (const gain of context.gains) {
      expect(gain.gain.setValueAtTime).toHaveBeenCalled();
      // A ramp down avoids an abrupt cutoff on every note.
      expect(gain.gain.exponentialRampToValueAtTime.mock.calls.at(-1)?.[0]).toBeLessThan(0.001);
    }
  });

  it("waits for a suspended context to resume before scheduling sound", async () => {
    initialState = "suspended";
    let release!: () => void;
    resumeWait = new Promise<void>(resolve => { release = resolve; });
    const playing = sounds.playInteractionSound("correct");
    expect(contexts[0].resume).toHaveBeenCalledOnce();
    expect(contexts[0].oscillators).toHaveLength(0);
    release(); await playing;
    expect(contexts[0].oscillators.length).toBeGreaterThan(0);
  });

  it("cancels a pending resume when muted, so a late permission resolution cannot produce a stale sound", async () => {
    initialState = "suspended";
    let release!: () => void;
    resumeWait = new Promise<void>(resolve => { release = resolve; });
    const playing = sounds.playInteractionSound("presentation");
    sounds.saveInteractionSoundsMuted(true);
    release(); await playing;
    expect(contexts[0].oscillators).toHaveLength(0);
    expect(sounds.getInteractionSoundsMuted()).toBe(true);
  });

  it("uses the saved mute preference before creating audio and persists an explicit change", async () => {
    localStorage.setItem(preferenceKey, "muted");
    expect(sounds.getInteractionSoundsMuted()).toBe(true);
    await sounds.playInteractionSound("click");
    expect(contexts).toHaveLength(0);
    sounds.saveInteractionSoundsMuted(false);
    expect(localStorage.getItem(preferenceKey)).toBe("on");
    await sounds.playInteractionSound("click");
    expect(contexts).toHaveLength(1);
    sounds.saveInteractionSoundsMuted(true);
    expect(localStorage.getItem(preferenceKey)).toBe("muted");
    expect(contexts[0].oscillators[0].stop).toHaveBeenLastCalledWith();
    await sounds.playInteractionSound("retry");
    expect(contexts[0].oscillators).toHaveLength(1);
  });

  it("keeps mute working for this visit when storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage blocked"); });
    expect(() => sounds.saveInteractionSoundsMuted(true)).not.toThrow();
    expect(sounds.getInteractionSoundsMuted()).toBe(true);
    await sounds.playInteractionSound("advance");
    expect(contexts).toHaveLength(0);
  });

  it("responds to a mute change from another tab, stops current notes, and unsubscribes cleanly", async () => {
    const changed = vi.fn(); const unsubscribe = sounds.subscribeInteractionSounds(changed);
    await sounds.playInteractionSound("correct");
    localStorage.setItem(preferenceKey, "muted");
    window.dispatchEvent(new StorageEvent("storage", { key: preferenceKey }));
    expect(sounds.getInteractionSoundsMuted()).toBe(true);
    expect(changed).toHaveBeenCalledOnce();
    for (const node of contexts[0].oscillators) expect(node.stop).toHaveBeenLastCalledWith();
    unsubscribe();
    window.dispatchEvent(new StorageEvent("storage", { key: preferenceKey }));
    expect(changed).toHaveBeenCalledOnce();
  });

  it("stays silent without failing the action when Web Audio is unavailable", async () => {
    vi.stubGlobal("AudioContext", undefined);
    await expect(sounds.playInteractionSound("correct")).resolves.toBeUndefined();
    expect(contexts).toHaveLength(0);
  });

  it("does not reject the learning handler when the browser blocks audio creation or resume", async () => {
    vi.stubGlobal("AudioContext", class { constructor() { throw new Error("Audio unavailable"); } });
    await expect(sounds.playInteractionSound("retry")).resolves.toBeUndefined();
    vi.stubGlobal("AudioContext", FakeAudioContext);
    initialState = "suspended"; resumeFailure = new Error("Gesture required");
    await expect(sounds.playInteractionSound("correct")).resolves.toBeUndefined();
    expect(contexts[0].oscillators).toHaveLength(0);
  });

  it("releases notes and gains when playback ends", async () => {
    await sounds.playInteractionSound("click");
    const context = contexts[0], note = context.oscillators[0];
    note.onended!();
    expect(note.disconnect).toHaveBeenCalledOnce();
    expect(context.gains[0].disconnect).toHaveBeenCalledOnce();
    sounds.stopInteractionSounds();
    expect(note.stop).toHaveBeenCalledTimes(1); // No longer in the active set.
  });
});

describe("interaction target classification", () => {
  it("recognizes nested button clicks, navigation, summaries and choices while excluding disabled/inert actions", () => {
    document.body.innerHTML = '<button id="plain"><span id="icon">?</span></button><a href="/demo" id="link">Conversa</a><button id="next" data-ui-sound="advance">Continuar</button><button id="scene" data-ui-sound="presentation-unlock">Próxima etapa</button><button id="check" data-ui-sound="none">Conferir</button><button disabled id="disabled">Não disponível</button><fieldset disabled><button id="inherited-disabled">Pendente</button></fieldset><button aria-disabled="true" id="aria-disabled">Pendente</button><div inert><button id="inert">Coberto</button></div><details><summary id="summary">Menu</summary></details><input type="radio" id="radio"><p id="text">Texto</p>';
    const target = (id: string) => sounds.interactionSoundFor(document.getElementById(id)!);
    expect(target("icon")).toBe("click"); expect(target("plain")).toBe("click");
    expect(target("link")).toBe("advance"); expect(target("next")).toBe("advance");
    expect(target("scene")).toBe("presentation-unlock");
    expect(target("summary")).toBe("click"); expect(target("radio")).toBe("click");
    for (const id of ["check", "disabled", "inherited-disabled", "aria-disabled", "inert", "text"]) expect(target(id), id).toBeNull();
  });
});


describe("independent effects and clicks", () => {
  it.each([false, true])("keeps effects independent when clicks muted=%s", async clicksMuted => {
    sounds.saveSoundMuted("clicks", clicksMuted);
    sounds.saveSoundMuted("effects", true);
    await sounds.playInteractionSound("presentation-ready");
    expect(contexts).toHaveLength(0);
    await sounds.playInteractionSound("click");
    expect(contexts).toHaveLength(clicksMuted ? 0 : 1);
    sounds.saveSoundMuted("effects", false);
    await sounds.playInteractionSound("presentation-ready");
    expect(contexts.at(-1)!.oscillators.length).toBeGreaterThan(3);
    expect(sounds.getClicksMuted()).toBe(clicksMuted);
  });
  it("migrates an old global mute without enabling the other channel and survives reload", async () => {
    localStorage.setItem(preferenceKey, "muted");
    sounds.saveSoundMuted("effects", false);
    expect(sounds.getClicksMuted()).toBe(true);
    vi.resetModules();
    const reloaded = await import("@/components/interaction/sounds");
    expect(reloaded.getEffectsMuted()).toBe(false);
    expect(reloaded.getClicksMuted()).toBe(true);
  });
  it("halves every presentation layer and feedback gain while preserving click volume", async () => {
    const { renderPresentationSound } = await import("@/components/interaction/presentation-sounds");
    const baseline = new FakeAudioContext();
    renderPresentationSound(baseline as unknown as AudioContext, "presentation-ready", new Set());
    await sounds.playInteractionSound("presentation-ready");
    const actual = contexts[1];
    expect(actual.gains).toHaveLength(baseline.gains.length);
    actual.gains.forEach((gain, i) => expect(gain.gain.exponentialRampToValueAtTime.mock.calls[0][0]).toBe(baseline.gains[i].gain.exponentialRampToValueAtTime.mock.calls[0][0] * 0.5));
    await sounds.playInteractionSound("correct");
    expect(actual.gains.at(-1)!.gain.exponentialRampToValueAtTime.mock.calls[0][0]).toBe(0.0375);
    await sounds.playInteractionSound("click");
    expect(actual.gains.at(-1)!.gain.exponentialRampToValueAtTime.mock.calls[0][0]).toBe(0.05);
  });
  it("does not cancel an effect when only clicks are disabled", async () => {
    await sounds.playInteractionSound("presentation-ready");
    sounds.saveSoundMuted("clicks", true);
    expect(contexts[0].oscillators[0].stop).toHaveBeenCalledTimes(1);
    sounds.saveSoundMuted("effects", true);
    expect(contexts[0].oscillators[0].stop).toHaveBeenLastCalledWith();
  });
  it("shows two persistent menu options and changes either without closing the menu", async () => {
    const react = await import("react"); act = react.act;
    const { createRoot } = await import("react-dom/client");
    const { SoundMenu } = await import("@/components/interaction/InteractionSounds");
    const container = document.createElement("div"); document.body.append(container);
    root = createRoot(container);
    await act(async () => root!.render(react.createElement(SoundMenu)));
    const menu = container.querySelector("details")!;
    menu.open = true;
    const options = container.querySelectorAll("button");
    expect(options).toHaveLength(2);
    await act(async () => options[0].click());
    expect(menu.open).toBe(true);
    expect(sounds.getEffectsMuted()).toBe(true);
    expect(sounds.getClicksMuted()).toBe(false);
    await act(async () => options[1].click());
    expect(sounds.getInteractionSoundsMuted()).toBe(true);
    await act(async () => options[0].click());
    expect(sounds.getEffectsMuted()).toBe(false);
    expect(sounds.getClicksMuted()).toBe(true);
    expect(contexts).toHaveLength(0);
  });
});

it("routes ordinary link clicks separately from explicit slide cues, including click fallback", async () => {
  const react = await import("react"); act = react.act;
  const { createRoot } = await import("react-dom/client");
  const { InteractionSounds } = await import("@/components/interaction/InteractionSounds");
  document.body.innerHTML = '<div id="root"></div><a href="#test">Link</a><button data-ui-sound="presentation-ready">Slide</button>';
  root = createRoot(document.getElementById("root")!);
  await act(async () => root!.render(react.createElement(InteractionSounds)));
  sounds.saveSoundMuted("clicks", true);
  await act(async () => document.querySelector("a")!.click());
  expect(contexts).toHaveLength(0);
  await act(async () => document.querySelector("button")!.click());
  expect(contexts[0].oscillators.length).toBeGreaterThan(3);
  sounds.saveSoundMuted("effects", true);
  sounds.saveSoundMuted("clicks", false);
  const count = contexts[0].oscillators.length;
  await act(async () => document.querySelector("button")!.click());
  expect(contexts[0].oscillators.length).toBe(count + 1);
  expect(frequencies(contexts[0]).at(-1)).toBe(620);
});

it("cancels pending effects only when their own category is muted", async () => {
  initialState = "suspended";
  let release!: () => void;
  resumeWait = new Promise<void>(resolve => { release = resolve; });
  const pending = sounds.playInteractionSound("presentation-ready");
  sounds.saveSoundMuted("clicks", true);
  release(); await pending;
  expect(contexts[0].oscillators.length).toBeGreaterThan(3);
});

it("does not let a legacy tab override explicit independent preferences", () => {
  sounds.saveSoundMuted("effects", true);
  sounds.saveSoundMuted("clicks", false);
  const unsubscribe = sounds.subscribeInteractionSounds(vi.fn());
  localStorage.setItem(preferenceKey, "on");
  window.dispatchEvent(new StorageEvent("storage", { key: preferenceKey }));
  expect(sounds.getEffectsMuted()).toBe(true);
  expect(sounds.getClicksMuted()).toBe(false);
  localStorage.setItem(preferenceKey, "muted");
  window.dispatchEvent(new StorageEvent("storage", { key: preferenceKey }));
  expect(sounds.getEffectsMuted()).toBe(true);
  expect(sounds.getClicksMuted()).toBe(false);
  unsubscribe();
});
