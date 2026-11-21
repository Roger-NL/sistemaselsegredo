"use client";

import { useEffect, useRef, useState } from "react";
import { firstDayVoiceUrl } from "./narration";
import type { FirstDayVoiceClip } from "./narration";

export function useFirstDayNarration() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const generation = useRef(0);
  const [playing, setPlaying] = useState<FirstDayVoiceClip | null>(null);

  function stop() {
    generation.current += 1;
    if (audio.current) {
      audio.current.onended = null;
      audio.current.onerror = null;
      audio.current.pause();
    }
    setPlaying(null);
  }

  function play(clips: readonly FirstDayVoiceClip[]) {
    stop();
    if (!clips.length || document.hidden) return;
    const player = audio.current ??= new Audio();
    const sequence = generation.current;
    function finish() {
      if (generation.current !== sequence) return;
      player.onended = null;
      player.onerror = null;
      setPlaying(null);
    }
    function next(index: number) {
      if (generation.current !== sequence) return;
      const clip = clips[index];
      if (!clip || document.hidden) { finish(); return; }
      player.src = firstDayVoiceUrl(clip);
      player.onended = () => next(index + 1);
      player.onerror = finish;
      setPlaying(clip);
      void player.play().catch(finish);
    }
    next(0);
  }

  useEffect(() => {
    function cancelOnHide() {
      if (!document.hidden) return;
      generation.current += 1;
      audio.current?.pause();
      setPlaying(null);
    }
    document.addEventListener("visibilitychange", cancelOnHide);
    return () => {
      document.removeEventListener("visibilitychange", cancelOnHide);
      generation.current += 1;
      if (audio.current) {
        audio.current.onended = null;
        audio.current.onerror = null;
        audio.current.pause();
      }
    };
  }, []);

  return { playing, play, stop };
}
