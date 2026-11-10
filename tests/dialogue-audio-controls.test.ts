// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CachedAudio } from "@/features/theory/TheoryExperience";
import { SpeakerLabel } from "@/features/demo/components/SpeakerLabel";
import { validatePublishedCatalog } from "@/server/speech/published";
import { speechIdentity, type SpeechParameters } from "@/server/speech/cache";
import { audio } from "@/features/demo/content/media";
let root: Root, container: HTMLDivElement;
beforeEach(() => { vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);container=document.createElement("div");document.body.append(container);root=createRoot(container); });
afterEach(async () => { await act(async () => root.unmount());container.remove();vi.unstubAllGlobals(); });
const keyA="a".repeat(64), keyB="b".repeat(64);
const url=(key:string)=>`https://test.public.blob.vercel-storage.com/speech-cache/v3/${key}.mp3`;
describe("two-speaker audio",()=>{
 it("identifies Lucas and the learner model visibly, without representing the model as a voice recording",async()=>{
   await act(async()=>root.render(createElement("div",null,createElement(SpeakerLabel,{role:"character"}),createElement(SpeakerLabel,{role:"you",model:true}))));
   expect(container.querySelector('[data-speaker="character"]')?.textContent).toContain("Lucas");
   expect(container.querySelector('[data-speaker="you"]')?.textContent).toContain("modelo da sua resposta");
 });
 it("slows the same native files and applies the chosen rate to newly mounted study clips",async()=>{
   const published={C21:{key:keyA,audioUrl:url(keyA)},U09:{key:keyB,audioUrl:url(keyB)}};
   await act(async()=>root.render(createElement(CachedAudio,{references:[{id:"C21",scope:"full"}],publishedAudio:published})));
   const first=container.querySelector("audio")!;expect(first.playbackRate).toBe(1);expect(first.preload).toBe("none");
   const select=container.querySelector("select")!;
   await act(async()=>{select.value="0.8";select.dispatchEvent(new Event("change",{bubbles:true}));});
   expect(first.playbackRate).toBe(0.8);expect(first.src).toBe(url(keyA));expect(first.preservesPitch).toBe(true);
   await act(async()=>root.render(createElement(CachedAudio,{references:[{id:"U09",scope:"full"}],publishedAudio:published})));
   const second=container.querySelector("audio")!;expect(second.playbackRate).toBe(0.8);expect(second.src).toBe(url(keyB));
   expect(second.getAttribute("aria-label")).toContain("sua resposta");expect(container.textContent).toContain("Você");
 });
 it("validates all50 role-specific keys, including identical words spoken by different people",()=>{
   const lucas:SpeechParameters={voiceId:"lucas",model:"eleven_multilingual_v2",format:"mp3_44100_128",speed:1,language:"en",stability:0.5,similarityBoost:0.75,processing:{tempo:0.78,version:"atempo-v1"}};
   const learner={...lucas,voiceId:"learner"};
   const input={schemaVersion:1,entries:Object.fromEntries(Object.values(audio).map(asset=>{const {key}=speechIdentity(asset.text,asset.role==="you"?learner:lucas);return [asset.id,{key,audioUrl:url(key)}];}))};
   const index=validatePublishedCatalog(input,lucas,learner);expect(Object.keys(index)).toHaveLength(50);expect(new Set(Object.values(index).map(e=>e!.key)).size).toBe(50);
   for(const [c,u] of [["C21","U09"],["C22","U14"],["C24","U13"],["C25","U04"]] as const)expect(index[c]).not.toEqual(index[u]);
 });
});
