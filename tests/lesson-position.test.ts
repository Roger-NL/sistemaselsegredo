import { describe, expect, it } from "vitest";
import { INTRODUCTION_POSITION_STORAGE, TUTORIAL_POSITION_STORAGE, restorePosition } from "../src/features/first-encounters/lesson-position";

describe("lesson presentation cursors", () => {
  it("keeps the introduction and guide independently versioned", () => {
    expect(INTRODUCTION_POSITION_STORAGE).not.toBe(TUTORIAL_POSITION_STORAGE);
    expect(INTRODUCTION_POSITION_STORAGE).toMatch(/introduction\.position\.v1$/);
    expect(TUTORIAL_POSITION_STORAGE).toMatch(/tutorial\.position\.v1$/);
  });

  it("restores the current screen and bounds a saved cursor when the sequence changes", () => {
    expect(restorePosition(JSON.stringify({ version: 1, index: 2 }), 3)).toBe(2);
    expect(restorePosition(JSON.stringify({ version: 1, index: 4 }), 6)).toBe(4);
    expect(restorePosition(JSON.stringify({ version: 1, index: 99 }), 3)).toBe(2);
    expect(restorePosition(JSON.stringify({ version: 1, index: -5 }), 6)).toBe(0);
  });

  it.each([null, "broken", "null", "[]", "1", '{"version":2,"index":2}', '{"version":1,"index":"2"}', '{"version":1,"index":1.5}', '{"index":2}'])("starts safely for invalid or incompatible storage: %s", raw => {
    expect(restorePosition(raw, 6)).toBe(0);
  });

  it("does not derive a cursor from saved audio, responses or completion flags", () => {
    expect(restorePosition(JSON.stringify({ version: 1, started: true, playing: true, completed: [1, 2] }), 6)).toBe(0);
    expect(restorePosition(JSON.stringify({ version: 1, index: 3, started: true, playing: true }), 6)).toBe(3);
  });

  it.each([0, -1, 2.5, Infinity, NaN])("handles an unavailable sequence length: %s", total => {
    expect(restorePosition('{"version":1,"index":2}', total)).toBe(0);
  });
});
