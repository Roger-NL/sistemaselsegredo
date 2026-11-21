import { getTutorialNarration, type TutorialNarrationId } from "./tutorial-script";
import type { LessonSpeechRole } from "./lesson-audio";

/** Each screen rehearses a different control used in the actual lesson. */
export const TUTORIAL_STEPS = [
  { id: "welcome", title: "Escute a Ana", audio: "welcome", kind: "listen" },
  { id: "repeat", title: "Ouça quantas vezes quiser", audio: "repeat", kind: "repeat" },
  { id: "drag", title: "Leve a fala até a Ana", audio: "drag", kind: "phrase" },
  { id: "word-pieces", title: "Monte a fala com as peças", audio: "word-pieces", kind: "words" },
  { id: "write-check", title: "Escreva, confira e corrija", audio: "write-check", kind: "write" },
  { id: "success", title: "Tudo pronto para a aula", audio: "success", kind: "finish" },
] as const;

export type TutorialStepId = typeof TUTORIAL_STEPS[number]["id"];
export type TutorialAudioId = TutorialNarrationId | "ana" | "word";
export type TutorialStepAudio = { id: TutorialAudioId; person: "ana" | "nina"; text: string; key: string; role: LessonSpeechRole };
export const TUTORIAL_ENGLISH_MODEL: TutorialStepAudio = { id: "ana", person: "ana", text: "I am Ana.", key: "ana:I am Ana.", role: "character" };
export type TutorialWord = "I" | "am" | "Ana.";
export function isTutorialWord(text: string): text is TutorialWord {
  return text === "I" || text === "am" || text === "Ana.";
}

export function getTutorialStep(id: TutorialStepId | number) {
  return typeof id === "number" ? TUTORIAL_STEPS[Math.max(0, Math.min(TUTORIAL_STEPS.length - 1, id))] : TUTORIAL_STEPS.find(step => step.id === id) ?? TUTORIAL_STEPS[0];
}
export function getTutorialStepAudio(id: TutorialStepId | number): TutorialStepAudio {
  return getTutorialNarration(getTutorialStep(id).audio);
}
export function getNextTutorialStep(id: TutorialStepId): TutorialStepId | null {
  const index = TUTORIAL_STEPS.findIndex(step => step.id === id);
  return TUTORIAL_STEPS[index + 1]?.id ?? null;
}
export function isTutorialActionStep(id: TutorialStepId | number) {
  return ["phrase", "words", "write"].includes(getTutorialStep(id).kind);
}
