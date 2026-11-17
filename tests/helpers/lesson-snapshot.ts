import { LESSON_SCENES } from "@/features/first-encounters/lesson-one";
import { createLessonProgress } from "@/features/first-encounters/lesson-progress";
import { conclusionModel, CONCLUSION_QUESTIONS, createConclusionState } from "@/features/first-encounters/lesson-conclusion";
import { encodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";
import type { LessonDashboardInput } from "@/features/first-encounters/lesson-dashboard";

/** Coherent new-curriculum evidence at each of the 49 global positions. */
export function accountLesson(units = 49): string {
  const progress: LessonDashboardInput = { introduction: null, guide: null, lesson: null, conclusion: null };
  if (units < 3) progress.introPosition = JSON.stringify({ version: 1, index: units });
  else if (units < 9) {
    progress.introduction = "done";
    progress.guidePosition = JSON.stringify({ version: 1, index: units - 3 });
  } else {
    progress.introduction = "done"; progress.guide = "done";
    const rows = LESSON_SCENES.flatMap((scene, si) => scene.rounds.map((round, ri) => ({ id: round.id, scene: si, round: ri })));
    const count = Math.min(29, units - 9), cursor = rows[count];
    progress.lesson = JSON.stringify({ ...createLessonProgress(), scene: cursor?.scene ?? 12, round: cursor?.round ?? 0, completed: rows.slice(0, count).map(item => item.id) });
    if (units >= 38) {
      const state = createConclusionState();
      state.theoryIndex = Math.min(4, units - 38);
      if (units >= 43) {
        const answered = units - 43;
        state.testStarted = true; state.phase = units === 49 ? "summary" : "test"; state.questionIndex = Math.min(5, answered);
        for (const question of CONCLUSION_QUESTIONS.slice(0, answered)) {
          const answer = conclusionModel(question); state.attempts[question.id] = { draft: answer, firstAnswer: answer, lastAnswer: answer };
        }
      }
      progress.conclusion = JSON.stringify(state);
    }
  }
  return encodeLessonAccountSnapshot(progress);
}
