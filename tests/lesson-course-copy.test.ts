import { describe, expect, it } from "vitest";
import { LESSON_SCENES } from "../src/features/first-encounters/lesson-one";
import { getLessonSceneGuide } from "../src/features/first-encounters/lesson-speech-plan";
import { TUTORIAL_STEPS } from "../src/features/first-encounters/tutorial-steps";
import { TUTORIAL_NARRATIONS } from "../src/features/first-encounters/tutorial-script";

const activityWords = /\bjog(?:o|os|ar|ando|ue|ues)\b/iu;
describe("course terminology", () => {
  it("uses lesson and activity language across all public prompts, guides and recorded tutorial copy", () => {
    const copy: string[] = [
      ...TUTORIAL_STEPS.map(step => step.title),
      ...Object.values(TUTORIAL_NARRATIONS).map(clip => clip.text),
    ];
    for (const scene of LESSON_SCENES) {
      copy.push(scene.title, scene.prompt, scene.hint, scene.insight);
      for (const round of scene.rounds) {
        const guide = getLessonSceneGuide(round);
        copy.push(round.instruction, guide.title, guide.action);
      }
    }
    for (const text of copy) expect(text, text).not.toMatch(activityWords);
  });
});
