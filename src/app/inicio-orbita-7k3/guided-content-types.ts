import type { LearningLanguage } from "./language";

// Portuguese, Spanish, German. English is the shared language being learned.
export type Translation = readonly [string, string, string];
export type TeachingUnit = { en: string; meaning: Translation; note: Translation };
export type GuidedAnswerContent = {
  id: "first" | "second" | "love" | "hate";
  phrase: string;
  meaning: Translation;
  parts: TeachingUnit[];
  reaction: { phrase: string; meaning: Translation; parts: TeachingUnit[] };
};
export type GuidedScenarioContent = {
  context: Translation;
  setting: Translation;
  question: string;
  questionMeaning: Translation;
  answers: [GuidedAnswerContent, GuidedAnswerContent];
  contrast: [TeachingUnit, TeachingUnit];
};

export function translate(text: Translation, language: LearningLanguage): string {
  return text[language === "pt" ? 0 : language === "es" ? 1 : 2];
}

export function unit(en: string, meaning: Translation, note: Translation): TeachingUnit {
  return { en, meaning, note };
}

export function reaction(en: string, meaning: Translation, note: Translation) {
  return { phrase: en, meaning, parts: [unit(en, meaning, note)] };
}

export function reply(parts: TeachingUnit[], meaning: Translation) {
  return { phrase: parts.map((part) => part.en).join(" "), meaning, parts };
}

export function answer(
  id: GuidedAnswerContent["id"],
  parts: TeachingUnit[],
  meaning: Translation,
  response: GuidedAnswerContent["reaction"],
): GuidedAnswerContent {
  return { id, phrase: parts.map((part) => part.en).join(" "), meaning, parts, reaction: response };
}
