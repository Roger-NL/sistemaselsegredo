// @vitest-environment jsdom
import { act, createElement, useLayoutEffect, useReducer } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const sounds = vi.hoisted(() => ({ play: vi.fn() }));
vi.mock("@/components/interaction/sounds", () => ({ playInteractionSound: sounds.play }));
import { ResponseConstruction } from "@/features/demo/components/ResponseConstruction";
import { useConversationMotion } from "@/features/demo/components/use-conversation-motion";
import { catalog, nodes } from "@/features/demo/content/catalog";
import { audio } from "@/features/demo/content/media";
import { presentationCards } from "@/features/demo/content/presentation";
import { listeningTarget } from "@/features/demo/model/listening";
import { constructionView, practice } from "@/features/demo/model/practice";
import { sceneConversation } from "@/features/demo/model/scene-conversation";
import { createDemo, transition } from "@/features/demo/model/reducer";
import type { DemoEvent, DemoState, ResponseNode, SupportProfile } from "@/features/demo/model/types";
import { decodeSnapshot, encodeSnapshot } from "@/features/demo/session/storage";
import legacy from "./fixtures/demo-legacy-navigation.json";

const response = (id: string) => catalog[id] as ResponseNode;
const reloaded = (state: DemoState) => {
  const restored = decodeSnapshot(encodeSnapshot(state)); expect(restored).toEqual(state); return restored!;
};
function reach(id: string, profile: SupportProfile = "some", choices: Record<string,string> = {}) {
  let state = createDemo(profile, "completion-test", 0);
  for (let guard = 0; guard < 220; guard++) {
    const node = catalog[state.nodeId], target = listeningTarget(state);
    const dispatch = (event: DemoEvent) => { const before = state; state = transition(state, event); expect(state).not.toBe(before); };
    if (target && !state.audioAccess[target.key]) dispatch({ at: node.id, type: "AUDIO_ACCESS", key: target.key, mode: "text" });
    else if (state.presentationStep < presentationCards(node, state).length) dispatch({ at: node.id, type: "ADVANCE_PRESENTATION" });
    else if (node.kind === "response" && (state.phase === "present" || state.phase === "recall")) dispatch({ at: node.id, type: state.phase === "present" ? "PREPARE" : "CHECK" });
    else if (state.nodeId === id) return reloaded(state);
    else if (node.kind === "scene") dispatch({ at: node.id, type: "NEXT" });
    else if (node.kind === "comprehension") dispatch({ at: node.id, type: "ANSWER_MEANING", correct: true });
    else if (node.kind === "choice") dispatch({ at: node.id, type: "CHOOSE", choice: choices[node.id] ?? node.choices[0].id });
    else if (node.kind === "response") {
      if (state.phase === "build") for (const block of practice(node, state.assistedBlocks ? "some" : state.activityProfile).answer) dispatch({ at: node.id, type: "PLACE_BLOCK", block });
      else if (state.phase === "write") dispatch({ at: node.id, type: "TYPE", text: audio[node.response].text });
      else if (state.phase === "select") dispatch({ at: node.id, type: "RECOGNIZE", response: node.response });
      dispatch({ at: node.id, type: "SEND_RESPONSE" });
    } else throw new Error(`Unreachable ${id}`);
  }
  throw new Error(`Did not reach ${id}`);
}

let root: Root, container: HTMLElement, latest: DemoState;
function Harness({ initial }: { initial: DemoState }) {
  const [state, commit] = useReducer(transition, initial);
  useLayoutEffect(() => { latest = state; }, [state]);
  const dispatch = useConversationMotion(state, commit), node = catalog[state.nodeId];
  if (node.kind !== "response") return createElement("p", null, node.id);
  const exercise = practice(node, state.assistedBlocks ? "some" : state.activityProfile);
  const view = constructionView(node, state.assistedBlocks ? "some" : state.activityProfile, state.selected);
  return createElement("main", { className: "demo-shell" },
    createElement(ResponseConstruction, { node, state, dispatch }),
    createElement("button", { onClick: () => dispatch({ at: node.id, type: "SEND_RESPONSE" }), disabled: state.selected.length !== exercise.answer.length }, "Enviar"),
    createElement("button", { onClick: () => dispatch({ at: node.id, type: "CLEAR" }), disabled: !view.selected.length }, "Limpar"));
}
beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  window.matchMedia = vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })) as unknown as typeof window.matchMedia;
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });
const bank = () => [...container.querySelectorAll<HTMLButtonElement>(".blocks button")];
const control = (text: string) => [...container.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === text)!;
async function mount(state: DemoState) { await act(async () => root.render(createElement(Harness, { initial: state }))); }
async function piece(text: string) { const button = bank().find(item => item.textContent === text); expect(button).toBeDefined(); await act(async () => button!.click()); }

describe("completion is a projection of the frozen assembly contract", () => {
  it("audits every response and keeps beginner tasks and independent writing unchanged", () => {
    let generated = 0, explicit = 0;
    for (const node of nodes) if (node.kind === "response") {
      for (const profile of ["beginner", "some", "less"] as const) {
        const canonical = practice(node, profile), before = JSON.stringify(canonical);
        const view = constructionView(node, profile);
        expect(JSON.stringify(practice(node, profile))).toBe(before);
        if (profile === "less" || !canonical.skeleton || canonical.mode !== "build") {
          expect(view.kind).toBe("assembly"); expect(view.blocks).toEqual(canonical.blocks); continue;
        }
        expect(view.kind).toBe("completion");
        if (node.skeleton) {
          expect(view.prefill).toEqual([]); expect(view.answer).toEqual(canonical.answer); expect(view.blocks).toEqual(canonical.blocks);
          if (profile === "some") explicit++;
        } else {
          expect(profile).toBe("some"); generated++;
          expect(view.prefill).toEqual(canonical.answer.slice(0,1));
          expect(view.answer).toEqual(canonical.answer.slice(1));
          expect(view.blocks.some(block => view.prefill.includes(block.id))).toBe(false);
        }
      }
    }
    expect(generated).toBe(19); expect(explicit).toBe(3);
  });

  it("preserves an old out-of-order assembly without presenting a contradictory fixed prefix", () => {
    const state = reach("p2.send"), node = response(state.nodeId);
    const old = transition(state, { at: node.id, type: "BLOCK", block: "mine" });
    const restored = reloaded(old), view = constructionView(node, "some", restored.selected);
    expect(view.kind).toBe("assembly"); expect(view.before).toBe(""); expect(view.selected).toEqual([{ id: "mine", index: 0 }]);
    expect(view.blocks).toEqual(practice(node, "some").blocks);
    expect(sceneConversation(restored)).toEqual({ role:"you", text:"mine", intention:false });
  });

  it("shows only too after Me, requires an intentional send and replays the full utterance", async () => {
    const initial = reach("p4.same"), journal = JSON.stringify(initial.journal);
    await mount(initial);
    expect(container.querySelector(".completion-fixed")?.textContent).toBe("Me");
    expect(bank().map(button => button.textContent)).toEqual(["too."]);
    expect(JSON.stringify(latest.journal)).toBe(journal); // No initial placement effect.
    expect(sceneConversation(latest)).toEqual({ role:"you", text:audio.U04.meaning, intention:true });
    await piece("too.");
    expect(latest.selected).toEqual(["word-0", "word-1"]);
    expect(latest.nodeId).toBe("p4.same"); expect(latest.evidence).toEqual(initial.evidence);
    expect(sceneConversation(latest)).toEqual({ role:"you", text:"Me too.", intention:false });
    expect(control("Enviar").disabled).toBe(false);
    expect(sounds.play.mock.calls.some(([kind]) => kind === "retry")).toBe(false);
    const beforeSend = reloaded(latest);
    await act(async () => control("Enviar").click());
    expect(latest.nodeId).toBe("p4.nice-a");
    expect(latest.transcript.slice(-2).map(line => line.audioId)).toEqual(["U04", "C04"]); expect(audio.U04.text).toBe("Me too.");
    const back = transition(latest, { at: latest.nodeId, type: "BACK" });
    expect(back).toEqual(beforeSend);
    expect(constructionView(response(back.nodeId), "some", back.selected).selected).toEqual([{ id:"word-1", index:1 }]);
    reloaded(latest);
  });

  it("returns wrong pieces and resets the missing part after three errors while the fixed prefix stays visible", async () => {
    const initial = reach("p2.send"); await mount(initial);
    for (let attempt = 1; attempt <= 3; attempt++) {
      await piece("it’s");
      expect(latest.evidence).toEqual(initial.evidence); expect(latest.nodeId).toBe(initial.nodeId);
      expect(container.querySelector(".completion-fixed")?.textContent).toBe("No");
      expect(sceneConversation(latest)).toEqual({ role:"you", text:audio.U01.meaning, intention:true });
      expect(control("Limpar").disabled).toBe(true);
      reloaded(latest);
    }
    expect(latest.selected).toEqual([]); expect(latest.assemblyMistakes).toBe(0);
    await piece("it’s not"); await piece("mine");
    expect(latest.selected).toEqual(["no", "negative", "mine"]);
    expect(control("Enviar").disabled).toBe(false);
    const remove = container.querySelector<HTMLButtonElement>('[aria-label="Retirar it’s not"]')!;
    await act(async () => remove.click());
    expect(latest.selected).toEqual(["no"]); expect(latest.returnedBlocks).toEqual(["negative", "mine"]);
    expect(control("Limpar").disabled).toBe(true);
    await piece("it’s not"); await act(async () => control("Limpar").click());
    expect(latest.selected).toEqual([]); expect(container.querySelector(".completion-fixed")?.textContent).toBe("No");
    expect(bank().some(button => button.textContent === "No")).toBe(false);
  });

  it("restores v7 and v8 prefix selections with canonical remove indexes and no journal mutations", async () => {
    const v7 = decodeSnapshot(JSON.stringify(legacy.some.beforeSend))!;
    expect(legacy.some.beforeSend.storyVersion).toBe("cafe-v7"); expect(v7.selected).toEqual(legacy.some.beforeSend.selected);
    const original = encodeSnapshot(v7);
    await mount(v7);
    expect(container.querySelector(".completion-fixed")?.textContent).toBe("No");
    expect([...container.querySelectorAll(".answer ol button")].map(button => button.textContent?.replace(/\s+/g," ").trim())).toEqual(["it’s not", "mine"]);
    expect(encodeSnapshot(latest)).toBe(original);
    const prefix = transition(reach("p4.same"), { at:"p4.same", type:"PLACE_BLOCK", block:"word-0" });
    expect(constructionView(response(prefix.nodeId), "some", reloaded(prefix).selected).selected).toEqual([]);
    expect(constructionView(response(prefix.nodeId), "some", prefix.selected).prefill).toEqual([]);
    expect(sceneConversation(prefix)).toEqual({ role:"you", text:audio.U04.meaning, intention:true });
  });

  it("keeps explicit recombination gaps as missing-piece tasks without another prefix event", async () => {
    const initial = reach("p8.job", "some", { "p8.topic":"job" }); await mount(initial);
    expect(container.querySelector(".completion-fixed")?.textContent).toBe("Do you like");
    expect(bank().map(button => button.textContent)).toEqual(["your job", "your coffee"]);
    const count = initial.journal.length; await piece("your job");
    expect(latest.selected).toEqual(["job"]); expect(latest.journal.length).toBe(count + 1);
    expect(latest.nodeId).toBe("p8.job"); expect(control("Enviar").disabled).toBe(false);
    const beforeSend = reloaded(latest);
    await act(async () => control("Enviar").click());
    expect(latest.nodeId).toBe("p8.job-reaction"); reloaded(latest);
    expect(transition(latest, { at:latest.nodeId, type:"BACK" })).toEqual(beforeSend);
  });

  it("uses completion only after the independent writer asks for pieces and preserves the draft", async () => {
    let initial = reach("p4.same", "less"); expect(initial.phase).toBe("write");
    initial = transition(initial, { at:initial.nodeId, type:"TYPE", text:"I ordered the same." });
    initial = transition(initial, { at:initial.nodeId, type:"USE_BLOCKS" });
    expect(initial.assistedBlocks).toBe(true); await mount(reloaded(initial));
    expect(bank().map(button => button.textContent)).toEqual(["too."]);
    await piece("too."); expect(latest.draft).toBe("I ordered the same.");
    expect(latest.evidence).toEqual(initial.evidence); reloaded(latest);
    const writing = transition(latest, { at:latest.nodeId, type:"WRITE_AGAIN" });
    expect(writing.phase).toBe("write"); expect(writing.draft).toBe("I ordered the same.");
    reloaded(writing);
  });

  it.each([
    ["p8.job", "your job", { "p8.topic":"job" }],
    ["p9.cafe", "this café", {}],
    ["p10.here", "here", {}],
  ] as const)("mirrors the full sentence around the explicit %s gap only after a piece click", async (id, text, choices) => {
    const initial = reach(id, "some", choices), node = response(id); await mount(initial);
    expect(sceneConversation(latest)).toEqual({ role:"you", text:audio[node.response].meaning, intention:true });
    await piece(text);
    expect(sceneConversation(latest)).toEqual({ role:"you", text:audio[node.response].text, intention:false });
    expect(latest.nodeId).toBe(id); expect(latest.evidence).toEqual(initial.evidence); reloaded(latest);
  });
});
