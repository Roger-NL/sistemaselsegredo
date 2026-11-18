import originalRecordings from "./lesson-one-audio.json";
import vocabularyRecordings from "./lesson-vocabulary-audio.json";
import { LESSON_SCENES, evaluateSpeaker, phraseText } from "./lesson-one";
import type { PersonId, Round } from "./lesson-one";

export type LessonAudioCatalog = Readonly<Record<string, string>>;
export type LessonAudioRequest = { person: PersonId; text: string; key: string };
export type LessonAudioSnapshot = { playingKey: string | null; error: string | null; blocked: boolean };
export type LessonSpeechRole = "character" | "narration";
export type LessonSpeechFrame = {
  playbackId: number;
  key: string | null;
  person: PersonId | null;
  text: string | null;
  role: LessonSpeechRole;
  playing: boolean;
  time: number;
  duration: number;
  level: number;
  envelopeReady: boolean;
};
export type LessonSpeechDriver = {
  getFrame: () => LessonSpeechFrame;
  subscribeFrame: (listener: (frame: LessonSpeechFrame) => void) => () => void;
};
export type LessonAudioRequestOptions = {
  autoplay?: boolean;
  role?: LessonSpeechRole;
  onEnded?: () => void;
};
export type LessonSpeechEnvelope = { duration: number; binSeconds: number; levels: Float32Array };

const catalogJSON = { ...originalRecordings, ...vocabularyRecordings };
const PEOPLE: readonly PersonId[] = ["ana", "leo", "maya", "sam", "nina"];
const AUDIO_PATH = /^\/first-encounters\/audio\/lesson-one\/(ana|leo|maya|sam|nina)-[a-z0-9][a-z0-9-]*\.(?:mp3|m4a|wav)$/;
const RETRY_ERROR = "Não foi possível reproduzir esta fala. Tente novamente.";
const EMPTY_SNAPSHOT: LessonAudioSnapshot = { playingKey: null, error: null, blocked: false };

/** Text is deliberately exact: a different model must not reuse another clip. */
export function getLessonAudioKey(person: PersonId, text: string): string {
  return `${person}:${text}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function validURL(person: PersonId, value: unknown): value is string {
  return typeof value === "string" && AUDIO_PATH.test(value) && value.startsWith(`/first-encounters/audio/lesson-one/${person}-`);
}

/** Only recorded local clips are eligible; there is no generation or TTS fallback. */
export function getLessonAudioClip(person: PersonId, text: string, catalog: unknown = catalogJSON): string | undefined {
  if (!isRecord(catalog)) return undefined;
  const value = catalog[getLessonAudioKey(person, text)];
  return validURL(person, value) ? value : undefined;
}

/** This validates catalog structure/paths; file existence and speech need separate QA. */
export function validateLessonAudioCatalog(catalog: unknown): { valid: boolean; errors: string[]; entries: number } {
  if (!isRecord(catalog)) return { valid: false, errors: ["O catálogo precisa ser um objeto de chave e caminho local."], entries: 0 };
  const errors: string[] = [];
  for (const [key, value] of Object.entries(catalog)) {
    const colon = key.indexOf(":");
    const person = key.slice(0, colon) as PersonId;
    if (colon < 0 || !PEOPLE.includes(person) || !key.slice(colon + 1).trim()) errors.push(`Chave inválida: ${key}`);
    else if (!validURL(person, value)) errors.push(`Caminho de áudio inválido para ${key}`);
  }
  return { valid: errors.length === 0, errors, entries: Object.keys(catalog).length };
}

/** Correct lesson models, including valid alternative speakers and anonymous reading. */
export function getLessonAudioRequirements(): LessonAudioRequest[] {
  const requests = new Map<string, LessonAudioRequest>();
  const referenceNames = new Set<string>();
  function add(person: PersonId, text: string) {
    const key = getLessonAudioKey(person, text);
    requests.set(key, { person, text, key });
  }
  function visit(round: Round) {
    if (!round.vocabulary && round.referent !== "team") referenceNames.add(round.expected.complement);
    for (const choice of round.bubbleChoices ?? []) add("nina", phraseText(choice));
    if (round.vocabulary) {
      add("nina", phraseText(round.expected));
      if (round.kind === "build") for (const pronoun of ["I", "you", "we", "they"] as const) {
        add("nina", phraseText({ pronoun, verb: pronoun === "I" ? "am" : "are", complement: round.expected.complement }));
      }
    }
    if (round.kind === "messages") {
      // Nina reads every anonymous message, independently of its recipient.
      // The identified authors also need their own recording after acceptance.
      for (const message of round.ensemble ?? []) {
        add("nina", phraseText(message.expected));
        visit(message);
      }
    } else if (round.kind === "ensemble") {
      for (const turn of round.ensemble ?? []) visit(turn);
    } else if (round.kind === "speaker") {
      for (const person of round.candidateSpeakers ?? [round.speaker]) {
        if (evaluateSpeaker(round, person).correct) add(person, phraseText(round.expected));
      }
    } else add(round.speaker, phraseText(round.expected));
  }
  for (const scene of LESSON_SCENES) for (const round of scene.rounds) visit(round);
  // The explicit example cards are read by Nina, including names belonging to
  // other characters. Their visible reader role distinguishes these from turns.
  for (const name of referenceNames) {
    add("nina", `I am ${name}.`);
    add("nina", `You are ${name}.`);
  }
  return [...requests.values()];
}

export function getLessonAudioCoverage(catalog: unknown = catalogJSON, required: readonly LessonAudioRequest[] = getLessonAudioRequirements()) {
  const available = required.filter(item => Boolean(getLessonAudioClip(item.person, item.text, catalog)));
  const missing = required.filter(item => !getLessonAudioClip(item.person, item.text, catalog));
  return { required: [...required], available, missing, complete: missing.length === 0 };
}

export type LessonAudioController = {
  getSnapshot: () => LessonAudioSnapshot;
  subscribe: (listener: () => void) => () => void;
  play: (person: PersonId, text: string) => Promise<void>;
  request: (person: PersonId, text: string, options?: LessonAudioRequestOptions) => Promise<boolean>;
  whenIdle: (manualOnly?: boolean) => Promise<void> | undefined;
  unlock: () => Promise<boolean>;
  resume: () => Promise<boolean>;
  pause: () => void;
  stop: () => void;
  has: (person: PersonId, text: string) => boolean;
  speech: LessonSpeechDriver;
  dispose: () => void;
};

/** Small RMS windows preserve actual silences and word timing in the recording. */
export function createLessonSpeechEnvelope(buffer: Pick<AudioBuffer, "numberOfChannels" | "sampleRate" | "length" | "duration" | "getChannelData">, binSeconds = .02): LessonSpeechEnvelope {
  const samplesPerBin = Math.max(1, Math.round(buffer.sampleRate * binSeconds));
  const levels = new Float32Array(Math.ceil(buffer.length / samplesPerBin));
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index));
  for (let bin = 0; bin < levels.length; bin++) {
    const start = bin * samplesPerBin, end = Math.min(start + samplesPerBin, buffer.length);
    let energy = 0;
    for (const channel of channels) for (let sample = start; sample < end; sample++) energy += channel[sample] ** 2;
    levels[bin] = Math.sqrt(energy / Math.max(1, (end - start) * channels.length));
  }
  const audible = Array.from(levels).filter(value => value > .008).sort((a, b) => a - b);
  const reference = Math.max(.04, audible[Math.max(0, Math.ceil(audible.length * .95) - 1)] ?? .04);
  for (let bin = 0; bin < levels.length; bin++) levels[bin] = Math.max(0, Math.min(1, (levels[bin] - .008) / (reference - .008)));
  return { duration: buffer.duration, binSeconds: samplesPerBin / buffer.sampleRate, levels };
}

export function sampleLessonSpeechEnvelope(envelope: LessonSpeechEnvelope | null, time: number): number {
  if (!envelope || !Number.isFinite(time) || time < 0 || time >= envelope.duration) return 0;
  return envelope.levels[Math.min(envelope.levels.length - 1, Math.floor(time / envelope.binSeconds))] ?? 0;
}

async function decodeLocalEnvelope(url: string): Promise<LessonSpeechEnvelope | null> {
  if (typeof OfflineAudioContext === "undefined") return null;
  // Analyze a separate local copy. Routing the audible media through a Web Audio
  // node can silence it under browser/CORS policies; no output node is created.
  const response = await fetch(url, { credentials: "same-origin", cache: "force-cache" });
  if (!response.ok) throw new Error("Local speech analysis unavailable");
  const bytes = await response.arrayBuffer();
  const context = new OfflineAudioContext(1, 1, 44100);
  return createLessonSpeechEnvelope(await context.decodeAudioData(bytes));
}

type PlaybackRequest = { person: PersonId; text: string; options: LessonAudioRequestOptions; position: number };
type ActivePlayback = PlaybackRequest & {
  audio: HTMLAudioElement;
  url: string;
  key: string;
  ticket: number;
  running: boolean;
  envelope: LessonSpeechEnvelope | null;
  finished: Promise<void>;
  detach: () => void;
};

/** Cached local media, discrete React state, and a separate real-time speech driver. */
export function createLessonAudioController(options: {
  catalog?: unknown;
  /** Trusted local-media adapter; the ordinary lesson keeps its strict resolver. */
  resolveClip?: (person: PersonId, text: string) => string | undefined;
  createAudio?: (url: string) => HTMLAudioElement;
  decodeEnvelope?: (url: string) => Promise<LessonSpeechEnvelope | null>;
  requestFrame?: (callback: FrameRequestCallback) => number;
  cancelFrame?: (handle: number) => void;
} = {}): LessonAudioController {
  const catalog = options.catalog ?? catalogJSON;
  const resolveClip = options.resolveClip ?? ((person: PersonId, text: string) => getLessonAudioClip(person, text, catalog));
  const makeAudio = options.createAudio ?? ((url: string) => new Audio(url));
  const decodeEnvelope = options.decodeEnvelope ?? decodeLocalEnvelope;
  const requestFrame = options.requestFrame ?? (typeof requestAnimationFrame === "function" ? requestAnimationFrame.bind(globalThis) : undefined);
  const cancelFrame = options.cancelFrame ?? (typeof cancelAnimationFrame === "function" ? cancelAnimationFrame.bind(globalThis) : undefined);
  const cache = new Map<string, HTMLAudioElement>();
  const envelopes = new Map<string, Promise<LessonSpeechEnvelope | null>>();
  const failed = new Set<string>();
  const listeners = new Set<() => void>();
  const frameListeners = new Set<(frame: LessonSpeechFrame) => void>();
  let snapshot = EMPTY_SNAPSHOT;
  let generation = 0;
  let active: ActivePlayback | null = null;
  let pending: PlaybackRequest | null = null;
  let paused: PlaybackRequest | null = null;
  let frameHandle: number | null = null;

  function publish(playingKey: string | null, error: string | null = null, blocked = false) {
    if (snapshot.playingKey === playingKey && snapshot.error === error && snapshot.blocked === blocked) return;
    snapshot = { playingKey, error, blocked };
    for (const notify of listeners) notify();
  }
  function getFrame(): LessonSpeechFrame {
    const playing = Boolean(active?.running && !active.audio.paused && !active.audio.ended);
    if (!active || !playing) return { playbackId: generation, key: null, person: null, text: null, role: "narration", playing: false, time: 0, duration: 0, level: 0, envelopeReady: false };
    const time = Number.isFinite(active.audio.currentTime) ? Math.max(0, active.audio.currentTime) : 0;
    return { playbackId: active.ticket, key: active.key, person: active.person, text: active.text,
      role: active.options.role ?? "narration", playing: true, time,
      duration: Number.isFinite(active.audio.duration) ? active.audio.duration : active.envelope?.duration ?? 0,
      level: sampleLessonSpeechEnvelope(active.envelope, time), envelopeReady: active.envelope !== null };
  }
  function notifyFrame() {
    const frame = getFrame();
    for (const listener of frameListeners) listener(frame);
  }
  function cancelPump() {
    if (frameHandle !== null) cancelFrame?.(frameHandle);
    frameHandle = null;
  }
  function pump() {
    frameHandle = null;
    notifyFrame();
    ensurePump();
  }
  function ensurePump() {
    if (frameHandle === null && requestFrame && frameListeners.size && getFrame().playing) frameHandle = requestFrame(pump);
  }
  function signalFrame() {
    if (!getFrame().playing) cancelPump();
    notifyFrame();
    ensurePump();
  }
  const speech: LessonSpeechDriver = {
    getFrame,
    subscribeFrame: listener => {
      frameListeners.add(listener);
      listener(getFrame());
      ensurePump();
      return () => { frameListeners.delete(listener); if (!frameListeners.size) cancelPump(); };
    },
  };
  function pauseMedia(audio: HTMLAudioElement, reset: boolean) {
    audio.pause();
    if (reset) {
      // Setting currentTime before metadata can fail in some browser engines.
      try { audio.currentTime = 0; } catch { /* Replay will attempt the reset again. */ }
    }
  }
  function cancel(reset: boolean) {
    generation++;
    const previous = active;
    active = null;
    if (previous) {
      previous.detach();
      pauseMedia(previous.audio, reset);
    }
    publish(null);
    signalFrame();
  }
  function stop() { pending = null; paused = null; cancel(true); }
  function pause() {
    const previous = active;
    paused = previous ? { person: previous.person, text: previous.text, options: previous.options, position: previous.audio.currentTime } : pending;
    pending = null;
    cancel(false);
  }

  function loadEnvelope(url: string) {
    let promise = envelopes.get(url);
    if (!promise) {
      promise = decodeEnvelope(url).catch(() => { if (envelopes.get(url) === promise) envelopes.delete(url); return null; });
      envelopes.set(url, promise);
    }
    return promise;
  }

  async function begin(person: PersonId, text: string, requestOptions: LessonAudioRequestOptions, position = 0): Promise<boolean> {
    // Every request supersedes the last, even when the requested file is absent.
    stop();
    const url = resolveClip(person, text);
    if (!url) { publish(null, "Esta fala ainda não tem áudio disponível."); return false; }
    const ticket = generation;
    const key = getLessonAudioKey(person, text);
    let audio: HTMLAudioElement;
    try {
      const cached = cache.get(url);
      audio = cached ?? makeAudio(url);
      if (!cached) { audio.preload = "none"; cache.set(url, audio); }
      else if (failed.delete(url)) audio.load();
    } catch { publish(null, RETRY_ERROR); return false; }

    const current = () => active?.ticket === ticket && active.audio === audio;
    const onPlaying = () => {
      if (!current() || !active) return;
      active.running = true; pending = null; paused = null;
      publish(key); signalFrame();
    };
    const onWaiting = () => { if (current() && active) { active.running = false; signalFrame(); } };
    const onPause = () => {
      if (!current()) return;
      // Browsers dispatch pause immediately before ended at a natural boundary.
      // Keep that ended listener attached so a sequence advances exactly once.
      if (audio.ended || Number.isFinite(audio.duration) && audio.currentTime >= audio.duration - .001) {
        if (active) active.running = false;
        signalFrame();
      } else pause();
    };
    const onEnded = () => {
      if (!current()) return;
      const complete = active?.options.onEnded;
      active?.detach(); active = null; pending = null; paused = null;
      publish(null); signalFrame();
      complete?.();
    };
    const onError = () => {
      if (!current()) return;
      failed.add(url);
      active?.detach(); active = null; pending = null; paused = null;
      pauseMedia(audio, true); publish(null, RETRY_ERROR); signalFrame();
    };
    let finish!: () => void;
    const finished = new Promise<void>(resolve => { finish = resolve; });
    const detach = () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("pause", onPause);
      finish();
    };
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("pause", onPause);
    active = { audio, ticket, detach, finished, person, text, options: requestOptions, position, url, key, running: false, envelope: null };
    // Analysis never delays the audible play() gesture or an autoplay attempt.
    void loadEnvelope(url).then(envelope => { if (current() && active) { active.envelope = envelope; signalFrame(); } });
    try {
      try { audio.currentTime = position; } catch { /* Metadata may not be available yet. */ }
      await audio.play();
      if (current()) { onPlaying(); return true; }
      // An old promise may resolve after another clip starts or the round changes.
      // A replay of the same cached element belongs to the new request, however.
      else if (active?.audio !== audio) pauseMedia(audio, true);
    } catch (error) {
      if (current() && error && typeof error === "object" && "name" in error && error.name === "NotAllowedError") {
        active?.detach(); active = null;
        pending = { person, text, options: requestOptions, position };
        pauseMedia(audio, false); publish(null, null, true); signalFrame();
      } else if (current()) onError();
      else if (active?.audio !== audio) pauseMedia(audio, true);
    }
    return false;
  }
  const request = (person: PersonId, text: string, requestOptions: LessonAudioRequestOptions = {}) => begin(person, text, requestOptions);
  async function play(person: PersonId, text: string) { await request(person, text); }
  function resume(): Promise<boolean> {
    if (getFrame().playing) return Promise.resolve(true);
    const previous = pending ?? paused;
    // begin invokes media.play synchronously before awaiting it, preserving the
    // user activation of the Ativar som click. It never claims a global unlock.
    return previous ? begin(previous.person, previous.text, previous.options, previous.position) : Promise.resolve(false);
  }

  return {
    getSnapshot: () => snapshot,
    whenIdle: manualOnly => manualOnly && active?.options.autoplay ? undefined : active?.finished,
    subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    play, request, unlock: resume, resume, pause, stop, speech,
    has: (person, text) => Boolean(resolveClip(person, text)),
    dispose: () => {
      stop();
      for (const audio of cache.values()) pauseMedia(audio, true);
      cache.clear();
      failed.clear();
      envelopes.clear();
    },
  };
}
