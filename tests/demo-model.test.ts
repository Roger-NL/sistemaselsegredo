import { describe, expect, it } from "vitest";
import { catalog, nodes } from "@/features/demo/content/catalog";
import { audio, images } from "@/features/demo/content/media";
import { acceptsAnswer, practice, recognitionOptions } from "@/features/demo/model/practice";
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
    for (const block of practice(node, state.assistedBlocks ? "some" : state.activityProfile).answer) state = transition(state, { at: node.id, type: "BLOCK", block });
  }
  if (state.phase === "write") state = transition(state, { at: node.id, type: "TYPE", text: audio[node.response].text });
  if (state.phase === "select") state = transition(state, { at: node.id, type: "RECOGNIZE", response: node.response });
  return dispatch(state, { type: "SUBMIT" });
}
function reach(id: string, choices: Record<string, string> = {}, profile: typeof PROFILES[number] = "some"): DemoState {
  let state = createDemo(profile, "test-run-id", 1000);
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
      function walk(state: DemoState, depth = 0, seenImages: string[] = []) {
        expect(depth).toBeLessThan(150);
        const node = catalog[state.nodeId]; visited.add(node.id);
        const sequence = seenImages.at(-1) === node.image ? seenImages : [...seenImages, node.image];
        if (node.kind === "end") {
          paths++; endings.add(ending(state));
          // Every path includes the encounter, cups, warning/rescue, invitation and goodbye.
          const firstScenes = ["V01", "V02", "V03", "V04", "V05", "V06", "V07", "V08", "V09", "V10"];
          expect(sequence.slice(0, 10)).toEqual(firstScenes);
          expect(sequence.at(-1)).toBe("V12");
          expect(sequence.includes("V11")).toBe(state.decisions["p8.topic"] === "english");
          expect(new Set(sequence).size).toBe(state.decisions["p8.topic"] === "english" ? 12 : 11);
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
        if (node.kind === "choice") for (const choice of node.choices) walk(transition(state, { type: "CHOOSE", at: node.id, choice: choice.id }), depth + 1, sequence);
        else walk(advance(state), depth + 1, sequence);
      }
      walk(createDemo(profile, "test-run-id", 1000));
      expect(paths).toBe(128); expect(endings.size).toBe(3);
    }
    expect(visited.size).toBe(nodes.length);
  });

  it("uses one actual reply in part 2 and immediately shows Lucas's reaction for every level", () => {
    for (const profile of PROFILES) {
      let state = reach("p2.question", {}, profile);
      state = transition(state, { at: state.nodeId, type: "UNDERSTAND", correct: true });
      expect(state.nodeId).toBe("p2.send");
      expect(state.phase).toBe(profile === "beginner" ? "present" : profile === "some" ? "build" : "write");
      if (state.phase === "present") {
        expect(dispatch(state, { type: "SUBMIT" })).toBe(state);
        state = advance(state); expect(state.nodeId).toBe("p2.send"); expect(state.phase).toBe("build");
      }
      state = advance(state);
      expect(state.nodeId).toBe("p2.reaction");
      expect(state.transcript.slice(-2).map(line => line.audioId)).toEqual(["U01", "C02"]);
      expect(state.evidence.filter(item => item.response === "U01")).toHaveLength(1);
      expect(transition(state, { at: "p2.send", type: "SUBMIT" })).toBe(state);
      expect(advance(state).nodeId).toBe("p3.intent");
    }
    for (const removed of ["p2.model", "p2.prepare", "p2.meaning"]) expect(catalog[removed]).toBeUndefined();
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
    expect(checked.phase).toBe("build");
    expect(checked.transcript).toEqual(state.transcript);
    expect(advance(checked).evidence.at(-1)?.kind).toBe("supported");
  });

  it("uses actual history when an expression is new, encountered or already used", () => {
    const unseen = reach("p7.not", { "p5.opinion": "like", "p7.opinion": "not" });
    expect(unseen.phase).toBe("build");
    const seen = reach("p7.too", { "p3.intent": "okay", "p5.opinion": "like" });
    expect(seen.phase).toBe("recall");
    const unseenToo = reach("p7.too", { "p3.intent": "okay", "p5.opinion": "not" });
    expect(unseenToo.phase).toBe("build");
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

  it("declares exactly twelve illustrations and fifty distinct contextual voices", () => {
    expect(catalog["p1.first"].help).toEqual([]);
    expect(Object.keys(images)).toHaveLength(12); expect(Object.keys(audio)).toHaveLength(50);
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


describe("three approved practice experiences", () => {
  it("starts the same response with model + pieces, incomplete structure, or writing", () => {
    const guided = reach("p3.ask", {}, "beginner"); const prompted = reach("p3.ask"); const writing = reach("p3.ask", {}, "less");
    expect(guided.phase).toBe("present"); expect(prompted.phase).toBe("build"); expect(writing.phase).toBe("write");
    expect(practice(catalog["p3.ask"] as import("@/features/demo/model/types").ResponseNode, "some").skeleton).toContain("___");
  });
  it("limits guided blocks to the answer, retains medium distractors and uses recognition", () => {
    const node = catalog["p4.mine"] as import("@/features/demo/model/types").ResponseNode;
    expect(practice(node, "beginner").blocks.some(b => b.id === "negative")).toBe(false);
    expect(practice(node, "some").blocks.some(b => b.id === "negative")).toBe(true);
    let state = reach("p3.okay", { "p3.intent": "okay" }, "beginner"); state = advance(state);
    expect(state.phase).toBe("select");
    const responseNode = catalog[state.nodeId] as import("@/features/demo/model/types").ResponseNode;
    const wrong = recognitionOptions(responseNode).find(id => id !== responseNode.response)!;
    state = transition(state, { at: state.nodeId, type: "RECOGNIZE", response: wrong });
    const failed = dispatch(state, { type: "SUBMIT" }); expect(failed.nodeId).toBe(state.nodeId); expect(failed.help[state.nodeId]).toBe(1);
    expect(failed.transcript).toEqual(state.transcript);
  });
  it("accepts orthography and equivalent contractions but rejects a change of meaning", () => {
    for (const text of ["NO, IT'S NOT MINE!", "No, it is not mine", "No, it isn't mine.", "  No,  it’s not mine. "]) expect(acceptsAnswer(text, "U01")).toBe(true);
    for (const text of ["Yes, it is mine", "No, it is mine", "<script>bad</script>", ""]) expect(acceptsAnswer(text, "U01")).toBe(false);
  });
  it("keeps rejected writing, allows recovery through pieces and marks that support", () => {
    let state = reach("p2.send", {}, "less");
    state = transition(state, { at: state.nodeId, type: "TYPE", text: "Yes, it is mine" });
    state = dispatch(state, { type: "SUBMIT" }); expect(state.nodeId).toBe("p2.send"); expect(state.draft).toBe("Yes, it is mine");
    expect(decodeSnapshot(encodeSnapshot(state))).toEqual(state);
    state = dispatch(state, { type: "USE_BLOCKS" }); expect(state.draft).toBe("Yes, it is mine");
    state = dispatch(state, { type: "WRITE_AGAIN" }); expect(state.draft).toBe("Yes, it is mine");
    expect(state.phase).toBe("write"); expect(decodeSnapshot(encodeSnapshot(state))).toEqual(state);
    state = dispatch(state, { type: "USE_BLOCKS" }); state = advance(state); expect(state.evidence.at(-1)?.kind).toBe("supported");
  });
  it("retains the exact accepted writing and records observable written evidence", () => {
    let state = reach("p2.send", {}, "less"); state = transition(state, { at: state.nodeId, type: "TYPE", text: "No, it isn't mine!" });
    state = dispatch(state, { type: "SUBMIT" }); expect(state.transcript.at(-2)?.written).toBe("No, it isn't mine!");
    expect(state.evidence.at(-1)?.kind).toBe("written");
  });
  it("sends the approved model when using support instead of an unaccepted draft", () => {
    let state = reach("p2.send", {}, "less");
    state = transition(state, { at: state.nodeId, type: "TYPE", text: "Yes, it is mine" });
    for (let clue = 0; clue < catalog[state.nodeId].help.length; clue++) state = dispatch(state, { type: "HELP" });
    state = dispatch(state, { type: "USE_SUPPORT" });
    expect(state.nodeId).not.toBe("p2.send");
    expect(state.transcript.find(line => line.nodeId === "p2.send")?.written).toBeUndefined();
    expect(state.evidence.at(-1)?.kind).toBe("supported");
  });
  it("applies a changed profile at the next activity without erasing the active draft", () => {
    let state = reach("p2.send", {}, "less"); state = transition(state, { at: state.nodeId, type: "TYPE", text: "No, it’s not mine." });
    state = transition(state, { at: state.nodeId, type: "PROFILE", profile: "beginner" });
    expect(state.phase).toBe("write"); expect(state.activityProfile).toBe("less"); expect(state.profile).toBe("beginner");
    expect(decodeSnapshot(encodeSnapshot(state))).toEqual(state);
    state = dispatch(state, { type: "SUBMIT" }); expect(state.activityProfile).toBe("beginner");
  });
  it("keeps Careful visible before use and prevents premature recall submissions for every level", () => {
    for (const profile of PROFILES) {
      expect(reach("p6.warn", {}, profile).phase).toBe("ready");
      const recall = reach("p7.tired", {}, profile); expect(recall.phase).toBe("recall");
      expect(dispatch(recall, { type: "SUBMIT" })).toBe(recall);
    }
  });
});

describe("local recovery of the shorter opening", () => {
  const legacyStart: DemoEvent[] = [
    { at: "p1.first", type: "NEXT" }, { at: "p2.question", type: "UNDERSTAND", correct: true },
    { at: "p2.model", type: "NEXT" },
  ];
  const preparation: DemoEvent[] = ["no", "negative", "mine"].map(block => ({ at: "p2.prepare", type: "BLOCK", block }));
  function legacy(profile: typeof PROFILES[number], journal: DemoEvent[]) {
    return JSON.stringify({ schemaVersion: 1, storyVersion: "cafe-v2", runId: "test-run-id", startedAt: 1000, initialProfile: profile, journal });
  }
  it("preserves a completed conversation in all three profiles without sending anything twice", () => {
    for (const profile of PROFILES) {
      const current = reach("end", {}, profile);
      const index = current.journal.findIndex(event => event.at === "p2.send");
      const practiceEvents: DemoEvent[] = profile === "less" ? [{ at: "p2.prepare", type: "TYPE", text: audio.U01.text }] : preparation;
      const journal = [...current.journal.slice(0, index), { at: "p2.model", type: "NEXT" } as DemoEvent,
        ...practiceEvents, { at: "p2.prepare", type: "SUBMIT" } as DemoEvent,
        { at: "p2.meaning", type: "NEXT" } as DemoEvent, ...current.journal.slice(index)];
      expect(decodeSnapshot(legacy(profile, journal))).toEqual(current);
    }
  });
  it("retains a partial practice draft without claiming it was sent", () => {
    const state = decodeSnapshot(legacy("beginner", [...legacyStart, ...preparation.slice(0, 2)]))!;
    expect(state.nodeId).toBe("p2.send"); expect(state.phase).toBe("build");
    expect(state.selected).toEqual(["no", "negative"]);
    expect(state.transcript.some(line => line.audioId === "U01")).toBe(false);
    expect(decodeSnapshot(encodeSnapshot(state))).toEqual(state);
  });
  it("turns a completed practice into a ready draft, not an automatic submission", () => {
    const state = decodeSnapshot(legacy("beginner", [...legacyStart, ...preparation, { at: "p2.prepare", type: "SUBMIT" }]))!;
    expect(state.selected).toEqual(["no", "negative", "mine"]);
    expect(state.transcript.some(line => line.audioId === "U01")).toBe(false);
    const sent = dispatch(state, { type: "SUBMIT" });
    expect(sent.nodeId).toBe("p2.reaction");
    expect(sent.transcript.filter(line => line.audioId === "U01")).toHaveLength(1);
  });
  it("preserves typed preparation as an unsent draft", () => {
    const state = decodeSnapshot(legacy("less", [...legacyStart, { at: "p2.prepare", type: "TYPE", text: "No, it isn't mine!" }]))!;
    expect(state.phase).toBe("write"); expect(state.draft).toBe("No, it isn't mine!");
    expect(state.transcript.some(line => line.audioId === "U01")).toBe(false);
  });
  it("rejects unknown stages and ambiguous legacy support changes", () => {
    expect(decodeSnapshot(legacy("some", [...legacyStart, { at: "p2.unknown", type: "NEXT" }]))).toBeNull();
    expect(decodeSnapshot(legacy("some", [...legacyStart, { at: "p2.prepare", type: "PROFILE", profile: "less" }, { at: "p2.send", type: "TYPE", text: audio.U01.text }]))).toBeNull();
  });
});
