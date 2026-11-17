"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { lessonSoundsEngine } from "./lesson-sounds";
import type { LessonSoundsEngine } from "./lesson-sounds";

const serverMuted = () => false;

/** An independent owner of the page's shared, voice-independent SFX channel. */
export function useLessonSounds(engine: LessonSoundsEngine = lessonSoundsEngine) {
  const [scope] = useState(() => engine.createScope());
  const muted = useSyncExternalStore(engine.subscribe, engine.getMuted, serverMuted);
  useEffect(() => scope.mount(), [scope]);
  return { play: scope.play, muted, toggleMuted: engine.toggleMuted, unlock: scope.unlock };
}
