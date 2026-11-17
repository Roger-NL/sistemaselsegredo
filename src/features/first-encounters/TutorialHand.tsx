"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { RefObject } from "react";
import type { LessonSpeechDriver, LessonSpeechFrame } from "./lesson-audio";
import "./tutorial-hand.css";

export type TutorialHandBeat = {
  id: string;
  kind: "point" | "tap" | "drag" | "two-tap";
  /** Absolute seconds on this narration asset, never a wall-clock delay. */
  start: number;
  end: number;
  /** A data-tutorial-cue value within scopeRef, not a CSS selector. */
  target: string;
  source?: string;
  text?: string;
  /** Generic demonstrations can use a small card while pointing at a group. */
  ghostWidth?: number;
  ghostHeight?: number;
  /** Optional absolute seconds for a drag's travel, between start and end. */
  travelStart?: number;
  travelEnd?: number;
  sourceLabel?: string;
  targetLabel?: string;
};

export type TutorialHandPlan = {
  id: string;
  /** Exact speech frame key. A different clip must never run this demonstration. */
  audioKey: string;
  beats: readonly TutorialHandBeat[];
};

export type TutorialHandProps = {
  scopeRef: RefObject<HTMLElement | null>;
  speech: LessonSpeechDriver;
  plan: TutorialHandPlan | null;
  /** The parent turns this off as soon as the learner starts interacting. */
  active?: boolean;
};

type Point = { x: number; y: number };
type LocalRect = Point & { width: number; height: number };
const TIP = { x: 30, y: 7 };
const HAND_SIZE = { width: 88, height: 112, scale: .82 };
const EASE_OUT = [.23, 1, .32, 1] as const;
const EASE_TRAVEL = [.77, 0, .175, 1] as const;
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;

/** Cubic-bezier tokens shared with the lesson/animate skill, sampled by media time. */
function ease(progress: number, curve: readonly number[]) {
  const x = clamp(progress);
  const sample = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  let low = 0, high = 1;
  for (let index = 0; index < 14; index++) {
    const middle = (low + high) / 2;
    if (sample(middle, curve[0], curve[2]) < x) low = middle; else high = middle;
  }
  return sample((low + high) / 2, curve[1], curve[3]);
}

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function getReducedMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
function getServerReducedMotion() { return true; }

function pulse(time: number, center: number, width: number) {
  return Math.max(0, 1 - Math.abs(time - center) / width);
}
function normalized(time: number, start: number, end: number) {
  return clamp((time - start) / Math.max(.001, end - start));
}
function center(rect: LocalRect): Point { return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }; }
function handAngle(anchors: readonly Point[], width: number, height: number) {
  // Choose from fixed anchors, not the traveling pointer. The same beat keeps
  // its orientation from pickup to release; a layout change can re-evaluate it.
  const angles = [-12, 168, 78, -102];
  const corners = [[0, 0], [HAND_SIZE.width, 0], [0, HAND_SIZE.height], [HAND_SIZE.width, HAND_SIZE.height]];
  let bestAngle = angles[0], bestOverflow = Infinity;
  for (const angle of angles) {
    const radians = angle * Math.PI / 180;
    const cos = Math.cos(radians), sin = Math.sin(radians);
    let overflow = 0;
    for (const anchor of anchors) {
      for (const [x, y] of corners) {
        const localX = (x - TIP.x) * HAND_SIZE.scale, localY = (y - TIP.y) * HAND_SIZE.scale;
        const rotatedX = anchor.x + localX * cos - localY * sin;
        const rotatedY = anchor.y + localX * sin + localY * cos;
        // Leave room for the authored stroke and drop shadow as well.
        overflow += Math.max(0, 8 - rotatedX) + Math.max(0, rotatedX - width + 8)
          + Math.max(0, 8 - rotatedY) + Math.max(0, rotatedY - height + 8);
      }
    }
    if (overflow < bestOverflow) { bestAngle = angle; bestOverflow = overflow; }
    if (overflow === 0) break;
  }
  return bestAngle;
}
function setOpacity(element: HTMLElement, value: number) { element.style.opacity = String(clamp(value)); }
function positionRect(element: HTMLElement, rect: LocalRect) {
  element.style.width = `${rect.width}px`;
  element.style.height = `${rect.height}px`;
  element.style.transform = `translate3d(${rect.x}px,${rect.y}px,0)`;
}

/** Visual explanation only. It never clicks, focuses, selects or drops on the real exercise. */
export function TutorialHand({ scopeRef, speech, plan, active = true }: TutorialHandProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const handRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const ghostTextRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const sourceLabelRef = useRef<HTMLDivElement>(null);
  const targetLabelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);

  useEffect(() => {
    const overlay = overlayRef.current;
    const hand = handRef.current;
    const ghost = ghostRef.current;
    const ring = ringRef.current;
    const sourceMarker = sourceRef.current;
    const targetMarker = targetRef.current;
    const sourceLabel = sourceLabelRef.current;
    const targetLabel = targetLabelRef.current;
    if (!overlay || !hand || !ghost || !ring || !sourceMarker || !targetMarker || !sourceLabel || !targetLabel) return;
    let disposed = false;
    const observed = new Set<Element>();
    const hide = () => {
      overlay.dataset.tutorialHandState = "idle";
      overlay.dataset.tutorialHandBeat = "";
      for (const element of [hand, ghost, ring, sourceMarker, targetMarker, sourceLabel, targetLabel]) setOpacity(element, 0);
    };
    if (!active || !plan?.beats.length) { hide(); return; }
    const resize = typeof ResizeObserver === "function" ? new ResizeObserver(() => render(speech.getFrame())) : null;
    const observe = (element: Element) => {
      if (observed.has(element)) return;
      observed.add(element);
      resize?.observe(element);
    };
    const find = (scope: HTMLElement, value: string | undefined) => value
      ? [...scope.querySelectorAll<HTMLElement>("[data-tutorial-cue]")].find(element => element.dataset.tutorialCue === value)
      : undefined;
    const localRect = (element: HTMLElement | undefined, origin: DOMRect, scopeRect: DOMRect): LocalRect | null => {
      if (!element?.isConnected) return null;
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
      if (rect.width <= 0 || rect.height <= 0 || x < scopeRect.left || x > scopeRect.right || y < scopeRect.top || y > scopeRect.bottom) return null;
      observe(element);
      return { x: rect.left - origin.left, y: rect.top - origin.top, width: rect.width, height: rect.height };
    };
    const placeLabel = (element: HTMLElement, rect: LocalRect, text: string, width: number) => {
      if (element.textContent !== text) element.textContent = text;
      const x = clamp(rect.x + rect.width / 2, Math.min(115, width / 2), Math.max(width - 115, width / 2));
      element.style.transform = `translate3d(${x}px,${Math.max(40, rect.y - 8)}px,0) translate(-50%,-100%)`;
      setOpacity(element, 1);
    };
    const render = (frame: LessonSpeechFrame) => {
      if (disposed) return;
      const scope = scopeRef.current;
      const beat = plan?.beats.find(item => Number.isFinite(item.start) && Number.isFinite(item.end) && item.end > item.start && frame.time >= item.start && frame.time < item.end);
      if (!active || !scope || !plan || !frame.playing || frame.key !== plan.audioKey || !Number.isFinite(frame.time) || document.visibilityState === "hidden" || !beat) { hide(); return; }
      const origin = overlay.getBoundingClientRect();
      const scopeRect = scope.getBoundingClientRect();
      const targetElement = find(scope, beat.target);
      if (targetElement?.matches(":disabled,[aria-disabled=true]")) { hide(); return; }
      const target = localRect(targetElement, origin, scopeRect);
      const source = beat.kind === "drag" || beat.kind === "two-tap"
        ? localRect(find(scope, beat.source), origin, scopeRect) : target;
      // A missing/zero-sized target never falls back to a guessed screen position.
      if (!target || !source || origin.width <= 0 || origin.height <= 0) { hide(); return; }
      observe(scope);
      observe(overlay);
      hide();
      const from = center(source), to = center(target);
      const progress = normalized(frame.time, beat.start, beat.end);
      let position = to, press = 0, click = 0, ghostOpacity = 0;
      let ringPosition = to;
      if (reducedMotion) {
        position = beat.kind === "drag" || beat.kind === "two-tap" ? from : to;
        positionRect(targetMarker, target);
        setOpacity(targetMarker, 1);
        placeLabel(targetLabel, target, beat.targetLabel ?? (beat.kind === "point" ? "Aqui" : beat.kind === "drag" ? "2 · Leve a fala até aqui" : beat.kind === "two-tap" ? "2 · Clique aqui" : "Clique aqui"), origin.width);
        if (beat.kind === "drag" || beat.kind === "two-tap") {
          positionRect(sourceMarker, source); setOpacity(sourceMarker, 1);
          placeLabel(sourceLabel, source, beat.sourceLabel ?? (beat.kind === "drag" ? "1 · Pegue a fala" : "1 · Clique na fala"), origin.width);
        }
      } else if (beat.kind === "drag") {
        const travelStart = clamp(beat.travelStart ?? lerp(beat.start, beat.end, .27), beat.start, beat.end - .001);
        const travelEnd = clamp(beat.travelEnd ?? lerp(beat.start, beat.end, .86), travelStart + .001, beat.end);
        const travel = ease(normalized(frame.time, travelStart, travelEnd), EASE_TRAVEL);
        position = { x: lerp(from.x, to.x, travel), y: lerp(from.y, to.y, travel) };
        const grasp = normalized(frame.time, beat.start, travelStart);
        press = Math.max(pulse(grasp, .5, .32), frame.time >= travelStart && frame.time <= travelEnd ? .55 : 0);
        const release = normalized(frame.time, travelEnd, beat.end);
        click = frame.time < travelStart ? pulse(grasp, .5, .32) : frame.time >= travelEnd ? pulse(release, .18, .4) : 0;
        ringPosition = frame.time < travelStart ? from : to;
        // The real card stays readable during the press. Reveal the opaque
        // example only once held, so two translucent copies do not overlap.
        ghostOpacity = frame.time < travelStart ? ease(normalized(grasp, .68, .85), EASE_OUT) : 1 - ease(release, EASE_OUT);
        positionRect(targetMarker, target); setOpacity(targetMarker, .25 + travel * .6);
      } else if (beat.kind === "two-tap") {
        const travel = ease(normalized(progress, .35, .65), EASE_TRAVEL);
        position = { x: lerp(from.x, to.x, travel), y: lerp(from.y, to.y, travel) };
        press = Math.max(pulse(progress, .19, .1), pulse(progress, .82, .1));
        click = press;
        ringPosition = progress < .5 ? from : to;
      } else if (beat.kind === "tap") {
        press = pulse(progress, .5, .2);
        click = press;
      }
      const visibility = reducedMotion ? 1 : Math.min(normalized(progress, 0, .07), 1 - normalized(progress, .94, 1));
      const angle = handAngle([from, to], origin.width, origin.height);
      hand.style.transform = `translate3d(${position.x - TIP.x}px,${position.y - TIP.y}px,0) rotate(${angle}deg) scale(${HAND_SIZE.scale * (1 - press * .055)})`;
      setOpacity(hand, visibility);
      overlay.dataset.tutorialHandState = reducedMotion ? "reduced" : beat.kind;
      overlay.dataset.tutorialHandBeat = beat.id;
      overlay.dataset.tutorialHandX = position.x.toFixed(3);
      overlay.dataset.tutorialHandY = position.y.toFixed(3);
      overlay.dataset.tutorialHandAngle = String(angle);
      if (ghostOpacity > 0 && !reducedMotion) {
        const width = Math.min(source.width, beat.ghostWidth ?? source.width);
        const height = Math.min(source.height, beat.ghostHeight ?? source.height);
        ghost.style.width = `${width}px`;
        ghost.style.height = `${height}px`;
        ghost.style.transform = `translate3d(${position.x - width / 2}px,${position.y - height / 2}px,0)`;
        if (ghostTextRef.current && ghostTextRef.current.textContent !== (beat.text ?? "I am Ana.")) ghostTextRef.current.textContent = beat.text ?? "I am Ana.";
        setOpacity(ghost, ghostOpacity);
      }
      if (click > 0 && !reducedMotion) {
        ring.style.transform = `translate3d(${ringPosition.x}px,${ringPosition.y}px,0) translate(-50%,-50%) scale(${1 + (1 - click) * .65})`;
        setOpacity(ring, click * .8);
      }
    };
    const onLayout = () => render(speech.getFrame());
    const scope = scopeRef.current;
    const mutations = new MutationObserver(onLayout);
    if (scope) { observe(scope); mutations.observe(scope, { childList: true, subtree: true }); }
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);
    document.addEventListener("visibilitychange", onLayout);
    const unsubscribe = speech.subscribeFrame(render);
    render(speech.getFrame());
    return () => {
      disposed = true;
      unsubscribe(); resize?.disconnect(); mutations.disconnect();
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
      document.removeEventListener("visibilitychange", onLayout);
      hide();
    };
  }, [active, plan, reducedMotion, scopeRef, speech]);

  return <div ref={overlayRef} className="th-overlay" aria-hidden="true" data-tutorial-hand-state="idle" data-tutorial-hand-beat="">
    <div ref={sourceRef} className="th-target th-source"/>
    <div ref={targetRef} className="th-target"/>
    <div ref={sourceLabelRef} className="th-callout"/>
    <div ref={targetLabelRef} className="th-callout"/>
    <div ref={ringRef} className="th-click-ring"/>
    <div ref={ghostRef} className="th-ghost"><span className="th-example">Exemplo</span><span ref={ghostTextRef}/></div>
    <div ref={handRef} className="th-hand" data-tutorial-hand-pointer="true">
      <span className="th-fingertip" data-tutorial-fingertip="true"/>
      <svg viewBox="0 0 88 112" focusable="false" aria-hidden="true">
        <path className="th-skin" d="M25 42V13C25 5 35 5 35 13V41L39 37C43 33 49 36 49 42V46L53 43C58 39 63 43 63 49V53L67 50C73 47 78 51 78 57L77 73C76 84 69 90 67 96V104H35L34 95C30 90 27 84 24 80L13 65C9 60 11 55 16 54C21 53 25 58 29 62L25 54Z"/>
        <path className="th-finger-lines" d="M35 43V59M49 47V63M63 54V66M30 71C35 66 40 68 43 73M37 91C44 87 55 87 63 91"/>
        <path className="th-cuff" d="M32 98H70V110H32Z"/>
        <path className="th-cuff-shine" d="M38 102H63"/>
      </svg>
    </div>
  </div>;
}
