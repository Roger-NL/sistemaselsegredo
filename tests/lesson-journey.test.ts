import { expect, it } from "vitest";
import { getLessonJourney, LESSON_JOURNEY_TOTAL_UNITS, type LessonJourneyStage } from "../src/features/first-encounters/lesson-journey";

it("uses all49units across stage boundaries and clamps invalid per-stage progress", () => {
  expect(LESSON_JOURNEY_TOTAL_UNITS).toBe(49);
  for (const [stage, completed, percent] of [["introduction",0,0],["guide",0,6],["lesson",0,18],["theory",0,78],["test",0,88],["test",6,100]] as const) {
    const result = getLessonJourney(stage, completed);
    expect(result.percent).toBe(percent);
    expect(result.segments.reduce((sum, item) => sum + item.completed, 0)).toBe(result.completedUnits);
  }
  expect(getLessonJourney("lesson", 29).percent).toBe(78);
  expect(getLessonJourney("test", -5).percent).toBe(88);
  expect(getLessonJourney("test", 999).percent).toBe(100);
  expect(getLessonJourney("test", Number.NaN).percent).toBe(88);
  expect(getLessonJourney("introduction", Infinity).percent).toBe(0);
  expect(getLessonJourney("lesson", 2.9).stageCompleted).toBe(2);
  expect(getLessonJourney("unknown" as LessonJourneyStage, 0).percent).toBe(0);
});
