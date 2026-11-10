// @vitest-environment jsdom
import { act, createElement, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { catalog } from "@/features/demo/content/catalog";
import { audio } from "@/features/demo/content/media";
import { presentationCards } from "@/features/demo/content/presentation";
import { listeningTarget } from "@/features/demo/model/listening";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { PROFILES, type DemoState } from "@/features/demo/model/types";
import { advanceTestDemo } from "@/features/local-testing/progress";
import { decodeSnapshot, encodeSnapshot } from "@/features/demo/session/storage";
import { lessons } from "@/features/theory/content";
import { isCorrect } from "@/features/theory/progress";
import frozen from "./fixtures/reading-contracts.json";

const mocks = vi.hoisted(() => ({ remember: vi.fn<(state: DemoState, generation: number) => boolean>(() => true) }));
vi.mock("@/features/demo/session/browser", () => ({ remember: mocks.remember }));
// Remove the whole illustration, including its speech balloon, rather than
// passing an image description as a substitute for the text under test.
vi.mock("@/features/demo/components/SceneArtwork", () => ({ SceneArtwork: () => null }));
vi.mock("@/components/interaction/sounds", () => ({ playInteractionSound: vi.fn(), stopInteractionSounds: vi.fn() }));
import { DemoExperience } from "@/features/demo/DemoExperience";
import { StudyCard } from "@/features/theory/TheoryExperience";

let root: Root, container: HTMLElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); mocks.remember.mockClear();
  window.matchMedia = vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })) as unknown as typeof window.matchMedia;
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("requestAnimationFrame", () => 1); vi.stubGlobal("cancelAnimationFrame", vi.fn());
  window.scrollTo = vi.fn();
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Unexpected network request"); }));
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });
function parsed(state: DemoState) {
  const dom = document.createElement("div");
  dom.innerHTML = renderToStaticMarkup(createElement(DemoExperience, { initial: state }));
  return dom;
}
function visibleEnglish(dom: ParentNode, phrase: string) {
  const target = [...dom.querySelectorAll<HTMLElement>(".activity-content [lang=en]")].find(element => element.textContent === phrase);
  expect(target).toBeDefined();
  expect(target!.closest(".audio-sr-only,[hidden],[aria-hidden=true],details:not([open])")).toBeNull();
  expect(target!.style.display).not.toBe("none");
  return target!;
}

describe("meaning comes from English, without the illustration", () => {
  for (const profile of PROFILES) it(`${profile}: reads C01, interprets yours and then responds using explicit textual ownership`, async () => {
    const state = advanceTestDemo(createDemo(profile, `reading-${profile}`, 0), 11, { targetNode: "p2.question" });
    await act(async () => root.render(createElement(DemoExperience, { initial: state })));
    expect(container.querySelector("img,.scene-balloon")).toBeNull();
    visibleEnglish(container, "Is this yours?");
    expect(container.querySelector(".cup-clue,.speech .meaning")).toBeNull();
    const context = container.querySelector(".context")!.textContent!;
    expect(context).not.toMatch(/café é seu|bebida é sua|gesto|observe|nome/i);
    const options = [...container.querySelectorAll<HTMLButtonElement>(".activity-actions .choices button")];
    expect(options.map(button => button.textContent)).toEqual(["Se essa bebida é sua.", "Se essa bebida é dele.", "Qual bebida você pediu."]);
    await act(async () => options[1].click());
    expect(container.querySelector(".notice:not(:empty)")!.textContent).toMatch(/yours|Yours/);
    expect(container.querySelector(".notice:not(:empty)")!.textContent).not.toMatch(/nome|gesto|apont|desenh/i);
    const wrong = mocks.remember.mock.lastCall![0] as unknown as DemoState;
    expect(wrong.journal.at(-1)).toEqual({at:"p2.question",type:"ANSWER_MEANING",correct:false,option:"lucas"});
    expect(wrong.evidence).toEqual(state.evidence);
    await act(async () => options[0].click());
    expect(container.querySelector(".response-context")!.textContent).toContain("dele, não sua");
    const next = mocks.remember.mock.lastCall![0] as unknown as DemoState;
    expect(next.nodeId).toBe("p2.send"); expect(next.evidence).toEqual(state.evidence);
    expect(decodeSnapshot(encodeSnapshot(next))).toEqual(next);
    const own = advanceTestDemo(createDemo(profile, "own-cup", 0), 11, {targetNode:"p4.mine",choices:{"p3.intent":"okay"}});
    const activity = {...own,presentationStep:presentationCards(catalog[own.nodeId],own).length};
    expect(parsed(activity).querySelector(".response-context")!.textContent).toContain("sua bebida");
    expect(fetch).not.toHaveBeenCalled();
  });

  for (const profile of PROFILES) it(`${profile}: all Lucas dialogue remains readable in the panel before and after optional playback`, () => {
    let covered = 0;
    for (const node of Object.values(catalog)) {
      if (!node.heard?.length) continue;
      const initial = createDemo(profile, "dialogue-without-art", 0);
      const cards = presentationCards(node, initial);
      const dialogue = cards.findIndex(card => card.heard?.length);
      const state: DemoState = {...initial,nodeId:node.id,phase:node.kind === "response" ? "present" : "scene",presentationStep:dialogue < 0 ? cards.length : dialogue};
      const target = listeningTarget(state);
      if (target?.kind !== "lucas") continue;
      const phrase = target.audio.map(id => audio[id].text).join(" ");
      visibleEnglish(parsed(state), phrase);
      const heard = transition(state,{at:node.id,type:"AUDIO_ACCESS",key:target.key,mode:"heard"});
      visibleEnglish(parsed(heard), phrase); covered++;
    }
    expect(covered).toBeGreaterThan(20);
  });
});

describe("study reading and stable saved-course contracts", () => {
  it("keeps English learning material visible for all24 study steps with no images or media requests", async () => {
    const steps = lessons.flatMap(lesson => lesson.steps); expect(steps).toHaveLength(24);
    for (const step of steps) {
      await act(async () => root.render(createElement(StudyCard, {key:step.id,step,publishedAudio:{},onComplete:vi.fn(),onNext:vi.fn(),onAcknowledge:vi.fn(),headingRef:createRef<HTMLHeadingElement>()})));
      const quote = container.querySelector<HTMLElement>(".study-quote p[lang=en]")!;
      expect(quote.textContent).toBe(step.phrase.replace(/`/g,""));
      expect(quote.closest(".study-sr-only,.audio-sr-only,[hidden],[aria-hidden=true]")).toBeNull();
      expect(container.querySelector("img,picture")).toBeNull();
    }
    const question = steps.find(step => step.id === "this-yours")!.practice;
    expect(question.prompt).toContain("Is this yours?");
    expect(question.prompt).not.toMatch(/gesto|aponta|imagem/i);
    expect(isCorrect(question,"Se o copo é seu.")).toBe(true);
    expect(isCorrect(question,"Se você gosta do café.")).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("preserves every node, path, audio/evidence mode, v7/v8 card structure and study answer contract from the published baseline", () => {
    const nodes = Object.values(catalog).map(node => Object.fromEntries(
      ["id","kind","part","image","heard","next","response","mode","teach","blocks","answer","skeleton","presentation","button"]
        .filter(key => key in node).map(key => [key,(node as unknown as Record<string, unknown>)[key]])
        .concat([["helpCount",node.help.length]], "choices" in node ? [["choices",node.choices]] : []),
    ));
    expect(nodes).toEqual(frozen.nodes);
    for (const storyVersion of ["cafe-v7","cafe-v8"] as const) {
      const cards = Object.fromEntries(Object.values(catalog).map(node=>[node.id,presentationCards(node,{storyVersion,decisions:{}}).map(card=>({presentation:card.presentation,...(card.heard?{heard:card.heard}:{})}))]));
      expect(cards).toEqual(frozen.cards[storyVersion]);
    }
    const study = lessons.flatMap(lesson=>lesson.steps.map(step=>({id:step.id,mode:step.mode,phrase:step.phrase,meaning:step.meaning,storyAudio:step.storyAudio,
      practice:Object.fromEntries(["kind","optionLanguage","options","answer","answers","tokens","distractors","gaps","placement","context","instruction"].filter(key=>key in step.practice).map(key=>[key,step.practice[key as keyof typeof step.practice]])),
    })));
    expect(study).toEqual(frozen.study);
  });
});
