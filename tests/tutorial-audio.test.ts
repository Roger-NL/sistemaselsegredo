// @vitest-environment jsdom
import { act, createElement, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLessonAudioClip } from "../src/features/first-encounters/lesson-audio";
import { createTutorialAudioController, getTutorialAudioClip, validateTutorialAudioCatalog } from "../src/features/first-encounters/tutorial-audio";
import { getTutorialNarration, TUTORIAL_NARRATIONS } from "../src/features/first-encounters/tutorial-script";
import { useTutorialAudio } from "../src/features/first-encounters/useTutorialAudio";

vi.mock("../src/features/first-encounters/tutorial-audio.json", () => ({ default: {
  "nina:Primeiro, escute a Ana.": "/first-encounters/audio/tutorial-pt/nina-welcome.m4a",
} }));
vi.mock("../src/features/first-encounters/lesson-one-audio.json", () => ({ default: {
  "ana:I am Ana.": "/first-encounters/audio/lesson-one/ana-i-am-ana.m4a",
} }));

const welcome = getTutorialNarration("welcome");
const fullCatalog = Object.fromEntries(Object.values(TUTORIAL_NARRATIONS).map(clip => [clip.key, clip.url]));
class Media extends EventTarget {
  paused = true;
  ended = false;
  duration = 2;
  currentTime = 0;
  preload = "";
  pending: Promise<void>[] = [];
  constructor(readonly url: string) { super(); }
  play = vi.fn(async () => { await (this.pending.shift() ?? Promise.resolve()); this.paused = false; });
  pause = vi.fn(() => { this.paused = true; });
  load = vi.fn();
  element() { return this as unknown as HTMLAudioElement; }
  emit(type: string) { this.dispatchEvent(new Event(type)); }
}
function fixture() {
  const media: Media[] = [];
  const createAudio = vi.fn((url: string) => { const element = new Media(url); media.push(element); return element.element(); });
  return { controller: createTutorialAudioController({ catalog: fullCatalog, createAudio }), media, createAudio };
}

beforeEach(() => vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("the recorded tutorial whitelist", () => {
  it("exposes the nine recorded Portuguese lines with explicit narrator identity", () => {
    expect(Object.keys(TUTORIAL_NARRATIONS)).toEqual(["welcome", "repeat", "next", "drag", "your-turn", "click", "success", "word-pieces", "write-check"]);
    expect(welcome).toMatchObject({ person: "nina", role: "narration", text: "Primeiro, escute a Ana." });
    expect(getTutorialNarration("drag").text).toBe("Olhe só. Segure esta fala, arraste até aqui e solte.");
    expect(validateTutorialAudioCatalog(fullCatalog)).toEqual({ valid: true, errors: [], entries: 9 });
    for (const id of ["word-pieces", "write-check"] as const) {
      const clip = getTutorialNarration(id);
      expect(clip.role).toBe("narration");
      expect(getTutorialAudioClip("nina", clip.text, fullCatalog)).toBe(`/first-encounters/audio/tutorial-pt/nina-${id}.m4a`);
    }
  });

  it("accepts only the exact recorded PT mapping and the existing Ana English demonstration", () => {
    expect(getTutorialAudioClip("nina", welcome.text, fullCatalog)).toBe(welcome.url);
    expect(getTutorialAudioClip("ana", "I am Ana.", fullCatalog)).toBe("/first-encounters/audio/lesson-one/ana-i-am-ana.m4a");
    expect(getTutorialAudioClip("ana", welcome.text, fullCatalog)).toBeUndefined();
    expect(getTutorialAudioClip("nina", "I am Ana.", fullCatalog)).toBeUndefined();
    expect(getTutorialAudioClip("leo", "You are Ana.", fullCatalog)).toBeUndefined();
    expect(getTutorialAudioClip("nina", welcome.text.replace("Ana.", "Ana"), fullCatalog)).toBeUndefined();
    expect(getTutorialAudioClip("nina", welcome.text, { [welcome.key]: getTutorialNarration("drag").url })).toBeUndefined();
  });

  it("rejects remote/API/query/path substitutions without broadening the ordinary lesson resolver", () => {
    for (const url of ["https://voice.example/generate", "/api/speech", `${welcome.url}?token=x`, "/first-encounters/audio/tutorial-pt/../nina-welcome.m4a"]) {
      const catalog = { [welcome.key]: url };
      expect(getTutorialAudioClip("nina", welcome.text, catalog)).toBeUndefined();
      expect(validateTutorialAudioCatalog(catalog).valid).toBe(false);
    }
    expect(getLessonAudioClip("nina", welcome.text, fullCatalog)).toBeUndefined();
    expect(validateTutorialAudioCatalog({ "nina:An invented line.": welcome.url }).valid).toBe(false);
    expect(validateTutorialAudioCatalog([]).valid).toBe(false);
  });
});

describe("one effective PT and English playback channel", () => {
  it("stops the Portuguese narrator before English Ana and preserves the shared driver and cache", async () => {
    const { controller, media, createAudio } = fixture();
    const driver = controller.speech;
    expect(createAudio).not.toHaveBeenCalled();
    await controller.request("nina", welcome.text);
    expect(driver.getFrame()).toMatchObject({ person: "nina", role: "narration", text: welcome.text });
    await controller.request("ana", "I am Ana.", { role: "character" });
    expect(media[0].paused).toBe(true); expect(media[1].paused).toBe(false);
    expect(driver.getFrame()).toMatchObject({ person: "ana", role: "character", text: "I am Ana." });
    await controller.request("nina", welcome.text);
    expect(media[1].paused).toBe(true); expect(media.filter(item => !item.paused)).toHaveLength(1);
    expect(createAudio).toHaveBeenCalledTimes(2); expect(controller.speech).toBe(driver);
    controller.stop(); expect(media.every(item => item.paused)).toBe(true);
    expect(driver.getFrame()).toMatchObject({ playing: false, level: 0 });
    controller.dispose();
  });

  it("does not let a delayed PT play promise or callback take over a newer Ana demonstration", async () => {
    const { controller, media } = fixture();
    await controller.request("nina", welcome.text);
    let resolve!: () => void;
    media[0].pending.push(new Promise<void>(done => { resolve = done; }));
    const staleEnded = vi.fn();
    const stale = controller.request("nina", welcome.text, { onEnded: staleEnded });
    await controller.request("ana", "I am Ana.", { role: "character" });
    resolve(); await stale; media[0].emit("ended");
    expect(staleEnded).not.toHaveBeenCalled();
    expect(media[0].paused).toBe(true); expect(media[1].paused).toBe(false);
    expect(controller.speech.getFrame()).toMatchObject({ person: "ana", role: "character" });
    controller.dispose();
  });

  it("advances PT→English only on the current natural end and can cancel the sequence", async () => {
    const { controller, media } = fixture();
    const speakAna = vi.fn(() => { void controller.request("ana", "I am Ana.", { role: "character" }); });
    await controller.request("nina", welcome.text, { onEnded: speakAna });
    controller.pause(); media[0].emit("ended"); expect(speakAna).not.toHaveBeenCalled();
    await controller.request("nina", welcome.text, { onEnded: speakAna });
    media[0].ended = true; media[0].paused = true; media[0].currentTime = media[0].duration;
    media[0].emit("pause"); media[0].emit("ended");
    await Promise.resolve(); await Promise.resolve();
    expect(speakAna).toHaveBeenCalledOnce(); expect(controller.speech.getFrame().person).toBe("ana");
    controller.stop(); expect(controller.speech.getFrame().playing).toBe(false);
    controller.dispose();
  });

  it("reuses the same tutorial controller across scoped hook renders and stops before changing steps", async () => {
    const media: Media[] = [];
    vi.stubGlobal("Audio", function Audio(url: string) { const element = new Media(url); media.push(element); return element.element(); });
    let hook!: ReturnType<typeof useTutorialAudio>;
    function Reader({ scope }: { scope: string }) {
      const audio = useTutorialAudio(scope);
      useEffect(() => { hook = audio; }, [audio]);
      return createElement("output", null, audio.playingKey ?? "idle");
    }
    const node = document.createElement("div"), root = createRoot(node);
    await act(async () => root.render(createElement(Reader, { scope: "pt-guide" })));
    const driver = hook.speech;
    await act(async () => hook.request("nina", welcome.text));
    expect(media).toHaveLength(1);
    await act(async () => root.render(createElement(Reader, { scope: "ana-demo" })));
    expect(media[0].paused).toBe(true); expect(hook.speech).toBe(driver);
    await act(async () => hook.request("ana", "I am Ana.", { role: "character" }));
    expect(media).toHaveLength(2);
    expect(media.filter(item => !item.paused)).toHaveLength(1);
    await act(async () => root.unmount()); expect(media.every(item => item.paused)).toBe(true);
  });
});
