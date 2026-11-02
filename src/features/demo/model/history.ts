import { normalizeAnswer } from "./normalize";
import { audio } from "../content/media";
import { STORY_VERSION, type AudioId, type DemoState } from "./types";

const expressionSources: Partial<Record<AudioId, AudioId[]>> = {
  U04: ["U04", "C08", "C20", "C25", "C30"], U07: ["U07"],
  U06: ["U06", "U14", "C09", "C19", "C22"], U09: ["C08", "C09", "C21", "U09"],
};
export function expressionHistory(state: DemoState, id: AudioId): "used" | "encountered" | "new" {
  const sources = expressionSources[id] ?? [id];
  // Preserve the original phase decisions while reconstructing old journals.
  // Only future actions after UPGRADE_CONTENT use literal lexical evidence.
  if (state.storyVersion !== STORY_VERSION) {
    if (state.transcript.some(line => line.role === "you" && sources.includes(line.audioId))) return "used";
    return state.transcript.some(line => sources.includes(line.audioId)) ? "encountered" : "new";
  }
  const expression = ` ${normalizeAnswer(audio[id].text)} `;
  const containsExpression = (text: string) => ` ${normalizeAnswer(text)} `.includes(expression);
  // An audio ID records the intended response family. Written alternatives
  // preserve that intention without proving use of the model's exact words.
  if (state.transcript.some(line => line.role === "you" && sources.includes(line.audioId)
    && containsExpression(line.written ?? audio[line.audioId].text))) return "used";
  return state.transcript.some(line => line.role === "character" && sources.includes(line.audioId)
    && containsExpression(audio[line.audioId].text)) ? "encountered" : "new";
}
export function conversation(state: DemoState) {
  return state.transcript.map(line => ({ ...line, text: line.written ?? audio[line.audioId].text, meaning: audio[line.audioId].meaning }));
}
