"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { EnglishWords } from "./WordMeaning";
import type { FirstDayVoiceClip } from "./narration";
import { firstDayWordTimes } from "./first-day-word-times";

type WordRange = number | readonly [first: number, last: number];
export type ReadAlongTrack = FirstDayVoiceClip | "permission-rule-en" | "example-window-pt" | "example-seat-pt" | "example-comic-pt";
type ActiveWord = { clip: FirstDayVoiceClip; index: number };
type Translation = readonly [english: ReadAlongTrack, portuguese: ReadAlongTrack, words: readonly (readonly [WordRange, WordRange])[]];

// Each entry ties the spoken words to the corresponding words in the other language.
// An inclusive range keeps expressions like "pick up" and "ao lado" together.
const translations: readonly Translation[] = [
  ["permission-rule-en", "permission-rule", [
    [[0, 1], 0], [2, 1], [3, 2], [4, 3], [5, 4], [6, 5], [7, 6], [8, 7], [[9, 10], 8], [11, 9],
    [12, [10, 11]], [13, 12], [14, 13], [15, 14], [16, [15, 16]], [17, 17], [18, 18], [[19, 20], 19],
    [21, [20, 21]], [[22, 23], 22], [24, 23], [[25, 26], 24],
  ]],
  ["lunchtime", "lunchtime-pt", [[[0, 1], [0, 1]], [2, 2], [[3, 4], 3], [5, 4], [6, 5], [7, 6], [[8, 9], 7], [10, 8], [11, 9]]],
  ["empty-chair", "empty-chair-pt", [[0, 0], [[1, 2], 1], [3, 2], [4, 3], [5, 4], [6, 5], [[7, 8], [6, 7]], [[9, 10], [8, 9]], [11, 10]]],
  ["ana-looks-up", "ana-looks-up-pt", [[0, 0], [[1, 2], [1, 3]], [3, 4], [4, 5], [5, 6], [6, 7]]],
  ["rafael-sits", "rafael-sits-pt", [[0, 0], [1, 1], [2, 2], [3, 3], [4, [4, 5]], [5, 6], [6, [7, 8]], [7, [9, 11]], [8, 12], [9, 13], [10, 14], [11, 15], [[12, 13], [16, 17]]]],
  ["ana-introduces-herself", "ana-introduces-herself-pt", [[0, 0], [1, [1, 3]], [2, 4], [[3, 4], [5, 6]]]],
  ["door-instruction-en", "door-instruction-pt", [[0, 0], [1, 1], [2, 2], [3, 3], [[4, 5], [4, 5]], [[6, 7], 6], [8, 7], [9, [9, 10]], [[10, 11], 8]]],
  ["learner-seat", "learner-seat-pt", [[0, 0], [[1, 2], 1], [3, 2], [4, 3]]],
  ["ana-sure", "ana-sure-pt", [[0, 0]]],
  ["rafael-intro", "rafael-intro-pt", [[0, [1, 2]], [1, [3, 4]], [[2, 4], 0]]],
  ["ana-intro", "ana-intro-pt", [[0, [0, 1]], [1, [2, 3]]]],
  ["example-window", "example-window-pt", [[[0, 1], 0], [[2, 3], 1]]],
  ["example-seat", "example-seat-pt", [[[0, 1], 0], [2, 1], [3, 2]]],
  ["example-comic", "example-comic-pt", [[[0, 1], 0], [[2, 3], 1]]],
  ["challenge-door", "door-answer-pt", [[[0, 1], 0], [2, 1], [3, 2], [4, 3]]],
  ["ana-door-reply", "ana-door-reply-pt", [[0, 0], [1, 1], [2, 2], [[3, 4], [3, 4]]]],
];

function contains(range: WordRange | undefined, index: number) {
  return typeof range === "number" ? range === index : range !== undefined && index >= range[0] && index <= range[1];
}

export function matchingWords(track: ReadAlongTrack, active: ActiveWord | null): WordRange | undefined {
  if (!active) return;
  if (track === active.clip) return active.index;
  for (const [en, pt, words] of translations) {
    if (active.clip === en && track === pt) return words.find(([from]) => contains(from, active.index))?.[1];
    if (active.clip === pt && track === en) return words.find(([, from]) => contains(from, active.index))?.[0];
  }
}

// Use media time so the highlight follows replays, buffering and changes in playback rate.
// Only publish on a word boundary. Text that isn't active keeps the same snapshot.
export function createReadAlong() {
  let active: ActiveWord | null = null;
  const listeners = new Set<() => void>();
  function publish(clip: FirstDayVoiceClip, index: number) {
    if (index < 0 ? active === null : active?.clip === clip && active.index === index) return;
    active = index < 0 ? null : { clip, index };
    listeners.forEach(listener => listener());
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    getSnapshot: () => active,
    follow(player: HTMLAudioElement, clip: FirstDayVoiceClip) {
      const times = firstDayWordTimes[clip];
      const singleWord = clip.startsWith("word-");
      if (!times && !singleWord) return;
      let timer: number | undefined;
      let buffering = false;
      const clear = () => {
        window.clearTimeout(timer);
        publish(clip, -1);
      };
      function refresh() {
        window.clearTimeout(timer);
        if (buffering || player.paused || player.ended || player.seeking || player.readyState < 2) {
          publish(clip, -1);
          return;
        }
        if (singleWord) {
          publish(clip, 0);
          return;
        }
        const now = player.currentTime * 100;
        const index = times?.findIndex(([, end]) => now < end) ?? -1;
        const span = times?.[index];
        const reading = span !== undefined && now >= span[0];
        publish(clip, reading ? index : -1);
        if (span && player.playbackRate > 0) {
          const boundary = reading ? span[1] : span[0];
          timer = window.setTimeout(refresh, Math.max(16, (boundary - now) * 10 / player.playbackRate));
        }
      }
      function onPlaying() { buffering = false; refresh(); }
      function onWaiting() { buffering = true; clear(); }
      const events = {
        playing: onPlaying, waiting: onWaiting, timeupdate: refresh, ratechange: refresh,
        seeking: clear, seeked: onPlaying, pause: clear, ended: clear, error: clear,
      };
      for (const [event, handler] of Object.entries(events)) player.addEventListener(event, handler);
      refresh();
      return () => {
        for (const [event, handler] of Object.entries(events)) player.removeEventListener(event, handler);
        clear();
      };
    },
  };
}

export const ReadAlongContext = createContext<ReturnType<typeof createReadAlong> | null>(null);
const subscribeEmpty = () => () => {};
const readEmpty = () => undefined;

export function ReadAlongText({ track, text, offset = 0, glossary = false }: {
  track: ReadAlongTrack;
  text: string;
  offset?: number;
  glossary?: boolean;
}) {
  const store = useContext(ReadAlongContext);
  const highlighted = useSyncExternalStore(
    store?.subscribe ?? subscribeEmpty,
    () => matchingWords(track, store?.getSnapshot() ?? null),
    readEmpty,
  );
  let word = offset;
  return text.split(/(\s+)/).map((part, index) => {
    if (!part.trim()) return part;
    const current = contains(highlighted, word++);
    return <span key={index} data-read-along-active={current || undefined}>
      {glossary ? <EnglishWords text={part}/> : part}
    </span>;
  });
}
