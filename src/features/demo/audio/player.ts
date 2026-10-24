export type AudioProgress = { status: "loading" | "playing" | "paused" | "ended" | "error"; progress: number };
export type AudioSource = string | (() => Promise<string>);

/** A single lazy player. Resolves files only after an explicit play request. */
export class DemoAudioPlayer {
  private current: HTMLAudioElement | null = null;
  private settle: ((ok: boolean) => void) | null = null;
  private generation = 0;
  private rate = 1;
  constructor(private create: (url: string) => HTMLAudioElement = url => new Audio(url)) {}
  private stop() { this.settle?.(false); this.current?.pause(); if (this.current) this.current.src = ""; this.current = null; }
  cancel() { this.generation++; this.stop(); }
  pause() { if (!this.current) return false; this.current.pause(); return true; }
  async resume() { try { if (!this.current) return false; await this.current.play(); return true; } catch { return false; } }
  setPlaybackRate(rate: number) { this.rate = rate === 0.9 ? 0.9 : 1; if (this.current) this.current.playbackRate = this.rate; }
  async play(url: string) {
    this.cancel();
    const element = this.create(url); element.preload = "none"; element.playbackRate = this.rate; this.current = element;
    try { await element.play(); return true; }
    catch { if (this.current === element) this.cancel(); return false; }
  }
  async playSequence(sources: AudioSource[], onProgress: (update: AudioProgress) => void = () => {}) {
    this.cancel();
    const generation = this.generation;
    // Resolve concurrently but never hold the first phrase for a slower later phrase.
    // Each result handles rejection immediately, even if cancellation skips that phrase.
    const urls = sources.map(source => typeof source === "string" ? source
      : source().then(url => url, () => null));
    for (let index = 0; index < urls.length; index++) {
      if (generation !== this.generation) return false;
      this.stop();
      onProgress({ status: "loading", progress: index / urls.length });
      const url = typeof urls[index] === "string" ? urls[index] as string : await urls[index];
      if (generation !== this.generation) return false;
      if (!url) { onProgress({ status: "error", progress: index / urls.length }); return false; }
      const element = this.create(url); element.preload = "none"; element.playbackRate = this.rate; this.current = element;
      const completed = await new Promise<boolean>(resolve => {
        let status: AudioProgress["status"] = "loading";
        let finished = false;
        const update = () => {
          if (generation !== this.generation || finished) return;
          const fraction = Number.isFinite(element.duration) && element.duration > 0
            ? Math.min(1, Math.max(0, element.currentTime / element.duration)) : 0;
          onProgress({ status, progress: (index + fraction) / urls.length });
        };
        const playing = () => { status = "playing"; update(); };
        const waiting = () => { status = "loading"; update(); };
        const paused = () => { status = "paused"; update(); };
        const listeners = { playing, waiting, stalled: waiting, pause: paused, timeupdate: update, durationchange: update, loadedmetadata: update };
        const finish = (ok: boolean) => {
          if (finished) return;
          finished = true;
          element.removeEventListener("ended", ended); element.removeEventListener("error", failed);
          for (const [name, listener] of Object.entries(listeners)) element.removeEventListener(name, listener);
          if (this.settle === finish) this.settle = null;
          resolve(ok);
        };
        const ended = () => {
          if (generation === this.generation) onProgress({ status: index + 1 === urls.length ? "ended" : "loading", progress: (index + 1) / urls.length });
          finish(true);
        };
        const failed = () => { if (generation === this.generation && !finished) { status = "error"; update(); } finish(false); };
        this.settle = finish;
        for (const [name, listener] of Object.entries(listeners)) element.addEventListener(name, listener);
        element.addEventListener("ended", ended, { once: true });
        element.addEventListener("error", failed, { once: true });
        void element.play().catch(failed);
      });
      if (!completed) { if (generation === this.generation) this.stop(); return false; }
    }
    return generation === this.generation;
  }
}
