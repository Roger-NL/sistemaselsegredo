import type { AudioId, ChoiceNode, DemoNode, ImageId, ResponseNode, SceneNode } from "../model/types";
import { audio } from "./media";

export function scene(id: string, part: number, image: ImageId, context: string, heard: AudioId[], next: string, button = "Continuar"): SceneNode {
  return { id, part, image, context, heard, next, button, kind: "scene", help: heard.map(id => `${audio[id].text} → ${audio[id].meaning}`) };
}
export function choice(id: string, part: number, image: ImageId, context: string, prompt: string, choices: ChoiceNode["choices"], heard: AudioId[] = []): ChoiceNode {
  return { id, part, image, context, prompt, choices, heard, kind: "choice", help: heard.map(id => `${audio[id].text} → ${audio[id].meaning}`) };
}
export function response(input: Omit<ResponseNode, "kind" | "help"> & { help?: string[] }): ResponseNode {
  const model = audio[input.response];
  return { ...input, kind: "response", help: input.help ?? (input.mode === "blocks" || input.mode === "recombine" ? [
    input.context, input.skeleton ?? `${input.blocks?.find(b => b.id === input.answer?.[0])?.text ?? ""} ___`,
    `${model.text} → ${model.meaning}`,
  ] : [`${model.text} → ${model.meaning}`]) };
}
export function assertCatalog(nodes: readonly DemoNode[]) {
  const ids = new Set(nodes.map(n => n.id));
  if (ids.size !== nodes.length) throw new Error("DUPLICATE_DEMO_NODE");
  for (const node of nodes) {
    const destinations = node.kind === "choice" ? node.choices.map(c => c.next) : "next" in node ? [node.next] : [];
    if (destinations.some(id => !ids.has(id))) throw new Error(`UNKNOWN_DEMO_DESTINATION:${node.id}`);
    if (node.heard?.some(id => !audio[id])) throw new Error(`UNKNOWN_AUDIO:${node.id}`);
    if (node.kind === "response") {
      if (!audio[node.response]) throw new Error(`UNKNOWN_RESPONSE:${node.id}`);
      const blocks = new Set(node.blocks?.map(b => b.id));
      if (blocks.size !== (node.blocks?.length ?? 0) || node.answer?.some(id => !blocks.has(id))) throw new Error(`INVALID_BLOCKS:${node.id}`);
    }
  }
}
