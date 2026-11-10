import { isPresentationSound, renderPresentationSound, type PresentationSound } from "./presentation-sounds";
import { isStorySound, renderStorySound, type StorySound } from "./story-sounds";

export type InteractionSound = "click" | "advance" | "correct" | "retry" | "presentation" | StorySound | PresentationSound;
const KEY = "basedspeak.interface-sounds.v1";
const listeners = new Set<() => void>();
export type SoundChannel = "effects" | "clicks";
const keys = { effects: "basedspeak.sound-effects.v2", clicks: "basedspeak.sound-clicks.v2" };
const memory: Partial<Record<SoundChannel, boolean>> = {};
let context: AudioContext | undefined;
let generation = 0;
let currentChannel: SoundChannel | undefined;
const active = new Set<AudioScheduledSourceNode>();

export function getSoundMuted(channel: SoundChannel) {
  if (memory[channel] !== undefined) return memory[channel];
  try {
    if (typeof window === "undefined") return false;
    return (window.localStorage.getItem(keys[channel]) ?? window.localStorage.getItem(KEY)) === "muted";
  } catch { return false; }
}
export const getEffectsMuted = () => getSoundMuted("effects");
export const getClicksMuted = () => getSoundMuted("clicks");
export const getInteractionSoundsMuted = () => getEffectsMuted() && getClicksMuted();
export const getServerSoundsMuted = () => false;
export function subscribeInteractionSounds(listener: () => void) {
  listeners.add(listener);
  const update = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null || Object.values(keys).some(key => key === event.key)) {
      delete memory.effects; delete memory.clicks;
      if (currentChannel && getSoundMuted(currentChannel)) stopInteractionSounds();
      listener();
    }
  };
  window.addEventListener("storage", update);
  return () => { listeners.delete(listener); window.removeEventListener("storage", update); };
}
export function stopInteractionSounds() {
  generation++;
  currentChannel = undefined;
  active.forEach(source => { try { source.stop(); source.disconnect(); } catch { /* Already ended. */ } });
  active.clear();
}
export function saveSoundMuted(channel: SoundChannel, muted: boolean) {
  // Freeze both migrated choices before changing one; an old global mute must survive.
  const other = channel === "effects" ? "clicks" : "effects";
  memory[other] = getSoundMuted(other);
  memory[channel] = muted;
  try {
    window.localStorage.setItem(keys[other], memory[other] ? "muted" : "on");
    window.localStorage.setItem(keys[channel], muted ? "muted" : "on");
  } catch { /* Keep the choices for this visit. */ }
  if (muted && currentChannel === channel) stopInteractionSounds();
  listeners.forEach(listener => listener());
}
/** Compatibility for previously saved global sound settings. */
export function saveInteractionSoundsMuted(muted: boolean) {
  saveSoundMuted("effects", muted);
  saveSoundMuted("clicks", muted);
  try { window.localStorage.setItem(KEY, muted ? "muted" : "on"); } catch { /* In-memory choices remain available. */ }
}

/** Local interface and story accents. No media fetch or speech generation. */
export async function playInteractionSound(kind: InteractionSound, channel: SoundChannel = kind === "click" ? "clicks" : "effects") {
  if (typeof window === "undefined" || getSoundMuted(channel)) return;
  try {
    const Constructor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Constructor) return;
    context ??= new Constructor();
    stopInteractionSounds();
    currentChannel = channel;
    const ticket = generation;
    if (context.state === "suspended") await context.resume();
    if (ticket !== generation || getSoundMuted(channel) || context.state !== "running") return;
    if (isStorySound(kind)) { renderStorySound(context, kind, active, channel === "effects" ? 0.5 : 1); return; }
    if (kind === "presentation" || isPresentationSound(kind)) { renderPresentationSound(context, kind === "presentation" ? "presentation-welcome" : kind, active, channel === "effects" ? 0.5 : 1); return; }
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
      gain.gain.exponentialRampToValueAtTime((kind === "click" ? 0.05 : 0.075) * (channel === "effects" ? 0.5 : 1), at + 0.006);
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
  if (explicit && isPresentationSound(explicit)) return explicit;
  if (explicit === "click" || explicit === "advance" || explicit === "correct" || explicit === "retry" || explicit === "presentation") return explicit;
  return action.matches("a[href]") ? "advance" : "click";
}
