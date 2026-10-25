import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DemoExperience } from "@/features/demo/DemoExperience";
import { catalog } from "@/features/demo/content/catalog";
import { audio } from "@/features/demo/content/media";
import { presentationCards } from "@/features/demo/content/presentation";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { listeningTarget } from "@/features/demo/model/listening";
import { practice } from "@/features/demo/model/practice";
import { decodeSnapshot, encodeSnapshot } from "@/features/demo/session/storage";
import { PROFILES, type DemoState } from "@/features/demo/model/types";
const render = (state: DemoState) => renderToStaticMarkup(createElement(DemoExperience, { initial: state }));

function read(state: DemoState) {
  const node = catalog[state.nodeId];
  while (state.presentationStep < presentationCards(node).length) {
    const target = listeningTarget(state);
    if (target && !state.audioAccess[target.key]) state = transition(state, { at: node.id, type: "AUDIO_ACCESS", key: target.key, mode: "heard" });
    const previous = state;
    state = transition(state, { at: node.id, type: "ADVANCE_PRESENTATION" });
    expect(state.transcript).toEqual(previous.transcript);
    expect(state.evidence).toEqual(previous.evidence);
    expect(catalog[state.nodeId].image).toBe(node.image);
    expect(transition(state, { at: node.id, type: "BACK" })).toEqual(previous);
  }
  return state;
}

describe("one main message per screen in parts 3–10", () => {
  it("preserves all 384 paths, tasks and immediate Lucas reactions through the reading cards", () => {
    for (const profile of PROFILES) {
      let paths = 0;
      function walk(input: DemoState, depth = 0) {
        expect(depth).toBeLessThan(150);
        let state = read(input);
        const node = catalog[state.nodeId];
        if (node.kind === "end") { paths++; expect(decodeSnapshot(encodeSnapshot(state))).toEqual(state); return; }
        if (node.kind === "choice") {
          for (const choice of node.choices) walk(transition(state, { at: node.id, type: "CHOOSE", choice: choice.id }), depth + 1);
          return;
        }
        if (node.kind === "scene") state = transition(state, { at: node.id, type: "NEXT" });
        else if (node.kind === "comprehension") state = transition(state, { at: node.id, type: "UNDERSTAND", correct: true });
        else {
          if (state.phase === "present") state = transition(state, { at: node.id, type: "PREPARE" });
          if (state.phase === "recall") state = transition(state, { at: node.id, type: "CHECK" });
          if (state.phase === "build") for (const block of practice(node, profile).answer) state = transition(state, { at: node.id, type: "BLOCK", block });
          if (state.phase === "write") state = transition(state, { at: node.id, type: "TYPE", text: audio[node.response].text });
          if (state.phase === "select") state = transition(state, { at: node.id, type: "RECOGNIZE", response: node.response });
          const beforeSend = state;
          state = transition(state, { at: node.id, type: "SUBMIT" });
          expect(state.nodeId).toBe(node.next);
          const target = catalog[state.nodeId];
          if (target.kind !== "end") {
            const first = presentationCards(target)[0];
            expect(first?.presentation ?? (target.kind === "scene" ? "dialogue" : null)).toBe("dialogue");
            expect(target.heard?.length).toBeGreaterThan(0);
          }
          expect(transition(state, { at: node.id, type: "SUBMIT" })).toBe(state);
          expect(state.evidence.length).toBe(beforeSend.evidence.length + 1);
        }
        walk(state, depth + 1);
      }
      walk(createDemo(profile, "sequence-test", 0));
      expect(paths).toBe(128);
    }
  });
  it("renders situation, context, Lucas and instruction without leaking the response activity", () => {
    const initial = createDemo("less", "sequence-render", 0);
    const state = { ...initial, nodeId: "p7.tired", phase: "recall" as const };
    const cards = presentationCards(catalog[state.nodeId]);
    expect(cards.map(card => card.presentation)).toEqual(["title", "context", "dialogue", "prompt"]);
    for (let step = 0; step < cards.length; step++) {
      let view: DemoState = { ...state, presentationStep: step };
      const target = listeningTarget(view);
      if (target) view = transition(view, { at: view.nodeId, type: "AUDIO_ACCESS", key: target.key, mode: "heard" });
      const html = render(view);
      expect(html.match(/class="opening-card"/g)).toHaveLength(1);
      expect(html).not.toContain('id="written-answer"');
      expect(html).not.toContain('class="recognition-response"');
      expect(html).not.toContain('class="construction"');
      expect(html.includes('lang="en">I’m tired.')).toBe(step === 2);
    }
    const activity = render({ ...state, phase: "write", presentationStep: cards.length });
    expect(activity).toContain('id="written-answer"');
    expect(activity).not.toContain('class="opening-card"');
    expect(activity).not.toContain('lang="en">I’m tired.');
    expect(activity).not.toContain("A conversa continua.");
  });
  it("restores v4 writing without another send and keeps the new cards reachable with Back", () => {
    const state = createDemo("less", "migration-test", 0);
    // A real journal reaches part three without manufacturing state.
    let current = state;
    for (let i = 0; i < 4; i++) current = transition(current, { at: current.nodeId, type: "NEXT" });
    current = transition(current, { at: current.nodeId, type: "UNDERSTAND", correct: true });
    current = transition(current, { at: current.nodeId, type: "TYPE", text: audio.U01.text });
    current = transition(current, { at: current.nodeId, type: "SUBMIT" });
    current = transition(current, { at: current.nodeId, type: "NEXT" });
    current = transition(current, { at: current.nodeId, type: "NEXT" });
    current = transition(current, { at: current.nodeId, type: "CHOOSE", choice: "ask" });
    current = transition(current, { at: current.nodeId, type: "TYPE", text: "What did" });
    const snapshot = JSON.parse(encodeSnapshot(current)); snapshot.storyVersion = "cafe-v4";
    const restored = decodeSnapshot(JSON.stringify(snapshot))!;
    expect(restored.nodeId).toBe("p3.ask"); expect(restored.draft).toBe("What did");
    expect(restored.transcript).toEqual(current.transcript);
    expect(restored.presentationStep).toBe(0);
    expect(transition(restored, { at: restored.nodeId, type: "BACK" }).nodeId).toBe("p3.intent");
    expect(decodeSnapshot(encodeSnapshot(restored))).toEqual(restored);
  });
});
