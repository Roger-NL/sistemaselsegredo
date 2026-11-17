// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TutorialCaption, getTutorialCaptionLength } from "../src/features/first-encounters/TutorialCaption";
import { getTutorialStepAudio, TUTORIAL_STEPS } from "../src/features/first-encounters/tutorial-steps";
import { getTutorialHandPlan } from "../src/features/first-encounters/tutorial-hand-plans";
import type { LessonSpeechDriver, LessonSpeechFrame } from "../src/features/first-encounters/lesson-audio";
import timingJSON from "../src/features/first-encounters/tutorial-timing.json";
import type { TutorialClipTiming } from "../src/features/first-encounters/TutorialCaption";

let root: Root, container: HTMLDivElement;
function driver() {
  let frame: LessonSpeechFrame={playbackId:0,key:null,person:null,text:null,role:"narration",playing:false,time:0,duration:0,level:0,envelopeReady:false};
  const listeners=new Set<(frame:LessonSpeechFrame)=>void>();
  const speech:LessonSpeechDriver={getFrame:()=>frame,subscribeFrame:listener=>{listeners.add(listener);listener(frame);return()=>{listeners.delete(listener);};}};
  return {speech,emit:(next:Partial<LessonSpeechFrame>)=>{frame={...frame,...next};for(const notify of listeners)notify(frame);}};
}
beforeEach(()=>{vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);window.matchMedia=vi.fn().mockReturnValue({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()});container=document.createElement("div");document.body.append(container);root=createRoot(container);});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
const timings=timingJSON as Record<string,TutorialClipTiming>;
const read=()=>container.querySelector<HTMLElement>(".lo-tutorial-typed")!.textContent;

describe("one explanation per tutorial screen",()=>{
  it("keeps six useful screens and gives each visit one local guide utterance",()=>{
    expect(TUTORIAL_STEPS.map(step=>step.id)).toEqual(["welcome","repeat","drag","word-pieces","write-check","success"]);
    for(let index=0;index<TUTORIAL_STEPS.length;index++){
      const turn=getTutorialStepAudio(index);
      expect(turn.id).toBe(TUTORIAL_STEPS[index].audio);
      expect(turn.role).toBe("narration");
      expect(turn.person).toBe("nina");
      expect(turn.text.trim().length).toBeGreaterThan(8);
    }
  });
  it("keeps dragging attached to segure/arraste/solte and leaves practice to the learner",()=>{
    const timing=timings.drag,beat=getTutorialHandPlan("drag",timing)!.beats[0];
    const word=(text:string)=>timing.words.find(word=>word.word.toLowerCase().replace(/[^a-z]/g,"")===text)!;
    expect(beat.kind).toBe("drag");expect(beat.source).toBe("phrase");expect(beat.target).toBe("ana");
    expect(beat.start).toBeLessThanOrEqual(word("segure").start);expect(beat.travelStart).toBe(word("arraste").start);expect(beat.travelEnd).toBe(word("solte").start);
    expect(beat.end).toBeLessThanOrEqual(timing.duration);
    expect(getTutorialHandPlan("ana",timings.ana)).toBeNull();
  });
  it("never types future words during a recorded pause",()=>{
    const text="Pegue a fala.",timing={duration:2,words:[{word:"Pegue",start:0,end:.4},{word:"a",start:1,end:1.2},{word:"fala.",start:1.2,end:1.6}]};
    expect(text.slice(0,getTutorialCaptionLength(text,.7,2,timing))).toBe("Pegue");
    expect(getTutorialCaptionLength(text,2,2,timing)).toBe(text.length);
  });
  it("updates only the caption node with the real clock, keeps pause, and ignores a different clip",async()=>{
    const live=driver(),text="Primeiro, escute a Ana.",key="nina:"+text;let renders=0;
    function Parent(){renders++;return createElement(TutorialCaption,{speech:live.speech,text,clipKey:key,complete:false});}
    await act(async()=>root.render(createElement(Parent)));
    await act(async()=>live.emit({playing:true,key,duration:2,time:1}));const prefix=read();expect(prefix!.length).toBeGreaterThan(0);expect(prefix!.length).toBeLessThan(text.length);
    await act(async()=>live.emit({playing:false,time:1}));expect(read()).toBe(prefix);
    await act(async()=>live.emit({playing:true,key:"another clip",time:2}));expect(read()).toBe(prefix);expect(renders).toBe(1);
  });
  it("clears the old screen's caption while the next voice is pending or blocked",async()=>{
    const live=driver(),first="Primeiro, escute a Ana.";
    await act(async()=>root.render(createElement(TutorialCaption,{speech:live.speech,text:first,clipKey:"first",complete:false})));
    await act(async()=>live.emit({playing:true,key:"first",duration:2,time:1.5}));expect(read()!.length).toBeGreaterThan(0);
    await act(async()=>live.emit({playing:false,key:null}));
    await act(async()=>root.render(createElement(TutorialCaption,{speech:live.speech,text:"Agora, arraste a fala.",clipKey:"next",complete:false})));
    expect(read()).toBe("");
  });
  it("shows a complete static caption when reduced motion is requested",async()=>{
    window.matchMedia=vi.fn().mockReturnValue({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()});
    const live=driver(),text="Agora é com você.";
    await act(async()=>root.render(createElement(TutorialCaption,{speech:live.speech,text,clipKey:"practice",complete:false})));
    expect(read()).toBe(text);
  });
});
