import { GUEST_LEARNING_KEY, type GuestStorage } from "@/features/dashboard/guest-learning";
import { localToolsAllowed } from "./environment";

const CHANGE_EVENT = "basedspeak-local-test-change";
export function subscribeLocalTests(listener: () => void) {
  window.addEventListener("storage", listener); window.addEventListener(CHANGE_EVENT, listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener(CHANGE_EVENT, listener); };
}
export function readLocalTestData() {
  try { return localTestingAvailable() ? window.localStorage.getItem(TEST_LEARNING_KEY) : null; } catch { return null; }
}
const MODE_KEY = "basedspeak.local-testing.enabled";
export const TEST_LEARNING_KEY = "basedspeak.local-testing.learning.v1";
export function localTestingAvailable() {
  return typeof window !== "undefined" && localToolsAllowed(window.location.hostname);
}
export function localTestingActive() {
  if (!localTestingAvailable()) return false;
  try { return window.localStorage.getItem(MODE_KEY) === "1"; } catch { return false; }
}
export function setLocalTesting(active: boolean) {
  if (!localTestingAvailable()) throw new Error("Os testes só estão disponíveis no servidor local de desenvolvimento.");
  if (active) window.localStorage.setItem(MODE_KEY, "1");
  else window.localStorage.removeItem(MODE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
/** Account caches and ordinary guest progress are never read or written in the sandbox. */
export function testStorage(storage: Storage): GuestStorage {
  return {
    getItem: key => key === GUEST_LEARNING_KEY ? storage.getItem(TEST_LEARNING_KEY) : null,
    setItem: (key, value) => { if (key === GUEST_LEARNING_KEY) storage.setItem(TEST_LEARNING_KEY, value); },
    removeItem: key => { if (key === GUEST_LEARNING_KEY) storage.removeItem(TEST_LEARNING_KEY); },
  };
}
export function workspaceStorage() {
  return localTestingActive() ? testStorage(window.localStorage) : window.localStorage;
}
/** No account API is called by the workspace store while the local sandbox is active. */
export async function workspaceFetch(input: string, init?: RequestInit) {
  if (localTestingActive()) return new Response(JSON.stringify({ error: "Ambiente de testes local: conta desconectada deste percurso." }), { status: 401, headers: { "Content-Type": "application/json" } });
  return fetch(input, init);
}
