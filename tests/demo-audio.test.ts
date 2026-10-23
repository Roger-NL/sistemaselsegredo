import { describe, expect, it, vi } from "vitest";
import { DemoAudioPlayer } from "@/features/demo/audio/player";

class FakeAudio extends EventTarget {
  preload = ""; src = "test";
  playbackRate = 1;
  play = vi.fn(async () => {}); pause = vi.fn();
}
describe("single prepared-audio player", () => {
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
});
