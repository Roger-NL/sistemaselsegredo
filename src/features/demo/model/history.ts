import { audio } from "../content/media";
import type { AudioId, DemoState } from "./types";

const expressionSources: Partial<Record<AudioId, AudioId[]>> = {
  U04: ["U04", "C08", "C20", "C25", "C30"], U07: ["U07"],
  U06: ["U06", "U14", "C09", "C19", "C22"], U09: ["C08", "C09", "C21", "U09"],
};
export function expressionHistory(state: DemoState, id: AudioId): "used" | "encountered" | "new" {
  const sources = expressionSources[id] ?? [id];
  if (state.transcript.some(line => line.role === "you" && sources.includes(line.audioId))) return "used";
  return state.transcript.some(line => sources.includes(line.audioId)) ? "encountered" : "new";
}
export function conversation(state: DemoState) {
  return state.transcript.map(line => ({ ...line, text: audio[line.audioId].text, meaning: audio[line.audioId].meaning }));
}
