import { describe, expect, it } from "vitest";
import { catalog } from "@/features/demo/content/catalog";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { PROFILES } from "@/features/demo/model/types";
import { decodeSnapshot } from "@/features/demo/session/storage";

describe("temporary forward navigation", () => {
  for (const profile of PROFILES) it(`reaches the end without answers in ${profile}, persists and rewinds`, () => {
    let state = createDemo(profile, "test-navigation", 0);
    const parts = new Set<number>();
    for (let i = 0; i < 300 && catalog[state.nodeId].kind !== "end"; i++) {
      parts.add(catalog[state.nodeId].part);
      const before = state;
      state = transition(state, { at: state.nodeId, type: "TEST_FORWARD" });
      expect(state).not.toBe(before);
      expect(state.evidence).toEqual([]);
      expect(state.transcript.some(line => line.role === "you")).toBe(false);
      expect(Object.values(state.audioAccess)).not.toContain("heard");
      expect(decodeSnapshot(JSON.stringify(state))).toEqual(state);
      expect(transition(state, { at: state.nodeId, type: "BACK" })).toEqual(before);
    }
    expect(catalog[state.nodeId].kind).toBe("end");
    expect([...parts]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(transition(state, { at: state.nodeId, type: "TEST_FORWARD" })).toBe(state);
  });
});
