export type PresentationSound =
  | "presentation-welcome" | "presentation-ready"
  | "presentation-cafe" | "presentation-support"
  | "presentation-study" | "presentation-practice"
  | "presentation-unlock" | "presentation-lesson" | "presentation-dashboard";

type Score = { notes: readonly number[]; spacing: number; decay: number; volume: number };

/** Nine related celesta-like motifs: each frame has its own entrance, without a loop. */
const scores: Record<PresentationSound, Score> = {
  "presentation-welcome": { notes: [523.25, 659.25, 783.99, 1046.5], spacing: 0.085, decay: 0.68, volume: 0.021 },
  "presentation-ready": { notes: [659.25, 783.99, 880, 1318.51], spacing: 0.07, decay: 0.59, volume: 0.02 },
  "presentation-cafe": { notes: [392, 523.25, 659.25, 783.99], spacing: 0.1, decay: 0.6, volume: 0.023 },
  "presentation-support": { notes: [523.25, 783.99, 659.25, 880], spacing: 0.085, decay: 0.57, volume: 0.021 },
  "presentation-study": { notes: [523.25, 587.33, 659.25, 783.99, 880], spacing: 0.065, decay: 0.54, volume: 0.02 },
  "presentation-practice": { notes: [783.99, 659.25, 1046.5, 880, 1318.51], spacing: 0.055, decay: 0.58, volume: 0.019 },
  "presentation-unlock": { notes: [523.25, 659.25, 783.99, 1046.5, 1318.51], spacing: 0.075, decay: 0.84, volume: 0.021 },
  "presentation-lesson": { notes: [523.25, 880, 1318.51], spacing: 0.115, decay: 0.82, volume: 0.022 },
  "presentation-dashboard": { notes: [392, 523.25, 659.25, 783.99, 1046.5], spacing: 0.08, decay: 0.72, volume: 0.021 },
};

export function isPresentationSound(value: string): value is PresentationSound {
  return Object.hasOwn(scores, value);
}

/** Bell overtones and quiet trailing reflections share the interface's mute/cancellation. */
export function renderPresentationSound(audio: AudioContext, kind: PresentationSound, active: Set<AudioScheduledSourceNode>, volumeScale = 1) {
  const score = scores[kind];
  function bell(frequency: number, offset: number, duration: number, volume: number, pan: number) {
    const source = audio.createOscillator();
    const gain = audio.createGain();
    const at = audio.currentTime + offset;
    source.type = "sine";
    source.frequency.setValueAtTime(frequency, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume * volumeScale, at + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    source.connect(gain);
    const panner = audio.createStereoPanner?.();
    if (panner) {
      panner.pan.setValueAtTime(pan, at);
      gain.connect(panner); panner.connect(audio.destination);
    } else gain.connect(audio.destination);
    active.add(source);
    source.onended = () => { active.delete(source); source.disconnect(); gain.disconnect(); panner?.disconnect(); };
    source.start(at); source.stop(at + duration);
  }
  score.notes.forEach((frequency, index) => {
    const at = index * score.spacing;
    const pan = index % 2 ? 0.25 : -0.25;
    // An inharmonic upper partial gives a glassy bell, rather than a plain notification beep.
    bell(frequency, at, score.decay, score.volume, pan);
    bell(frequency * 2.756, at, score.decay * 0.46, score.volume * 0.13, -pan);
    bell(frequency, at + 0.16, score.decay * 0.64, score.volume * 0.15, -pan);
  });
}
