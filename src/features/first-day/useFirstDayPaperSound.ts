"use client";

import { useEffect, useState } from "react";
import { FIRST_DAY_AUDIO_RATE } from "./narration";

const paperSource = "/first-day/page-turn.wav";

function createPaperSound() {
  let element: HTMLAudioElement | undefined;
  let volumeLocked = false;
  let context: AudioContext | undefined;
  let buffer: Promise<AudioBuffer | undefined> | undefined;
  let active: { source: AudioBufferSourceNode; gain: GainNode } | undefined;
  let generation = 0;

  function release() {
    active?.source.disconnect();
    active?.gain.disconnect();
    active = undefined;
  }

  function stop() {
    generation += 1;
    element?.pause();
    if (active) {
      active.source.onended = null;
      active.source.stop();
      release();
    }
  }

  function prepare() {
    if (!element) {
      element = new Audio();
      element.volume = .5;
      volumeLocked = element.volume !== .5;
    }
    // iPhone Safari can leave volume fixed at 1 on HTML media elements.
    if (!volumeLocked) {
      if (!element.src) element.src = paperSource;
      return;
    }

    const AudioContext = window.AudioContext
      ?? (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    try {
      const decoder = context ??= new AudioContext({ latencyHint: "interactive" });
      if (decoder.state !== "running") void decoder.resume().catch(() => {});
      if (!buffer) {
        const pending: Promise<AudioBuffer | undefined> = fetch(paperSource)
          .then(response => {
            if (!response.ok) throw new Error("Page-turn audio unavailable");
            return response.arrayBuffer();
          })
          .then(bytes => decoder.decodeAudioData(bytes))
          .catch(() => {
            if (buffer === pending) buffer = undefined;
            return undefined;
          });
        buffer = pending;
      }
    } catch { /* HTML audio remains available if Web Audio cannot start. */ }
  }

  function play(overNarration: boolean) {
    stop();
    if (document.hidden) return;
    prepare();
    const volume = overNarration ? .11 : .17;
    const player = element!;
    const sequence = generation;
    const playElement = () => {
      if (!player.src) player.src = paperSource;
      player.defaultPlaybackRate = FIRST_DAY_AUDIO_RATE;
      player.playbackRate = FIRST_DAY_AUDIO_RATE;
      player.currentTime = 0;
      player.volume = volume;
      void player.play().catch(() => {});
    };
    const decoder = context;
    if (!decoder || !buffer) {
      playElement();
      return;
    }
    void buffer.then(samples => {
      if (sequence !== generation || document.hidden) return;
      if (!samples || decoder.state !== "running") {
        playElement();
        return;
      }
      const source = decoder.createBufferSource();
      const gain = decoder.createGain();
      source.buffer = samples;
      source.playbackRate.value = FIRST_DAY_AUDIO_RATE;
      gain.gain.value = volume;
      source.connect(gain);
      gain.connect(decoder.destination);
      try {
        source.start();
        active = { source, gain };
        source.onended = release;
      } catch {
        source.disconnect();
        gain.disconnect();
        playElement();
      }
    }).catch(() => {});
  }

  function dispose() {
    stop();
    if (context && context.state !== "closed") void context.close().catch(() => {});
    context = undefined;
    buffer = undefined;
    element = undefined;
  }

  return { prepare, play, stop, dispose };
}

export function useFirstDayPaperSound() {
  const [sound] = useState(createPaperSound);
  useEffect(() => () => sound.dispose(), [sound]);
  return sound;
}
