// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LESSON_SCENES, PERSON_NAMES, phraseText } from "../src/features/first-encounters/lesson-one";
import type { LessonSpeechDriver } from "../src/features/first-encounters/lesson-audio";

// Keep the real media controller and DnD. The dummy reports ready and observes
// the same imperative driver as Rive, without running WASM in a DOM test.
vi.mock("next/dynamic", async () => {
  const { useEffect, useRef } = await import("react");
  return { default: () => function Character({ person, speech, onReady }: { person:string; speech?:LessonSpeechDriver; onReady?:()=>void }) {
    const ref=useRef<HTMLSpanElement>(null);
    useEffect(()=>{onReady?.();},[onReady]);
    useEffect(()=>speech?.subscribeFrame(frame=>{
      ref.current?.setAttribute("data-dummy-speaking",String(frame.playing&&frame.role==="character"&&frame.person===person));
    }),[speech,person]);
    return createElement("span",{ref,"data-character-dummy":person,"data-dummy-speaking":"false"});
  } };
});
// These suites exercise lesson interactions with isolated browser storage.
// Account ownership and synchronization are covered by lesson-account-storage.test.ts.
vi.mock("../src/features/first-encounters/useLessonAccountProgress", () => ({
  useLessonAccountProgress: () => ({ ready: true, storage: window.localStorage, scopeKey: "isolated-lesson", saving: false, error: "", notice: "", refresh: () => {}, reset: async () => {} }),
}));

import { LessonOne } from "../src/features/first-encounters/LessonOne";
import { LESSON_TUTORIAL_STORAGE } from "../src/features/first-encounters/LessonTutorial";

class Media extends EventTarget {
  static instances:Media[]=[];
  static calls:string[]=[];
  static current:Media|null=null;
  static behavior:"ok"|"blocked"|"pending"="ok";
  static failURL:string|null=null;
  src:string;preload="";currentTime=0;duration=1.1;paused=true;ended=false;
  resolve:(()=>void)|null=null;
  constructor(url:string){super();this.src=url;Media.instances.push(this);}
  play=vi.fn(async()=>{
    Media.current=this;
    Media.calls.push(this.src);
    const behavior=Media.behavior;Media.behavior="ok";
    if(behavior==="blocked")throw new DOMException("gesture required","NotAllowedError");
    if(Media.failURL===this.src){Media.failURL=null;throw Error("network");}
    if(behavior==="pending")await new Promise<void>(resolve=>{this.resolve=resolve;});
    this.paused=false;this.ended=false;this.dispatchEvent(new Event("playing"));
  });
  pause=vi.fn(()=>{this.paused=true;this.dispatchEvent(new Event("pause"));});
  load=vi.fn();
  end(){this.currentTime=this.duration;this.ended=true;this.paused=true;this.dispatchEvent(new Event("pause"));this.dispatchEvent(new Event("ended"));}
}
let root:Root,container:HTMLDivElement,frames:Map<number,FrameRequestCallback>,serial:number;
const STORAGE="basedspeak.lesson-one.v2",all=LESSON_SCENES.flatMap(scene=>scene.rounds);
beforeEach(()=>{
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);vi.stubGlobal("Audio",Media);
  Media.instances=[];Media.calls=[];Media.current=null;Media.behavior="ok";Media.failURL=null;
  frames=new Map();serial=0;
  vi.stubGlobal("requestAnimationFrame",(callback:FrameRequestCallback)=>{frames.set(++serial,callback);return serial;});
  vi.stubGlobal("cancelAnimationFrame",(id:number)=>frames.delete(id));
  window.matchMedia=vi.fn().mockReturnValue({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()});
  Object.defineProperty(HTMLDialogElement.prototype,"showModal",{configurable:true,value:function(this:HTMLDialogElement){this.open=true;}});
  Object.defineProperty(HTMLDialogElement.prototype,"close",{configurable:true,value:function(this:HTMLDialogElement){this.open=false;this.dispatchEvent(new Event("close"));}});
  localStorage.clear(); localStorage.setItem("basedspeak.lesson-one.introduction.v1","done");localStorage.setItem("basedspeak.lesson-one.mechanics.v1",JSON.stringify({version:1,seen:["bubbles","join","speaker","verb","build","messages","ensemble","write"]}));
  container=document.createElement("div");document.body.append(container);root=createRoot(container);
});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();localStorage.clear();vi.restoreAllMocks();vi.unstubAllGlobals();});
async function flush(){await act(async()=>{const callbacks=[...frames.values()];frames.clear();for(const callback of callbacks)callback(performance.now());});}
async function settle(){await flush();await flush();await flush();}
async function mount(id="g1-self",tutorial=false){
  const scene=LESSON_SCENES.findIndex(scene=>scene.rounds.some(round=>round.id===id)),round=LESSON_SCENES[scene].rounds.findIndex(round=>round.id===id);
  localStorage.setItem(STORAGE,JSON.stringify({version:2,scene,round,completed:all.slice(0,all.findIndex(round=>round.id===id)).map(round=>round.id),supported:[]}));
  if(!tutorial)localStorage.setItem(LESSON_TUTORIAL_STORAGE,"done");
  await act(async()=>root.render(createElement(LessonOne)));await settle();
}
function byText(text:string,scope:ParentNode=container){const found=[...scope.querySelectorAll<HTMLButtonElement>("button")].find(button=>button.textContent?.trim()===text);expect(found,text).toBeTruthy();return found!;}
function source(label:string,scope:ParentNode=container){const found=[...scope.querySelectorAll<HTMLButtonElement>("[data-lesson-drag-source]")].find(button=>button.getAttribute("aria-label")===label);expect(found,label).toBeTruthy();return found!;}
function target(id:string,scope:ParentNode=container){const found=[...scope.querySelectorAll<HTMLElement>("[data-lesson-drop]")].find(element=>element.dataset.lessonDrop===id);expect(found,id).toBeTruthy();return found!;}
async function click(element:HTMLElement){await act(async()=>element.click());await settle();}
async function place(text:string,id:string){await click(source(text));await click(target(id));}
function last(){return Media.current!;}
async function ended(media=last()){await act(async()=>media.end());await settle();}
function main(){return container.querySelector<HTMLButtonElement>("[data-audio-main]")!;}
function footer(){return container.querySelector<HTMLButtonElement>(".lo-footer .lo-next")!;}
function speaking(scope:ParentNode=container){return [...scope.querySelectorAll<HTMLElement>('[data-dummy-speaking="true"]')].map(el=>el.dataset.characterDummy);}
function current(){return container.querySelector<HTMLElement>(".lo-app")!.dataset.round;}

describe("guided start, automatic turns and learner control",()=>{
  it.each(all)("makes the announced action available before grading $id",async round=>{
    await mount(round.id);const stage=container.querySelector<HTMLElement>(".lo-learning")!;
    expect(stage.querySelector(".lo-scene-guide p")?.textContent?.trim().length).toBeGreaterThan(10);
    const enabledTarget=(id:string)=>expect(target(id,stage).dataset.dropDisabled,id).toBe("false");
    const enabledSource=(label:string)=>expect(source(label,stage).disabled,label).toBe(false);
    if(round.kind==="speaker"){
      for(const person of round.candidateSpeakers??[])expect(stage.querySelector<HTMLButtonElement>(`[data-person="${person}"]`)?.disabled).toBe(false);
    }else if(round.kind==="join"){
      enabledTarget("team");for(const person of round.candidateSpeakers??[])enabledSource(PERSON_NAMES[person]);
    }else if(round.kind==="messages"){
      for(const person of round.candidateSpeakers??[])enabledSource(PERSON_NAMES[person]);enabledTarget("message:0");enabledTarget("message:1");
    }else if(round.kind==="ensemble"){
      for(const phrase of round.bubbleChoices??[])enabledSource(phraseText(phrase));for(let index=0;index<4;index++)enabledTarget(`turn:${index}`);
    }else if(round.kind==="bubbles"){
      for(const phrase of round.bubbleChoices??[])enabledSource(phraseText(phrase));enabledTarget(`person:${round.speaker}`);enabledTarget("speech");
    }else{
      enabledSource("am");enabledSource("are");enabledTarget("word:verb");
      if(round.kind==="build"){for(const word of ["I","you","we","they"])enabledSource(word);enabledTarget("word:pronoun");}
    }
    expect(container.querySelector(".lo-feedback.is-correct")).toBeNull();
  });

  it("reads the selected option; speaks accepted actors once, with manual repeat and fresh retry visits",async()=>{
    await mount();expect(Media.calls).toEqual([]);
    await place("You are Ana.","speech");expect(Media.calls.at(-1)).toContain("nina-you-are-ana");await ended();expect(container.querySelector(".lo-feedback.is-retry")).not.toBeNull();
    await place("I am Ana.","speech");await ended();expect(Media.calls).toHaveLength(3);expect(speaking()).toEqual(["ana"]);
    await click(byText("Uma pista"));expect(Media.calls).toHaveLength(3);
    await act(async()=>root.render(createElement(LessonOne)));await settle();expect(Media.calls).toHaveLength(3);
    await click(main());expect(speaking()).toEqual([]);await click(main());expect(Media.calls).toHaveLength(4);expect(Media.instances).toHaveLength(3);
    await click(byText("Refazer"));expect(speaking()).toEqual([]);expect(footer().disabled).toBe(true);expect(Media.calls).toHaveLength(4);
    await place("I am Ana.","speech");await ended();expect(Media.calls).toHaveLength(6);
  });

  it("uses a neutral known prompt, handles browser blocking, then performs the valid selected speaker",async()=>{
    Media.behavior="blocked";await mount("g4-inside");
    expect(Media.calls).toHaveLength(1);expect(Media.calls[0]).toContain("nina-we-are-a-team");expect(speaking()).toEqual([]);
    await click(container.querySelector<HTMLButtonElement>('[aria-label="Ativar som"]')!);expect(Media.calls).toHaveLength(2);expect(speaking()).toEqual([]);
    await click(container.querySelector<HTMLButtonElement>('[data-person="maya"]')!);expect(Media.calls).toHaveLength(2);
    await click(container.querySelector<HTMLButtonElement>('[data-person="leo"]')!);expect(Media.calls).toHaveLength(3);
    expect(Media.calls[2]).toContain("leo-we-are-a-team");expect(speaking()).toEqual(["leo"]);
  });

  it("reads each selected verb, then performs the canonical accepted form",async()=>{
    await mount("g3-i");expect(Media.calls).toEqual([]);await place("are","word:verb");expect(Media.calls.at(-1)).toContain("nina-");await ended();
    await click(footer()); expect(Media.calls).toHaveLength(1); expect(speaking()).toEqual([]);
    await place("am", "word:verb");await ended(); await click(footer());
    expect(Media.calls).toHaveLength(3);expect(Media.calls[2]).toContain("ana-i-am-ana");expect(speaking()).toEqual(["ana"]);
    expect(container.querySelector(".ls-speech-bubble strong")?.textContent).toBe("I am Ana.");
  });

  it("reads anonymous messages sequentially without character mouths, then performs identified authors in order",async()=>{
    await mount("g5-messages");expect(Media.calls).toHaveLength(1);expect(speaking()).toEqual([]);
    expect(Media.calls[0]).toContain("nina-they-are-a-team");
    await ended();expect(Media.calls).toHaveLength(2);expect(Media.calls[1]).toContain("nina-we-are-a-team");expect(speaking()).toEqual([]);
    await ended();await place("Maya","message:0");await place("Ana","message:1");await click(footer());
    expect(Media.calls).toHaveLength(3);expect(Media.calls[2]).toContain("maya-they-are-a-team");expect(speaking()).toEqual(["maya"]);
    await ended();expect(Media.calls).toHaveLength(4);expect(Media.calls[3]).toContain("ana-we-are-a-team");expect(speaking()).toEqual(["ana"]);
    await ended();expect(speaking()).toEqual([]);expect(current()).toBe("g5-messages");
  });

  it("retries the failed second author instead of restarting the first message",async()=>{
    await mount("g5-messages");await ended();await ended();await place("Maya","message:0");await place("Ana","message:1");await click(footer());
    Media.failURL="/first-encounters/audio/lesson-one/ana-we-are-a-team.m4a";await ended();
    expect(speaking()).toEqual([]);expect(container.querySelector(".lo-audio-error")).not.toBeNull();
    await click(byText("Tentar novamente"));expect(Media.calls.at(-1)).toContain("ana-we-are-a-team");expect(speaking()).toEqual(["ana"]);
  });

  it("lets manual message repetition replace the remaining automatic queue without overlapping voices",async()=>{
    await mount("g5-messages");await ended();await ended();await place("Maya","message:0");await place("Ana","message:1");await click(footer());
    expect(speaking()).toEqual(["maya"]);
    await click(container.querySelectorAll<HTMLButtonElement>(".lo-message-audio")[1]);
    expect(Media.calls.at(-1)).toContain("ana-we-are-a-team");expect(speaking()).toEqual(["ana"]);
    expect(Media.instances.filter(media=>!media.paused)).toHaveLength(1);
    const calls=Media.calls.length;await ended();expect(Media.calls).toHaveLength(calls);expect(speaking()).toEqual([]);expect(current()).toBe("g5-messages");
  });

  it("finishes with identity/team inference and changes Nina from neutral reader to identified actor only after acceptance",async()=>{
    await mount("use6-they");expect(Media.calls).toHaveLength(1);expect(Media.calls[0]).toContain("nina-they-are-a-team");expect(speaking()).toEqual([]);
    expect(container.querySelector(".lo-word-bank,.lo-write-toggle")).toBeNull();
    await ended();expect(Media.calls.at(-1)).toContain("nina-i-am-nina");expect(speaking()).toEqual([]);await ended();
    await place("Nina","message:0");await place("Leo","message:1");await click(footer());
    expect(container.querySelector(".lo-feedback.is-retry")).not.toBeNull();expect(Media.calls).toHaveLength(2);expect(current()).toBe("use6-they");
    await place("Leo","message:0");await place("Nina","message:1");await click(footer());
    expect(container.querySelector(".lo-feedback.is-correct")).not.toBeNull();expect(Media.calls.at(-1)).toContain("leo-they-are-a-team");expect(speaking()).toEqual(["leo"]);
    await ended();expect(Media.calls.at(-1)).toContain("nina-i-am-nina");expect(speaking()).toEqual(["nina"]);
    expect(Media.instances.filter(media=>!media.paused)).toHaveLength(1);await ended();expect(speaking()).toEqual([]);expect(footer().disabled).toBe(false);
  });

  it.each([false,true])("keeps the Nina choice neutral, performs accepted Leo and cancels stale speech on Next, prompt repeated=%s",async repeatPrompt=>{
    await mount("g6-ensemble");expect(Media.calls).toHaveLength(1);expect(Media.calls[0]).toContain("nina-you-are-nina");expect(speaking()).toEqual([]);
    expect(container.querySelector(".lo-turns,.lo-ensemble-bank")).toBeNull();
    expect(container.querySelector('[data-person="ana"]')).toBeNull();
    if(repeatPrompt){await ended();await click(main());expect(Media.calls.at(-1)).toContain("nina-you-are-nina");expect(speaking()).toEqual([]);}
    const prompts=Media.calls.length;
    await click(container.querySelector<HTMLButtonElement>('[data-person="nina"]')!);
    expect(Media.calls).toHaveLength(prompts);expect(container.querySelector(".lo-feedback.is-retry")).not.toBeNull();expect(footer().disabled).toBe(true);
    await click(container.querySelector<HTMLButtonElement>('[data-person="leo"]')!);
    if (repeatPrompt) {
      expect(container.querySelector(".lo-feedback.is-correct")).not.toBeNull();
      expect(Media.calls).toHaveLength(prompts);
      await ended();
    }
    const accepted=last();expect(Media.calls).toHaveLength(prompts+1);expect(Media.calls.at(-1)).toContain("leo-you-are-nina");expect(speaking()).toEqual(["leo"]);
    expect(Media.instances.filter(media=>!media.paused)).toHaveLength(1);
    await click(main());expect(speaking()).toEqual([]);await click(main());expect(Media.calls).toHaveLength(prompts+2);expect(speaking()).toEqual(["leo"]);
    await click(footer());expect(current()).toBe("use6-i");expect(accepted.paused).toBe(true);expect(speaking()).toEqual([]);
    expect(Media.calls.at(-1)).toContain("nina-i-am-nina");const calls=Media.calls.length;
    await ended(accepted);expect(Media.calls).toHaveLength(calls);expect(current()).toBe("use6-i");
  });

  it("cancels a pending accepted request without reopening a mouth after Refazer",async()=>{
    await mount();Media.behavior="pending";await place("I am Ana.","speech");const pending=last();
    expect(speaking()).toEqual([]);await click(byText("Refazer"));
    await act(async()=>pending.resolve?.());await settle();expect(speaking()).toEqual([]);expect(pending.paused).toBe(true);
  });

  it("makes back/refazer/erase/restart concrete and stops old speech while preserving cancel",async()=>{
    await mount();await place("I am Ana.","speech");await click(footer());expect(current()).toBe("g1-listener");
    await click(byText("Voltar",container.querySelector(".lo-footer")!));expect(current()).toBe("g1-self");expect(footer().disabled).toBe(true);
    await click(byText("Digitar"));const input=container.querySelector<HTMLInputElement>('[aria-label="Sua fala em inglês"]')!;
    await act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")!.set!.call(input,"I am Ana.");input.dispatchEvent(new Event("input",{bubbles:true}));});
    expect(footer().disabled).toBe(false);await click(container.querySelector<HTMLButtonElement>('[aria-label="Apagar o que escrevi"]')!);expect(input.value).toBe("");expect(footer().disabled).toBe(true);
    const before=localStorage.getItem(STORAGE);await click(byText("Recomeçar do zero"));await click(byText("Manter meu avanço"));expect(localStorage.getItem(STORAGE)).toBe(before);
    await click(byText("Recomeçar do zero"));await click(byText("Recomeçar",container.querySelector(".lo-dialog[open]")!));
    expect(JSON.parse(localStorage.getItem(STORAGE)!).completed).toEqual([]);expect(current()).toBe("g1-self");expect(speaking()).toEqual([]);
  });
});
