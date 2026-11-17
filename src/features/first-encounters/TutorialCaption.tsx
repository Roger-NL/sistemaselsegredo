"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { LessonSpeechDriver } from "./lesson-audio";

export type TutorialWordTiming = { word: string; start: number; end: number };
export type TutorialClipTiming = { duration: number; words: TutorialWordTiming[] };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** Interpolate letters inside each actually spoken word, preserving its pauses. */
export function getTutorialCaptionLength(text: string, time: number, duration: number, timing?: TutorialClipTiming): number {
  const tokens = [...text.matchAll(/\S+/g)];
  const words = timing?.words.filter(word => normalize(word.word));
  const matches = words?.length === tokens.length && words.every((word, index) => {
    const spoken = normalize(word.word), written = normalize(tokens[index][0]);
    return spoken === written || written === "ana" && spoken === "anna";
  });
  if (matches && words) {
    let shown = 0;
    for (let index = 0; index < words.length; index++) {
      const word = words[index], start = tokens[index].index!, end = start + tokens[index][0].length;
      if (time < word.start) return shown;
      if (time >= word.end) { shown = end; continue; }
      return start + Math.floor((end - start) * Math.max(0, Math.min(1, (time - word.start) / Math.max(.02, word.end - word.start))));
    }
    return shown;
  }
  const progress = Math.max(0, Math.min(1, (time - .14) / Math.max(.1, duration - .28)));
  return Math.floor(text.length * progress);
}

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Only this text node changes per audio frame; the scene and character do not rerender. */
export function TutorialCaption({ speech, text, clipKey, timing, complete }: {
  speech: LessonSpeechDriver; text: string; clipKey: string; timing?: TutorialClipTiming; complete: boolean;
}) {
  const node = useRef<HTMLSpanElement>(null);
  const previousCopy = useRef<string | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => true);
  useEffect(() => {
    const element = node.current;
    if (!element) return;
    const paint = (length: number) => {
      const next = text.slice(0, length);
      if (element.textContent !== next) element.textContent = next;
      element.dataset.captionLength = String(length);
      element.dataset.captionComplete = String(length === text.length);
    };
    const identity = `${clipKey}:${text}`;
    if (previousCopy.current !== identity) { previousCopy.current = identity; paint(0); }
    if (complete || reducedMotion) paint(text.length);
    const update = () => {
      const frame = speech.getFrame();
      if (complete || reducedMotion) paint(text.length);
      else if (frame.playing && frame.key === clipKey) paint(getTutorialCaptionLength(text, frame.time, frame.duration, timing));
    };
    const unsubscribe = speech.subscribeFrame(update);
    update();
    return unsubscribe;
  }, [speech, text, clipKey, timing, complete, reducedMotion]);
  return <p className="lo-tutorial-caption" data-caption-key={clipKey}><span ref={node} className="lo-tutorial-typed" aria-hidden="true"/><span className="lo-tutorial-sr">{text}</span></p>;
}
