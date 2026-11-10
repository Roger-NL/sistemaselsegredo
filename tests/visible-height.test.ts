// @vitest-environment jsdom
import { act, createElement, useRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { useVisibleHeight } from "@/components/core/use-visible-height";

function Probe() {
  const ref = useRef<HTMLElement>(null);
  useVisibleHeight(ref,"--study-height");
  // createElement forwards the ref to a host element; it never reads .current.
  // eslint-disable-next-line react-hooks/refs
  return createElement("main",{ref});
}
afterEach(()=>vi.unstubAllGlobals());
it("tracks browser chrome and keyboard height, and removes listeners on unmount",async()=>{
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
  vi.stubGlobal("innerHeight",844);
  const viewport=Object.assign(new EventTarget(),{height:844.7});
  vi.stubGlobal("visualViewport",viewport);
  const remove=vi.spyOn(viewport,"removeEventListener");
  const container=document.createElement("div");
  document.body.append(container);
  const root=createRoot(container);
  await act(async()=>root.render(createElement(Probe)));
  const frame=container.querySelector("main")!;
  expect(frame.style.getPropertyValue("--study-height")).toBe("844px");
  viewport.height=365.9;
  viewport.dispatchEvent(new Event("resize"));
  expect(frame.style.getPropertyValue("--study-height")).toBe("365px");
  viewport.height=1000;
  window.dispatchEvent(new Event("resize"));
  expect(frame.style.getPropertyValue("--study-height")).toBe("844px");
  await act(async()=>root.unmount());
  expect(frame.style.getPropertyValue("--study-height")).toBe("");
  expect(remove).toHaveBeenCalledWith("resize",expect.any(Function));
  container.remove();
});
