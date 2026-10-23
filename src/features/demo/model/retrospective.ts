import type { AudioId, DemoState } from "./types";

export function ending(state: DemoState) {
  if (state.decisions["p10.contact"] === "contact") return "Vocês se despediram com a possibilidade de conversar novamente.";
  return state.decisions["p9.pause"] === "stay"
    ? "Vocês compartilharam mais um pouco do café e depois se despediram."
    : "Vocês se despediram depois de uma conversa agradável.";
}
export type Highlight = { before: AudioId; after: AudioId; beforeRole: "you" | "character"; description: string };
export function retrospective(state: DemoState): Highlight[] {
  const transformations: [AudioId[], AudioId, string][] = [
    [["C08", "C09"], "U09", "Você usou esta expressão em outro contexto."],
    [["U01"], "U05", "Você adaptou a resposta para reconhecer seu pedido."],
    [["C07"], "U12", "Você recombinou uma pergunta com uma peça nova: your job."],
    [["C07"], "U13", "Você recombinou uma pergunta com uma peça nova: this café."],
    [["U06", "C09", "C19", "C22"], "U17", "Você usou uma peça disponível para dizer que gosta daqui."],
  ];
  return transformations.flatMap(([sources, after, description]) => {
    const end = state.transcript.findIndex(line => line.audioId === after && line.role === "you");
    if (end < 0) return [];
    const before = state.transcript.slice(0, end).find(line => sources.includes(line.audioId));
    return before ? [{ before: before.audioId, beforeRole: before.role, after, description }] : [];
  });
}
