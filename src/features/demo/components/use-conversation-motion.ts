"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, type Dispatch } from "react";
import { flushSync } from "react-dom";
import { getMotionPreference, subscribePreferences } from "@/features/dashboard/preferences";
import { transition } from "../model/reducer";
import type { DemoEvent, DemoState } from "../model/types";

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
    const changed = after.nodeId !== before.nodeId || after.phase !== before.phase
      || after.presentationStep !== before.presentationStep || after.reviewView !== before.reviewView
      || after.audioAccess !== before.audioAccess;
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
