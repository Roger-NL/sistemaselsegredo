"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getMotionPreference, getServerPreference, subscribePreferences } from "@/features/dashboard/preferences";

type StartOptions = { resume?: boolean; prepare?: () => void };
type Journey = { start: (options?: StartOptions) => void; ready: (element: HTMLElement) => () => void; cancel: () => void; pending: boolean; headerTone: "paper" | "immersive"; reducedMotion: boolean };
const noop = () => {};
const ready = () => noop;
const JourneyContext = createContext<Journey>({ start: noop, ready, cancel: noop, pending: false, headerTone: "paper", reducedMotion: false });

/** Compatibility for existing navigation; the current lesson owns its transitions. */
export function JourneyTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const reducedMotion = useSyncExternalStore(subscribePreferences, getMotionPreference, getServerPreference);
  const start = useCallback((options: StartOptions = {}) => { options.prepare?.(); router.push("/demo"); }, [router]);
  const value = useMemo<Journey>(() => ({ start, ready, cancel: noop, pending: false, headerTone: "paper", reducedMotion }), [start, reducedMotion]);
  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}
export const useJourneyTransition = () => useContext(JourneyContext);
