// @vitest-environment jsdom
import { act, createElement, useLayoutEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PublishedAudioCatalog } from "@/contracts/demo-audio";
import type { AudioProgress } from "@/features/demo/audio/player";

const mocks = vi.hoisted(() => ({
  order: [] as string[],
  stopEffects: vi.fn(), createResolver: vi.fn(), resolve: vi.fn(),
  constructPlayer: vi.fn(), play: vi.fn(), cancel: vi.fn(), pause: vi.fn(), resume: vi.fn(), rate: vi.fn(),
}));
vi.mock("@/components/interaction/sounds", () => ({ stopInteractionSounds: mocks.stopEffects }));
vi.mock("@/features/demo/services/audio-client", () => ({ createCatalogAudioClient: mocks.createResolver }));
vi.mock("@/features/demo/audio/player", () => ({
  DemoAudioPlayer: class {
    constructor() { mocks.constructPlayer(); }
    playSequence = mocks.play;
    cancel = mocks.cancel;
    pause = mocks.pause;
    resume = mocks.resume;
    setPlaybackRate = mocks.rate;
  },
}));
import { useDemoAudio, type DemoAudio } from "@/features/demo/audio/use-demo-audio";

let root: Root;
let controller: DemoAudio;
let finish: (ok: boolean) => void;
const published: PublishedAudioCatalog = {
  C10: { key: "a".repeat(64), audioUrl: `https://test.public.blob.vercel-storage.com/speech-cache/v3/${"a".repeat(64)}.mp3` },
};
function Harness() {
  const audio = useDemoAudio("p6.safe:0:scene:end:false", published);
  useLayoutEffect(() => { controller = audio; }, [audio]);
  return null;
}

beforeEach(() => {
  vi.clearAllMocks(); mocks.order.length = 0;
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  document.body.innerHTML = '<div id="root"></div>';
  root = createRoot(document.getElementById("root")!);
  mocks.stopEffects.mockImplementation(() => { mocks.order.push("stop-effects"); });
  mocks.createResolver.mockImplementation(() => { mocks.order.push("catalog"); return mocks.resolve; });
  mocks.resolve.mockResolvedValue(published.C10!.audioUrl);
  mocks.constructPlayer.mockImplementation(() => { mocks.order.push("player"); });
  mocks.pause.mockReturnValue(true);
  mocks.resume.mockImplementation(async () => { mocks.order.push("resume-voice"); return true; });
  mocks.play.mockImplementation(async (sources: (() => Promise<string>)[], update: (value: AudioProgress) => void) => {
    await Promise.all(sources.map(source => source()));
    mocks.order.push("play-voice");
    update({ status: "playing", progress: 0 });
    return new Promise<boolean>(resolve => { finish = resolve; });
  });
});
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });

describe("voice priority over narrative effects", () => {
  it("mounts silently without stopping effects, loading a catalog or creating a voice player", async () => {
    await act(async () => root.render(createElement(Harness)));
    expect(controller.playback.status).toBe("idle");
    expect(mocks.stopEffects).not.toHaveBeenCalled();
    expect(mocks.createResolver).not.toHaveBeenCalled();
    expect(mocks.constructPlayer).not.toHaveBeenCalled();
    expect(mocks.play).not.toHaveBeenCalled();
    expect(mocks.resume).not.toHaveBeenCalled();
  });

  it("stops all effect layers before replaying the existing catalog voice", async () => {
    await act(async () => root.render(createElement(Harness)));
    let playback!: Promise<void>;
    await act(async () => { playback = controller.replay(["C10", "C11"], "listen-lucas"); });
    expect(mocks.order).toEqual(["stop-effects", "catalog", "player", "play-voice"]);
    expect(mocks.createResolver).toHaveBeenCalledWith(undefined, undefined, published);
    expect(mocks.resolve.mock.calls.map(call => call[0])).toEqual(["C10", "C11"]);
    expect(controller.playback).toMatchObject({ source: "listen-lucas", status: "playing" });
    await act(async () => { finish(true); await playback; });
    expect(controller.playback.status).toBe("ended");
    expect(mocks.stopEffects).toHaveBeenCalledOnce();
  });

  it("stops effects again before a paused voice resumes, while idle resume stays silent", async () => {
    await act(async () => root.render(createElement(Harness)));
    await act(async () => controller.resume());
    expect(mocks.stopEffects).not.toHaveBeenCalled();
    expect(mocks.resume).not.toHaveBeenCalled();
    let playback!: Promise<void>;
    await act(async () => { playback = controller.replay("C10", "listen-lucas"); });
    await act(async () => controller.pause());
    expect(controller.playback.status).toBe("paused");
    mocks.order.length = 0; mocks.stopEffects.mockClear();
    await act(async () => controller.resume());
    expect(mocks.order).toEqual(["stop-effects", "resume-voice"]);
    expect(mocks.stopEffects).toHaveBeenCalledOnce();
    expect(controller.playback.status).toBe("playing");
    expect(mocks.createResolver).toHaveBeenCalledOnce();
    expect(mocks.play).toHaveBeenCalledOnce();
    await act(async () => { finish(true); await playback; });
  });
});
