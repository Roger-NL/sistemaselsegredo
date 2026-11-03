export type InteractionSound = "click" | "advance" | "correct" | "retry";
const KEY = "basedspeak.interface-sounds.v1";
const listeners = new Set<() => void>();
let memoryMuted: boolean | undefined;
let context: AudioContext | undefined;
let generation = 0;
const active = new Set<OscillatorNode>();

export function getInteractionSoundsMuted() {
  if (memoryMuted !== undefined) return memoryMuted;
  try { return typeof window !== "undefined" && window.localStorage.getItem(KEY) === "muted"; }
  catch { return false; }
}
export const getServerSoundsMuted = () => false;
export function subscribeInteractionSounds(listener: () => void) {
  listeners.add(listener);
  const update = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) { memoryMuted = undefined; if (getInteractionSoundsMuted()) stopInteractionSounds(); listener(); }
  };
  window.addEventListener("storage", update);
  return () => { listeners.delete(listener); window.removeEventListener("storage", update); };
}
export function stopInteractionSounds() {
  generation++;
  active.forEach(oscillator => { try { oscillator.stop(); oscillator.disconnect(); } catch { /* Already ended. */ } });
  active.clear();
}
export function saveInteractionSoundsMuted(muted: boolean) {
  memoryMuted = muted;
  try { window.localStorage.setItem(KEY, muted ? "muted" : "on"); } catch { /* Keep the choice for this visit. */ }
  if (muted) stopInteractionSounds();
  listeners.forEach(listener => listener());
}

/** Short local tones only. No media fetch, speech synthesis, music or autoplay. */
export async function playInteractionSound(kind: InteractionSound) {
  if (typeof window === "undefined" || getInteractionSoundsMuted()) return;
  try {
    const Constructor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Constructor) return;
    context ??= new Constructor();
    stopInteractionSounds();
    const ticket = generation;
    if (context.state === "suspended") await context.resume();
    if (ticket !== generation || getInteractionSoundsMuted() || context.state !== "running") return;
    const notes = kind === "click" ? [620] : kind === "advance" ? [440, 660] : kind === "correct" ? [520, 660, 880] : [330, 260];
    const duration = kind === "click" ? 0.025 : kind === "retry" ? 0.09 : 0.065;
    const start = context.currentTime;
    notes.forEach((frequency, index) => {
      const oscillator = context!.createOscillator();
      const gain = context!.createGain();
      const at = start + index * (duration + 0.012);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(kind === "click" ? 0.05 : 0.075, at + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      oscillator.connect(gain); gain.connect(context!.destination);
      active.add(oscillator);
      oscillator.onended = () => { active.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(at); oscillator.stop(at + duration);
    });
  } catch { /* A blocked audio context must never block a learning action. */ }
}

export function interactionSoundFor(target: Element): InteractionSound | null {
  const action = target.closest("button, a[href], summary, input[type=radio], [role=button]");
  if (!action || action.matches(":disabled, [aria-disabled=true]") || action.closest("[inert]")) return null;
  const explicit = action.getAttribute("data-ui-sound");
  if (explicit === "none") return null;
  if (explicit === "click" || explicit === "advance" || explicit === "correct" || explicit === "retry") return explicit;
  return action.matches("a[href]") ? "advance" : "click";
}
