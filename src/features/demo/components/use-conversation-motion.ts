"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, type Dispatch } from "react";
import { flushSync } from "react-dom";
import { getMotionPreference, subscribePreferences } from "@/features/dashboard/preferences";
import { transition } from "../model/reducer";
import type { DemoEvent, DemoState } from "../model/types";
import { playInteractionSound } from "@/components/interaction/sounds";
import { storySoundFor } from "../model/story-sound";

/** Keep the real DOM current; only the browser's decorative snapshots overlap. */
export function useConversationMotion(state: DemoState, dispatch: Dispatch<DemoEvent>) {
  const current = useRef(state);
  useLayoutEffect(() => { current.current = state; }, [state]);
  const active = useRef<ViewTransition | null>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => {
      active.current?.skipTransition();
      active.current = null;
      delete document.documentElement.dataset.demoTransition;
    };
    const preferenceChanged = () => { if (media.matches || getMotionPreference()) stop(); };
    media.addEventListener("change", preferenceChanged);
    const unsubscribe = subscribePreferences(preferenceChanged);
    return () => { stop(); unsubscribe(); media.removeEventListener("change", preferenceChanged); };
  }, []);

  return useCallback((event: DemoEvent) => {
    const before = current.current;
    const after = transition(before, event);
    const storySound = storySoundFor(before, after, event);
    if (storySound) void playInteractionSound(storySound);
    else if (event.type === "SEND_RESPONSE" && after !== before) void playInteractionSound(after.evidence.length > before.evidence.length ? "correct" : "retry");
    else if (event.type === "ANSWER_MEANING" && after !== before) void playInteractionSound(event.correct ? "correct" : "retry");
    else if (event.type === "PLACE_BLOCK" && after.returnSerial > before.returnSerial) void playInteractionSound("retry");
    else if (["CONTINUE_SCENE", "BACK_SCENE", "NEXT", "ADVANCE_PRESENTATION", "BACK", "CHOOSE", "PREPARE", "CHECK"].includes(event.type)) {
      if (after !== before) void playInteractionSound("advance");
    }
    const changed = after.nodeId !== before.nodeId || after.phase !== before.phase
      || after.presentationStep !== before.presentationStep || after.reviewView !== before.reviewView;
    if (!changed || !document.startViewTransition || getMotionPreference()
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dispatch(event); return;
    }
    active.current?.skipTransition();
    document.documentElement.dataset.demoTransition = "active";
    const animation = document.startViewTransition(() => flushSync(() => dispatch(event)));
    active.current = animation;
    // A rapid next action may skip snapshots; it must never lose the state update.
    void animation.ready.catch(() => {});
    void animation.finished.catch(() => {}).finally(() => {
      if (active.current !== animation) return;
      active.current = null;
      delete document.documentElement.dataset.demoTransition;
    });
  }, [dispatch]);
}
