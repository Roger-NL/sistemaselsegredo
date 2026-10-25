import { describe, expect, it } from "vitest";
import { nextSceneDensity, type SceneSpace } from "@/features/demo/model/layout";

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
