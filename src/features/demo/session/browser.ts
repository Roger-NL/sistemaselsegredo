import { studentWorkspace } from "@/features/dashboard/workspace-store";
import { decodeSnapshot, encodeSnapshot } from "./storage";
import type { DemoState } from "../model/types";

type BrowserSession = { status: "loading" | "ok" | "empty" | "unavailable" | "invalid"; state: DemoState | null };
const serverSnapshot: BrowserSession = { status: "loading", state: null };
let snapshot: BrowserSession = serverSnapshot;
let previousRaw: string | null | undefined;
let previousStatus: string | undefined;
export const subscribe = studentWorkspace.subscribe;
export const getServerSnapshot = () => serverSnapshot;
export function getBrowserSnapshot(): BrowserSession {
  const { workspace, status, guestLearning } = studentWorkspace.getSnapshot();
  const raw = (workspace?.learning || guestLearning)?.demoSnapshot ?? null;
  if (raw !== previousRaw || status !== previousStatus) {
    previousRaw = raw; previousStatus = status;
    const restored = raw ? decodeSnapshot(raw) : null;
    snapshot = status !== "ready" && !(status === "unauthenticated" && guestLearning) ? serverSnapshot : { status: raw ? restored ? "ok" : "invalid" : "empty", state: restored };
  }
  return snapshot;
}
/** Generations prevent a mounted practice from writing after the account changes. */
export function remember(state: DemoState, generation: number) {
  return studentWorkspace.stage("demoSnapshot", encodeSnapshot(state), generation);
}
export function restart(generation: number) {
  return studentWorkspace.stage("demoSnapshot", null, generation);
}
