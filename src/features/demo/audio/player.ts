/** A single lazy player. No microphone, synthesis, preloading or autoplay on restore. */
export class DemoAudioPlayer {
  private current: HTMLAudioElement | null = null;
  constructor(private create: (url: string) => HTMLAudioElement = url => new Audio(url)) {}
  cancel() { this.current?.pause(); if (this.current) this.current.src = ""; this.current = null; }
  pause() { this.current?.pause(); }
  async play(url: string) {
    this.cancel();
    const element = this.create(url); element.preload = "none"; this.current = element;
    try { await element.play(); return true; }
    catch { if (this.current === element) this.cancel(); return false; }
  }
}
