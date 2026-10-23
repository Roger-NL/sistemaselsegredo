import { catalog } from "../content/catalog";
import { createDemo, transition } from "../model/reducer";
import { PROFILES, REVIEW_VIEWS, SCHEMA_VERSION, STORY_VERSION, type DemoEvent, type DemoState, type SupportProfile, type ReviewView } from "../model/types";

export const STORAGE_KEY = "basedspeak.demo.cafe.v1";
type StoragePort = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type RestoreResult = { status: "ok"; state: DemoState } | { status: "empty" | "unavailable" | "invalid" };
const isRecord = (x: unknown): x is Record<string, unknown> => Boolean(x && typeof x === "object" && !Array.isArray(x));
function validEvent(value: unknown): value is DemoEvent {
  if (!isRecord(value) || typeof value.at !== "string" || !catalog[value.at]) return false;
  switch (value.type) {
    case "NEXT": case "PREPARE": case "SUBMIT": case "CHECK": case "HELP": case "USE_SUPPORT": case "CLEAR": return true;
    case "CHOOSE": return typeof value.choice === "string";
    case "UNDERSTAND": return typeof value.correct === "boolean";
    case "BLOCK": return typeof value.block === "string";
    case "REMOVE_BLOCK": return Number.isInteger(value.index);
    case "PROFILE": return PROFILES.includes(value.profile as SupportProfile);
    case "REVIEW": return REVIEW_VIEWS.includes(value.view as ReviewView);
    default: return false;
  }
}
export function decodeSnapshot(raw: string): DemoState | null {
  try {
    if (raw.length > 1_000_000) return null;
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data.schemaVersion !== SCHEMA_VERSION || data.storyVersion !== STORY_VERSION
      || typeof data.runId !== "string" || !/^[\w-]{8,100}$/.test(data.runId)
      || typeof data.startedAt !== "number" || !Number.isFinite(data.startedAt)
      || !PROFILES.includes(data.initialProfile as SupportProfile) || !Array.isArray(data.journal) || data.journal.length > 4_000) return null;
    let state = createDemo(data.initialProfile as SupportProfile, data.runId, data.startedAt);
    for (const event of data.journal) {
      if (!validEvent(event)) return null;
      const next = transition(state, event);
      if (next === state) return null;
      state = next;
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
