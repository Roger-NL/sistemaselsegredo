import { catalog } from "../content/catalog";
import { presentationCards } from "../content/presentation";
import type { AudioId, DemoState } from "./types";

export type AudioAccess = "heard" | "text";
export type ListeningTarget = { key: string; audio: AudioId[]; kind: "lucas" | "model" };
export const modelKey = (nodeId: string) => `model:${nodeId}`;
export const lucasKey = (nodeId: string) => `lucas:${nodeId}`;

/** Only the utterance on the current screen; never preload or synthesize audio. */
export function listeningTarget(state: DemoState): ListeningTarget | null {
  const node = catalog[state.nodeId];
  const cards = presentationCards(node);
  const card = cards[state.presentationStep];
  if (card) return card.heard?.length ? { key: lucasKey(node.id), audio: card.heard, kind: "lucas" } : null;
  if (node.kind === "scene" && node.heard?.length) return { key: lucasKey(node.id), audio: node.heard, kind: "lucas" };
  // This is the same question just heard in part one, not a second listening task.
  if (node.kind === "comprehension") return { key: lucasKey("p1.lucas"), audio: ["C01"], kind: "lucas" };
  if (node.kind === "response" && ["present", "ready"].includes(state.phase)) return { key: modelKey(node.id), audio: [node.response], kind: "model" };
  return null;
}

export function acceptsAudioAccess(state: DemoState, key: string) {
  if (listeningTarget(state)?.key === key) return true;
  const node = catalog[state.nodeId];
  // Optional help reveals a complete model only after its own listening.
  return node.kind === "response" && key === modelKey(node.id) && state.help[node.id] === node.help.length;
}
