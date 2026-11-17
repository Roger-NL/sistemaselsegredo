"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useLessonDrag } from "./LessonDrag";
import "./lesson-task-transition.css";

export type LessonTaskTransitionProps = {
  transitionKey: string | number;
  /** Absolute task index; a lower index enters from the previous direction. */
  order: number;
  enabled?: boolean;
  children?: ReactNode;
};

type RunningTransition = { node: HTMLElement; animation: Animation; previousWillChange: string };
type PreviousTask = { key: string | number; order: number; enabled: boolean };
const TARGETS = ".ls-stage-content,.ls-speech-anchor,.lo-workbench";

/**
 * Keep this wrapper and its LessonDragProvider unkeyed. It never duplicates
 * children, delays an update, disables controls, or animates the Rive world.
 */
export function LessonTaskTransition({ transitionKey, order, enabled = true, children }: LessonTaskTransitionProps) {
  const scope = useRef<HTMLDivElement>(null);
  const previous = useRef<PreviousTask | null>(null);
  const running = useRef(new Map<HTMLElement, RunningTransition>());
  const inputMode = useRef<"pointer" | "keyboard">("pointer");
  const { cancel: cancelDrag } = useLessonDrag();

  const finishMotion = useCallback(() => {
    for (const transition of running.current.values()) {
      transition.node.style.willChange = transition.previousWillChange;
      try { transition.animation.finish(); } catch { /* A removed target is already settled. */ }
      transition.animation.cancel();
    }
    running.current.clear();
    scope.current?.setAttribute("data-lesson-transitioning", "false");
  }, []);

  useEffect(() => {
    // Capture before a drag reads geometry. Every visible control is immediately
    // available, and pointer travel never continues underneath a learner's hand.
    const onPointer = () => { inputMode.current = "pointer"; finishMotion(); };
    const onKey = () => { inputMode.current = "keyboard"; finishMotion(); };
    const onInput = () => finishMotion();
    const onVisibility = () => { if (document.hidden) finishMotion(); };
    const media = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    const onMotionPreference = () => finishMotion();
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("input", onInput, true);
    document.addEventListener("visibilitychange", onVisibility);
    media?.addEventListener("change", onMotionPreference);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("visibilitychange", onVisibility);
      media?.removeEventListener("change", onMotionPreference);
    };
  }, [finishMotion]);

  useLayoutEffect(() => () => finishMotion(), [finishMotion]);

  useLayoutEffect(() => {
    const element = scope.current, before = previous.current;
    previous.current = { key: transitionKey, order, enabled };
    if (!element) return;
    const changed = before !== null && before.key !== transitionKey;
    if (changed) cancelDrag();
    if (!changed || !enabled || !before.enabled || document.hidden || inputMode.current === "keyboard") {
      finishMotion();
      return;
    }

    // A programmatic second navigation can interrupt mid-flight. Capture its
    // visible state before cancelling, then continue from there to the new rest.
    const carried = new Map<HTMLElement, { opacity: string; transform: string }>();
    for (const transition of running.current.values()) {
      if (transition.node.isConnected) {
        const style = getComputedStyle(transition.node);
        carried.set(transition.node, { opacity: style.opacity, transform: style.transform });
      }
    }
    finishMotion();

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const tokens = getComputedStyle(element);
    const ease = tokens.getPropertyValue("--lesson-task-ease").trim() || "cubic-bezier(.23,1,.32,1)";
    const configuredDuration = Number.parseFloat(tokens.getPropertyValue("--lesson-task-duration"));
    const duration = reduce ? 160 : Math.min(300, Math.max(220, Number.isFinite(configuredDuration) ? configuredDuration : 260));
    const direction = order < before.order ? -1 : 1;
    const candidates = [...element.querySelectorAll<HTMLElement>(TARGETS)];
    const targets = candidates.filter(node => !candidates.some(other => other !== node && other.contains(node)));

    element.dataset.lessonTransitionDirection = direction === 1 ? "forward" : "back";
    for (const node of targets) {
      const base = getComputedStyle(node);
      if (base.display === "none" || base.visibility === "hidden" || typeof node.animate !== "function") continue;
      const previousFrame = carried.get(node);
      const parsedOpacity = Number.parseFloat(base.opacity);
      const baselineOpacity = Number.isFinite(parsedOpacity) ? parsedOpacity : 1;
      const travel = node.matches(".lo-workbench") ? 8 : 12;
      const transform = base.transform || "none";
      const start: Keyframe = { opacity: previousFrame?.opacity ?? baselineOpacity * .62 };
      const end: Keyframe = { opacity: baselineOpacity };
      if (!reduce) {
        start.transform = previousFrame?.transform ?? `translateX(${direction * travel}px)${transform === "none" ? "" : ` ${transform}`}`;
        end.transform = transform;
      }
      const previousWillChange = node.style.willChange;
      node.style.willChange = reduce ? "opacity" : "transform, opacity";
      const animation = node.animate([start, end], { duration, easing: ease, fill: "none" });
      const transition = { node, animation, previousWillChange };
      running.current.set(node, transition);
      void animation.finished.then(() => {
        if (running.current.get(node) !== transition) return;
        running.current.delete(node); node.style.willChange = previousWillChange;
        if (!running.current.size) element.dataset.lessonTransitioning = "false";
      }, () => { /* Cancellation is part of ordinary navigation. */ });
    }
    element.dataset.lessonTransitioning = String(running.current.size > 0);
  }, [transitionKey, order, enabled, cancelDrag, finishMotion]);

  return <div ref={scope} className="lesson-task-transition" data-lesson-transition-key={transitionKey} data-lesson-transitioning="false">{children}</div>;
}
