// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DemoEntry } from "@/features/demo/DemoEntry";

let root: Root, container: HTMLElement, width: number, visibleHeight: number;
let frames: Map<number, FrameRequestCallback>, serial: number, notices: (() => void)[];
let viewport: EventTarget;
const header = 64, back = 36, footer = 26, actions = 44, spacing = 22;
const readingHeights = () => width === 320 ? {comfortable:450,compact:340,tight:295} : {comfortable:390,compact:320,tight:270};
const grid = () => container.querySelector<HTMLElement>(".entry-grid")!;
const reading = () => container.querySelector<HTMLElement>(".entry-reading")!;
const artwork = () => parseFloat(grid().style.getPropertyValue("--entry-art-height")) || 160;
const gridHeight = () => visibleHeight - header - back - footer;
async function flush() {
  await act(async () => { await Promise.resolve(); });
  for (let guard=0; frames.size; guard++) {
    expect(guard).toBeLessThan(5); const work=[...frames.values()]; frames.clear();
    await act(async () => work.forEach(callback => callback(0)));
  }
}
async function notify() { notices.forEach(callback=>callback()); await flush(); }
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
  width=320;visibleHeight=568;frames=new Map();serial=0;notices=[];viewport=new EventTarget();
  vi.stubGlobal("visualViewport",viewport);
  vi.stubGlobal("requestAnimationFrame",(callback:FrameRequestCallback)=>{frames.set(++serial,callback);return serial;});
  vi.stubGlobal("cancelAnimationFrame",(id:number)=>frames.delete(id));
  vi.stubGlobal("ResizeObserver",class { constructor(notify:()=>void){notices.push(notify);} observe(){} disconnect(){} });
  vi.spyOn(HTMLElement.prototype,"clientWidth","get").mockImplementation(()=>width-32);
  vi.spyOn(HTMLElement.prototype,"clientHeight","get").mockImplementation(function(this:HTMLElement){
    if(this.matches(".entry-reading")) return gridHeight()-artwork()-actions-spacing;
    return gridHeight();
  });
  const natural = (element:HTMLElement)=>readingHeights()[element.closest<HTMLElement>(".entry-reading")?.dataset.fitDensity as keyof ReturnType<typeof readingHeights> || "comfortable"];
  vi.spyOn(HTMLElement.prototype,"offsetHeight","get").mockImplementation(function(this:HTMLElement){
    if(this.matches(".auto-fit-content")) return natural(this);
    if(this.matches(".entry-start-actions,button")) return actions;
    if(this.matches(".profile-option")) return 60;
    return 0;
  });
  vi.spyOn(HTMLElement.prototype,"scrollHeight","get").mockImplementation(function(this:HTMLElement){return this.matches(".auto-fit-content")?natural(this):0;});
  vi.spyOn(HTMLElement.prototype,"offsetWidth","get").mockImplementation(()=>width-44);
  vi.spyOn(HTMLElement.prototype,"scrollWidth","get").mockImplementation(()=>width-44);
  vi.spyOn(HTMLElement.prototype,"getClientRects").mockImplementation(function(this:HTMLElement){return (this.closest(".desktop-context")?[]:[{}]) as unknown as DOMRectList;});
  vi.spyOn(window,"getComputedStyle").mockImplementation((element:Element)=>({
    display:element.matches(".entry-grid")?"flex":"block",flexDirection:"column",rowGap:"8px",paddingTop:"4px",paddingBottom:"4px",
    marginTop:element.matches(".entry-start-actions")?"6px":"0px",marginBottom:"0px",
    fontSize:element.matches(".entry-details")?"12px":element.matches("small")?"13px":"16px",visibility:"visible",
  }) as CSSStyleDeclaration);
  container=document.createElement("div");document.body.append(container);root=createRoot(container);
});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
async function mount(){
  const start=vi.fn();
  await act(async()=>root.render(createElement("main",{className:"demo-shell"},
    createElement("header",null,"BasedSpeak"),createElement("nav",null,"Voltar ao estudo guiado"),
    createElement(DemoEntry,{onStart:start}),createElement("footer",null,"Privacidade · Termos"),
  )));await flush();await notify();return start;
}
describe("complete entry budget, using synthetic sizes including header/return/art/three choices/CTA/footer",()=>{
  it.each([[320,568],[390,600]])("%i × %i gives the three choices space before lending height to the image",async(w,h)=>{
    width=w;visibleHeight=h;const start=await mount();
    expect(container.querySelectorAll(".profile-option")).toHaveLength(3);
    expect(container.querySelector(".entry-art img")).not.toBeNull();
    expect(artwork()).toBeGreaterThanOrEqual(80);expect(artwork()).toBeLessThan(160);
    expect(Number(reading().style.getPropertyValue("--fit-scale"))).toBe(1);
    expect(reading().dataset.fitOverflow).toBe("false");
    const fitted=parseFloat(reading().style.getPropertyValue("--fit-height"));
    expect(header+back+footer+artwork()+actions+spacing+fitted).toBeLessThanOrEqual(visibleHeight);
    const selected=container.querySelector<HTMLInputElement>('input[value="some"]')!;
    await act(async()=>selected.click());expect(selected.checked).toBe(true);expect(start).not.toHaveBeenCalled();
    visibleHeight=844;viewport.dispatchEvent(new Event("resize"));await flush();await notify();
    expect(artwork()).toBe(160);expect(reading().dataset.fitDensity).toBe("comfortable");expect(selected.checked).toBe(true);
    await act(async()=>container.querySelector<HTMLButtonElement>(".entry-start-actions button")!.click());
    expect(start).toHaveBeenCalledExactlyOnceWith("some");
  });
});
