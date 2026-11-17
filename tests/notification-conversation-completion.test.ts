import { describe, expect, it } from "vitest";
import { completedLesson } from "@/server/notifications/events";
import { accountLesson } from "./helpers/lesson-snapshot";
import { decodeLessonAccountSnapshot, encodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";

describe("Aula 1 completion notification", () => {
  it("recognizes completion only after practice, theory and all six correct test answers", () => {
    expect(completedLesson(accountLesson())).toBe(true);
    for (const units of [0, 3, 9, 37, 38, 43, 48]) expect(completedLesson(accountLesson(units))).toBe(false);
  });
  it("ignores legacy snapshots and a forged summary with a wrong final answer", () => {
    for (const raw of [null, "broken", '{"nodeId":"end"}', '{"studyCompleted":49,"demoPercent":100}']) expect(completedLesson(raw)).toBe(false);
    const saved = decodeLessonAccountSnapshot(accountLesson())!;
    const conclusion = JSON.parse(saved.progress.conclusion!);
    conclusion.attempts["write-self"].lastAnswer = "You are Ana.";
    expect(completedLesson(encodeLessonAccountSnapshot({ ...saved.progress, conclusion: JSON.stringify(conclusion) }))).toBe(false);
  });
});
