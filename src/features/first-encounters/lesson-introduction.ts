import { createLessonAudioController, getLessonAudioClip, getLessonAudioKey } from "./lesson-audio";
import type { PersonId } from "./lesson-one";

import { LESSON_INTRODUCTION_SCENES, type IntroductionScene } from "./lesson-introduction-content";

export const LESSON_INTRODUCTION_STORAGE = "basedspeak.lesson-one.introduction.v1";
export { LESSON_INTRODUCTION_SCENES } from "./lesson-introduction-content";
export type { IntroductionModel, IntroductionScene, IntroductionSceneId } from "./lesson-introduction-content";
export type IntroductionClip = {
  person: PersonId; text: string; key: string; role: "character"; english: boolean; modelIndex: number | null;
};

/** Each block is a complete utterance, reached only by a learner gesture. */
export function getIntroductionClips(scene: IntroductionScene): readonly IntroductionClip[] {
  return scene.blocks.map(block => {
    const model = typeof block === "number" ? scene.models[block] : null;
    const person = model?.speaker ?? "nina";
    const text = typeof block === "number" ? scene.models[block].text : block.text;
    return { person, text, key: getLessonAudioKey(person, text), role: "character", english: Boolean(model),
      modelIndex: typeof block === "number" ? block : null };
  });
}

const CLIPS = new Map(LESSON_INTRODUCTION_SCENES.flatMap(scene => scene.blocks.map(block => {
  if (typeof block !== "number") return [getLessonAudioKey("nina", block.text), `/first-encounters/audio/introduction-pt/nina-${block.recording}.m4a`] as const;
  const { speaker, text } = scene.models[block];
  return [getLessonAudioKey(speaker, text), getLessonAudioClip(speaker, text)] as const;
})));
type ControllerOptions = Omit<NonNullable<Parameters<typeof createLessonAudioController>[0]>, "catalog" | "resolveClip">;

export function createIntroductionAudioController(options: ControllerOptions = {}) {
  return createLessonAudioController({ ...options, resolveClip: (person, text) => CLIPS.get(getLessonAudioKey(person, text)) ?? getLessonAudioClip(person, text) });
}
