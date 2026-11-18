/** Small, local UI tones. This channel never reads or changes lesson speech. */
export type LessonSoundCue = "tap" | "place" | "success" | "retry" | "advance";

export const LESSON_SOUNDS_STORAGE = "basedspeak.lesson-one.sfx-muted.v1";
const PRIORITY: Record<LessonSoundCue, number> = { tap: 0, place: 1, retry: 2, advance: 3, success: 4 };
const COALESCE_MS = 16;
const TRAILING_CLICK_MS = 80;
const MASTER_GAIN = 0.28;
// A browser that never resumes Web Audio must not hold the spoken answer hostage.
const MAX_CUE_WAIT_MS = 650;

type Tone = { frequency: number; to?: number; delay: number; duration: number; gain: number };
// A pair of rising notes confirms the answer; one lower, falling note invites another try.
const TONES: Record<LessonSoundCue, readonly Tone[]> = {
  tap: [{ frequency: 360, to: 320, delay: 0, duration: 0.025, gain: 0.12 }],
  place: [{ frequency: 520, to: 590, delay: 0, duration: 0.07, gain: 0.16 }],
  success: [
    { frequency: 659.255, delay: 0, duration: 0.19, gain: 0.32 },
    { frequency: 880, delay: 0.06, duration: 0.19, gain: 0.29 },
  ],
  retry: [{ frequency: 392, to: 262, delay: 0, duration: 0.16, gain: 0.32 }],
  advance: [{ frequency: 470, to: 620, delay: 0, duration: 0.1, gain: 0.14 }],
};

type SoundStorage = Pick<Storage, "getItem" | "setItem">;
export type LessonSoundsOptions = {
  createContext?: () => AudioContext | null;
  hasGesture?: () => boolean;
  isHidden?: () => boolean;
  now?: () => number;
  getStorage?: () => SoundStorage | undefined;
  /** Observes emitted cues, not requests; useful for isolated orchestration QA. */
  onCue?: (cue: LessonSoundCue) => void;
};
export type LessonSoundScope = {
  mount: () => () => void;
  play: (cue: LessonSoundCue) => Promise<void> | undefined;
  unlock: () => Promise<boolean>;
};

function browserContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Constructor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return Constructor ? new Constructor({ latencyHint: "interactive" }) : null;
}
function browserStorage(): SoundStorage | undefined {
  try { return typeof window === "undefined" ? undefined : window.localStorage; } catch { return undefined; }
}

/** One engine per page, with independent owners for the lesson and tutorial. */
export function createLessonSoundsEngine(options: LessonSoundsOptions = {}) {
  const now = options.now ?? (() => Date.now());
  const hidden = options.isHidden ?? (() => typeof document !== "undefined" && document.hidden);
  const storage = options.getStorage ?? browserStorage;
  const owners = new Set<symbol>();
  const subscribers = new Set<() => void>();
  let context: AudioContext | null = null;
  let master: GainNode | null = null;
  let resumePending: Promise<boolean> | null = null;
  let muted = false;
  let storageRead = false;
  let trustedGestureUntil = 0;
  let batchSequence = 0;
  let queueTimer: ReturnType<typeof setTimeout> | undefined;
  let pending: { id: number; owner: symbol; cue: LessonSoundCue; ready: Promise<boolean>; finished: Promise<void>; finish: () => void } | null = null;
  let lastEmission: { cue: LessonSoundCue; time: number } | null = null;
  type ActiveSound = { owner: symbol; gain: GainNode; oscillators: OscillatorNode[]; clean: () => void };
  const active = new Set<ActiveSound>();

  const publish = () => subscribers.forEach(listener => listener());
  const hasGesture = options.hasGesture ?? (() => {
    if (typeof navigator === "undefined") return false;
    return navigator.userActivation?.isActive ?? (now() < trustedGestureUntil);
  });
  const readStorage = () => {
    if (storageRead) return;
    storageRead = true;
    try { muted = storage()?.getItem(LESSON_SOUNDS_STORAGE) === "true"; } catch { /* Private mode can deny storage. */ }
    publish();
  };

  function clearPending(owner?: symbol) {
    if (owner && pending?.owner !== owner) return;
    pending?.finish();
    pending = null;
    if (queueTimer !== undefined) clearTimeout(queueTimer);
    queueTimer = undefined;
  }
  function fade(sound: ActiveSound) {
    if (!active.has(sound) || !context) return;
    const time = context.currentTime;
    try {
      sound.gain.gain.cancelScheduledValues(time);
      sound.gain.gain.setValueAtTime(sound.gain.gain.value, time);
      sound.gain.gain.linearRampToValueAtTime(0, time + 0.006);
      sound.oscillators.forEach(oscillator => { try { oscillator.stop(time + 0.008); } catch { /* Already ended. */ } });
    } catch { sound.clean(); }
  }
  function cancel(owner?: symbol) {
    clearPending(owner);
    active.forEach(sound => { if (!owner || sound.owner === owner) fade(sound); });
  }

  // Called synchronously from play/unlock so the browser still has the gesture.
  function prepareContext(): Promise<boolean> | null {
    if (muted || hidden()) return null;
    if (!context || context.state === "closed") {
      if (!hasGesture()) return null;
      try {
        context = (options.createContext ?? browserContext)();
        if (!context) return null;
        master = context.createGain();
        master.gain.setValueAtTime(MASTER_GAIN, context.currentTime);
        master.connect(context.destination);
      } catch { context = null; master = null; return null; }
    }
    if (context.state === "running") return Promise.resolve(true);
    if (resumePending) return resumePending;
    if (!hasGesture()) return null;
    const current = context;
    try {
      resumePending = current.resume().then(
        () => context === current && current.state === "running",
        () => false,
      ).finally(() => { resumePending = null; });
      return resumePending;
    } catch { return null; }
  }

  function emit(owner: symbol, cue: LessonSoundCue, finish: () => void) {
    if (!context || !master || context.state !== "running" || muted || hidden() || !owners.has(owner)) { finish(); return; }
    // Bound polyphony during very fast use; each older tone fades rather than cuts.
    if (active.size >= 3) fade(active.values().next().value!);
    const group = context.createGain();
    group.gain.setValueAtTime(1, context.currentTime);
    group.connect(master);
    const oscillators: OscillatorNode[] = [];
    const envelopes: GainNode[] = [];
    const sound: ActiveSound = { owner, gain: group, oscillators, clean: () => {
      if (!active.delete(sound)) return;
      clearTimeout(watchdog);
      oscillators.forEach(oscillator => { oscillator.onended = null; oscillator.disconnect(); });
      envelopes.forEach(envelope => envelope.disconnect());
      group.disconnect(); finish();
    } };
    // A suspended device may never deliver "ended"; disconnect it before releasing speech.
    const watchdog = setTimeout(sound.clean, MAX_CUE_WAIT_MS);
    active.add(sound);
    let remaining = TONES[cue].length;
    const start = context.currentTime + 0.002;
    try {
      TONES[cue].forEach(tone => {
        const oscillator = context!.createOscillator();
        const envelope = context!.createGain();
        oscillators.push(oscillator); envelopes.push(envelope);
        oscillator.type = "sine";
        const from = start + tone.delay;
        const end = from + tone.duration;
        oscillator.frequency.setValueAtTime(tone.frequency, from);
        if (tone.to) oscillator.frequency.exponentialRampToValueAtTime(tone.to, end);
        envelope.gain.setValueAtTime(0, from);
        envelope.gain.linearRampToValueAtTime(tone.gain, from + 0.004);
        if (cue === "success" || cue === "retry") envelope.gain.setValueAtTime(tone.gain, from + 0.035);
        envelope.gain.exponentialRampToValueAtTime(0.0001, end - 0.004);
        envelope.gain.linearRampToValueAtTime(0, end);
        oscillator.connect(envelope); envelope.connect(group);
        oscillator.onended = () => { if (--remaining === 0) sound.clean(); };
        oscillator.start(from); oscillator.stop(end + 0.002);
      });
      lastEmission = { cue, time: now() };
      options.onCue?.(cue);
    } catch { sound.clean(); }
  }

  async function flush(id: number) {
    queueTimer = undefined;
    const batch = pending;
    if (!batch || batch.id !== id) return;
    const ready = await batch.ready;
    if (pending?.id !== id) return;
    const latest = pending;
    pending = null;
    if (ready) emit(latest.owner, latest.cue, latest.finish);
    else latest.finish();
  }
  function play(owner: symbol, cue: LessonSoundCue) {
    if (!owners.has(owner) || muted || hidden()) return;
    const elapsed = lastEmission ? now() - lastEmission.time : Infinity;
    if (lastEmission && elapsed < TRAILING_CLICK_MS &&
      (lastEmission.cue === cue || (PRIORITY[lastEmission.cue] >= PRIORITY.retry && PRIORITY[cue] < PRIORITY.retry))) return;
    const ready = prepareContext();
    if (!ready) return;
    if (pending) {
      // Equal priority transfers ownership too: a parent's final advance survives
      // the tutorial owner unmounting in the same commit.
      if (PRIORITY[cue] >= PRIORITY[pending.cue]) pending = { ...pending, owner, cue, ready };
      return pending.finished;
    }
    const id = ++batchSequence;
    let finish!: () => void;
    const finished = new Promise<void>(resolve => {
      const expiry = setTimeout(() => {
        if (pending?.id === id) { pending = null; resolve(); }
      }, MAX_CUE_WAIT_MS);
      finish = () => { clearTimeout(expiry); resolve(); };
    });
    pending = { id, owner, cue, ready, finished, finish };
    queueTimer = setTimeout(() => { void flush(id); }, COALESCE_MS);
    return finished;
  }

  function setMuted(value: boolean, persist: boolean) {
    if (muted === value) return;
    muted = value;
    if (value) cancel();
    if (persist) { try { storage()?.setItem(LESSON_SOUNDS_STORAGE, String(value)); } catch { /* Preference stays in memory. */ } }
    publish();
  }
  const visibility = () => { if (hidden()) { cancel(); lastEmission = null; } };
  const pageHide = () => { cancel(); lastEmission = null; };
  const gesture = (event: Event) => { if (event.isTrusted) trustedGestureUntil = now() + 1000; };
  const storageChanged = (event: StorageEvent) => {
    if (event.key === LESSON_SOUNDS_STORAGE) setMuted(event.newValue === "true", false);
  };
  function attach() {
    if (typeof document === "undefined") return;
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("pointerdown", gesture, { capture: true, passive: true });
    document.addEventListener("keydown", gesture, true);
    window.addEventListener("pagehide", pageHide);
    window.addEventListener("storage", storageChanged);
  }
  function detach() {
    if (typeof document === "undefined") return;
    document.removeEventListener("visibilitychange", visibility);
    document.removeEventListener("pointerdown", gesture, true);
    document.removeEventListener("keydown", gesture, true);
    window.removeEventListener("pagehide", pageHide);
    window.removeEventListener("storage", storageChanged);
  }

  return {
    getMuted: () => muted,
    subscribe: (listener: () => void) => { subscribers.add(listener); return () => { subscribers.delete(listener); }; },
    toggleMuted: () => { readStorage(); setMuted(!muted, true); },
    createScope(): LessonSoundScope {
      const owner = Symbol("lesson-sounds-owner");
      return {
        mount: () => {
          if (!owners.size) attach();
          owners.add(owner); readStorage();
          return () => {
            owners.delete(owner); cancel(owner);
            if (!owners.size) { detach(); lastEmission = null; }
            // Keep the one silent context reusable for Strict Mode and siblings.
          };
        },
        play: cue => play(owner, cue),
        unlock: async () => owners.has(owner) && !!(await prepareContext()),
      };
    },
  };
}

export type LessonSoundsEngine = ReturnType<typeof createLessonSoundsEngine>;
export const lessonSoundsEngine = createLessonSoundsEngine();
