import { PERSON_NAMES, phraseText, type PersonId, type Round } from "./lesson-one";

export type LessonSpokenTurn = {
  person: PersonId;
  text: string;
  role: "character" | "narration";
  turnIndex?: number;
};

/** Speak given information before a puzzle; perform its answer only after acceptance. */
export function getAutomaticLessonSpeech(round: Round, accepted: boolean, chosenSpeaker?: PersonId): LessonSpokenTurn[] {
  if (round.vocabulary) return [];
  if (accepted) {
    if (round.kind === "ensemble" || round.kind === "messages") {
      return (round.ensemble ?? []).map((turn, turnIndex) => ({ person: turn.speaker, text: phraseText(turn.expected), role: "character", turnIndex }));
    }
    return [{ person: round.kind === "speaker" ? chosenSpeaker ?? round.speaker : round.speaker, text: phraseText(round.expected), role: "character" }];
  }
  if (round.kind === "messages") return (round.ensemble ?? []).map((turn, turnIndex) => ({ person: "nina", text: phraseText(turn.expected), role: "narration", turnIndex }));
  if (round.kind === "speaker" || round.kind === "join") return [{ person: "nina", text: phraseText(round.expected), role: "narration" }];
  return [];
}

/** The large instruction lives beside the people and objects it describes. */
export function getLessonSceneGuide(round: Round, writing = false): { title: string; action: string } {
  const who = PERSON_NAMES[round.speaker], listener = PERSON_NAMES[round.listener];
  if (round.kind === "messages") return { title: "Quem enviou cada mensagem?", action: "Leve cada pessoa até a mensagem que ela poderia enviar." };
  if (round.kind === "ensemble") return { title: "Vamos montar esta conversa.", action: "Escolha um turno. Depois, leve a fala até ele." };
  if (round.kind === "speaker") return { title: "Quem pode dizer esta frase?", action: "Clique na pessoa." };
  if (round.kind === "join") return { title: "Faça a equipe combinar com a fala.", action: "Inclua uma pessoa na equipe." };
  if (round.kind === "verb") return { title: `Complete a fala de ${who}.`, action: writing ? "Escreva a frase do seu jeito." : "Leve am ou are até o espaço vazio." };
  if (round.vocabulary) return { title: round.instruction, action: round.vocabulary.cue };
  const title = round.expected.pronoun === "I" ? `${who} quer se apresentar.`
    : round.expected.pronoun === "you" ? `${who} fala diretamente com ${listener}.`
      : round.expected.pronoun === "we" ? `${who} apresenta a própria equipe.` : `${who} fala sobre a outra equipe.`;
  return { title, action: writing ? "Escreva o que essa pessoa diz." : round.kind === "bubbles" ? "Escolha a fala e leve até quem está falando." : "Monte a fala com as peças abaixo." };
}
