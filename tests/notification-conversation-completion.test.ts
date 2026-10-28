import { describe, expect, it } from "vitest";
import { catalog } from "@/features/demo/content/catalog";
import { audio } from "@/features/demo/content/media";
import { practice } from "@/features/demo/model/practice";
import { createDemo, replayEvent, transition } from "@/features/demo/model/reducer";
import { encodeSnapshot } from "@/features/demo/session/storage";
import type { DemoEvent, DemoState } from "@/features/demo/model/types";
import { completedConversation } from "@/server/notifications/events";
import { parseDemoSnapshot } from "@/server/workspace/validation";

type WithoutAt<T> = T extends unknown ? Omit<T, "at"> : never;
function advance(state: DemoState): DemoState {
  const node = catalog[state.nodeId];
  const act = (event: WithoutAt<DemoEvent>) => { state = transition(state, { ...event, at: node.id } as DemoEvent); };
  if (node.kind === "scene") act({ type: "NEXT" });
  else if (node.kind === "choice") act({ type: "CHOOSE", choice: node.choices[0].id });
  else if (node.kind === "comprehension") act({ type: "UNDERSTAND", correct: true });
  else if (node.kind === "response") {
    if (state.phase === "present") act({ type: "PREPARE" });
    else if (state.phase === "recall") act({ type: "CHECK" });
    else {
      if (state.phase === "build") for (const block of practice(node, state.activityProfile).answer) act({ type: "BLOCK", block });
      if (state.phase === "write") act({ type: "TYPE", text: audio[node.response].text });
      if (state.phase === "select") act({ type: "RECOGNIZE", response: node.response });
      act({ type: "SUBMIT" });
    }
  }
  return state;
}

describe("real conversation completion notification", () => {
  it("recognizes the end of a valid branched journey independently of unused alternative activities", () => {
    let state = createDemo("some", "notification-completion", 0);
    for (let guard = 0; catalog[state.nodeId].kind !== "end"; guard++) { expect(guard).toBeLessThan(200); state = advance(state); }
    const raw = encodeSnapshot(state);
    expect(parseDemoSnapshot(raw).demoPercent).toBeLessThan(100);
    expect(completedConversation(raw)).toBe(true);
  });
  it("does not count test navigation, partial progress, or a forged snapshot as actual completion", () => {
    let state = createDemo("some", "notification-test-skip", 0);
    expect(completedConversation(encodeSnapshot(state))).toBe(false);
    for (let guard = 0; catalog[state.nodeId].kind !== "end"; guard++) { expect(guard).toBeLessThan(150); state = replayEvent(state, { at: state.nodeId, type: "TEST_FORWARD" }); }
    expect(completedConversation(encodeSnapshot(state))).toBe(false);
    expect(completedConversation(JSON.stringify({ nodeId: "end" }))).toBe(false);
    expect(completedConversation(null)).toBe(false);
  });
});
