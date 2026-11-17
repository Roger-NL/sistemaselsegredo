import { createLessonAudioController, getLessonAudioClip, getLessonAudioKey } from "./lesson-audio";
import type { PersonId } from "./lesson-one";

export const LESSON_INTRODUCTION_STORAGE = "basedspeak.lesson-one.introduction.v1";
export type IntroductionSceneId = "self-and-you" | "we-and-they" | "lesson-path";
export type IntroductionModel = { speaker: PersonId; text: string; translation: string };
export type IntroductionScene = {
  id: IntroductionSceneId;
  title: string;
  subtitle: string;
  text: string;
  person: "nina";
  role: "character";
  key: string;
  url: string;
  models: readonly IntroductionModel[];
};

function scene(value: Omit<IntroductionScene, "person" | "role" | "key" | "url">): IntroductionScene {
  return { ...value, person: "nina", role: "character", key: getLessonAudioKey("nina", value.text),
    url: `/first-encounters/audio/introduction-pt/nina-${value.id}.m4a` };
}

/** A content preview; the separate guide introduces the lesson's controls. */
export const LESSON_INTRODUCTION_SCENES: readonly IntroductionScene[] = [
  scene({
    id: "self-and-you",
    title: "Eu e você, em inglês.",
    subtitle: "A fala muda conforme quem fala e quem escuta.",
    text: "Nesta aula, você vai aprender a falar de si e com outra pessoa. Primeiro, eu sou. Depois, você é. Veja quem fala e com quem fala.",
    models: [
      { speaker: "ana", text: "I am Ana.", translation: "Eu sou Ana." },
      { speaker: "leo", text: "You are Ana.", translation: "Você é Ana." },
    ],
  }),
  scene({
    id: "we-and-they",
    title: "Nós e eles, em inglês.",
    subtitle: "Veja se quem fala faz parte da equipe.",
    text: "Ao falar da própria equipe, usamos nós somos. Ao falar de outra equipe, usamos eles ou elas são. As imagens mostram quem faz parte de cada grupo.",
    models: [
      { speaker: "ana", text: "We are a team.", translation: "Nós somos uma equipe." },
      { speaker: "maya", text: "They are a team.", translation: "Eles/elas são uma equipe." },
    ],
  }),
  scene({
    id: "lesson-path",
    title: "Um passo de cada vez.",
    subtitle: "Da primeira tentativa ao que você consegue usar.",
    text: "Você começa praticando em cenas curtas. Depois, entende a regra com exemplos. No fim, faz um teste curto para ver o que já consegue usar.",
    models: [],
  }),
];

export type IntroductionClip = {
  person: PersonId; text: string; key: string; role: "character"; english: boolean; modelIndex: number | null;
};

/** One voice channel: the visible PT guide, followed by each actual EN speaker. */
export function getIntroductionClips(selected: IntroductionScene): readonly IntroductionClip[] {
  return [{ person: selected.person, text: selected.text, key: selected.key, role: "character", english: false, modelIndex: null },
    ...selected.models.map((model, modelIndex): IntroductionClip => ({ person: model.speaker, text: model.text,
      key: getLessonAudioKey(model.speaker, model.text), role: "character", english: true, modelIndex }))];
}

const ENGLISH_MODELS = new Set(LESSON_INTRODUCTION_SCENES.flatMap(item => item.models.map(model => getLessonAudioKey(model.speaker, model.text))));
type ControllerOptions = Omit<NonNullable<Parameters<typeof createLessonAudioController>[0]>, "catalog" | "resolveClip">;

/** Exactly three local PT clips and four already recorded person/phrase pairs. */
export function createIntroductionAudioController(options: ControllerOptions = {}) {
  return createLessonAudioController({ ...options, resolveClip: (person, text) => {
    const introduction = person === "nina" ? LESSON_INTRODUCTION_SCENES.find(item => item.text === text) : undefined;
    if (introduction) return introduction.url;
    return ENGLISH_MODELS.has(getLessonAudioKey(person, text)) ? getLessonAudioClip(person, text) : undefined;
  } });
}
