import { describe, expect, it } from "vitest";
import { visibleViewportSize } from "@/lib/ui/viewport";

describe("public pages in the visible viewport", () => {
  it("fits the actual Chrome zoom regression instead of the larger layout viewport", () => {
    expect(visibleViewportSize({ width: 440, height: 956 }, {
      width: 348.8288269042969, height: 757.909912109375,
    })).toEqual({ width: 348, height: 757 });
  });

  it("follows a shrinking visible height without increasing the layout width", () => {
    expect(visibleViewportSize({ width: 390, height: 844 }, { width: 390, height: 410.8 }))
      .toEqual({ width: 390, height: 410 });
    expect(visibleViewportSize({ width: 320, height: 568 }, { width: 900, height: 1000 }))
      .toEqual({ width: 320, height: 568 });
  });

  it("uses the browser layout when visual viewport dimensions are absent or invalid", () => {
    const layout = { width: 320, height: 568 };
    expect(visibleViewportSize(layout)).toEqual(layout);
    expect(visibleViewportSize(layout, { width: NaN, height: 0 })).toEqual(layout);
  });
});
