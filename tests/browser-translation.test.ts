// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { readFileSync } from "node:fs";
import type { WorkspaceState } from "@/features/dashboard/workspace-store";
const mocks=vi.hoisted(()=>({snapshot:{status:"empty",state:null},stage:vi.fn(),workspace:{status:"unauthenticated",generation:1,saving:false,error:"",notice:"",workspace:null,guestLearning:{revision:0,saveVersion:0,demoSnapshot:null,studySnapshot:null,demoPercent:0,studyCompleted:0,studyTotal:24,updatedAt:null}} as WorkspaceState}));
vi.mock("next/navigation",()=>({useRouter:()=>({push:vi.fn()})}));
vi.mock("@/features/dashboard/use-student-workspace",()=>({useStudentWorkspace:()=>mocks.workspace}));
vi.mock("@/features/dashboard/workspace-store",()=>({studentWorkspace:{stage:mocks.stage,flush:vi.fn(),beginEdit:vi.fn(),endEdit:vi.fn()}}));
vi.mock("@/features/demo/session/browser",()=>({subscribe:()=>()=>{},getBrowserSnapshot:()=>mocks.snapshot,getServerSnapshot:()=>mocks.snapshot}));
import { TheoryExperience } from "@/features/theory/TheoryExperience";
let root:Root,container:HTMLElement;
beforeEach(()=>{
  mocks.stage.mockReset().mockReturnValue(true);
  mocks.workspace.guestLearning!.studySnapshot=null;
  mocks.workspace.guestLearning!.studyCompleted=0;
  document.body.innerHTML='<div id="root"></div>';
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
  window.scrollTo=vi.fn();window.matchMedia=vi.fn(()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()})) as unknown as typeof window.matchMedia;
  container=document.getElementById("root")!;root=createRoot(container);
});
afterEach(async()=>{await act(async()=>root.unmount());vi.unstubAllGlobals();});
async function click(text:string){const button=[...container.querySelectorAll('button')].find(e=>e.textContent===text);expect(button,text).toBeDefined();await act(async()=>button!.click());}
// Google Translate replaces text nodes with nested FONT elements. No real
// translation is requested in unit tests; this reproduces its DOM mutation.
function translatorPass(target:Element){
  const walker=document.createTreeWalker(target,window.NodeFilter.SHOW_TEXT);const texts:Text[]=[];while(walker.nextNode())texts.push(walker.currentNode as Text);
  for(const text of texts){if(!text.data.trim()||text.parentElement?.closest('font,script,style,option'))continue;const outer=document.createElement('font'),inner=document.createElement('font');inner.textContent=text.data;outer.append(inner);text.replaceWith(outer);}
}
describe("native browser translation compatibility",()=>{
  it("keeps glossary counts current after a translator replaces the original text nodes",async()=>{
    await act(async()=>root.render(createElement(TheoryExperience,{publishedAudio:{}})));
    await click("Consultar as expressões");
    const oldCounterBoundary=container.querySelector('[role="status"].study-small [data-ui-text]')!;
    translatorPass(container);
    const search=container.querySelector<HTMLInputElement>('#phrase-search')!;
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value')!.set!;
    await act(async()=>{setter.call(search,'mine');search.dispatchEvent(new window.Event('input',{bubbles:true}));search.dispatchEvent(new window.Event('change',{bubbles:true}));});
    const count=container.querySelectorAll('.study-phrase-list details').length;
    expect(count).toBe(3);
    expect(oldCounterBoundary.isConnected).toBe(false);
    // A delayed translation of the old count must update only the detached
    // boundary, never replace the current search result count.
    oldCounterBoundary.textContent='45 translated expressions';
    expect(container.querySelector('[role="status"].study-small')?.textContent).toBe(`${count} falas`);
    await click("Voltar aos blocos");
    expect(container.querySelector('#phrase-search')).toBeNull();
    expect(container.textContent).toContain('Começar a descobrir');
  });
  it("lets translated teaching advance explicitly into an occasional practice and return without stale labels or DOM exceptions",async()=>{
    mocks.stage.mockImplementation((_key,raw)=>{
      mocks.workspace.guestLearning!.studySnapshot=raw;
      mocks.workspace.guestLearning!.studyCompleted=JSON.parse(raw).completed.length;
      return true;
    });
    await act(async()=>root.render(createElement(TheoryExperience,{publishedAudio:{}})));
    translatorPass(container);
    await click("Começar a descobrir");
    mocks.stage.mockClear();
    expect(container.querySelector('.study-reason p')?.textContent).toContain("yours");
    expect(container.querySelector('.study-examples')).not.toBeNull();
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('.study-reason')?.closest('details')).toBeNull();
    translatorPass(container);
    const details=container.querySelector<HTMLDetailsElement>('details.study-deeper')!;
    await act(async()=>details.querySelector('summary')!.click());
    expect(details.open).toBe(true);
    expect(mocks.stage).not.toHaveBeenCalled();
    translatorPass(details);
    await click("Entendi, continuar");
    expect(mocks.stage).toHaveBeenCalledTimes(1);
    expect(JSON.parse(mocks.stage.mock.calls[0][1])).toEqual({version:1,position:1,completed:['this-yours'],supported:[]});
    await act(async()=>root.render(createElement(TheoryExperience,{publishedAudio:{}})));
    expect(container.querySelector('.study-card h1')?.textContent).toBe("Meu, seu — sem repetir");
    translatorPass(container);
    await click("Praticar");
    expect(container.querySelector('.study-task-heading')).not.toBeNull();
    expect(container.querySelectorAll('input.study-gap')).toHaveLength(4);
    translatorPass(container);
    const help=container.querySelector<HTMLDetailsElement>('details.study-support')!;
    expect(help.open).toBe(false);
    await act(async()=>help.querySelector('summary')!.click());
    expect(help.open).toBe(true);
    expect(help.querySelector('.study-hint')?.textContent).not.toBe('');
    translatorPass(help);
    await click("Rever explicação");
    expect(container.querySelector('.study-quote [lang=en]')?.textContent).toBe("Oh! This is mine.");
    expect(container.querySelector('.study-card')?.getAttribute('data-phase')).toBe('learn');
    expect(container.querySelector('.study-task-heading')).toBeNull();
    expect(container.textContent).not.toContain("Sua resposta em inglês");
  });
  it("declares the source language and permits translation without injecting a translator or patching DOM prototypes",()=>{
    const layout=readFileSync('src/app/layout.tsx','utf8');
    expect(layout).toContain('lang="pt-BR" translate="yes"');
    expect(layout).not.toMatch(/notranslate|translate\.google|googtrans|Node\.prototype/);
  });
});
