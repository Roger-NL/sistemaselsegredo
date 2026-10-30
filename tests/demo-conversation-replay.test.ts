import { describe, expect, it } from "vitest";
import { createDemo } from "@/features/demo/model/reducer";
import { replaySlides } from "@/features/demo/model/replay";
import { PROFILES } from "@/features/demo/model/types";

for (const profile of PROFILES) describe(`recorded scene replay: ${profile}`, () => {
  it("preserves the recorded order, response and scene without adding another branch or editing progress", () => {
    const state = createDemo(profile, "recorded-review", 123);
    state.nodeId = "end";
    state.decisions = { "p10.contact": "bye" };
    state.transcript = [
      { id: "question", nodeId: "p1.lucas", part: 1, role: "character", audioId: "C01" },
      { id: "answer", nodeId: "p2.send", part: 2, role: "you", audioId: "U01", written: "No, it isn't mine." },
      { id: "goodbye", nodeId: "p10.bye", part: 10, role: "you", audioId: "U20" },
    ];
    const before = JSON.stringify(state);
    const slides = replaySlides(state);
    expect(slides.map(slide => slide.id)).toEqual(["question", "answer", "goodbye"]);
    expect(slides.map(slide => slide.image.id)).toEqual(["V01", "V02", "V12"]);
    expect(slides[1].text).toBe("No, it isn't mine.");
    expect(slides[1].meaning).toBeNull(); // Never label the model translation as the student's own words.
    expect(slides.map(slide => slide.audioId)).toEqual(["C01", "U01", "U20"]);
    expect(JSON.stringify(state)).toBe(before);
  });
  it("does not invent a conversation for an empty attempt", () => {
    expect(replaySlides(createDemo(profile, "empty", 0))).toEqual([]);
  });
});
