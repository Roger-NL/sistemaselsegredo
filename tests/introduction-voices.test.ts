import { describe, expect, it } from "vitest";
import { createIntroductionAudioController, getIntroductionClips, LESSON_INTRODUCTION_SCENES } from "../src/features/first-encounters/lesson-introduction";

describe("introduction voice identities", () => {
  it("permits only the visible guide and four exact recorded actor models", () => {
    const controller = createIntroductionAudioController();
    const clips = LESSON_INTRODUCTION_SCENES.flatMap(getIntroductionClips);
    expect(clips.map(clip => clip.person)).toEqual(["nina", "ana", "leo", "nina", "ana", "maya", "nina"]);
    expect(clips.every(clip => clip.role === "character" && controller.has(clip.person, clip.text))).toBe(true);
    expect(clips.filter(clip => clip.english).map(clip => clip.key)).toEqual([
      "ana:I am Ana.", "leo:You are Ana.", "ana:We are a team.", "maya:They are a team.",
    ]);
    for (const clip of clips.filter(clip => clip.english)) expect(controller.has("nina", clip.text)).toBe(false);
    expect(controller.has("ana", "You are Ana.")).toBe(false);
    expect(controller.has("leo", "We are a team.")).toBe(false);
    expect(controller.has("ana", LESSON_INTRODUCTION_SCENES[0].text)).toBe(false);
    expect(controller.has("nina", "A different Portuguese narration.")).toBe(false);
    controller.dispose();
  });
});
