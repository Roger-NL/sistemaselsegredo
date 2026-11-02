import { catalog, nodes } from "@/features/demo/content/catalog";
import { advanceTestDemo } from "@/features/local-testing/progress";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { decodeSnapshot, encodeSnapshot } from "@/features/demo/session/storage";
import { decodeProgress, emptyProgress, studySteps } from "@/features/theory/progress";
import type { LearningProgress } from "@/contracts/workspace";
import type { SupportProfile, DemoState, ReviewView } from "@/features/demo/model/types";
export const testActions = ["reset-all", "reset-real", "reset-presentation", "complete-presentation", "reset-demo", "start-demo", "back", "forward", "next-part", "jump-part", "jump-node", "complete-part", "complete-demo", "complete-all", "profile", "review", "reset-study", "study-position", "study-complete", "study-uncomplete", "complete-study"] as const;
export type TestAction = { action: typeof testActions[number]; profile?: SupportProfile; part?: number; node?: string; step?: number; view?: ReviewView };
/** Rebuild a coherent prefix, including choices needed to reach an alternate branch. */
function route(target: string, profile: SupportProfile): DemoState {
  function path(id: string, seen = new Set<string>()): Record<string,string> | null {
    if (id === target) return {};
    if (seen.has(id)) return null;
    const node = catalog[id]; if (!node || node.kind === "end") return null;
    const nextSeen = new Set([...seen, id]);
    for (const edge of node.kind === "choice" ? node.choices : [{ id:"", next:node.next }]) {
      const found = path(edge.next, nextSeen);
      if (found) return node.kind === "choice" ? { ...found, [id]:edge.id } : found;
    }
    return null;
  }
  const choices = path("p1.first");
  if (!choices) throw new Error("Este momento não possui um caminho válido.");
  const result = advanceTestDemo(createDemo(profile, crypto.randomUUID(), Date.now()), 11, { targetNode:target, choices });
  if (result.nodeId !== target) throw new Error("Esse momento é omitido pelas decisões deste caminho. Escolha outro momento.");
  return result;
}
export function applyTestAction(previous: LearningProgress, input: TestAction): LearningProgress {
  const next = { ...previous, testMode: input.action !== "reset-real" };
  const saved = previous.demoSnapshot ? decodeSnapshot(previous.demoSnapshot) : null;
  const profile = input.profile ?? saved?.profile ?? "beginner";
  let state = saved ?? createDemo(profile, crypto.randomUUID(), Date.now());
  const partNode = nodes.find(node => node.part === input.part)?.id;
  if (["reset-all","reset-real"].includes(input.action)) return { ...next, demoSnapshot:null, studySnapshot:null, demoPercent:0, studyCompleted:0 };
  if (["reset-presentation","complete-presentation"].includes(input.action)) return next;
  if (input.action === "reset-demo") return { ...next, demoSnapshot:null, demoPercent:0 };
  if (input.action === "reset-study") return { ...next, studySnapshot:null, studyCompleted:0 };
  if (input.action.startsWith("study-") || ["complete-study","complete-all"].includes(input.action)) {
    let progress = decodeProgress(previous.studySnapshot);
    if (input.action === "complete-study" || input.action === "complete-all") progress = { ...emptyProgress, position:studySteps.length-1, completed:studySteps.map(s=>s.step.id), supported:studySteps.map(s=>s.step.id) };
    else {
      const index = input.step!; const id = studySteps[index].step.id;
      progress = { ...progress, position:index };
      if (input.action === "study-complete") progress = { ...progress, completed:[...new Set([...progress.completed,id])], supported:[...new Set([...progress.supported,id])] };
      if (input.action === "study-uncomplete") progress = { ...progress, completed:progress.completed.filter(s=>s!==id), supported:progress.supported.filter(s=>s!==id) };
    }
    next.studySnapshot = JSON.stringify(progress); next.studyCompleted = progress.completed.length;
    if (input.action !== "complete-all") return next;
  }
  switch (input.action) {
    case "start-demo": state = createDemo(profile,crypto.randomUUID(),Date.now()); break;
    case "jump-part": state = route(partNode!,profile); break;
    case "jump-node": state = route(input.node!,profile); break;
    case "complete-part": state = advanceTestDemo(route(partNode!,profile),input.part!+1); break;
    case "back": state = transition(state,{at:state.nodeId,type:"BACK"}); break;
    case "forward": state = advanceTestDemo(state,11,{oneNode:true}); break;
    case "next-part": state = advanceTestDemo(state,catalog[state.nodeId].part+1); break;
    case "complete-all": case "complete-demo": state = advanceTestDemo(state); break;
    case "profile": state = transition(state,{at:state.nodeId,type:"PROFILE",profile}); break;
    case "review": state = advanceTestDemo(state); state = transition(state,{at:state.nodeId,type:"REVIEW",view:input.view!}); break;
  }
  next.demoSnapshot = encodeSnapshot(state);
  return next;
}
