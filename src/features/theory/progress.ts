import { lessons, type Practice } from "./content";

export const studySteps = lessons.flatMap(lesson => lesson.steps.map(step => ({ lesson, step })));
export const THEORY_KEY = "basedspeak.study.cafe.v1";
export type StudyProgress = { version: 1; position: number; completed: string[]; supported: string[] };
export const emptyProgress: StudyProgress = { version: 1, position: 0, completed: [], supported: [] };
const ids = new Set(studySteps.map(({ step }) => step.id));

export function decodeProgress(raw: string | null): StudyProgress {
  if (!raw) return emptyProgress;
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !Number.isInteger(value.position) || !Array.isArray(value.completed) || !Array.isArray(value.supported)) return emptyProgress;
    const clean = (list: unknown[]) => [...new Set(list.filter((id): id is string => typeof id === "string" && ids.has(id)))];
    const completed = clean(value.completed);
    return { version: 1, position: Math.max(0, Math.min(value.position, studySteps.length - 1)), completed, supported: clean(value.supported).filter(id => completed.includes(id)) };
  } catch { return emptyProgress; }
}

export function normalizeAnswer(value: string) {
  return value.normalize("NFC").toLowerCase().replace(/[’‘]/g, "'").replace(/\bit's\b/g, "it is").replace(/\bi'm\b/g, "i am").replace(/\bdon't\b/g, "do not").replace(/\bisn't\b/g, "is not").replace(/[.,!?]/g, "").replace(/\s+/g, " ").trim();
}
export function isCorrect(practice: Practice, answer: string) {
  const accepted = practice.kind === "write" ? practice.answers : [practice.answer];
  return accepted.some(value => normalizeAnswer(value) === normalizeAnswer(answer));
}
export function completeStep(progress: StudyProgress, id: string, withModel: boolean): StudyProgress {
  if (!ids.has(id)) return progress;
  return { ...progress, completed: [...new Set([...progress.completed, id])], supported: withModel ? [...new Set([...progress.supported, id])] : progress.supported.filter(value => value !== id) };
}
