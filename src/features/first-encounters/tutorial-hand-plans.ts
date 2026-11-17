import { getTutorialNarration, type TutorialNarrationId } from "./tutorial-script";
import type { TutorialHandPlan } from "./TutorialHand";
import type { TutorialClipTiming } from "./TutorialCaption";

const plain = (word: string) => word.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "");

/** Beat boundaries use the actual spoken words in each local recording. */
export function getTutorialHandPlan(id: TutorialNarrationId | "ana", timing?: TutorialClipTiming): TutorialHandPlan | null {
  if (id === "ana" || id === "welcome" || id === "your-turn") return null;
  const clip = getTutorialNarration(id), duration = timing?.duration ?? 3;
  const word = (name: string, fallback: number, occurrence = 0) => timing?.words.filter(item => plain(item.word) === name)[occurrence] ?? { start: fallback, end: fallback + .24 };
  if (id === "word-pieces") {
    const reset = word("refazer", 4.1);
    return { id, audioKey: clip.key, beats: [
      { id:"piece-I",kind:"drag",source:"word-I",target:"slot-I",text:"I",start:.1,travelStart:.3,travelEnd:.85,end:1.05 },
      { id:"piece-am",kind:"drag",source:"word-am",target:"slot-am",text:"am",start:1.1,travelStart:1.3,travelEnd:1.85,end:2.05 },
      { id:"reset-pieces",kind:"point",target:"refazer",start:Math.max(2.1,reset.start-.25),end:Math.min(duration-.02,reset.end+.12) },
    ] };
  }
  if (id === "write-check") {
    const write = word("escreva", .8), check = word("conferir", 2.08), erase = word("apagar", 4.94);
    return { id, audioKey: clip.key, beats: [
      { id:"write-here",kind:"point",target:"write-input",start:Math.max(0,write.start-.2),end:Math.min(check.start-.05,write.end+.9) },
      { id:"check-writing",kind:"tap",target:"conferir",start:check.start-.15,end:Math.min(duration,check.end+.25) },
      { id:"erase-writing",kind:"point",target:"apagar",start:erase.start-.2,end:Math.min(duration-.02,erase.end+.15) },
    ] };
  }
  if (id === "drag") {
    const hold = word("segure", .65), travel = word("arraste", 1.55), release = word("solte", 2.6);
    return { id, audioKey: clip.key, beats: [{ id: "drag-to-ana", kind: "drag", source: "phrase", target: "ana", text: "I am Ana.",
      start: Math.max(0, hold.start - .12), travelStart: travel.start, travelEnd: release.start,
      end: Math.min(duration - .02, release.end + .2), sourceLabel: "Pegue a fala", targetLabel: "Leve até a Ana" }] };
  }
  if (id === "click") {
    const first = word("clicar", 1.05), second = word("clicar", 2.55, 1);
    const firstCenter = (first.start + first.end) / 2, secondCenter = (second.start + second.end) / 2;
    const span = (secondCenter - firstCenter) / .63;
    return { id, audioKey: clip.key, beats: [{ id: "two-clicks", kind: "two-tap", source: "phrase", target: "ana", start: Math.max(0, firstCenter - span * .19), end: Math.min(duration - .02, firstCenter + span * .81), sourceLabel: "Clique na fala", targetLabel: "Depois, na Ana" }] };
  }
  const click = word("clique", id === "success" ? 1.6 : .8), center = (click.start + click.end) / 2;
  const half = Math.max(.12, Math.min(.5, center, duration - center - .03));
  return { id, audioKey: clip.key, beats: [{ id: `point-${id}`, kind: "tap", target: id === "repeat" ? "listen" : id === "success" ? "start" : "next", start: Math.max(0, center - half), end: Math.min(duration, center + half) }] };
}
