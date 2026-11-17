export const LESSON_JOURNEY_STAGES = [
  { id: "introduction", label: "Apresentação", units: 3 },
  { id: "guide", label: "Como funciona", units: 6 },
  { id: "lesson", label: "Aula", units: 29 },
  { id: "theory", label: "Teoria", units: 5 },
  { id: "test", label: "Teste", units: 6 },
] as const;
export type LessonJourneyStage = typeof LESSON_JOURNEY_STAGES[number]["id"];
export const LESSON_JOURNEY_TOTAL_UNITS = LESSON_JOURNEY_STAGES.reduce((sum, stage) => sum + stage.units, 0);
export const LESSON_JOURNEY_TITLE = "Apresentação → Como funciona → Aula → Teoria → Teste";

/** One denominator across the whole demo; a fresh test starts at 43/49. */
export function getLessonJourney(stage: LessonJourneyStage, completed: number) {
  const found = LESSON_JOURNEY_STAGES.findIndex(item => item.id === stage);
  const index = found < 0 ? 0 : found;
  const current = LESSON_JOURNEY_STAGES[index];
  const stageCompleted = Number.isFinite(completed) ? Math.max(0, Math.min(current.units, Math.floor(completed))) : 0;
  const previous = LESSON_JOURNEY_STAGES.slice(0, index).reduce((sum, item) => sum + item.units, 0);
  const completedUnits = previous + stageCompleted;
  return { stage: current.id, label: current.label, stageCompleted, stageTotal: current.units,
    completedUnits, totalUnits: LESSON_JOURNEY_TOTAL_UNITS, percent: Math.round(100 * completedUnits / LESSON_JOURNEY_TOTAL_UNITS),
    segments: LESSON_JOURNEY_STAGES.map((item, position) => {
      const units = position < index ? item.units : position === index ? stageCompleted : 0;
      return { ...item, completed: units, fraction: units / item.units };
    }) };
}
