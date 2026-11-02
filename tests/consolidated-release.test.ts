import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { replaySlides } from "@/features/demo/model/replay";
import { decodeSnapshot, encodeSnapshot } from "@/features/demo/session/storage";
import { advanceTestDemo } from "@/features/local-testing/progress";
import { parseDemoSnapshot } from "@/server/workspace/validation";
import type { DemoState } from "@/features/demo/model/types";
const fixtures = JSON.parse(readFileSync("tests/fixtures/demo-cafe-v7-content.json", "utf8")).fixtures as { label: string; profile: string; snapshot: string; expected: DemoState }[];
describe("content migration with the later scene replay and local controls", () => {
  it("replays actual old replies and selected branches without changing the saved attempt", () => {
    for (const fixture of fixtures) {
      const state = decodeSnapshot(fixture.snapshot)!;
      expect(state).not.toBeNull();
      const before = encodeSnapshot(state), slides = replaySlides(state);
      expect(slides.map(line => [line.nodeId, line.audioId, line.written])).toEqual(fixture.expected.transcript.map(line => [line.nodeId, line.audioId, line.written]));
      expect(slides.every(line => line.image.ready)).toBe(true);
      expect(encodeSnapshot(state)).toBe(before);
      expect(decodeSnapshot(before)).toEqual(state);
    }
  });
  it("lets the isolated test controls finish restored drafts using v8 rules while preserving the historical prefix", () => {
    for (const fixture of fixtures.filter(item => item.label !== "completed")) {
      const restored = decodeSnapshot(fixture.snapshot)!;
      const saved = encodeSnapshot(restored);
      const completed = advanceTestDemo(restored);
      expect(completed.nodeId).toBe("end");
      expect(completed.journal.slice(0, restored.journal.length)).toEqual(restored.journal);
      expect(completed.transcript.slice(0, restored.transcript.length)).toEqual(restored.transcript);
      expect(encodeSnapshot(restored)).toBe(saved);
      expect(decodeSnapshot(encodeSnapshot(completed))).toEqual(completed);
      expect(parseDemoSnapshot(encodeSnapshot(completed)).demoSnapshot).toBe(encodeSnapshot(completed));
      if (fixture.label === "before-contradictory-response") expect(completed.transcript.some(line => line.audioId === "U17")).toBe(false);
    }
  });
});
