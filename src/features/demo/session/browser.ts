import { clearDemo, restoreDemo, saveDemo } from "./storage";
import type { DemoState } from "../model/types";

type BrowserSession = { status: "loading" | "ok" | "empty" | "unavailable" | "invalid"; state: DemoState | null };
const serverSnapshot: BrowserSession = { status: "loading", state: null };
let snapshot: BrowserSession | undefined;
const listeners = new Set<() => void>();
export const subscribe = (callback: () => void) => { listeners.add(callback); return () => { listeners.delete(callback); }; };
export const getServerSnapshot = () => serverSnapshot;
export function getBrowserSnapshot(): BrowserSession {
  if (!snapshot) {
    try { const result = restoreDemo(window.localStorage); snapshot = { ...result, state: result.status === "ok" ? result.state : null }; }
    catch { snapshot = { status: "unavailable", state: null }; }
  }
  return snapshot;
}
export function remember(state: DemoState, notify = false) {
  let saved = false;
  try { saved = saveDemo(window.localStorage, state); } catch { /* In-memory run remains usable. */ }
  snapshot = { status: saved ? "ok" : "unavailable", state };
  if (notify) listeners.forEach(callback => callback());
  return saved;
}
export function restart() {
  try { clearDemo(window.localStorage); } catch { /* Clear only this demo; never clear all storage. */ }
  snapshot = { status: "empty", state: null }; listeners.forEach(callback => callback());
}
