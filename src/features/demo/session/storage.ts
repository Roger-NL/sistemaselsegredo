import { catalog } from "../content/catalog";
import { listeningTarget } from "../model/listening";
import { presentationCards } from "../content/presentation";
import { createDemo, transition } from "../model/reducer";
import { PROFILES, REVIEW_VIEWS, SCHEMA_VERSION, STORY_VERSION, type DemoEvent, type DemoState, type SupportProfile, type ReviewView } from "../model/types";

export const STORAGE_KEY = "basedspeak.demo.cafe.v1";
type StoragePort = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type RestoreResult = { status: "ok"; state: DemoState } | { status: "empty" | "unavailable" | "invalid" };
const isRecord = (x: unknown): x is Record<string, unknown> => Boolean(x && typeof x === "object" && !Array.isArray(x));
const removedPreparation = new Set(["p2.model", "p2.prepare", "p2.meaning"]);
function validEvent(value: unknown, legacy = false): value is DemoEvent {
  if (!isRecord(value) || typeof value.at !== "string" || (!catalog[value.at] && !(legacy && removedPreparation.has(value.at)))) return false;
  switch (value.type) {
    case "SEND_RESPONSE": case "REVEAL_MODEL": case "ADVANCE_PRESENTATION": case "NEXT": case "PREPARE": case "SUBMIT": case "CHECK": case "HELP": case "USE_SUPPORT": case "CLEAR": case "TOGGLE_MODEL": return true;
    case "AUDIO_ACCESS": return typeof value.key === "string" && value.key.length <= 160 && ["heard", "text"].includes(value.mode as string);
    case "TYPE": return typeof value.text === "string" && value.text.length <= 240;
    case "RECOGNIZE": return typeof value.response === "string";
    case "USE_BLOCKS": case "WRITE_AGAIN": return true;
    case "CHOOSE": return typeof value.choice === "string";
    case "ANSWER_MEANING": case "UNDERSTAND": return typeof value.correct === "boolean";
    case "PLACE_BLOCK": case "BLOCK": return typeof value.block === "string";
    case "RETURN_BLOCKS": case "REMOVE_BLOCK": return Number.isInteger(value.index);
    case "PROFILE": return PROFILES.includes(value.profile as SupportProfile);
    case "REVIEW": return REVIEW_VIEWS.includes(value.view as ReviewView);
    default: return false;
  }
}
export function decodeSnapshot(raw: string): DemoState | null {
  try {
    if (raw.length > 1_000_000) return null;
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data.schemaVersion !== SCHEMA_VERSION || ![STORY_VERSION, "cafe-v6", "cafe-v5", "cafe-v4", "cafe-v3", "cafe-v2"].includes(data.storyVersion as string)
      || typeof data.runId !== "string" || !/^[\w-]{8,100}$/.test(data.runId)
      || typeof data.startedAt !== "number" || !Number.isFinite(data.startedAt)
      || !PROFILES.includes(data.initialProfile as SupportProfile) || !Array.isArray(data.journal) || data.journal.length > 4_000) return null;
    const legacy = data.storyVersion === "cafe-v2";
    const previousOpening = data.storyVersion === "cafe-v3" || legacy;
    const journal: DemoEvent[] = [];
    for (const event of data.journal) {
      if (!validEvent(event, legacy)) return null;
      journal.push(event);
    }
    const hadActualResponse = journal.some(event => event.at === "p2.send");
    // A support switch inside removed activities cannot be replayed unambiguously.
    // Keep the original snapshot intact and report incompatibility in that case.
    if (legacy && hadActualResponse && journal.some(event => removedPreparation.has(event.at) && event.type === "PROFILE")) return null;
    let state = createDemo(data.initialProfile as SupportProfile, data.runId, data.startedAt);
    const apply = (event: DemoEvent): boolean => {
      // Old journals recorded reading/advancing, not actual listening. Preserve
      // that distinction and their position without pretending audio was heard.
      const target = listeningTarget(state);
      if (data.storyVersion !== STORY_VERSION && target && !state.audioAccess[target.key] && ["NEXT", "ADVANCE_PRESENTATION", "PREPARE", "UNDERSTAND", "SUBMIT"].includes(event.type)) {
        state = transition(state, { at: state.nodeId, type: "AUDIO_ACCESS", key: target.key, mode: "text" });
      }
      const next = transition(state, event);
      if (next === state) return false;
      state = next; return true;
    };
    for (const original of journal) {
      let event = original;
      // Preserve old attempts at their actual activity, without replaying a send.
      // The added reading cards remain reachable through Back after migration.
      if (previousOpening && event.type === "NEXT" && (event.at === "p1.first" || event.at === "p2.reaction")) {
        if (!apply(event)) return null;
        const inserted = event.at === "p1.first" ? ["p1.context", "p1.lucas", "p2.prompt"] : ["p3.prompt"];
        for (const at of inserted) if (!apply({ at, type: "NEXT" })) return null;
        continue;
      }
      if (legacy && removedPreparation.has(event.at)) {
        // Removed screens never sent a reply. Do not turn a practice submission
        // into an actual send when restoring the shorter flow.
        if (hadActualResponse || event.type === "NEXT" || event.type === "SUBMIT" || event.type === "USE_SUPPORT") continue;
        if (event.at !== "p2.prepare" && event.type !== "PROFILE") return null;
        event = { ...event, at: "p2.send" };
        if (state.nodeId !== "p2.send") return null;
        if (state.phase === "present" && ["BLOCK", "TYPE", "REMOVE_BLOCK", "CLEAR", "USE_BLOCKS", "WRITE_AGAIN"].includes(event.type)) {
          if (!apply({ at: "p2.send", type: "PREPARE" })) return null;
        }
      }
      if (!apply(event)) return null;
    }
    // Older attempts keep their current activity and draft. Reading cards are
    // added to the journal so Back can still visit them without another send.
    if (["cafe-v4", "cafe-v3", "cafe-v2"].includes(data.storyVersion as string)) {
      while (state.presentationStep < presentationCards(catalog[state.nodeId]).length) {
        if (!apply({ at: state.nodeId, type: "ADVANCE_PRESENTATION" })) return null;
      }
    }
    return state;
  } catch { return null; }
}
export function encodeSnapshot(state: DemoState) {
  return JSON.stringify({ schemaVersion: SCHEMA_VERSION, storyVersion: STORY_VERSION, runId: state.runId,
    startedAt: state.startedAt, initialProfile: state.initialProfile, journal: state.journal });
}
export function restoreDemo(storage: StoragePort): RestoreResult {
  try { const raw = storage.getItem(STORAGE_KEY); if (!raw) return { status: "empty" }; const state = decodeSnapshot(raw); return state ? { status: "ok", state } : { status: "invalid" }; }
  catch { return { status: "unavailable" }; }
}
export function saveDemo(storage: StoragePort, state: DemoState): boolean {
  try { storage.setItem(STORAGE_KEY, encodeSnapshot(state)); return true; } catch { return false; }
}
export function clearDemo(storage: StoragePort): boolean {
  try { storage.removeItem(STORAGE_KEY); storage.removeItem(`${STORAGE_KEY}.feedback`); return true; } catch { return false; }
}
