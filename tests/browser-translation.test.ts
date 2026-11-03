// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { readFileSync } from "node:fs";
const mocks=vi.hoisted(()=>({snapshot:{status:"empty",state:null},workspace:{status:"unauthenticated",generation:1,saving:false,error:"",notice:"",workspace:null,guestLearning:{revision:0,demoSnapshot:null,studySnapshot:null,demoPercent:0,studyCompleted:0,studyTotal:24,updatedAt:null}}}));
vi.mock("next/navigation",()=>({useRouter:()=>({push:vi.fn()})}));
vi.mock("@/features/dashboard/use-student-workspace",()=>({useStudentWorkspace:()=>mocks.workspace}));
vi.mock("@/features/dashboard/workspace-store",()=>({studentWorkspace:{stage:vi.fn(),flush:vi.fn()}}));
vi.mock("@/features/demo/session/browser",()=>({subscribe:()=>()=>{},getBrowserSnapshot:()=>mocks.snapshot,getServerSnapshot:()=>mocks.snapshot}));
import { TheoryExperience } from "@/features/theory/TheoryExperience";
let root:Root,container:HTMLElement;
beforeEach(()=>{
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
    expect(container.querySelector('[role="status"].study-small')?.textContent).toBe(`${count} expressões`);
    await click("Voltar aos blocos");
    expect(container.querySelector('#phrase-search')).toBeNull();
    expect(container.textContent).toContain('Começar a descobrir');
  });
  it("lets a translated card change from explanation to activity and back without stale labels or DOM exceptions",async()=>{
    await act(async()=>root.render(createElement(TheoryExperience,{publishedAudio:{}})));
    translatorPass(container);
    await click("Começar a descobrir");
    translatorPass(container);
    await click("Experimentar");
    expect(container.querySelector('.study-practice-heading,form')).not.toBeNull();
    translatorPass(container);
    await click("Rever explicação");
    expect(container.textContent).toContain("Uma frase para explorar");
    expect(container.textContent).not.toContain("Sua resposta em inglês");
  });
  it("declares the source language and permits translation without injecting a translator or patching DOM prototypes",()=>{
    const layout=readFileSync('src/app/layout.tsx','utf8');
    expect(layout).toContain('lang="pt-BR" translate="yes"');
    expect(layout).not.toMatch(/notranslate|translate\.google|googtrans|Node\.prototype/);
  });
});
