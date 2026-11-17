import { createLessonAudioController, getLessonAudioClip } from "./lesson-audio";

export const REVISION_NARRATIONS = {
  completion: { text: "Parabéns! Você concluiu sua primeira aula. Você aprendeu a falar de si, com outra pessoa e sobre uma equipe. Vamos relembrar?", url: "/first-encounters/audio/revision-pt/nina-completion-congratulations.m4a" },
  self: { text: "Aqui, I significa eu. Com I, usamos am para dizer eu sou. You significa você. Com you, usamos are para dizer você é.", url: "/first-encounters/audio/revision-pt/nina-words-self-you.m4a" },
  team: { text: "We significa nós e inclui quem fala. We are significa nós somos. They significa eles ou elas e indica outro grupo. They are significa eles ou elas são.", url: "/first-encounters/audio/revision-pt/nina-words-we-they.m4a" },
} as const;

// Sentence excerpts from Nina's two word explanations.
export const WORD_NARRATIONS = {
  I: "Aqui, I significa eu.",
  am: "Com I, usamos am para dizer eu sou.",
  you: "You significa você.",
  are: "Com you, usamos are para dizer você é.",
  we: "We significa nós e inclui quem fala.",
  they: "They significa eles ou elas e indica outro grupo.",
} as const;
const wordRecordings = new Map(Object.entries(WORD_NARRATIONS).map(([word, text]) =>
  [text as string, `/first-encounters/audio/revision-pt/nina-word-${word.toLowerCase()}.m4a`]));

/** Exact local recordings, never browser synthesis or an online TTS request. */
export function createRevisionAudioController() {
  return createLessonAudioController({ resolveClip: (person, text) => getLessonAudioClip(person, text)
    ?? (person === "nina" ? Object.values(REVISION_NARRATIONS).find(clip => clip.text === text)?.url
      ?? wordRecordings.get(text) : undefined) });
}
