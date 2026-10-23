/** A single lazy player. No microphone, synthesis, preloading or autoplay on restore. */
export class DemoAudioPlayer {
  private current: HTMLAudioElement | null = null;
  private settle: ((ok: boolean) => void) | null = null;
  private generation = 0;
  constructor(private create: (url: string) => HTMLAudioElement = url => new Audio(url)) {}
  private stop() { this.settle?.(false); this.current?.pause(); if (this.current) this.current.src = ""; this.current = null; }
  cancel() { this.generation++; this.stop(); }
  pause() { this.current?.pause(); }
  async play(url: string) {
    this.cancel();
    const element = this.create(url); element.preload = "none"; this.current = element;
    try { await element.play(); return true; }
    catch { if (this.current === element) this.cancel(); return false; }
  }
  async playSequence(urls: string[]) {
    this.cancel();
    const generation = this.generation;
    for (const url of urls) {
      if (generation !== this.generation) return false;
      this.stop();
      const element = this.create(url); element.preload = "none"; this.current = element;
      const completed = await new Promise<boolean>(resolve => {
        const finish = (ok: boolean) => {
          element.removeEventListener("ended", ended); element.removeEventListener("error", failed);
          if (this.settle === finish) this.settle = null;
          resolve(ok);
        };
        const ended = () => finish(true);
        const failed = () => finish(false);
        this.settle = finish;
        element.addEventListener("ended", ended, { once: true });
        element.addEventListener("error", failed, { once: true });
        void element.play().catch(failed);
      });
      if (!completed) return false;
    }
    return generation === this.generation;
  }
}
