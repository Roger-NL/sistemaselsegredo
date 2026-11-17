"use client";

import { createTutorialAudioController } from "./tutorial-audio";
import { useLessonAudio } from "./useLessonAudio";

/** One mounted controller owns PT narration, English Ana, and their shared clock. */
export function useTutorialAudio(scopeKey: string) {
  return useLessonAudio(scopeKey, createTutorialAudioController);
}
