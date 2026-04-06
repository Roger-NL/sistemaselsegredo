"use client";

type SfxType = "click" | "success" | "error";

let audioCtx: AudioContext | null = null;
let enabled = true;

const getContext = () => {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
};

const tone = (ctx: AudioContext, frequency: number, durationMs: number, gainValue: number, startDelayMs = 0) => {
  const now = ctx.currentTime + startDelayMs / 1000;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.02);
};

export const playUiSfx = (type: SfxType) => {
  if (!enabled) return;
  const ctx = getContext();
  if (!ctx) return;

  // Best effort on first user interaction in Safari/iOS.
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => undefined);
  }

  if (type === "click") {
    tone(ctx, 880, 45, 0.025);
    return;
  }

  if (type === "success") {
    tone(ctx, 740, 70, 0.03);
    tone(ctx, 980, 90, 0.03, 45);
    return;
  }

  // error
  tone(ctx, 220, 90, 0.035);
  tone(ctx, 180, 95, 0.03, 55);
};

export const setUiSfxEnabled = (value: boolean) => {
  enabled = value;
};

