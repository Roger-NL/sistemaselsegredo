import { describe, expect, it } from "vitest";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { listeningTarget } from "@/features/demo/model/listening";
import { encodeSnapshot, decodeSnapshot } from "@/features/demo/session/storage";
import { conversationPosition } from "@/features/demo/session/position";
import type { DemoState } from "@/features/demo/model/types";

const next = (input: DemoState) => {
  const target = listeningTarget(input);
  const state = target ? transition(input, { at:input.nodeId, type:"AUDIO_ACCESS", key:target.key, mode:"text" }) : input;
  return transition(state, { at:state.nodeId, type:"NEXT" });
};

describe("conversation return point", () => {
  it("restores the actual third part and chosen support from the saved journal", () => {
    let state = createDemo("beginner", "navigation-proof", 0);
    for (let i = 0; i < 4; i++) state = next(state);
    state = transition(state, { at:state.nodeId, type:"UNDERSTAND", correct:true });
    state = transition(state, { at:state.nodeId, type:"PREPARE" });
    for (const block of ["no", "negative", "mine"]) state = transition(state, { at:state.nodeId, type:"BLOCK", block });
    state = transition(state, { at:state.nodeId, type:"SUBMIT" });
    state = next(state);
    const raw = encodeSnapshot(state);
    expect(state.nodeId).toBe("p3.prompt");
    expect(conversationPosition(raw)).toEqual({ part:3, completed:false });
    expect(decodeSnapshot(raw)?.profile).toBe("beginner");
    expect(decodeSnapshot(raw)?.journal).toEqual(state.journal);
  });
  it("does not invent a return point when there is no valid saved conversation", () => {
    expect(conversationPosition(null)).toBeNull();
    expect(conversationPosition('{"nodeId":"p3.prompt"}')).toBeNull();
  });
});
