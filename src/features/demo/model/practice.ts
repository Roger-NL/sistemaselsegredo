import { normalizeAnswer } from "./normalize";
export { normalizeAnswer } from "./normalize";
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
  const skeleton = profile === "some" ? node.skeleton ?? (answer.length > 1 ? `${source.find(b => b.id === answer[0])?.text ?? ""} ___` : undefined) : node.skeleton;
  return { mode, blocks, answer, skeleton };
}

export type ConstructionView = {
  kind: "assembly" | "completion";
  before: string;
  after: string;
  blocks: Block[];
  answer: string[];
  selected: { id: string; index: number }[];
  prefill: string[];
};

/** A view of the existing exercise, never a new persisted answer contract.
 * Given words stay outside the missing part. Canonical IDs and old journals
 * keep their meaning; a user click can supply the given prefix through the
 * same PLACE_BLOCK events that have always been understood by the reducer.
 */
export function constructionView(node: ResponseNode, profile: SupportProfile, selected: string[] = []): ConstructionView {
  const exercise = practice(node, profile);
  const full: ConstructionView = { kind: "assembly", before: "", after: "", blocks: exercise.blocks,
    answer: exercise.answer, selected: selected.map((id, index) => ({ id, index })), prefill: [] };
  if (exercise.mode !== "build" || !exercise.skeleton?.includes("___")) return full;
  const generated = profile === "some" && !node.skeleton;
  const prefix = generated ? exercise.answer.slice(0, 1) : [];
  // A pre-v8 journal may contain an out-of-order partial assembly. Keep it
  // visible and removable; do not reinterpret it as a completed fixed prefix.
  if (prefix.length && selected.length && selected[0] !== prefix[0]) return full;
  const [before, ...after] = exercise.skeleton.split("___");
  return {
    kind: "completion", before: before.trimEnd(), after: after.join("___").trimStart(),
    blocks: exercise.blocks.filter(block => !prefix.includes(block.id)),
    answer: exercise.answer.slice(prefix.length),
    selected: selected.slice(prefix.length).map((id, index) => ({ id, index: index + prefix.length })),
    prefill: selected.length ? [] : prefix,
  };
}
export function responsePhase(state: DemoState, node: ResponseNode, introducing = true): DemoState["phase"] {
  if (node.id === "p6.warn") return "ready";
  if (introducing && node.mode === "recall" && expressionHistory(state, node.response) !== "new") return "recall";
  if (introducing && state.activityProfile === "beginner" && expressionHistory(state, node.response) === "new") return "present";
  const mode: "send" | "write" | "select" | "build" = practice(node, state.activityProfile).mode;
  return mode === "send" ? "ready" : mode;
}
export function recognitionOptions(node: ResponseNode): AudioId[] {
  const choices: AudioId[] = [node.response, ...(["U03", "U07", "U04", "U20"] as AudioId[]).filter(id => id !== node.response).slice(0, 2)];
  const offset = [...node.id].reduce((n, c) => n + c.charCodeAt(0), 0) % choices.length;
  return [...choices.slice(offset), ...choices.slice(0, offset)];
}
// Deliberately finite, context-aware repertoire; never a semantic English grader.
const alternatives: Partial<Record<AudioId, string[]>> = {
  U01: ["No, not mine.", "It's not mine.", "No, it isn't mine."],
  U02: ["What did you order"], U03: ["That's okay.", "No problem.", "It's alright."],
  U05: ["It's mine.", "Yes, mine.", "Yes, this is mine."],
  U06: ["Yes, I like it."], U07: ["No, not really."], U09: ["Oh, really?"],
  U10: ["Sure!", "Yes, sure.", "Yes, please.", "Yes!"],
  U11: ["I'm learning English now."], U12: ["Do you like your work?"],
  U13: ["Do you like this cafe?"], U14: ["I like it.", "Yes, I like it."],
  U15: ["I can stay a bit longer."], U16: ["I need to go.", "I've got to go."],
  U17: ["I like this place."], U18: ["Could we keep in touch?"],
  U19: ["It was nice talking to you.", "Nice to talk to you."],
  U20: ["Goodbye!", "Bye bye!", "See you!"],
};
const contextual: Record<string, string[]> = {
  "p4.same": ["I ordered an iced coffee too.", "I ordered the same."],
  "p7.too": ["I'm tired too."], "p7.not": ["I'm not very tired."],
  "p5.like": ["I like the coffee."], "p5.not": ["I don't really like it."],
  "p9.english-like": ["I like learning English."], "p9.english-not": ["I don't really like learning English."],
  "p9.cafe-like": ["I like this café.", "I like this cafe."],
  "p9.cafe-not": ["I don't really like this café.", "I don't really like this cafe."],
};
export function writtenRepertoire(node: ResponseNode): string[] {
  return [audio[node.response].text, ...(alternatives[node.response] ?? []), ...(contextual[node.id] ?? [])];
}
export function acceptsAnswer(text: string, id: AudioId, nodeId?: string) {
  return [audio[id].text, ...(alternatives[id] ?? []), ...(nodeId ? contextual[nodeId] ?? [] : [])]
    .some(value => normalizeAnswer(text) === normalizeAnswer(value));
}
/** Frozen acceptance for already recorded pre-v8 sends (including its old flaws). */
export function acceptsLegacyAnswer(text: string, id: AudioId) {
  const normalize = (value: string) => value.normalize("NFC").toLowerCase().replace(/[’‘]/g, "'")
    .replace(/\bit's\b/g, "it is").replace(/\bi'm\b/g, "i am")
    .replace(/\bisn't\b/g, "is not").replace(/\bthat's\b/g, "that is")
    .replace(/[.,!?]/g, "").replace(/\s+/g, " ").trim();
  return normalize(text) === normalize(audio[id].text);
}
