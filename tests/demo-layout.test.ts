import { describe, expect, it } from "vitest";
import { needsScenePages, type SceneSpace } from "@/features/demo/model/layout";

const phone: SceneSpace = { available: 600, intro: 90, activity: 260, gap: 8, mobile: true };
describe("scene space and safe pagination", () => {
  it("keeps a short phone activity with its large illustration", () => {
    expect(needsScenePages(phone)).toBe(false);
  });
  it("separates longer guided/selection/construction content before controls lose space", () => {
    for (const activity of [350, 420, 560]) expect(needsScenePages({ ...phone, activity })).toBe(true);
  });
  it("adapts to keyboard space without changing the exercise", () => {
    expect(needsScenePages({ ...phone, available: 300 })).toBe(true);
  });
  it("keeps a fitting desktop response centered and splits one that exceeds the column", () => {
    expect(needsScenePages({ ...phone, mobile: false, activity: 450 })).toBe(false);
    expect(needsScenePages({ ...phone, mobile: false, activity: 550 })).toBe(true);
  });
  it("does not flicker between pages at a resize boundary, and reunites after enough growth", () => {
    expect(needsScenePages({ ...phone, available: 520 }, true)).toBe(true);
    expect(needsScenePages({ ...phone, available: 560 }, true)).toBe(false);
  });
  it("retains the last layout until hidden or initial dimensions can be measured", () => {
    expect(needsScenePages({ ...phone, available: 0 }, true)).toBe(true);
    expect(needsScenePages({ ...phone, intro: 0 })).toBe(false);
  });
});
