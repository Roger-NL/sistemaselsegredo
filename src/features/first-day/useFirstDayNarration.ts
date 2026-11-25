"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { firstDayVoiceRate, firstDayVoiceUrl } from "./narration";
import type { FirstDayVoiceClip } from "./narration";

import { takeCoverAudio } from "./cover-entry";
import { createFirstDayProgressStore } from "./first-day-progress";

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

  function play(clips: readonly FirstDayVoiceClip[], pauseMs = 0) {
    stop();
    if (!clips.length || document.hidden) return;
    const player = audio.current ??= new Audio();
    player.preservesPitch = true;
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
      const rate = firstDayVoiceRate(clip);
      player.defaultPlaybackRate = rate;
      player.src = firstDayVoiceUrl(clip);
      player.playbackRate = rate;
      player.onended = () => {
        if (pauseMs && index + 1 < clips.length) window.setTimeout(() => next(index + 1), pauseMs);
        else next(index + 1);
      };
      player.onerror = finish;
      setPlaying(clip);
      void player.play()?.catch(finish);
    }
    next(0);
  }

  const playCover = useEffectEvent(() => play(["cover"]));

  useEffect(() => {
    let mounted = true;
    queueMicrotask(() => {
      if (!mounted) return;
      const player = takeCoverAudio();
      const entry = createFirstDayProgressStore().getSnapshot();
      if (entry.position !== 0 || !entry.sound || document.hidden) { player?.pause(); return; }
      if (player) {
        audio.current = player;
        if (!player.ended && !player.paused) {
          setPlaying("cover");
          player.onended = player.onerror = () => setPlaying(null);
        }
      } else {
        playCover();
      }
    });
    function cancelOnHide() {
      if (!document.hidden) return;
      generation.current += 1;
      audio.current?.pause();
      setPlaying(null);
    }
    document.addEventListener("visibilitychange", cancelOnHide);
    return () => {
      mounted = false;
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
