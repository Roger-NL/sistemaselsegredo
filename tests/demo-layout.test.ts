import { describe, expect, it } from "vitest";
import { mobileArtworkHeight, nextSceneDensity, visibleAppSize, type SceneSpace } from "@/features/demo/model/layout";

const phone: SceneSpace = { available: 600, intro: 90, activity: 260, gap: 8, mobile: true };
describe("single-screen scene density", () => {
  it("keeps a short activity spacious with the illustration visible", () => {
    expect(nextSceneDensity("comfortable", phone)).toBe("comfortable");
  });
  it("reduces spacing progressively for long content, without creating a separate page", () => {
    const long = { ...phone, activity: 450 };
    expect(nextSceneDensity("comfortable", long)).toBe("compact");
    expect(nextSceneDensity("compact", long)).toBe("tight");
    expect(nextSceneDensity("tight", long)).toBe("tight");
  });
  it("retains comfortable spacing on desktop when the complete text fits", () => {
    expect(nextSceneDensity("comfortable", { ...phone, mobile: false, activity: 450 })).toBe("comfortable");
  });
  it("adapts opening cards even though their separate intro slot is intentionally empty", () => {
    const opening = { ...phone, intro: 0, activity: 450 };
    expect(nextSceneDensity("comfortable", opening)).toBe("compact");
    expect(nextSceneDensity("compact", opening)).toBe("tight");
    expect(nextSceneDensity("tight", opening)).toBe("tight");
    expect(nextSceneDensity("comfortable", { ...opening, activity: 260 })).toBe("comfortable");
  });
  it("does not change density before dimensions are available", () => {
    expect(nextSceneDensity("compact", { ...phone, available: 0 })).toBe("compact");
    expect(nextSceneDensity("comfortable", { ...phone, intro: 0 })).toBe("comfortable");
  });
});

describe("visible mobile viewport", () => {
  it("uses the narrower visible area when the layout viewport is wider", () => {
    expect(visibleAppSize({ width: 500, height: 1000 }, { width: 441, height: 957 })).toEqual({ width: 441, height: 957 });
  });
  it("does not expand the app beyond the layout viewport or round into overflow", () => {
    expect(visibleAppSize({ width: 390, height: 844 }, { width: 390.75, height: 844.75 })).toEqual({ width: 390, height: 844 });
    expect(visibleAppSize({ width: 390, height: 844 }, { width: 375.75, height: 700.5 })).toEqual({ width: 375, height: 700 });
  });
  it("retains the layout size when the visual viewport is unavailable", () => {
    expect(visibleAppSize({ width: 320, height: 568 })).toEqual({ width: 320, height: 568 });
    expect(visibleAppSize({ width: 320, height: 568 }, { width: 0, height: 0 })).toEqual({ width: 320, height: 568 });
  });
});

describe("mobile artwork sizing", () => {
  it("keeps the original image ratio instead of making an empty portrait frame", () => {
    expect(mobileArtworkHeight(414, { available: 780, intro: 0, activity: 190, gap: 10 })).toBe(276);
  });
  it("gives longer conversation text and its buttons space before sizing the image", () => {
    expect(mobileArtworkHeight(414, { available: 600, intro: 100, activity: 280, gap: 10 })).toBe(200);
  });
  it("retains a recognizable scene on short screens and keeps narrow images in proportion", () => {
    expect(mobileArtworkHeight(320, { available: 400, intro: 80, activity: 220, gap: 8 })).toBe(144);
    expect(mobileArtworkHeight(200, { available: 400, intro: 0, activity: 120, gap: 8 })).toBe(133);
  });
});
