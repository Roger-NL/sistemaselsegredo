import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DemoExperience } from "@/features/demo/DemoExperience";
import { catalog, nodes } from "@/features/demo/content/catalog";
import { audio } from "@/features/demo/content/media";
import { presentationCards } from "@/features/demo/content/presentation";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { listeningTarget } from "@/features/demo/model/listening";
import { practice } from "@/features/demo/model/practice";
import { decodeSnapshot, encodeSnapshot } from "@/features/demo/session/storage";
import { PROFILES, type DemoState } from "@/features/demo/model/types";
const render = (state: DemoState) => renderToStaticMarkup(createElement(DemoExperience, { initial: state }));
function ready() {
  let state = createDemo("beginner", "assembly-tests", 0);
  for (let i = 0; i < 4; i++) {
    const target = listeningTarget(state);
    if (target) state = transition(state, { at: state.nodeId, type: "AUDIO_ACCESS", key: target.key, mode: "heard" });
    state = transition(state, { at: state.nodeId, type: "NEXT" });
  }
  state = transition(state, { at: state.nodeId, type: "ANSWER_MEANING", correct: true });
  const target = listeningTarget(state)!;
  state = transition(state, { at: state.nodeId, type: "AUDIO_ACCESS", key: target.key, mode: "heard" });
  return transition(state, { at: state.nodeId, type: "PREPARE" });
}
const place = (state: DemoState, block: string) => transition(state, { at: state.nodeId, type: "PLACE_BLOCK", block });

describe("Portuguese intention and immediate piece return", () => {
  it("returns a wrong piece on each click and the complete assembly on every third error, without giving a hint", () => {
    let state = place(ready(), "no");
    const before = state;
    for (let i = 1; i <= 3; i++) {
      state = place(state, "mine");
      expect(state.selected).toEqual(i < 3 ? ["no"] : []);
      expect(state.returnedBlocks).toContain("mine");
      expect(state.assemblyMistakes).toBe(i % 3);
      expect(state.help).toEqual(before.help);
      expect(state.transcript).toEqual(before.transcript);
      expect(state.evidence).toEqual(before.evidence);
      expect(state.notice).not.toMatch(/peça \d|it’s not|não é/);
    }
    expect(state.returnedBlocks).toContain("no");
    state = place(state, "no");
    for (let i = 0; i < 3; i++) state = place(state, "mine");
    expect(state.selected).toEqual([]);
    expect(state.assemblyMistakes).toBe(0);
    expect(decodeSnapshot(encodeSnapshot(state))).toEqual(state);
    for (const id of ["no", "negative", "mine"]) state = place(state, id);
    state = transition(state, { at: state.nodeId, type: "SEND_RESPONSE" });
    expect(state.nodeId).toBe("p2.reaction");
    expect(state.transcript.filter(line => line.audioId === "U01")).toHaveLength(1);
  });
  it("returns the removed piece and its suffix together, without counting an error or leaving an invalid prefix", () => {
    let state = ready();
    for (const id of ["no", "negative", "mine"]) state = place(state, id);
    state = transition(state, { at: state.nodeId, type: "RETURN_BLOCKS", index: 1 });
    expect(state.selected).toEqual(["no"]);
    expect(state.returnedBlocks).toEqual(["negative", "mine"]);
    expect(state.assemblyMistakes).toBe(0);
    expect(place(state, "no")).toBe(state);
    expect(transition(state, { at: state.nodeId, type: "PLACE_BLOCK", block: "unknown" })).toBe(state);
  });
  it("applies the same correction rule to every bank, including independent learners who choose pieces", () => {
    for (const profile of PROFILES) for (const node of nodes) {
      if (node.kind !== "response" || node.id === "p6.warn") continue;
      const state: DemoState = { ...createDemo(profile, "all-banks-test", 0), nodeId: node.id, presentationStep: presentationCards(node).length, phase: "build", assistedBlocks: profile === "less" };
      const exercise = practice(node, profile === "less" ? "some" : profile);
      const wrong = exercise.blocks.find(block => block.id !== exercise.answer[0]);
      if (wrong) {
        const failed = place(state, wrong.id);
        expect(failed.selected).toEqual([]);
        expect(failed.help).toEqual(state.help);
        expect(failed.returnedBlocks).toEqual([wrong.id]);
      }
      let completed = state;
      for (const id of exercise.answer) completed = place(completed, id);
      expect(completed.selected).toEqual(exercise.answer);
      expect(transition(completed, { at: node.id, type: "SEND_RESPONSE" }).nodeId).toBe(node.next);
    }
  });
  it("keeps the complete response out of the preparation and does not auto-reveal it after mistakes", () => {
    let state = ready();
    expect(render(state)).toContain(audio.U01.meaning);
    expect(render(state)).not.toContain(audio.U01.text);
    for (let i = 0; i < 3; i++) state = place(state, "mine");
    expect(render(state)).not.toContain(audio.U01.text);
    const revealed = transition(state, { at: state.nodeId, type: "REVEAL_MODEL" });
    expect(revealed.help[state.nodeId]).toBe(catalog[state.nodeId].help.length);
    expect(revealed.nodeId).toBe(state.nodeId);
    expect(revealed.transcript).toEqual(state.transcript);
    expect(revealed.selected).toEqual(state.selected);
  });
  it("preserves v6 drafts with old out-of-order clicks without replaying them as new errors", () => {
    let state = ready();
    state = transition(state, { at: state.nodeId, type: "BLOCK", block: "mine" });
    const old = JSON.parse(encodeSnapshot(state)); old.storyVersion = "cafe-v6";
    const restored = decodeSnapshot(JSON.stringify(old))!;
    expect(restored.selected).toEqual(["mine"]);
    expect(restored.assemblyMistakes).toBe(0);
    const cleared = transition(restored, { at: restored.nodeId, type: "RETURN_BLOCKS", index: 0 });
    expect(cleared.selected).toEqual([]);
    expect(decodeSnapshot(encodeSnapshot(cleared))).toEqual(cleared);
  });
  it("keeps typing autonomous and incorrect submissions free of automatic hints", () => {
    const state: DemoState = { ...ready(), phase: "write", profile: "less", activityProfile: "less", draft: "Wrong" };
    const result = transition(state, { at: state.nodeId, type: "SEND_RESPONSE" });
    expect(result.draft).toBe("Wrong");
    expect(result.help).toEqual(state.help);
    expect(result.nodeId).toBe(state.nodeId);
  });
});
