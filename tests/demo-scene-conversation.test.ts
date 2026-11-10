import { describe, expect, it } from "vitest";
import { createDemo, replayEvent, transition } from "@/features/demo/model/reducer";
import { sceneConversation } from "@/features/demo/model/scene-conversation";
import { catalog } from "@/features/demo/content/catalog";
import { practice } from "@/features/demo/model/practice";
import { sceneReadingGroup } from "@/features/demo/model/scene-conversation";
import { PROFILES, type SupportProfile } from "@/features/demo/model/types";
import { decodeSnapshot, encodeSnapshot } from "@/features/demo/session/storage";
import { audio } from "@/features/demo/content/media";

function reach(id: string, profile: SupportProfile) {
  let state = createDemo(profile, "comic-scene-test", 0);
  for (let i = 0; i < 500 && state.nodeId !== id; i++) {
    const node = catalog[state.nodeId];
    if (sceneReadingGroup(state) || node.kind === "scene" || state.phase === "present") state = transition(state, { at: node.id, type: "CONTINUE_SCENE" });
    else if (node.kind === "choice") state = transition(state, { at: node.id, type: "CHOOSE", choice: node.choices[0].id });
    else if (node.kind === "comprehension") state = transition(state, { at: node.id, type: "ANSWER_MEANING", correct: true });
    else if (node.kind === "response") {
      if (state.phase === "recall") state = transition(state, { at: node.id, type: "CHECK" });
      if (state.phase === "build") for (const block of practice(node, state.activityProfile).answer) state = transition(state, { at: node.id, type: "PLACE_BLOCK", block });
      if (state.phase === "write") state = transition(state, { at: node.id, type: "TYPE", text: audio[node.response].text });
      if (state.phase === "select") state = transition(state, { at: node.id, type: "RECOGNIZE", response: node.response });
      state = transition(state, { at: node.id, type: "SEND_RESPONSE" });
    }
  }
  expect(state.nodeId).toBe(id);
  expect(decodeSnapshot(encodeSnapshot(state))).toEqual(state);
  return state;
}

it("shows Lucas's actual words on the left, and only learner intention before an answer", () => {
  const initial = createDemo("beginner", "comic-scene-test", 0);
  expect(sceneConversation(initial)).toBeNull();
  expect(sceneConversation({ ...initial, nodeId: "p1.lucas" })).toEqual({ role: "character", text: audio.C01.text, intention: false });
  expect(sceneConversation({ ...initial, nodeId: "p2.send", phase: "present" })).toEqual({ role: "you", text: audio.U01.meaning, intention: true });
});

describe("one reading action, original persisted events", () => {
  for (const profile of PROFILES) it(`collapses the repeated preparation for ${profile} without sending an answer`, () => {
    const start = reach("p4.same", profile);
    const after = transition(start, { at: start.nodeId, type: "CONTINUE_SCENE" });
    expect(after.presentationStep).toBe(2);
    expect(after.journal.slice(start.journal.length).map(e => e.type)).toEqual(profile === "beginner" ? ["ADVANCE_PRESENTATION", "ADVANCE_PRESENTATION", "PREPARE"] : ["ADVANCE_PRESENTATION", "ADVANCE_PRESENTATION"]);
    expect(after.phase).not.toBe("present");
    expect(decodeSnapshot(encodeSnapshot(after))).toEqual(after);
    const back = transition(after, { at: after.nodeId, type: "BACK_SCENE" });
    expect(back.presentationStep).toBe(0);
    expect(after.evidence).toEqual(start.evidence);
    expect(after.transcript).toEqual(start.transcript);
    expect(after.selected).toEqual([]);
  });
  it("offers reading as a real text-access choice and preserves replay / back", () => {
    let state = createDemo("beginner", "comic-scene-test", 0);
    for (let i = 0; i < 2; i++) state = transition(state, { at: state.nodeId, type: "NEXT" });
    const before = state;
    state = transition(state, { at: state.nodeId, type: "CONTINUE_SCENE" });
    expect(state.audioAccess["lucas:p1.lucas"]).toBe("text");
    expect(state.nodeId).toBe("p2.prompt");
    expect(state.evidence).toEqual([]);
    expect(state.journal.some(e => e.type === "CONTINUE_SCENE")).toBe(false);
    expect(decodeSnapshot(encodeSnapshot(state))).toEqual(state);
    state = transition(state, { at: state.nodeId, type: "BACK" });
    expect(state.nodeId).toBe(before.nodeId);
    expect(decodeSnapshot(encodeSnapshot(state))).toEqual(state);
  });
});

it("combines the danger caption and instruction, then Back returns to that visible screen", () => {
  const state = reach("p6.warn", "less");
  const after = transition(state, { at: state.nodeId, type: "CONTINUE_SCENE" });
  expect(after.presentationStep).toBe(3);
  expect(after.evidence).toEqual(state.evidence);
  expect(decodeSnapshot(encodeSnapshot(after))).toEqual(after);
  const back = transition(after, { at: after.nodeId, type: "BACK_SCENE" });
  expect(back.presentationStep).toBe(0);
  expect(back.journal).toEqual(state.journal);
});

it("lets the learner's own response appear on the right as they compose, without revealing an answer", () => {
  const state = reach("p4.same", "less");
  const activity = transition(state, { at: state.nodeId, type: "CONTINUE_SCENE" });
  expect(sceneConversation(activity)?.intention).toBe(true);
  const writing = transition(activity, { at: activity.nodeId, type: "TYPE", text: "Me too." });
  expect(sceneConversation(writing)).toEqual({ role: "you", text: "Me too.", intention: false });
  expect(writing.evidence).toEqual(activity.evidence);
});

it("returns to the visible caption even after the learner edits their answer", () => {
  let state = reach("p4.same", "beginner");
  state = transition(state, { at: state.nodeId, type: "CONTINUE_SCENE" });
  state = transition(state, { at: state.nodeId, type: "RECOGNIZE", response: "U04" });
  const back = transition(state, { at: state.nodeId, type: "BACK_SCENE" });
  expect(back.presentationStep).toBe(0);
  expect(back.evidence).toEqual(state.evidence);
  expect(decodeSnapshot(encodeSnapshot(back))).toEqual(back);
});


it("keeps the original upgrade boundary when returning through an older saved story", () => {
  let state = createDemo("some", "comic-legacy-test", 0, "cafe-v7");
  state = replayEvent(state, { at: state.nodeId, type: "NEXT" });
  const back = transition(state, { at: state.nodeId, type: "BACK_SCENE" });
  expect(back.storyVersion).toBe("cafe-v8");
  expect(decodeSnapshot(encodeSnapshot(back))).toEqual(back);
  const forward = transition(state, { at: state.nodeId, type: "CONTINUE_SCENE" });
  expect(forward.storyVersion).toBe("cafe-v8");
  expect(decodeSnapshot(encodeSnapshot(forward))).toEqual(forward);
});
