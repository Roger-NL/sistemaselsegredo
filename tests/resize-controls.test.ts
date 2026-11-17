// @vitest-environment jsdom
import { act, createElement, Fragment } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({ login:vi.fn(), replace:vi.fn(), refresh:vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({replace:auth.replace,refresh:auth.refresh}) }));
vi.mock("@/client/auth/service", () => ({login:auth.login,register:vi.fn(),loginWithGoogle:vi.fn(),resetPassword:vi.fn()}));
import { SiteViewport } from "@/components/core/SiteViewport";
import { LessonConclusion } from "@/features/first-encounters/LessonConclusion";
import { CONCLUSION_QUESTIONS, LESSON_CONCLUSION_STORAGE, conclusionModel, createConclusionState, setConclusionDraft, submitConclusionAnswer } from "@/features/first-encounters/lesson-conclusion";
vi.mock("@/features/first-encounters/useLessonSounds", () => ({ useLessonSounds: () => ({ play: vi.fn() }) }));
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
  it("keeps the new lesson's native submit outside the writing field without sending on resize", async () => {
    let saved = createConclusionState();
    for (const question of CONCLUSION_QUESTIONS.slice(0, 4)) saved = submitConclusionAnswer(setConclusionDraft(saved, question, conclusionModel(question)), question);
    saved = setConclusionDraft(saved, CONCLUSION_QUESTIONS[4], "I'm Ana.");
    localStorage.setItem(LESSON_CONCLUSION_STORAGE, JSON.stringify({ ...saved, phase: "test", questionIndex: 4, testStarted: true }));
    await act(async () => root.render(createElement(Fragment, null, createElement(SiteViewport), createElement(LessonConclusion, { onReturnToPractice: vi.fn(), onRestartPractice: vi.fn() }))));
    const button = container.querySelector<HTMLButtonElement>('.lc-footer button[type="submit"]')!;
    const input = container.querySelector<HTMLInputElement>('#lc-written-answer')!;
    expect(button.form).toBe(container.querySelector('form')); expect(button.closest('form')).toBeNull();
    for (const height of [650, 360, 844]) { viewport.height = height; viewport.dispatchEvent(new Event("resize")); }
    expect(input.value).toBe("I'm Ana.");
    expect(JSON.parse(localStorage.getItem(LESSON_CONCLUSION_STORAGE)!).attempts['write-self'].firstAnswer).toBeNull();
    await act(async () => button.click());
    expect(JSON.parse(localStorage.getItem(LESSON_CONCLUSION_STORAGE)!).attempts['write-self'].firstAnswer).toBe("I'm Ana.");
    localStorage.removeItem(LESSON_CONCLUSION_STORAGE);
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
