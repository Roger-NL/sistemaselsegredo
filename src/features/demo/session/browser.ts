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
  const { workspace, status } = studentWorkspace.getSnapshot();
  const raw = workspace?.learning.demoSnapshot ?? null;
  if (raw !== previousRaw || status !== previousStatus) {
    previousRaw = raw; previousStatus = status;
    const restored = raw ? decodeSnapshot(raw) : null;
    snapshot = status !== "ready" ? serverSnapshot : { status: raw ? restored ? "ok" : "invalid" : "empty", state: restored };
  }
  return snapshot;
}
/** The generation belongs to the mounted practice, never to an anonymous cache. */
export function remember(state: DemoState, generation: number) {
  return studentWorkspace.stage("demoSnapshot", encodeSnapshot(state), generation);
}
export function restart(generation: number) {
  return studentWorkspace.stage("demoSnapshot", null, generation);
}
