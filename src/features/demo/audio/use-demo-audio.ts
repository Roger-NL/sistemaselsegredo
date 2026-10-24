"use client";

import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { DemoAudioPlayer, type AudioProgress } from "./player";
import { createCatalogAudioClient } from "../services/audio-client";
import type { AudioId } from "../model/types";

export type Playback = { source: string | null; status: "idle" | AudioProgress["status"]; progress: number };
export type DemoAudio = {
  playback: Playback;
  replay: (ids: AudioId | AudioId[], source: string) => Promise<void>;
  pause: () => void; resume: () => Promise<void>; stop: () => void;
  release: (source: string) => void;
  setPlaybackRate: (rate: number) => void;
};
const idle: Playback = { source: null, status: "idle", progress: 0 };
export const DemoAudioContext = createContext<DemoAudio | null>(null);

export function useDemoAudio(activityKey: string): DemoAudio {
  const [state, setState] = useState<Playback & { activityKey: string }>({ ...idle, activityKey });
  const playback = state.activityKey === activityKey ? state : idle;
  const player = useRef<DemoAudioPlayer | null>(null);
  const resolver = useRef<ReturnType<typeof createCatalogAudioClient> | null>(null);
  const operation = useRef({ version: 0, rate: 1, source: null as string | null, controller: null as AbortController | null });
  useEffect(() => {
    const current = operation.current;
    return () => { current.version++; current.controller?.abort(); player.current?.cancel(); };
  }, [activityKey]);

  const stop = useCallback(() => {
    operation.current.version++;
    operation.current.controller?.abort(); operation.current.controller = null;
    operation.current.source = null;
    player.current?.cancel();
    setState({ ...idle, activityKey });
  }, [activityKey]);
  const release = useCallback((source: string) => { if (operation.current.source === source) stop(); }, [stop]);
  async function replay(input: AudioId | AudioId[], source: string) {
    const version = ++operation.current.version;
    operation.current.controller?.abort(); player.current?.cancel();
    const controller = new AbortController(); operation.current.controller = controller;
    operation.current.source = source;
    setState({ activityKey, source, status: "loading", progress: 0 });
    resolver.current ??= createCatalogAudioClient();
    player.current ??= new DemoAudioPlayer();
    player.current.setPlaybackRate(operation.current.rate);
    const ids = Array.isArray(input) ? input : [input];
    try {
      const ok = await player.current.playSequence(ids.map(id => () => resolver.current!(id, controller.signal)), update => {
        if (version === operation.current.version) setState({ ...update, activityKey, source });
      });
      if (version !== operation.current.version) return;
      operation.current.controller = null;
      setState(current => ({ ...current, status: ok ? "ended" : "error", progress: ok ? 1 : current.progress }));
    } catch {
      if (version === operation.current.version && !controller.signal.aborted) {
        operation.current.controller = null;
        setState(current => ({ ...current, status: "error" }));
      }
    }
  }
  return {
    playback, replay, stop, release,
    pause() {
      if (playback.status !== "playing" && playback.status !== "loading") return;
      if (!player.current?.pause()) { stop(); return; }
      setState(current => current.activityKey === activityKey ? { ...current, status: "paused" } : current);
    },
    async resume() {
      if (playback.status !== "paused") return;
      const version = operation.current.version;
      const ok = await player.current?.resume();
      if (version === operation.current.version) setState(current => ({ ...current, status: ok ? "playing" : "error" }));
    },
    setPlaybackRate(rate) { operation.current.rate = rate; player.current?.setPlaybackRate(rate); },
  };
}
