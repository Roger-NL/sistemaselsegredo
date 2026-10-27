import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DemoExperience } from "@/features/demo/DemoExperience";
import { catalog } from "@/features/demo/content/catalog";
import { audio } from "@/features/demo/content/media";
import { presentationCards } from "@/features/demo/content/presentation";
import { listeningTarget } from "@/features/demo/model/listening";
import { practice } from "@/features/demo/model/practice";
import { createDemo, replayEvent, transition } from "@/features/demo/model/reducer";
import { retrospective } from "@/features/demo/model/retrospective";
import { PROFILES, type DemoEvent, type DemoState, type SupportProfile } from "@/features/demo/model/types";
import { decodeSnapshot, encodeSnapshot } from "@/features/demo/session/storage";
import fixture from "./fixtures/demo-legacy-navigation.json";

// Frozen output from the pre-removal reducer, independent of the new replay path.
const legacy = fixture as unknown as { sourceCommit: string; skipped: DemoState } & Record<SupportProfile, {
  beforeSend: DemoState; afterSend: DemoState; resumed: DemoState;
}>;

function restore(expected: DemoState): DemoState {
  const state = decodeSnapshot(JSON.stringify(expected));
  expect(state).toEqual(expected);
  expect(decodeSnapshot(encodeSnapshot(state!))).toEqual(expected);
  return state!;
}

function completeNormally(initial: DemoState): DemoState {
  let state = initial;
  for (let guard = 0; catalog[state.nodeId].kind !== "end"; guard++) {
    expect(guard).toBeLessThan(250);
    const node = catalog[state.nodeId];
    const target = listeningTarget(state);
    const act = (event: DemoEvent) => { state = transition(state, event); };
    const before = state;
    if (target && !state.audioAccess[target.key]) {
      // Exercise the supported textual alternative without pretending audio ended.
      act({ at: node.id, type: "AUDIO_ACCESS", key: target.key, mode: "text" });
    } else if (state.presentationStep < presentationCards(node).length) {
      act({ at: node.id, type: "ADVANCE_PRESENTATION" });
    } else if (node.kind === "scene") {
      act({ at: node.id, type: "NEXT" });
    } else if (node.kind === "choice") {
      act({ at: node.id, type: "CHOOSE", choice: node.choices[0].id });
    } else if (node.kind === "comprehension") {
      act({ at: node.id, type: "ANSWER_MEANING", correct: true });
    } else if (node.kind === "response") {
      if (state.phase === "present") act({ at: node.id, type: "PREPARE" });
      else if (state.phase === "recall") act({ at: node.id, type: "CHECK" });
      else {
        if (state.phase === "build") {
          const answer = practice(node, state.assistedBlocks ? "some" : state.activityProfile).answer;
          for (const block of answer.slice(state.selected.length)) act({ at: node.id, type: "PLACE_BLOCK", block });
        } else if (state.phase === "write") {
          act({ at: node.id, type: "TYPE", text: audio[node.response].text });
        } else if (state.phase === "select") {
          act({ at: node.id, type: "RECOGNIZE", response: node.response });
        }
        act({ at: node.id, type: "SEND_RESPONSE" });
      }
    }
    expect(state).not.toBe(before);
  }
  return state;
}

describe("retired test navigation and saved attempts", () => {
  it("restores the complete pre-removal baseline without changing decisions, evidence or access", () => {
    expect(legacy.sourceCommit).toBe("5d80bf1ca652e66cd38caceed8e98410ad7568ee");
    restore(legacy.skipped);
    for (const profile of PROFILES) {
      for (const expected of Object.values(legacy[profile])) restore(expected);
    }
  });

  for (const profile of PROFILES) {
    it(`rejects the shortcut for new and restored ${profile} attempts`, () => {
      const states = [createDemo(profile, "new-normal-attempt", 0), ...Object.values(legacy[profile]).map(restore)];
      for (const state of states) {
        const snapshot = encodeSnapshot(state);
        expect(transition(state, { at: state.nodeId, type: "TEST_FORWARD" })).toBe(state);
        expect(encodeSnapshot(state)).toBe(snapshot);
      }
    });

    it(`preserves every legacy skip prefix through the ending and Back in ${profile}`, () => {
      let state = createDemo(profile, legacy.skipped.runId, legacy.skipped.startedAt);
      const states = [state];
      const parts = new Set<number>();
      for (let guard = 0; catalog[state.nodeId].kind !== "end"; guard++) {
        expect(guard).toBeLessThan(250);
        parts.add(catalog[state.nodeId].part);
        state = replayEvent(state, { at: state.nodeId, type: "TEST_FORWARD" });
        expect(state).not.toBe(states.at(-1));
        expect(state.evidence).toEqual([]);
        expect(state.transcript.some(line => line.role === "you")).toBe(false);
        expect(Object.values(state.audioAccess)).not.toContain("heard");
        restore(state);
        states.push(state);
      }
      expect([...parts]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      if (profile === "beginner") expect(state).toEqual(legacy.skipped);
      let restored = restore(state);
      for (let index = states.length - 2; index >= 0; index--) {
        restored = transition(restored, { at: restored.nodeId, type: "BACK" });
        expect(restored).toEqual(states[index]);
        restored = restore(restored);
      }
      expect(transition(restored, { at: restored.nodeId, type: "BACK" })).toBe(restored);
      expect(restored).toEqual(createDemo(profile, state.runId, state.startedAt));
    });

    it(`preserves mixed journal prefixes, the filled response and a unique resend in ${profile}`, () => {
      const expected = legacy[profile];
      let prefix = createDemo(profile, expected.resumed.runId, expected.resumed.startedAt);
      for (const event of expected.resumed.journal) {
        prefix = replayEvent(prefix, event);
        restore(prefix);
      }
      expect(prefix).toEqual(expected.resumed);

      const beforeSend = restore(expected.beforeSend);
      const sent = transition(beforeSend, { at: beforeSend.nodeId, type: "SEND_RESPONSE" });
      expect(sent).toEqual(expected.afterSend);
      const restoredSent = restore(expected.afterSend);
      expect(transition(restoredSent, { at: beforeSend.nodeId, type: "SEND_RESPONSE" })).toBe(restoredSent);

      const rewound = transition(restoredSent, { at: restoredSent.nodeId, type: "BACK" });
      expect(rewound).toEqual(expected.beforeSend);
      expect(rewound.selected).toEqual(expected.beforeSend.selected);
      expect(rewound.draft).toBe(expected.beforeSend.draft);
      const resent = transition(restore(rewound), { at: rewound.nodeId, type: "SEND_RESPONSE" });
      expect(resent).toEqual(expected.afterSend);
      expect(resent.transcript.filter(line => line.role === "you" && line.audioId === "U01")).toHaveLength(1);
      expect(resent.evidence).toHaveLength(1);
      expect(Object.values(resent.audioAccess)).not.toContain("heard");
    });

    it(`continues the restored ${profile} draft through real activities without duplicate or fabricated evidence`, () => {
      const resumed = restore(legacy[profile].resumed);
      expect(resumed.nodeId).toBe("p3.ask");
      expect(resumed.selected).toEqual(profile === "less" ? [] : ["what"]);
      expect(resumed.draft).toBe(profile === "less" ? "What did" : "");
      const completed = completeNormally(resumed);
      expect(completed.journal.slice(0, resumed.journal.length)).toEqual(resumed.journal);
      expect(completed.journal.slice(resumed.journal.length).some(event => event.type === "TEST_FORWARD")).toBe(false);
      expect(Object.values(completed.audioAccess)).not.toContain("heard");
      for (const [key, mode] of Object.entries(resumed.audioAccess)) expect(completed.audioAccess[key]).toBe(mode);
      const responses = completed.transcript.filter(line => line.role === "you");
      expect(responses.filter(line => line.audioId === "U01")).toHaveLength(1);
      expect(responses.filter(line => line.audioId === "U02")).toHaveLength(1);
      expect(new Set(responses.map(line => line.id)).size).toBe(responses.length);
      expect(completed.evidence).toHaveLength(responses.length);
      expect(completed.evidence.slice(0, resumed.evidence.length)).toEqual(resumed.evidence);
      for (const highlight of retrospective(completed)) {
        expect(responses.some(line => line.audioId === highlight.after)).toBe(true);
      }
      restore(completed);
    });
  }

  it("keeps a fully skipped legacy retrospective honest and usable", () => {
    const state = restore(legacy.skipped);
    expect(retrospective(state)).toEqual([]);
    expect(state.evidence).toEqual([]);
    const render = (reviewView: DemoState["reviewView"]) => renderToStaticMarkup(createElement(DemoExperience, {
      initial: { ...state, reviewView },
    }));
    expect(render("end")).toContain("Esta tentativa não tem respostas suas registradas.");
    expect(render("end")).not.toContain("Você participou desta");
    const moments = render("moments");
    expect(moments).toContain("Esta tentativa não tem respostas suas registradas.");
    expect(moments).toContain("Esta conversa não comprova domínio ou memorização.");
    expect(moments).not.toContain("Momento 1 de 0");
    expect(moments).not.toContain("Você disse");
    expect(render("thanks")).toContain("Fim do percurso");
    expect(render("thanks")).not.toContain("Demo concluída");
  });
});
