import type { BarrierId, LearningLanguage, SceneId } from "./language";
import { guidedLife } from "./guided-life";
import { guidedTravel } from "./guided-travel";
import { guidedWork } from "./guided-work";
import { translate, type GuidedScenarioContent, type Translation } from "./guided-content-types";

export const guidedContent: Record<SceneId, Record<BarrierId, GuidedScenarioContent>> = {
  world: guidedTravel,
  work: guidedWork,
  life: guidedLife,
};

export const guidedSpeechPhrases = Array.from(new Set(
  Object.values(guidedContent).flatMap((paths) => Object.values(paths).flatMap((scenario) => [
    scenario.question,
    ...scenario.contrast.map((part) => part.en),
    ...scenario.answers.flatMap((answer) => [
      answer.phrase,
      ...answer.parts.map((part) => part.en),
      answer.reaction.phrase,
      ...answer.reaction.parts.map((part) => part.en),
    ]),
  ])),
));

const lessonOpening: Translation = [
  "Vamos lá{address}. “{phrase}” significa “{meaning}”.",
  "Vamos allá{address}. “{phrase}” significa “{meaning}”.",
  "Los geht’s{address}. „{phrase}“ bedeutet „{meaning}“.",
];
const contrastTitle: Translation = ["DUAS RESPOSTAS, DUAS IDEIAS", "DOS RESPUESTAS, DOS IDEAS", "ZWEI ANTWORTEN, ZWEI AUSSAGEN"];
const selectionLabel: Translation = ["Quero usar esta resposta", "Quiero usar esta respuesta", "Ich möchte diese Antwort verwenden"];
const intentLabels: [Translation, Translation, Translation] = [
  ["COMEÇO DA IDEIA", "INICIO DE LA IDEA", "ANFANG DES GEDANKENS"],
  ["COMO ELA CONTINUA", "CÓMO CONTINÚA", "SO GEHT ES WEITER"],
  ["COMPLETA A INTENÇÃO", "COMPLETA LA INTENCIÓN", "VERVOLLSTÄNDIGT DIE ABSICHT"],
];
const progress: Record<BarrierId, Translation> = {
  start: ["Você escolheu sua resposta em inglês e acompanhou a reação da outra pessoa.", "Elegiste tu respuesta en inglés y seguiste la reacción de la otra persona.", "Du hast deine Antwort auf Englisch gewählt und die Reaktion der anderen Person mitverfolgt."],
  freeze: ["Você usou um começo pronto para responder e acompanhou o que veio depois.", "Usaste un comienzo preparado para responder y seguiste lo que vino después.", "Du hast einen fertigen Einstieg zum Antworten genutzt und die Reaktion mitverfolgt."],
  words: ["Você usou vocabulário dentro de uma resposta completa e acompanhou a reação.", "Usaste vocabulario dentro de una respuesta completa y seguiste la reacción.", "Du hast Wörter in einer vollständigen Antwort verwendet und die Reaktion mitverfolgt."],
  translate: ["Você escolheu uma resposta em inglês e viu como a conversa continuou.", "Elegiste una respuesta en inglés y viste cómo continuó la conversación.", "Du hast eine Antwort auf Englisch gewählt und gesehen, wie das Gespräch weiterging."],
};

export function guidedLessonOpening(language: LearningLanguage, name: string | undefined, phrase: string, meaning: string) {
  return translate(lessonOpening, language)
    .replace("{address}", name ? `, ${name}` : "")
    .replace("{phrase}", phrase)
    .replace("{meaning}", meaning);
}

export function guidedContrastTitle(language: LearningLanguage) { return translate(contrastTitle, language); }
export function guidedSelectionLabel(language: LearningLanguage) { return translate(selectionLabel, language); }
export function guidedIntentLabel(language: LearningLanguage, index: number, count: number) {
  return translate(intentLabels[index === 0 ? 0 : index === count - 1 ? 2 : 1], language);
}
export function guidedProgress(language: LearningLanguage, barrier: BarrierId) { return translate(progress[barrier], language); }
