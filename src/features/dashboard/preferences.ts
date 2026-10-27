const KEY = "basedspeak.dashboard.preferences.v1";
const listeners = new Set<() => void>();
let memoryPreference: boolean | undefined;

export const subscribePreferences = (listener: () => void) => {
  listeners.add(listener);
  const update = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) { memoryPreference = undefined; listener(); }
  };
  window.addEventListener("storage", update);
  return () => { listeners.delete(listener); window.removeEventListener("storage", update); };
};
export const getServerPreference = () => false;
export function getMotionPreference() {
  if (memoryPreference !== undefined) return memoryPreference;
  try { return window.localStorage.getItem(KEY) === "reduced"; }
  catch { return false; }
}
export function saveMotionPreference(reduced: boolean) {
  memoryPreference = reduced;
  try { window.localStorage.setItem(KEY, reduced ? "reduced" : "full"); } catch { /* The current visit still respects this choice. */ }
  listeners.forEach(listener => listener());
}
