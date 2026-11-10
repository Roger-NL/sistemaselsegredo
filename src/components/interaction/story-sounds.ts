export type StorySound = "story-enter" | "story-surprise" | "story-relief" | "story-settle";
type Tone = { from: number; to?: number; at: number; duration: number; attack: number; gain: number; wave?: OscillatorType };
type Air = { from: number; to: number; at: number; duration: number; gain: number };
type Score = { tones: Tone[]; air?: Air };

/** A few narrative accents, rather than a continuous soundtrack or an alarm. */
const scores: Record<StorySound, Score> = {
  "story-enter": {
    air: { from: 380, to: 1800, at: 0, duration: 0.95, gain: 0.045 },
    tones: [
      { from: 164.81, to: 329.63, at: 0, duration: 1.1, attack: 0.28, gain: 0.035 },
      { from: 493.88, at: 0.18, duration: 0.9, attack: 0.16, gain: 0.022 },
      { from: 659.25, at: 0.32, duration: 0.78, attack: 0.1, gain: 0.018 },
      { from: 987.77, at: 0.48, duration: 0.65, attack: 0.035, gain: 0.011 },
    ],
  },
  "story-surprise": {
    air: { from: 650, to: 1400, at: 0, duration: 0.29, gain: 0.035 },
    tones: [
      { from: 240, to: 540, at: 0, duration: 0.19, attack: 0.035, gain: 0.04, wave: "triangle" },
      { from: 540, to: 360, at: 0.14, duration: 0.34, attack: 0.035, gain: 0.035 },
      { from: 810, to: 720, at: 0.16, duration: 0.29, attack: 0.025, gain: 0.014 },
    ],
  },
  "story-relief": { tones: [
    { from: 392, at: 0, duration: 0.48, attack: 0.045, gain: 0.028 },
    { from: 523.25, at: 0.07, duration: 0.46, attack: 0.055, gain: 0.022 },
    { from: 659.25, at: 0.13, duration: 0.4, attack: 0.06, gain: 0.016 },
  ] },
  "story-settle": {
    air: { from: 1100, to: 380, at: 0, duration: 0.44, gain: 0.025 },
    tones: [
      { from: 329.63, at: 0.05, duration: 0.5, attack: 0.12, gain: 0.024 },
      { from: 493.88, at: 0.12, duration: 0.43, attack: 0.1, gain: 0.016 },
    ],
  },
};

export function isStorySound(value: string): value is StorySound {
  return Object.hasOwn(scores, value);
}

/** Use the shared context, cancellation and mute preference. No downloaded media. */
export function renderStorySound(audio: AudioContext, kind: StorySound, active: Set<AudioScheduledSourceNode>, volumeScale = 1) {
  const score = scores[kind];
  const envelope = (at: number, duration: number, attack: number, volume: number) => {
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume * volumeScale, at + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    gain.connect(audio.destination);
    return gain;
  };
  const schedule = (source: AudioScheduledSourceNode, at: number, duration: number, nodes: AudioNode[]) => {
    active.add(source);
    source.onended = () => { active.delete(source); source.disconnect(); nodes.forEach(node => node.disconnect()); };
    source.start(at); source.stop(at + duration);
  };
  if (score.air) {
    const { from, to, at: offset, duration, gain: volume } = score.air;
    const at = audio.currentTime + offset;
    const source = audio.createBufferSource();
    const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * duration), audio.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;
    source.buffer = buffer;
    const filter = audio.createBiquadFilter(); filter.type = "bandpass";
    filter.Q.setValueAtTime(0.65, at);
    filter.frequency.setValueAtTime(from, at);
    filter.frequency.exponentialRampToValueAtTime(to, at + duration);
    const gain = envelope(at, duration, duration * 0.4, volume);
    source.connect(filter); filter.connect(gain);
    schedule(source, at, duration, [filter, gain]);
  }
  score.tones.forEach(tone => {
    const at = audio.currentTime + tone.at;
    const source = audio.createOscillator(); source.type = tone.wave ?? "sine";
    source.frequency.setValueAtTime(tone.from, at);
    if (tone.to) source.frequency.exponentialRampToValueAtTime(tone.to, at + tone.duration);
    const gain = envelope(at, tone.duration, tone.attack, tone.gain);
    source.connect(gain);
    schedule(source, at, tone.duration, [gain]);
  });
}
