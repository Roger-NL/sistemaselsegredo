// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SiteViewport } from "@/components/core/SiteViewport";
import { visibleViewportRect } from "@/lib/ui/viewport";

let root: Root, container: HTMLElement;
let viewport: EventTarget & { width:number; height:number; offsetTop:number; offsetLeft:number };
let frames: Map<number, FrameRequestCallback>, serial: number;
let reveal: ReturnType<typeof vi.fn>;
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype,"scrollIntoView");
function flushFrames() { const queued = [...frames.values()]; frames.clear(); queued.forEach(callback => callback(0)); }
const value = (name: string) => document.documentElement.style.getPropertyValue(`--visible-${name}`);
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("innerWidth", 1366); vi.stubGlobal("innerHeight", 768);
  viewport = Object.assign(new EventTarget(), { width:1366, height:768, offsetTop:0, offsetLeft:0 });
  vi.stubGlobal("visualViewport", viewport);
  frames = new Map(); serial = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++serial, callback); return serial; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  reveal = vi.fn();
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Unexpected network request"); }));
  Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{configurable:true,value:reveal});
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals();
  if(originalScroll) Object.defineProperty(HTMLElement.prototype,"scrollIntoView",originalScroll);
  else Reflect.deleteProperty(HTMLElement.prototype,"scrollIntoView");
});
async function mount() { await act(async () => root.render(createElement(SiteViewport))); flushFrames(); }

describe("the visible rectangle shared by every route and popup", () => {
  it.each([
    [1366,768,1366,650,0],
    [390,844,390,365.9,96],
    [844,390,844,270,40],
  ])("follows bars, keyboards and panning at %i × %i without enlarging the viewport", async (width,height,visibleWidth,visibleHeight,top) => {
    vi.stubGlobal("innerWidth", width); vi.stubGlobal("innerHeight", height);
    Object.assign(viewport, { width, height, offsetTop:0 });
    await mount();
    Object.assign(viewport, { width:visibleWidth, height:visibleHeight, offsetTop:top });
    viewport.dispatchEvent(new Event("resize"));
    expect(value("height")).toBe(`${Math.floor(visibleHeight)}px`);
    expect(value("width")).toBe(`${visibleWidth}px`);
    expect(value("top")).toBe(`${top}px`);
    Object.assign(viewport, { width, height, offsetTop:0 });
    viewport.dispatchEvent(new Event("resize"));
    expect(value("height")).toBe(`${height}px`);
    expect(value("top")).toBe("0px");
  });

  it("updates pan offsets without fighting a user's scroll, and reveals an active field after keyboard resize", async () => {
    await mount();
    const input = document.createElement("input"); container.append(input); input.focus(); flushFrames(); reveal.mockClear();
    viewport.height = 360; viewport.offsetTop = 120;
    viewport.dispatchEvent(new Event("resize")); flushFrames();
    expect(reveal).toHaveBeenCalledOnce();
    expect(reveal).toHaveBeenCalledWith({ block:"nearest", inline:"nearest", behavior:"instant" });
    viewport.offsetTop = 150;
    viewport.dispatchEvent(new Event("scroll")); flushFrames();
    expect(value("top")).toBe("150px");
    expect(reveal).toHaveBeenCalledOnce();
  });

  it("supports browsers whose keyboard resizes the layout viewport and browsers without VisualViewport", async () => {
    vi.stubGlobal("visualViewport", undefined);
    await mount();
    vi.stubGlobal("innerWidth",390); vi.stubGlobal("innerHeight",330);
    window.dispatchEvent(new Event("resize"));
    expect(value("height")).toBe("330px"); expect(value("width")).toBe("390px"); expect(value("top")).toBe("0px");
    vi.stubGlobal("innerHeight",844); window.dispatchEvent(new Event("resize"));
    expect(value("height")).toBe("844px");
  });

  it("releases listeners, pending focus work and its CSS values on unmount", async () => {
    const remove = vi.spyOn(viewport,"removeEventListener");
    await mount(); viewport.dispatchEvent(new Event("resize"));
    await act(async () => root.unmount());
    expect(remove).toHaveBeenCalledWith("resize",expect.any(Function));
    expect(remove).toHaveBeenCalledWith("scroll",expect.any(Function));
    expect(frames.size).toBe(0);
    expect(value("height")).toBe("");
  });
});

it("rejects invalid offsets and keeps fixed dialogs inside the visible rectangle", () => {
  expect(visibleViewportRect({width:390,height:844},{width:390,height:360,offsetTop:900,offsetLeft:-20})).toEqual({width:390,height:360,top:484,left:0});
  expect(visibleViewportRect({width:390,height:844},{width:NaN,height:0,offsetTop:NaN,offsetLeft:Infinity})).toEqual({width:390,height:844,top:0,left:0});
});
