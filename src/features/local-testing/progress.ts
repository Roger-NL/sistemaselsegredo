import type { LearningProgress } from "@/contracts/workspace";
import { audio } from "@/features/demo/content/media";
import { catalog } from "@/features/demo/content/catalog";
import { presentationCards } from "@/features/demo/content/presentation";
import { listeningTarget } from "@/features/demo/model/listening";
import { practice } from "@/features/demo/model/practice";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { decodeSnapshot, encodeSnapshot } from "@/features/demo/session/storage";
import type { DemoEvent, DemoNode, DemoState, SupportProfile } from "@/features/demo/model/types";
import { completeStep, decodeProgress, studySteps } from "@/features/theory/progress";

const cardsForState: (node: DemoNode, state?: DemoState) => ReturnType<typeof presentationCards> = presentationCards;

/** Synthetic test responses pass the same reducer and snapshot validation as the UI. */
export function advanceTestDemo(initial: DemoState, targetPart = 11): DemoState {
  let state = initial;
  for (let guard = 0; guard < 1000; guard++) {
    const node = catalog[state.nodeId];
    if (node.kind === "end" || node.part >= targetPart) return state;
    const target = listeningTarget(state);
    let event: DemoEvent;
    const at = node.id;
    if (target && !state.audioAccess[target.key]) event = { at, type: "AUDIO_ACCESS", key: target.key, mode: "text" };
    else if (state.presentationStep < cardsForState(node, state).length) event = { at, type: "ADVANCE_PRESENTATION" };
    else if (node.kind === "scene") event = { at, type: "NEXT" };
    else if (node.kind === "comprehension") event = { at, type: "ANSWER_MEANING", correct: true };
    else if (node.kind === "choice") event = { at, type: "CHOOSE", choice: node.choices[0].id };
    else if (node.kind === "response") {
      if (state.phase === "present") event = { at, type: "PREPARE" };
      else if (state.phase === "recall") event = { at, type: "CHECK" };
      else if (state.phase === "write") event = state.draft === audio[node.response].text ? { at, type: "SEND_RESPONSE" } : { at, type: "TYPE", text: audio[node.response].text };
      else if (state.phase === "select") event = state.recognized === node.response ? { at, type: "SEND_RESPONSE" } : { at, type: "RECOGNIZE", response: node.response };
      else if (state.phase === "build") {
        const exercise = practice(node, state.assistedBlocks ? "some" : state.activityProfile);
        if (state.selected.some((id, i) => id !== exercise.answer[i])) event = { at, type: "CLEAR" };
        else event = state.selected.length < exercise.answer.length ? { at, type: "PLACE_BLOCK", block: exercise.answer[state.selected.length] } : { at, type: "SEND_RESPONSE" };
      } else event = { at, type: "SEND_RESPONSE" };
    } else throw new Error("Não foi possível avançar este ponto da demo.");
    const next = transition(state, event);
    if (next === state) throw new Error(`O avanço parou em ${node.id}. O progresso anterior foi preservado.`);
    state = next;
  }
  throw new Error("A demo ultrapassou o limite de passos do teste.");
}
export type LocalProgressAction = "reset-all" | "reset-demo" | "advance-demo" | "complete-demo" | "jump-demo" | "reset-study" | "advance-study" | "complete-study";
export function changeTestProgress(learning: LearningProgress, action: LocalProgressAction, profile: SupportProfile, part = 1): LearningProgress {
  const next = { ...learning, updatedAt: new Date().toISOString() };
  if (action === "reset-all" || action === "reset-demo") { next.demoSnapshot = null; next.demoPercent = 0; }
  if (action === "reset-all" || action === "reset-study") { next.studySnapshot = null; next.studyCompleted = 0; }
  if (["advance-demo", "complete-demo", "jump-demo"].includes(action)) {
    const saved = learning.demoSnapshot ? decodeSnapshot(learning.demoSnapshot) : null;
    const start = action === "jump-demo" || !saved ? createDemo(profile, crypto.randomUUID(), Date.now()) : saved;
    const target = action === "jump-demo" ? Math.max(1, Math.min(10, Math.floor(part))) : action === "advance-demo" ? catalog[start.nodeId].part + 1 : 11;
    const state = advanceTestDemo(start, target);
    next.demoSnapshot = encodeSnapshot(state);
    next.demoPercent = catalog[state.nodeId].kind === "end" ? 100 : (catalog[state.nodeId].part - 1) * 10;
  }
  if (action === "advance-study" || action === "complete-study") {
    let progress = decodeProgress(learning.studySnapshot);
    if (action === "complete-study") progress = { ...progress, completed: studySteps.map(({ step }) => step.id), supported: [], position: studySteps.length - 1 };
    else {
      const position = studySteps.findIndex(({ step }) => !progress.completed.includes(step.id));
      if (position >= 0) progress = { ...completeStep(progress, studySteps[position].step.id, false), position: Math.min(position + 1, studySteps.length - 1) };
    }
    next.studySnapshot = JSON.stringify(progress);
    next.studyCompleted = progress.completed.length;
  }
  return next;
}
