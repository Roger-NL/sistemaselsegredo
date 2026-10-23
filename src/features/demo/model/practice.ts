import { audio } from "../content/media";
import type { AudioId, Block, DemoState, ResponseNode, SupportProfile } from "./types";
import { expressionHistory } from "./history";

/** One story, different observable response tasks; provider parameters never depend on level. */
export function practice(node: ResponseNode, profile: SupportProfile) {
  const mode: "send" | "write" | "select" | "build" = node.id === "p6.warn" ? "send" : profile === "less" ? "write"
    : profile === "beginner" && !["blocks", "recombine"].includes(node.mode) ? "select" : "build";
  const source: Block[] = node.blocks ?? audio[node.response].text.split(/\s+/).map((text, i) => ({ id: `word-${i}`, text }));
  const answer = node.answer ?? source.map(b => b.id);
  const distractors: Partial<Record<AudioId, string>> = { U02: "What do you", U06: "I don’t like", U11: "I’m teaching", U12: "your coffee", U13: "your job", U15: "I can’t stay", U16: "I don’t have to", U17: "there", U18: "Can we leave?" };
  const extra = profile === "some" && source.length === answer.length && distractors[node.response]
    ? [{ id: "distractor", text: distractors[node.response]! }] : [];
  const blocks = profile === "beginner" ? source.filter(b => answer.includes(b.id)) : [...source, ...extra];
  const skeleton = profile === "some" ? node.skeleton ?? `${source.find(b => b.id === answer[0])?.text ?? ""} ___` : node.skeleton;
  return { mode, blocks, answer, skeleton };
}
export function responsePhase(state: DemoState, node: ResponseNode, introducing = true): DemoState["phase"] {
  if (node.id === "p6.warn") return "ready";
  if (introducing && node.mode === "recall" && expressionHistory(state, node.response) !== "new") return "recall";
  if (introducing && state.activityProfile === "beginner" && node.id !== "p2.prepare" && expressionHistory(state, node.response) === "new") return "present";
  const mode: "send" | "write" | "select" | "build" = practice(node, state.activityProfile).mode;
  return mode === "send" ? "ready" : mode;
}
export function recognitionOptions(node: ResponseNode): AudioId[] {
  const choices: AudioId[] = [node.response, ...(["U03", "U07", "U04", "U20"] as AudioId[]).filter(id => id !== node.response).slice(0, 2)];
  const offset = [...node.id].reduce((n, c) => n + c.charCodeAt(0), 0) % choices.length;
  return [...choices.slice(offset), ...choices.slice(0, offset)];
}
export function normalizeAnswer(text: string) {
  return text.normalize("NFC").toLowerCase().replace(/[’‘]/g, "'")
    .replace(/\bit's\b/g, "it is").replace(/\bi'm\b/g, "i am")
    .replace(/\bisn't\b/g, "is not").replace(/\bthat's\b/g, "that is")
    .replace(/[.,!?]/g, "").replace(/\s+/g, " ").trim();
}
export function acceptsAnswer(text: string, id: AudioId) {
  return normalizeAnswer(text) === normalizeAnswer(audio[id].text);
}
