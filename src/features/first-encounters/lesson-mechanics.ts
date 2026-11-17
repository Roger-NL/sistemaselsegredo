import type { Round } from "./lesson-one";
import type { TutorialHandBeat, TutorialHandPlan } from "./TutorialHand";
import type { TutorialClipTiming } from "./TutorialCaption";
import { getTutorialNarration } from "./tutorial-script";

export const LESSON_MECHANICS_STORAGE = "basedspeak.lesson-one.mechanics.v1";
export type LessonMechanicId = Round["kind"] | "write";
export type LessonMechanic = {
  id: LessonMechanicId;
  text: string;
  key: string;
  url: string;
  person: "nina";
  role: "narration";
};

const TEXT: Record<Round["kind"], string> = {
  bubbles: "Escolha uma fala e leve até o balão. Você também pode tocar na fala e depois no balão.",
  join: "Escolha uma pessoa e leve para dentro da equipe. Você também pode tocar na pessoa e depois na equipe.",
  speaker: "A fala já está pronta. Toque na pessoa que pode dizer isso.",
  verb: "Escolha uma peça e leve até o espaço vazio da fala. Depois, toque em Conferir.",
  build: "Complete os dois espaços da fala com as peças. Depois, toque em Conferir.",
  messages: "Leve cada pessoa até a mensagem que ela enviou. Use cada pessoa uma vez. Depois, toque em Conferir.",
  ensemble: "Leve cada fala até um dos quatro turnos. Você pode trocar as falas. Depois, toque em Conferir.",
};
const definition = (id: Round["kind"]): LessonMechanic => ({ id, text: TEXT[id], key: `nina:${TEXT[id]}`,
  url: `/first-encounters/audio/mechanics-pt/nina-${id}.m4a`, person: "nina", role: "narration" });
const writing = getTutorialNarration("write-check");

/** Frozen recording copy; these clips explain controls, never the linguistic solution. */
export const LESSON_MECHANICS: Record<LessonMechanicId, LessonMechanic> = {
  bubbles: definition("bubbles"), join: definition("join"), speaker: definition("speaker"),
  verb: definition("verb"), build: definition("build"), messages: definition("messages"), ensemble: definition("ensemble"),
  write: { id: "write", text: writing.text, key: writing.key, url: writing.url, person: "nina", role: "narration" },
};

export function getLessonMechanic(round: Pick<Round, "kind"> | null | undefined, writingMode = false): LessonMechanic | null {
  return !round ? null : LESSON_MECHANICS[writingMode ? "write" : round.kind] ?? null;
}

const clean = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "");

/** Answer-independent demonstrations: source groups and generic ghosts, no expected/owner lookup. */
export function getLessonMechanicHandPlan(id: LessonMechanicId, timing?: TutorialClipTiming, round?: Round): TutorialHandPlan | null {
  void round; // The same mechanical demonstration must survive a change of correct answer.
  const clip = LESSON_MECHANICS[id];
  if (!clip) return null;
  const duration = timing?.duration ?? Math.max(3.6, clip.text.length / 14);
  const word = (name: string, fallback: number) => timing?.words.find(item => clean(item.word) === name) ?? { start: fallback, end: fallback + .3 };
  const bounded = (beat: TutorialHandBeat): TutorialHandBeat => ({ ...beat, start: Math.max(0, beat.start), end: Math.min(duration - .02, beat.end) });
  const point = (name: string, target: string, start: number, end: number): TutorialHandBeat => bounded({ id: name, kind: "point", target, start, end });
  const drag = (name: string, source: string, target: string, text: string, start: number, end: number): TutorialHandBeat => bounded({ id: name, kind: "drag", source, target, text, start, end,
    ghostWidth: 152, ghostHeight: 46, sourceLabel: "1 · Pegue aqui", targetLabel: "2 · Leve até aqui" });
  const check = word("conferir", duration - .8);
  let beats: TutorialHandBeat[];
  switch (id) {
    case "bubbles": {
      const destination = word("balao", duration * .42);
      beats = [drag("phrase-example", "bubble-bank", "bubble-target", "Sua fala", .12, destination.end + .12)];
      break;
    }
    case "join": {
      const destination = word("equipe", duration * .46);
      beats = [drag("person-example", "people", "team", "Uma pessoa", .12, destination.end + .12)];
      break;
    }
    case "speaker":
      beats = [point("choose-person", "people", word("toque", .9).start - .12, duration - .06)];
      break;
    case "verb":
      beats = [drag("word-example", "word-bank", "word-verb-slot", "Uma peça", .12, Math.max(1.5, check.start - .7)), point("check-words", "check", check.start - .15, check.end + .12)];
      break;
    case "build": {
      const end = Math.max(1.8, word("depois", duration * .66).start - .12);
      const middle = (.12 + end) / 2;
      beats = [drag("first-space", "word-bank", "word-pronoun-slot", "Uma peça", .12, middle - .04), drag("second-space", "word-bank", "word-verb-slot", "Outra peça", middle + .04, end), point("check-words", "check", check.start - .15, check.end + .12)];
      break;
    }
    case "messages":
      beats = [drag("sender-example", "people", "messages", "Uma pessoa", .12, word("enviou", duration * .44).end + .12), point("check-messages", "check", check.start - .15, check.end + .12)];
      break;
    case "ensemble":
      beats = [drag("turn-example", "bubble-bank", "turns", "Sua fala", .12, word("turnos", duration * .42).end + .12), point("check-turns", "check", check.start - .15, check.end + .12)];
      break;
    case "write": {
      const write = word("escreva", .8), erase = word("apagar", 4.94);
      beats = [point("write-here", "write-input", write.start - .15, write.end + .5), point("check-writing", "check", check.start - .15, check.end + .15), point("erase-writing", "apagar", erase.start - .15, erase.end + .1)];
      break;
    }
  }
  return { id: `lesson-mechanic-${id}`, audioKey: clip.key, beats: beats.filter(beat => beat.end > beat.start) };
}
