import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DemoExperience } from "@/features/demo/DemoExperience";
import { nodes, catalog } from "@/features/demo/content/catalog";
import { audio } from "@/features/demo/content/media";
import { presentationCards } from "@/features/demo/content/presentation";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { listeningTarget } from "@/features/demo/model/listening";
import { decodeSnapshot, encodeSnapshot } from "@/features/demo/session/storage";
import { PROFILES, type DemoState, type SupportProfile } from "@/features/demo/model/types";

const render = (state: DemoState) => renderToStaticMarkup(createElement(DemoExperience, { initial: state }));
function heard(state: DemoState) {
  const target = listeningTarget(state)!;
  return transition(state, { at: state.nodeId, type: "AUDIO_ACCESS", key: target.key, mode: "heard" });
}
function opening(profile: SupportProfile) {
  let state = createDemo(profile, "listening-tests", 0);
  for (let i = 0; i < 2; i++) state = transition(state, { at: state.nodeId, type: "NEXT" });
  return state;
}
function answer(profile: SupportProfile) {
  let state = heard(opening(profile));
  for (let i = 0; i < 2; i++) state = transition(state, { at: state.nodeId, type: "NEXT" });
  return transition(state, { at: state.nodeId, type: "UNDERSTAND", correct: true });
}

describe("listen, understand, respond", () => {
  it("keeps Lucas's readable line, playback and next step on one screen without revealing comprehension options", () => {
    for (const profile of PROFILES) {
      const before = opening(profile);
      expect(render(before)).toContain("Ouvir fala de Lucas");
      expect(render(before)).toContain(audio.C01.text);
      expect(render(before)).toContain('class="scene-balloon" data-speaker="character"');
      expect(render(before)).not.toContain("Li, continuar");
      expect(render(before)).toContain("Entender a pergunta");
      expect(render(before)).not.toContain("Se essa bebida é sua.");
      const after = heard(before);
      expect(render(after)).toBe(render(before));
      expect(after.nodeId).toBe(before.nodeId);
      expect(after.phase).toBe(before.phase);
      expect(after.presentationStep).toBe(before.presentationStep);
      expect(after.audioAccess["lucas:p1.lucas"]).toBe("heard");
      expect(render(after)).toContain(audio.C01.text);
      expect(render(after)).toContain("Entender a pergunta");
      expect(after.transcript).toEqual(before.transcript);
      expect(after.evidence).toEqual(before.evidence);
      expect(transition(after, { at: after.nodeId, type: "BACK" })).toEqual(before);
      expect(decodeSnapshot(encodeSnapshot(after))).toEqual(after);
      let question = transition(after, { at: after.nodeId, type: "NEXT" });
      question = transition(question, { at: question.nodeId, type: "NEXT" });
      expect(render(question)).toContain("Se essa bebida é sua.");
      expect(render(question)).not.toContain("Escute Lucas.");
    }
  });
  it("keeps the beginner intention in Portuguese before and after the English audio", () => {
    const before = answer("beginner");
    expect(before.phase).toBe("present");
    expect(render(before)).toContain("Ouvir modelo em inglês");
    expect(render(before)).not.toContain(audio.U01.text);
    expect(render(before)).toContain(audio.U01.meaning);
    expect(render(before)).toContain("Responder em inglês");
    const after = heard(before);
    expect(render(after)).toBe(render(before));
    expect(after.nodeId).toBe(before.nodeId);
    expect(after.phase).toBe("present");
    expect(after.presentationStep).toBe(before.presentationStep);
    expect(after.evidence).toEqual(before.evidence);
    expect(after.audioAccess["model:p2.send"]).toBe("heard");
    expect(render(after)).not.toContain(audio.U01.text);
    expect(render(after)).toContain(audio.U01.meaning);
    expect(render(after)).toContain("Responder em inglês");
    const practice = transition(after, { at: after.nodeId, type: "PREPARE" });
    expect(practice.phase).toBe("build");
    expect(render(practice)).not.toContain(audio.U01.text);
    expect(render(practice)).toContain('class="construction"');
  });
  it("keeps intermediate pieces and independent writing, without forcing an answer model", () => {
    const intermediate = answer("some"), independent = answer("less");
    expect(intermediate.phase).toBe("build");
    expect(independent.phase).toBe("write");
    expect(listeningTarget(intermediate)).toBeNull();
    expect(listeningTarget(independent)).toBeNull();
    expect(render(intermediate)).toContain('class="construction"');
    expect(render(independent)).toContain('id="written-answer"');
    expect(render(intermediate)).not.toContain(audio.U01.text);
    // Optional alternatives are in a closed disclosure, and their consultation
    // records REVEAL_MODEL. The canonical audio is labelled as a model.
    expect(render(independent)).toContain('class="writing-repertoire"');
    expect(render(independent)).not.toContain('class="writing-repertoire" open');
    expect(render(independent)).toContain("Consultar expressões aceitas");
    for (const state of [intermediate, independent]) expect(render(state)).toContain("Ouvir modelo");
  });
  it("shows Lucas in the comic while keeping learner models hidden before practice", () => {
    for (const profile of PROFILES) for (const node of nodes) {
      const steps = presentationCards(node).length;
      for (let step = 0; step <= steps; step++) {
        const state: DemoState = { ...createDemo(profile, "catalog-listen", 0), nodeId: node.id, presentationStep: step, phase: node.kind === "response" ? "present" : "scene" };
        const target = listeningTarget(state);
        if (!target) continue;
        const before = render(state);
        for (const id of target.audio) {
          if (target.kind === "lucas") expect(before).toContain(audio[id].text);
          else expect(before).not.toContain(audio[id].text);
        }
        expect(before).not.toContain('class="construction"');
        expect(before).not.toContain('id="written-answer"');
        const after = render(heard(state));
        for (const id of target.audio) {
          if (target.kind === "lucas") expect(after).toContain(audio[id].text);
          else { expect(after).not.toContain(audio[id].text); expect(after).toContain(audio[id].meaning); }
        }
      }
    }
  });
  it("ignores duplicate/stale completions and prevents a queued card advance from skipping listening", () => {
    let state: DemoState = { ...createDemo("beginner", "queued-listen", 0), nodeId: "p7.tired", phase: "recall", presentationStep: 2 };
    expect(transition(state, { at: state.nodeId, type: "ADVANCE_PRESENTATION" })).toBe(state);
    expect(transition(state, { at: state.nodeId, type: "AUDIO_ACCESS", key: "model:p2.send", mode: "heard" })).toBe(state);
    state = heard(state);
    expect(heard(state)).toBe(state);
    const next = transition(state, { at: state.nodeId, type: "ADVANCE_PRESENTATION" });
    expect(next.presentationStep).toBe(3);
    expect(transition(next, { at: "p1.lucas", type: "AUDIO_ACCESS", key: "lucas:p1.lucas", mode: "heard" })).toBe(next);
  });
  it("restores v5 drafts and distinguishes old reading from actual listening", () => {
    let old = answer("less");
    old = transition(old, { at: old.nodeId, type: "TYPE", text: "No, it’s" });
    const data = JSON.parse(encodeSnapshot(old));
    data.storyVersion = "cafe-v5";
    data.journal = data.journal.filter((event: { type: string }) => event.type !== "AUDIO_ACCESS");
    const migrated = decodeSnapshot(JSON.stringify(data))!;
    expect(migrated.nodeId).toBe(old.nodeId);
    expect(migrated.draft).toBe(old.draft);
    expect(migrated.transcript).toEqual(old.transcript);
    expect(migrated.audioAccess["lucas:p1.lucas"]).toBe("text");
    expect(decodeSnapshot(encodeSnapshot(migrated))).toEqual(migrated);
    const pending = JSON.parse(encodeSnapshot(opening("beginner"))); pending.storyVersion = "cafe-v5";
    expect(decodeSnapshot(JSON.stringify(pending))!.audioAccess).toEqual({});
    expect(catalog[migrated.nodeId].kind).toBe("response");
  });
});

it("keeps the warning model and explicit send on one screen before and after playback", () => {
  const state = { ...createDemo("beginner", "comic-ready-test", 0), nodeId: "p6.warn", presentationStep: presentationCards(catalog["p6.warn"]).length, phase: "ready" as const };
  expect(render(state)).toContain("Avisar Lucas");
  expect(render(state)).not.toContain("Ir direto para a atividade");
  expect(render(state)).not.toContain(audio.U08.text);
  const after = heard(state);
  expect(render(after)).toBe(render(state));
  expect(after.nodeId).toBe("p6.warn");
  expect(after.phase).toBe("ready");
  expect(render(after)).toContain("Avisar Lucas");
  expect(render(after)).not.toContain("Ir direto para a atividade");
  expect(render(after)).toContain("Ouvir modelo");
  expect(after.evidence).toEqual([]);
  expect(after.transcript).toEqual(state.transcript);
});
