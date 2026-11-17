import { describe, expect, it } from "vitest";
import { decodeLessonAccountSnapshot, encodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";
import { getLessonDashboardSnapshot } from "@/features/first-encounters/lesson-dashboard";
import { LESSON_SCENES } from "@/features/first-encounters/lesson-one";
import { restoreLessonProgress } from "@/features/first-encounters/lesson-progress";
import { accountLesson } from "./helpers/lesson-snapshot";

 describe("account snapshot for Aula 1", () => {
  it("has one canonical representation and a separate course identity", () => {
    const full = accountLesson();
    const decoded = decodeLessonAccountSnapshot(full)!;
    expect(decoded.courseId).toBe("first-encounters-v1");
    expect(encodeLessonAccountSnapshot(decoded.progress, decoded.mechanics)).toBe(full);
    for (const raw of [null, "broken", '{"version":2}', '{"version":1,"courseId":"old-course","progress":{}}', '{"version":1,"courseId":"first-encounters-v1","progress":{"lesson":5}}']) expect(decodeLessonAccountSnapshot(raw)).toBeNull();
  });
  it("represents every one of the 49 steps coherently and unlocks only at the end", () => {
    for (let units = 0; units <= 49; units++) {
      const snapshot = getLessonDashboardSnapshot(decodeLessonAccountSnapshot(accountLesson(units))!.progress);
      expect(snapshot.completedUnits).toBe(units);
      expect(snapshot.status === "complete").toBe(units === 49);
    }
  });
  it("drops unknown activity IDs, gaps, duplicate supports and unrecognized mechanics", () => {
    const ids = LESSON_SCENES.flatMap(scene => scene.rounds.map(round => round.id));
    const raw = encodeLessonAccountSnapshot({ introduction: null, guide: null, conclusion: null,
      lesson: JSON.stringify({ version: 2, scene: 12, round: 99, completed: [ids[0], ids[2], "unknown"], supported: [ids[0], ids[0], "unknown"] }),
      introPosition: '{"version":1,"index":90}', guidePosition: '{"version":1,"index":-4}' },
      '{"version":1,"seen":["bubbles","bubbles","invented"]}');
    const snapshot = decodeLessonAccountSnapshot(raw)!;
    expect(restoreLessonProgress(snapshot.progress.lesson)).toMatchObject({ completed: [ids[0]], supported: [ids[0]] });
    expect(JSON.parse(snapshot.progress.introPosition!)).toEqual({ version: 1, index: 2 });
    expect(JSON.parse(snapshot.progress.guidePosition!)).toEqual({ version: 1, index: 0 });
    expect(JSON.parse(snapshot.mechanics!)).toEqual({ version: 1, seen: ["bubbles"] });
  });
  it("preserves introduced vocabulary with the account, filtering unknown words", () => {
    const current = decodeLessonAccountSnapshot(accountLesson())!;
    const encoded = encodeLessonAccountSnapshot(current.progress, JSON.stringify({ version: 1, seen: ["build"], words: ["I", "am", "am", "invented"] }));
    const restored = decodeLessonAccountSnapshot(encoded)!;
    expect(JSON.parse(restored.mechanics!)).toEqual({ version: 1, seen: ["build"], words: ["I", "am"] });
    expect(encodeLessonAccountSnapshot(restored.progress, restored.mechanics)).toBe(encoded);
  });
  it("rechecks test answers and never trusts a saved summary label", () => {
    const snapshot = decodeLessonAccountSnapshot(accountLesson())!;
    const conclusion = JSON.parse(snapshot.progress.conclusion!);
    conclusion.attempts["write-listener"].lastAnswer = "I am Leo.";
    const altered = encodeLessonAccountSnapshot({ ...snapshot.progress, conclusion: JSON.stringify(conclusion) });
    expect(getLessonDashboardSnapshot(decodeLessonAccountSnapshot(altered)!.progress)).toMatchObject({ completedUnits: 48, status: "in-progress" });
  });
});
