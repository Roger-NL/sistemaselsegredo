import type { FirstDayVoiceClip } from "./narration";

type ProloguePanel = {
  title: string;
  caption: string;
  image: string;
  alt: string;
  audio: FirstDayVoiceClip;
  pieces: ReadonlyArray<{ word: string; voice: FirstDayVoiceClip; translation: string }>;
};

export const prologue = {
  intro: {
    title: "Seu crachá",
    caption: "Na portaria, perguntam se o crachá é seu.",
    image: "cracha",
    alt: "Na entrada do campus, você segura o crachá na mão.",
    audio: "tutorial-lookup",
    pieces: [{ word: "Yes!", voice: "tutorial-yes", translation: "Sim!" }],
  },
  drag: {
    title: "Um oi no corredor",
    caption: "Um colega acena. Você dá um oi.",
    image: "corredor",
    alt: "Um colega levanta a mão para cumprimentar você no corredor.",
    audio: "tutorial-place",
    pieces: [
      { word: "Hi", voice: "word-hi", translation: "Oi…" },
      { word: "there!", voice: "tutorial-there", translation: "Oi!" },
    ],
  },
  language: {
    title: "Antes do almoço",
    caption: "The door is still closed.",
    image: "porta",
    alt: "A porta do refeitório vista do corredor, antes de abrir para o almoço.",
    audio: "tutorial-switch",
    pieces: [],
  },
  arrival: {
    title: "O refeitório",
    caption: "Rafael abre a porta.",
    image: "abertura",
    alt: "Rafael abre a porta verde. Do outro lado, a luz entra pelas janelas do refeitório.",
    audio: "tutorial-arrival",
    pieces: [],
  },
} as const satisfies Record<string, ProloguePanel>;

export const doorCaptionPt = "A porta ainda está fechada.";
export type PrologueStep = keyof typeof prologue;
export const prologueOrder: readonly PrologueStep[] = ["intro", "drag", "language", "arrival"];
