import { describe, expect, it, vi } from "vitest";
import { DemoAudioPlayer } from "@/features/demo/audio/player";
import { nodes } from "@/features/demo/content/catalog";
import { audio } from "@/features/demo/content/media";

class FakeAudio extends EventTarget {
  preload = ""; src = "test";
  currentTime = 0; duration = Number.NaN;
  playbackRate = 1;
  play = vi.fn(async () => {}); pause = vi.fn();
}
describe("single prepared-audio player", () => {
  it("finishes every stage's single phrases and grouped lines once, with monotonic finite progress", async () => {
    const played = new Set<string>();
    for (const node of nodes) {
      const groups = [...(node.heard?.length ? [node.heard] : []), ...(node.kind === "response" ? [[node.response]] : [])];
      for (const group of groups) {
        const progress = vi.fn();
        const create = vi.fn((id: string) => {
          played.add(id);
          const element = new FakeAudio();
          // Vary clip lengths to exercise short words and longer sentences.
          element.duration = audio[id as keyof typeof audio].text.length / 10;
          element.play.mockImplementation(async () => {
            queueMicrotask(() => {
              element.dispatchEvent(new Event("playing"));
              for (const fraction of [0, .25, .5, .75]) {
                element.currentTime = element.duration * fraction;
                element.dispatchEvent(new Event("timeupdate"));
              }
              element.currentTime = element.duration;
              element.dispatchEvent(new Event("ended"));
            });
          });
          return element as unknown as HTMLAudioElement;
        });
        expect(await new DemoAudioPlayer(create).playSequence(group, progress), node.id).toBe(true);
        const updates = progress.mock.calls.map(([update]) => update);
        expect(updates.at(-1), node.id).toEqual({ status: "ended", progress: 1 });
        expect(updates.filter(update => update.status === "ended"), node.id).toHaveLength(1);
        for (let index = 0; index < updates.length; index++) {
          expect(Number.isFinite(updates[index].progress), node.id).toBe(true);
          expect(updates[index].progress, node.id).toBeGreaterThanOrEqual(index ? updates[index - 1].progress : 0);
          expect(updates[index].progress, node.id).toBeLessThanOrEqual(1);
        }
      }
    }
    expect([...played].sort()).toEqual(Object.keys(audio).sort());
  });
  it("changes playback rate and resumes the same file without creating another resource", async () => {
    const element = new FakeAudio(); const create = vi.fn().mockReturnValue(element);
    const player = new DemoAudioPlayer(create);
    await player.play("recording.mp3"); player.pause(); player.setPlaybackRate(0.9);
    expect(element.playbackRate).toBe(0.9); expect(await player.resume()).toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
  });
  it("interrupts a previous resource and handles blocked playback", async () => {
    const first = new FakeAudio(); const second = new FakeAudio();
    second.play.mockRejectedValue(new Error("autoplay blocked"));
    const create = vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(second);
    const player = new DemoAudioPlayer(create);
    expect(await player.play("first.mp3")).toBe(true);
    expect(await player.play("second.mp3")).toBe(false);
    expect(first.pause).toHaveBeenCalled(); expect(first.src).toBe("");
  });
  it("plays the sent reference before the character reaction and cancels pending sequences", async () => {
    const first = new FakeAudio(); const second = new FakeAudio();
    const create = vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(second);
    const player = new DemoAudioPlayer(create);
    const done = player.playSequence(["reference.mp3", "reaction.mp3"]);
    expect(create).toHaveBeenCalledTimes(1);
    first.dispatchEvent(new Event("ended"));
    await Promise.resolve();
    expect(create).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenLastCalledWith("reaction.mp3");
    player.cancel(); expect(await done).toBe(false);
  });
  it("tracks actual playback, buffering, pause and a complete circle at the end", async () => {
    const element = new FakeAudio(); const progress = vi.fn();
    const player = new DemoAudioPlayer(() => element);
    const done = player.playSequence(["recording.mp3"], progress);
    expect(progress).toHaveBeenLastCalledWith({ status: "loading", progress: 0 });
    element.duration = 4;
    element.dispatchEvent(new Event("playing"));
    element.currentTime = 1; element.dispatchEvent(new Event("timeupdate"));
    expect(progress).toHaveBeenLastCalledWith({ status: "playing", progress: 0.25 });
    element.dispatchEvent(new Event("waiting"));
    expect(progress).toHaveBeenLastCalledWith({ status: "loading", progress: 0.25 });
    player.pause(); element.dispatchEvent(new Event("pause"));
    expect(progress).toHaveBeenLastCalledWith({ status: "paused", progress: 0.25 });
    await player.resume(); element.dispatchEvent(new Event("playing"));
    expect(progress).toHaveBeenLastCalledWith({ status: "playing", progress: 0.25 });
    element.currentTime = 4; element.dispatchEvent(new Event("ended"));
    expect(await done).toBe(true);
    expect(progress).toHaveBeenLastCalledWith({ status: "ended", progress: 1 });
    const count = progress.mock.calls.length;
    element.dispatchEvent(new Event("timeupdate"));
    expect(progress).toHaveBeenCalledTimes(count);
  });
  it("starts the first phrase without waiting for the second URL", async () => {
    const first = new FakeAudio(); const second = new FakeAudio();
    let ready!: (url: string) => void;
    const later = new Promise<string>(resolve => { ready = resolve; });
    const create = vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(second);
    const player = new DemoAudioPlayer(create); const progress = vi.fn();
    const done = player.playSequence([() => Promise.resolve("first.mp3"), () => later], progress);
    await vi.waitFor(() => expect(first.play).toHaveBeenCalledOnce());
    expect(create).toHaveBeenCalledTimes(1);
    first.dispatchEvent(new Event("ended"));
    ready("second.mp3");
    await vi.waitFor(() => expect(second.play).toHaveBeenCalledOnce());
    second.dispatchEvent(new Event("ended"));
    expect(await done).toBe(true);
    expect(progress).toHaveBeenLastCalledWith({ status: "ended", progress: 1 });
  });
  it("does not play a late URL after cancellation or leak stale progress", async () => {
    let ready!: (url: string) => void;
    const source = new Promise<string>(resolve => { ready = resolve; });
    const create = vi.fn(); const progress = vi.fn();
    const player = new DemoAudioPlayer(create);
    const done = player.playSequence([() => source], progress);
    player.cancel(); ready("late.mp3");
    expect(await done).toBe(false); expect(create).not.toHaveBeenCalled();
    expect(progress).toHaveBeenCalledTimes(1);
  });
  it("reports download failures locally without claiming playback completed", async () => {
    const element = new FakeAudio(); const progress = vi.fn();
    const player = new DemoAudioPlayer(() => element);
    const done = player.playSequence(["missing.mp3"], progress);
    element.dispatchEvent(new Event("error"));
    expect(await done).toBe(false);
    expect(progress).toHaveBeenLastCalledWith({ status: "error", progress: 0 });
    expect(element.src).toBe("");
  });
});
