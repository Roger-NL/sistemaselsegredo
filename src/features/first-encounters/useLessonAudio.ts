"use client";

import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";
import { createLessonAudioController } from "./lesson-audio";
import type { LessonAudioController } from "./lesson-audio";

const SERVER_SNAPSHOT = { playingKey: null, error: null, blocked: false };
const serverSnapshot = () => SERVER_SNAPSHOT;

export function useLessonAudio(scopeKey: string, createController: () => LessonAudioController = createLessonAudioController) {
  const [controller] = useState(createController);
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, serverSnapshot);

  // Cancel before the next painted round, including unresolved play() promises.
  useLayoutEffect(() => {
    controller.stop();
    return () => controller.stop();
  }, [controller, scopeKey]);

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) controller.stop(); };
    const onPageHide = () => controller.stop();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      // dispose remains reusable for React Strict Mode's effect remount check.
      controller.dispose();
    };
  }, [controller]);

  return { ...snapshot, play: controller.play, request: controller.request, unlock: controller.unlock, resume: controller.resume,
    pause: controller.pause, stop: controller.stop, has: controller.has, speech: controller.speech };
}
