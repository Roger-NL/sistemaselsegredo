// @vitest-environment jsdom
import { act, createElement, Fragment } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({ login:vi.fn(), replace:vi.fn(), refresh:vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({replace:auth.replace,refresh:auth.refresh}) }));
vi.mock("@/client/auth/service", () => ({login:auth.login,register:vi.fn(),loginWithGoogle:vi.fn(),resetPassword:vi.fn()}));
import { SiteViewport } from "@/components/core/SiteViewport";
import { SceneFrame } from "@/features/demo/components/SceneFrame";
import { SignupForm } from "@/features/landing/SignupForm";

let root:Root, container:HTMLElement;
let viewport:EventTarget & {width:number;height:number;offsetTop:number;offsetLeft:number};
beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
  viewport=Object.assign(new EventTarget(),{width:390,height:844,offsetTop:0,offsetLeft:0});
  vi.stubGlobal("visualViewport",viewport);
  vi.stubGlobal("requestAnimationFrame",() => 1); vi.stubGlobal("cancelAnimationFrame",vi.fn());
  vi.stubGlobal("ResizeObserver",class { observe(){} disconnect(){} });
  window.matchMedia=vi.fn(() => ({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()})) as unknown as typeof window.matchMedia;
  vi.stubGlobal("fetch",vi.fn(() => {throw new Error("Unexpected network request");}));
  container=document.createElement("div");document.body.append(container);root=createRoot(container);
});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();vi.unstubAllGlobals();});

describe("controls remain separate from content that resizes or scrolls",()=>{
  it("keeps the demo's native form submission outside the scene, with no auto-send during resizing",async()=>{
    const submit=vi.fn();
    await act(async()=>root.render(createElement(Fragment,null,createElement(SiteViewport),
      // SceneFrame receives its scene body as the required children prop.
      // eslint-disable-next-line react/no-children-prop
      createElement(SceneFrame,{activityKey:"write",intro:null,artwork:createElement("aside",null,"Illustration"),
        actions:createElement("button",{type:"submit",form:"test-response"},"Enviar"),
        children:createElement("div",{className:"activity-body"},createElement("form",{id:"test-response",onSubmit:e=>{e.preventDefault();submit();}},createElement("input",{name:"response",defaultValue:"I'm learning English."}))),
      }))));
    const button=container.querySelector<HTMLButtonElement>("button")!;
    const input=container.querySelector<HTMLInputElement>("input")!;
    expect(button.closest(".scene-grid")).toBeNull();
    expect(button.closest(".scene-frame")).not.toBeNull();
    expect(button.form).toBe(container.querySelector("form"));
    for(const height of [650,360,844]){viewport.height=height;viewport.dispatchEvent(new Event("resize"));}
    expect(input.value).toBe("I'm learning English."); expect(submit).not.toHaveBeenCalled();
    await act(async()=>button.click());expect(submit).toHaveBeenCalledOnce();
  });

  it("keeps login submission outside scrolling fields, honoring validity and pending state",async()=>{
    let resolve!:(value:{success:boolean})=>void;
    auth.login.mockReturnValue(new Promise(done=>{resolve=done;}));
    await act(async()=>root.render(createElement(SignupForm,{initialMode:"login"})));
    const button=container.querySelector<HTMLButtonElement>(".signup-submit")!;
    const form=container.querySelector("form")!;
    expect(button.form).toBe(form);expect(button.closest(".signup-card-reading")).toBeNull();
    await act(async()=>button.click());expect(auth.login).not.toHaveBeenCalled();
    container.querySelector<HTMLInputElement>('[name="email"]')!.value="student@example.test";
    container.querySelector<HTMLInputElement>('[name="password"]')!.value="password-example";
    await act(async()=>button.click());
    expect(auth.login).toHaveBeenCalledExactlyOnceWith("student@example.test","password-example");
    expect(button.disabled).toBe(true);expect(container.querySelector("fieldset")?.disabled).toBe(true);
    await act(async()=>button.click());expect(auth.login).toHaveBeenCalledOnce();
    await act(async()=>resolve({success:true}));
    expect(auth.replace).toHaveBeenCalledExactlyOnceWith("/dashboard");expect(auth.refresh).toHaveBeenCalledOnce();
  });
});
