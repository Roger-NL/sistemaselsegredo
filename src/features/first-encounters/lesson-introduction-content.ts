import type { PersonId } from "./lesson-one";

export type IntroductionSceneId = "self-and-you" | "we-and-they" | "lesson-path";
export type IntroductionModel = { speaker: PersonId; text: string; translation: string };
export type IntroductionScene = {
  id: IntroductionSceneId;
  title: string;
  subtitle: string;
  blocks: readonly (number | { text: string; recording: string })[];
  models: readonly IntroductionModel[];
};

/** A content preview; the separate guide introduces the lesson's controls. */
export const LESSON_INTRODUCTION_SCENES: readonly IntroductionScene[] = [
  {
    id: "self-and-you",
    title: "Eu e você, em inglês.",
    subtitle: "A fala muda conforme quem fala e quem escuta.",
    blocks: [{ text: "Nesta aula, você vai aprender a falar de si e com outra pessoa.", recording: "self-preview" }, 0, 1],
    models: [
      { speaker: "ana", text: "I am Ana.", translation: "Eu sou Ana." },
      { speaker: "leo", text: "You are Ana.", translation: "Você é Ana." },
    ],
  },
  {
    id: "we-and-they",
    title: "Nós e eles, em inglês.",
    subtitle: "Veja se quem fala faz parte da equipe.",
    blocks: [
      { text: "Ao falar da própria equipe, usamos nós somos.", recording: "own-team" }, 0,
      { text: "Ao falar de outra equipe, usamos eles ou elas são.", recording: "other-team" }, 1,
    ],
    models: [
      { speaker: "ana", text: "We are a team.", translation: "Nós somos uma equipe." },
      { speaker: "maya", text: "They are a team.", translation: "Eles/elas são uma equipe." },
    ],
  },
  {
    id: "lesson-path",
    title: "Um passo de cada vez.",
    subtitle: "Da primeira tentativa ao que você consegue usar.",
    blocks: [
      { text: "Você começa praticando em cenas curtas.", recording: "practice" },
      { text: "Depois, entende a regra com exemplos.", recording: "rule" },
      { text: "No fim, faz um teste curto para ver o que já consegue usar.", recording: "test" },
    ],
    models: [],
  },
];
