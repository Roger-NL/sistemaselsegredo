"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MIN_TICK_INTERVAL_MS = 42;

export function useTypingSound() {
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);
  const enabledRef = useRef(true);
  const contextRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const lastTickAtRef = useRef(0);

  const unlock = useCallback(() => {
    if (!enabledRef.current) return;
    try {
      const Audio =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Audio) return;
      const context = contextRef.current ?? new Audio();
      contextRef.current = context;
      if (!bufferRef.current) {
        const buffer = context.createBuffer(
          1,
          Math.floor(context.sampleRate * 0.012),
          context.sampleRate,
        );
        const samples = buffer.getChannelData(0);
        for (let i = 0; i < samples.length; i++) {
          samples[i] =
            (Math.random() * 2 - 1) * Math.exp(-i / (samples.length / 5));
        }
        bufferRef.current = buffer;
      }
      void context
        .resume()
        .then(() => {
          if (contextRef.current === context)
            setReady(context.state === "running");
        })
        .catch(() => undefined);
    } catch {
      // Unsupported/blocked audio must never stop the conversation.
    }
  }, []);

  const tick = useCallback(() => {
    const context = contextRef.current;
    if (
      !enabledRef.current ||
      !context ||
      context.state !== "running" ||
      !bufferRef.current ||
      document.hidden
    )
      return;
    const now = performance.now();
    if (now - lastTickAtRef.current < MIN_TICK_INTERVAL_MS) return;
    lastTickAtRef.current = now;

    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = bufferRef.current;
    source.playbackRate.value = 0.9 + Math.random() * 0.2;
    gain.gain.value = 0.035;
    source.connect(gain);
    gain.connect(context.destination);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };
    source.start();
  }, []);

  const toggle = useCallback(() => {
    const nextEnabled = !enabledRef.current;
    enabledRef.current = nextEnabled;
    setEnabled(nextEnabled);
    if (nextEnabled) unlock();
  }, [unlock]);

  useEffect(
    () => () => {
      const context = contextRef.current;
      contextRef.current = null;
      bufferRef.current = null;
      if (context && context.state !== "closed")
        void context.close().catch(() => undefined);
    },
    [],
  );

  return { enabled, ready, unlock, tick, toggle };
}
