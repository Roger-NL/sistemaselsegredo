import { describe, expect, it } from "vitest";
import { catalog, nodes } from "@/features/demo/content/catalog";
import { audio, images } from "@/features/demo/content/media";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { ending, retrospective } from "@/features/demo/model/retrospective";
import { decodeSnapshot, encodeSnapshot, restoreDemo, saveDemo } from "@/features/demo/session/storage";
import { PROFILES, type DemoEvent, type DemoState } from "@/features/demo/model/types";

function dispatch(state: DemoState, action: Omit<DemoEvent, "at">) { return transition(state, { ...action, at: state.nodeId } as DemoEvent); }
function advance(state: DemoState): DemoState {
  const node = catalog[state.nodeId];
  if (node.kind === "scene") return dispatch(state, { type: "NEXT" });
  if (node.kind === "comprehension") return transition(state, { at: node.id, type: "UNDERSTAND", correct: true });
  if (node.kind !== "response") throw new Error(`Unexpected ${node.kind}`);
  if (state.phase === "present") return dispatch(state, { type: "PREPARE" });
  if (state.phase === "recall") return dispatch(state, { type: "CHECK" });
  if (state.phase === "build") {
    for (const block of node.answer ?? []) state = transition(state, { at: node.id, type: "BLOCK", block });
  }
  return dispatch(state, { type: "SUBMIT" });
}
function reach(id: string, choices: Record<string, string> = {}): DemoState {
  let state = createDemo("some", "test-run-id", 1000);
  for (let guard = 0; state.nodeId !== id && guard < 200; guard++) {
    const node = catalog[state.nodeId];
    state = node.kind === "choice" ? transition(state, { at: node.id, type: "CHOOSE", choice: choices[node.id] ?? node.choices[0].id }) : advance(state);
  }
  if (state.nodeId !== id) throw new Error(`Cannot reach ${id}`);
  return state;
}

describe("approved café graph", () => {
  it("has 128 narrative paths and all three equivalent endings for every support profile", () => {
    const visited = new Set<string>();
    for (const profile of PROFILES) {
      let paths = 0;
      const endings = new Set<string>();
      function walk(state: DemoState, depth = 0) {
        expect(depth).toBeLessThan(150);
        const node = catalog[state.nodeId]; visited.add(node.id);
        if (node.kind === "end") {
          paths++; endings.add(ending(state));
          expect(state.transcript.filter(line => line.role === "you" && line.audioId === "U01")).toHaveLength(1);
          expect(new Set(state.transcript.map(line => line.id)).size).toBe(state.transcript.length);
          expect(decodeSnapshot(encodeSnapshot(state))).toEqual(state);
          const transformed = retrospective(state).map(h => h.after);
          expect(transformed.includes("U05")).toBe(state.decisions["p3.intent"] === "okay");
          expect(transformed.includes("U12")).toBe(state.decisions["p8.topic"] === "job");
          expect(transformed.includes("U13")).toBe(state.decisions["p8.topic"] === "english");
          expect(transformed.includes("U17")).toBe(state.decisions["p9.pause"] === "stay");
          expect(state.transcript.some(line => line.audioId === "U18")).toBe(state.decisions["p10.contact"] === "contact");
          return;
        }
        if (node.kind === "choice") for (const choice of node.choices) walk(transition(state, { type: "CHOOSE", at: node.id, choice: choice.id }), depth + 1);
        else walk(advance(state), depth + 1);
      }
      walk(createDemo(profile, "test-run-id", 1000));
      expect(paths).toBe(128); expect(endings.size).toBe(3);
    }
    expect(visited.size).toBe(nodes.length);
  });

  it("separates preparation, model review and actual response in part 2", () => {
    let state = reach("p2.prepare");
    const initialTranscript = state.transcript;
    state = advance(state);
    expect(state.nodeId).toBe("p2.meaning");
    expect(state.transcript).toEqual(initialTranscript);
    state = advance(state);
    expect(state.nodeId).toBe("p2.send");
    expect(state.selected).toEqual([]);
    state = advance(state);
    expect(state.nodeId).toBe("p2.reaction");
    expect(state.transcript.slice(-2).map(l => l.audioId)).toEqual(["U01", "C02"]);
  });

  it("keeps erroneous blocks, supports correction and ignores stale double-clicks", () => {
    let state = reach("p4.mine", { "p3.intent": "okay" });
    for (const block of ["yes", "negative", "mine"]) state = transition(state, { at: state.nodeId, type: "BLOCK", block });
    state = dispatch(state, { type: "SUBMIT" });
    expect(state.nodeId).toBe("p4.mine"); expect(state.selected).toEqual(["yes", "negative", "mine"]);
    expect(state.notice).toContain("‘não é’");
    const duplicate = { type: "SUBMIT", at: state.nodeId } as const;
    for (let i = 0; i < 3; i++) state = dispatch(state, { type: "HELP" });
    const next = dispatch(state, { type: "USE_SUPPORT" });
    expect(next.nodeId).toBe("p4.nice-b");
    expect(transition(next, duplicate)).toBe(next);
    expect(next.evidence.at(-1)?.kind).toBe("supported");
  });

  it("does not reveal Really before checking and does not infer unobserved recall", () => {
    const state = reach("p7.tired");
    expect(state.phase).toBe("recall");
    expect(dispatch(state, { type: "SUBMIT" })).toBe(state);
    const checked = dispatch(state, { type: "CHECK" });
    expect(checked.phase).toBe("ready");
    expect(checked.transcript).toEqual(state.transcript);
    expect(dispatch(checked, { type: "SUBMIT" }).evidence.at(-1)?.kind).toBe("supported");
  });

  it("uses actual history when an expression is new, encountered or already used", () => {
    const unseen = reach("p7.not", { "p5.opinion": "like", "p7.opinion": "not" });
    expect(unseen.phase).toBe("ready");
    const seen = reach("p7.too", { "p3.intent": "okay", "p5.opinion": "like" });
    expect(seen.phase).toBe("recall");
    const unseenToo = reach("p7.too", { "p3.intent": "okay", "p5.opinion": "not" });
    expect(unseenToo.phase).toBe("ready");
  });

  it("preserves open help and current blocks when changing support, including on reload", () => {
    let state = reach("p2.send");
    state = transition(state, { at: state.nodeId, type: "BLOCK", block: "no" });
    state = dispatch(state, { type: "HELP" });
    const next = transition(state, { at: state.nodeId, type: "PROFILE", profile: "less" });
    expect(next.selected).toEqual(["no"]); expect(next.help).toEqual(state.help);
    expect(next.transcript).toEqual(state.transcript); expect(decodeSnapshot(encodeSnapshot(next))).toEqual(next);
  });

  it("keeps comprehension in the clue state on error and validates input blocks", () => {
    let state = reach("p2.question");
    state = transition(state, { at: state.nodeId, type: "UNDERSTAND", correct: false });
    expect(state.nodeId).toBe("p2.question"); expect(state.help[state.nodeId]).toBe(1);
    expect(state.transcript.some(l => l.role === "you")).toBe(false);
    state = reach("p2.send");
    expect(transition(state, { at: state.nodeId, type: "BLOCK", block: "job" })).toBe(state);
  });

  it("declares exactly nine illustrations and fifty distinct contextual voices", () => {
    expect(catalog["p1.first"].help).toEqual([]);
    expect(Object.keys(images)).toHaveLength(9); expect(Object.keys(audio)).toHaveLength(50);
    expect(audio.C25.text).toBe("Me too."); expect(audio.C30.text).toBe("Me too!");
    expect(audio.U08.meaning).toBe("Cuidado!");
  });
});

describe("versioned local recovery", () => {
  it("restores review position and an explicitly hidden model without losing open help", () => {
    let state = reach("p2.send");
    for (let i = 0; i < 3; i++) state = dispatch(state, { type: "HELP" });
    state = dispatch(state, { type: "TOGGLE_MODEL" });
    const restored = decodeSnapshot(encodeSnapshot(state));
    expect(restored?.modelHidden).toBe(true); expect(restored?.help["p2.send"]).toBe(3);
    state = reach("end");
    state = transition(state, { at: "end", type: "REVIEW", view: "feedback" });
    expect(decodeSnapshot(encodeSnapshot(state))?.reviewView).toBe("feedback");
  });
  it("rejects corrupt, incompatible and impossible snapshots", () => {
    for (const raw of ["{", "null", "{}", JSON.stringify({ ...JSON.parse(encodeSnapshot(reach("p2.send"))), storyVersion: "unknown" }),
      JSON.stringify({ ...JSON.parse(encodeSnapshot(createDemo("less", "test-run-id", 0))), journal: [{ at: "p1.first", type: "BLOCK", block: "evil" }] })]) expect(decodeSnapshot(raw)).toBeNull();
  });
  it("allows memory-only use if storage is unavailable", () => {
    const storage = { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("quota"); }, removeItem: () => {} };
    expect(restoreDemo(storage).status).toBe("unavailable");
    const state = createDemo("some", "test-run-id", 1);
    expect(saveDemo(storage, state)).toBe(false);
    expect(advance(state).nodeId).toBe("p2.question");
  });
});
