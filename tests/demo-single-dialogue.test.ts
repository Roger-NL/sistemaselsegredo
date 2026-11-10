// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { audio } from "@/features/demo/content/media";
import { catalog, nodes } from "@/features/demo/content/catalog";
import { createDemo, sceneDestination, transition } from "@/features/demo/model/reducer";
import { listeningTarget, lucasKey } from "@/features/demo/model/listening";
import { sceneReadingGroup } from "@/features/demo/model/scene-conversation";
import { practice } from "@/features/demo/model/practice";
import { decodeSnapshot, encodeSnapshot } from "@/features/demo/session/storage";
import { PROFILES, type DemoState, type SceneNode, type SupportProfile } from "@/features/demo/model/types";
import type { AudioProgress } from "@/features/demo/audio/player";

const mocks = vi.hoisted(() => ({
  remember: vi.fn(), catalog: vi.fn(), resolve: vi.fn(), play: vi.fn(), cancel: vi.fn(), rate: vi.fn(),
}));
vi.mock("@/features/demo/session/browser", () => ({ remember: mocks.remember }));
vi.mock("@/features/demo/services/audio-client", () => ({ createCatalogAudioClient: mocks.catalog }));
vi.mock("@/features/demo/audio/player", () => ({ DemoAudioPlayer: class {
  playSequence = mocks.play;
  cancel = mocks.cancel;
  setPlaybackRate = mocks.rate;
  pause = () => true;
  resume = async () => true;
} }));
import { DemoExperience } from "@/features/demo/DemoExperience";

let root: Root, container: HTMLDivElement;
let finish: ((ok: boolean) => void) | undefined;
let report: ((value: AudioProgress) => void) | undefined;
const network = vi.fn();
beforeEach(() => {
  vi.clearAllMocks(); finish = undefined; report = undefined;
  mocks.remember.mockReturnValue(true);
  mocks.catalog.mockReturnValue(mocks.resolve);
  mocks.resolve.mockImplementation(async (id: string) => `cached:${id}`);
  mocks.play.mockImplementation(async (sources: (() => Promise<string>)[], update: (value: AudioProgress) => void) => {
    await Promise.all(sources.map(source => source())); report = update;
    update({ status: "playing", progress: 0 });
    return new Promise<boolean>(resolve => { finish = resolve; });
  });
  mocks.cancel.mockImplementation(() => { finish?.(false); finish = undefined; });
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  vi.stubGlobal("fetch", network); localStorage.clear();
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });

function choicesTo(target: string, from = "p1.first", seen = new Set<string>()): [string, string][] | null {
  if (from === target) return [];
  if (seen.has(from)) return null;
  const node = catalog[from], visited = new Set([...seen, from]);
  if (node.kind === "choice") {
    for (const choice of node.choices) {
      const tail = choicesTo(target, choice.next, visited);
      if (tail) return [[node.id, choice.id], ...tail];
    }
  } else if ("next" in node) return choicesTo(target, node.next, visited);
  return null;
}
/** Real journal fixtures, including complementary branches, preserve replay semantics. */
function reach(profile: SupportProfile, target: string) {
  const route = choicesTo(target); if (!route) throw new Error(`UNREACHABLE_DIALOGUE:${target}`);
  const decisions = new Map(route);
  let state = createDemo(profile, "single-dialogue", 0);
  for (let step = 0; step < 500; step++) {
    if (state.nodeId === target) { expect(decodeSnapshot(encodeSnapshot(state))).toEqual(state); return state; }
    const node = catalog[state.nodeId];
    if (sceneReadingGroup(state) || node.kind === "scene" || state.phase === "present") state = transition(state, { at: node.id, type: "CONTINUE_SCENE" });
    else if (node.kind === "choice") state = transition(state, { at: node.id, type: "CHOOSE", choice: decisions.get(node.id) ?? node.choices[0].id });
    else if (node.kind === "comprehension") state = transition(state, { at: node.id, type: "ANSWER_MEANING", correct: true });
    else if (node.kind === "response") {
      if (state.phase === "recall") state = transition(state, { at: node.id, type: "CHECK" });
      if (state.phase === "build") for (const block of practice(node, state.activityProfile).answer) state = transition(state, { at: node.id, type: "PLACE_BLOCK", block });
      if (state.phase === "write") state = transition(state, { at: node.id, type: "TYPE", text: audio[node.response].text });
      if (state.phase === "select") state = transition(state, { at: node.id, type: "RECOGNIZE", response: node.response });
      state = transition(state, { at: node.id, type: "SEND_RESPONSE" });
    } else break;
  }
  throw new Error(`DIALOGUE_NOT_REACHED:${target}`);
}
function spokenScene(profile: SupportProfile, node: SceneNode) {
  let state = reach(profile, node.id);
  for (let count = 0; sceneReadingGroup(state) && !sceneReadingGroup(state)!.card.heard?.length; count++) {
    if (count > 8) throw new Error(`DIALOGUE_CONTEXT_LOOP:${node.id}`);
    state = transition(state, { at: node.id, type: "CONTINUE_SCENE" });
    expect(state.nodeId, node.id).toBe(node.id);
  }
  expect(listeningTarget(state)?.kind, node.id).toBe("lucas");
  return state;
}
async function mount(state: DemoState) {
  await act(async () => root.render(createElement(DemoExperience, { initial: state, generation: 1, key: `${state.profile}:${state.nodeId}:${state.phase}` })));
}
function saved(): DemoState { return mocks.remember.mock.calls.at(-1)![0] as DemoState; }
async function click(button: HTMLButtonElement | null) { expect(button).not.toBeNull(); await act(async () => button!.click()); }
async function completeAudio(ok = true) { expect(finish).toBeDefined(); await act(async () => { const done = finish!; finish = undefined; done(ok); }); }
const spoken = nodes.filter((node): node is SceneNode => node.kind === "scene" && Boolean(node.heard?.length));

describe("a single persistent Lucas dialogue", () => {
  for (const profile of PROFILES) it(`keeps every spoken scene's card and controls after listening in ${profile}`, async () => {
    expect(spoken.length).toBeGreaterThan(15);
    for (const node of spoken) {
      const before = spokenScene(profile, node);
      mocks.play.mockClear(); mocks.resolve.mockClear(); mocks.remember.mockClear();
      await mount(before);
      expect(mocks.play, node.id).not.toHaveBeenCalled();
      const article = container.querySelector<HTMLElement>('.activity-body .opening-card[data-presentation="dialogue"]')!;
      expect(article, node.id).not.toBeNull();
      const heading = article.querySelector("h1")!;
      const line = node.heard!.map(id => audio[id].text).join(" ");
      expect(heading.textContent, node.id).toBe(line);
      const listen = article.querySelector<HTMLButtonElement>('[aria-label="Ouvir fala de Lucas"]')!;
      const next = container.querySelector<HTMLButtonElement>(".activity-actions > .primary")!;
      expect(next, node.id).not.toBeNull();
      expect(container.querySelectorAll(".activity-actions > .primary"), node.id).toHaveLength(1);
      expect(container.querySelector(".listening-prompt"), node.id).toBeNull();
      expect(container.textContent, node.id).not.toContain("Li, continuar");
      await click(listen); await completeAudio();
      expect(container.querySelector('.activity-body .opening-card[data-presentation="dialogue"]'), node.id).toBe(article);
      expect(article.querySelector("h1"), node.id).toBe(heading);
      expect(article.querySelector('[aria-label="Ouvir fala de Lucas"]'), node.id).toBe(listen);
      expect(container.querySelector(".activity-actions > .primary"), node.id).toBe(next);
      expect(heading.textContent, node.id).toBe(line);
      expect(saved().nodeId, node.id).toBe(node.id);
      expect(saved().audioAccess[lucasKey(node.id)], node.id).toBe("heard");
      expect(saved().journal.slice(before.journal.length), node.id).toEqual([{ at: node.id, type: "AUDIO_ACCESS", key: lucasKey(node.id), mode: "heard" }]);
      expect(saved().evidence, node.id).toEqual(before.evidence);
      expect(saved().transcript, node.id).toEqual(before.transcript);
      expect(mocks.resolve.mock.calls.map(call => call[0]), node.id).toEqual(node.heard);
      const heard = saved();
      await act(async () => report!({ status: "ended", progress: 1 }));
      expect(saved().journal, node.id).toEqual(heard.journal);
      await click(next);
      expect(saved().nodeId, node.id).toBe(sceneDestination(heard));
      expect(saved().journal.slice(heard.journal.length), node.id).toEqual([{ at: node.id, type: "NEXT" }]);
      expect(decodeSnapshot(encodeSnapshot(saved())), node.id).toEqual(saved());
    }
    expect(network).not.toHaveBeenCalled();
  });

  for (const profile of PROFILES) it(`allows one reading action instead of listening at the opening, rescue and work in ${profile}`, async () => {
    for (const id of ["p1.lucas", "p6.safe", "p7.work"]) {
      const node = catalog[id]; if (node.kind !== "scene") throw new Error("SCENE_EXPECTED");
      const before = spokenScene(profile, node);
      await mount(before); mocks.play.mockClear();
      await click(container.querySelector(".activity-actions > .primary"));
      const after = saved();
      expect(after.nodeId, id).toBe(sceneDestination(before));
      expect(after.audioAccess[lucasKey(id)], id).toBe("text");
      expect(after.journal.slice(before.journal.length), id).toEqual([
        { at: id, type: "AUDIO_ACCESS", key: lucasKey(id), mode: "text" }, { at: id, type: "NEXT" },
      ]);
      expect(after.evidence, id).toEqual(before.evidence);
      expect(mocks.play, id).not.toHaveBeenCalled();
    }
    expect(network).not.toHaveBeenCalled();
  });

  it("keeps the same dialogue and reading action when audio fails", async () => {
    const node = catalog["p6.safe"] as SceneNode;
    await mount(spokenScene("beginner", node));
    const article = container.querySelector('.opening-card[data-presentation="dialogue"]')!;
    const next = container.querySelector<HTMLButtonElement>(".activity-actions > .primary")!;
    await click(article.querySelector('[aria-label="Ouvir fala de Lucas"]')); await completeAudio(false);
    expect(container.querySelector('.opening-card[data-presentation="dialogue"]')).toBe(article);
    expect(article.textContent).toContain("Não foi possível ouvir.");
    expect(saved().audioAccess[lucasKey(node.id)]).toBeUndefined();
    expect(next.disabled).toBe(false);
    await click(next);
    expect(saved().nodeId).toBe("p7.tired");
    expect(saved().audioAccess[lucasKey(node.id)]).toBe("text");
    expect(network).not.toHaveBeenCalled();
  });
});

describe("hearing a learner model never reveals or sends the response", () => {
  for (const [profile, id] of [["beginner", "p2.send"], ...PROFILES.map(profile => [profile, "p6.warn"] as const)] as const) {
    it(`keeps the Portuguese model card until explicit participation at ${id} in ${profile}`, async () => {
      let before = reach(profile, id);
      while (sceneReadingGroup(before)) before = transition(before, { at: id, type: "CONTINUE_SCENE" });
      const node = catalog[id]; if (node.kind !== "response") throw new Error("RESPONSE_EXPECTED");
      await mount(before);
      const article = container.querySelector<HTMLElement>(".response-cue")!;
      const next = container.querySelector<HTMLButtonElement>(".activity-actions > .primary")!;
      expect(article.querySelector("h1")?.textContent).toBe(audio[node.response].meaning);
      expect(article.querySelector('[lang="en"]')).toBeNull();
      expect(mocks.play).not.toHaveBeenCalled();
      await click(article.querySelector('[aria-label="Ouvir modelo em inglês"]')); await completeAudio();
      expect(container.querySelector(".response-cue")).toBe(article);
      expect(container.querySelector(".activity-actions > .primary")).toBe(next);
      expect(article.querySelector("h1")?.textContent).toBe(audio[node.response].meaning);
      expect(article.querySelector('[lang="en"]')).toBeNull();
      expect(saved().nodeId).toBe(id);
      expect(saved().evidence).toEqual(before.evidence);
      expect(saved().transcript).toEqual(before.transcript);
      await click(next);
      if (id === "p6.warn") {
        expect(saved().nodeId).toBe("p6.safe");
        expect(saved().evidence).toHaveLength(before.evidence.length + 1);
        expect(saved().journal.at(-1)?.type).toBe("SEND_RESPONSE");
      } else {
        expect(saved().nodeId).toBe(id); expect(saved().phase).toBe("build");
        expect(saved().evidence).toEqual(before.evidence);
      }
      expect(network).not.toHaveBeenCalled();
    });
  }
});

describe("Back crosses access markers rather than replaying an identical dialogue", () => {
  for (const profile of PROFILES) it(`preserves original BACK replay and skips duplicate UI cards in ${profile}`, () => {
    for (const id of ["p1.lucas", "p6.safe", "p7.work"]) {
      const node = catalog[id] as SceneNode, before = spokenScene(profile, node);
      const heard = transition(before, { at: id, type: "AUDIO_ACCESS", key: lucasKey(id), mode: "heard" });
      // The original event path is also exactly what persisted v8 journals used.
      const originalNext = transition(heard, { at: id, type: "NEXT" });
      const currentNext = transition(heard, { at: id, type: "CONTINUE_SCENE" });
      expect(currentNext, id).toEqual(originalNext);
      expect(transition(heard, { at: id, type: "BACK" }), id).toEqual(before);
      const back = transition(decodeSnapshot(encodeSnapshot(currentNext))!, { at: currentNext.nodeId, type: "BACK_SCENE" });
      expect(back.nodeId, id).toBe(id);
      const earlier = transition(back, { at: back.nodeId, type: "BACK_SCENE" });
      expect(earlier.nodeId, id).not.toBe(id);
      expect(earlier.journal.length, id).toBeLessThan(back.journal.length);
      expect(decodeSnapshot(encodeSnapshot(earlier)), id).toEqual(earlier);
    }
  });
});
