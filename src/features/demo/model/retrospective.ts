import type { AudioId, DemoState, Evidence, TranscriptLine } from "./types";

export function ending(state: DemoState) {
  if (state.decisions["p10.contact"] === "contact") return "Vocês se despediram com a possibilidade de conversar novamente.";
  return state.decisions["p9.pause"] === "stay"
    ? "Vocês compartilharam mais um pouco do café e depois se despediram."
    : "Vocês se despediram depois de uma conversa agradável.";
}
export type Highlight = {
  before: AudioId; after: AudioId; beforeRole: "you" | "character"; description: string;
  beforeWritten?: string; afterWritten?: string;
  beforeEvidenceKind: Evidence["kind"] | null; afterEvidenceKind: Evidence["kind"] | null;
};
function evidenceKind(state: DemoState, line: TranscriptLine): Evidence["kind"] | null {
  return line.role === "you"
    ? state.evidence.find(item => item.nodeId === line.nodeId && item.response === line.audioId)?.kind ?? null
    : null;
}
export function retrospective(state: DemoState): Highlight[] {
  const transformations: [AudioId[], AudioId, string][] = [
    [["C08", "C09"], "U09", "Você usou esta expressão em outro contexto."],
    [["U01"], "U05", "Você adaptou a resposta para reconhecer seu pedido."],
    [["C07"], "U12", "Você adaptou uma pergunta para falar de your job."],
    [["C07"], "U13", "Você adaptou uma pergunta para falar de this café."],
    [["U06", "C09", "C19", "C22"], "U17", "Você adaptou uma expressão para dizer que gosta daqui."],
  ];
  return transformations.flatMap(([sources, after, description]) => {
    const end = state.transcript.findIndex(line => line.audioId === after && line.role === "you");
    if (end < 0) return [];
    const reply = state.transcript[end];
    const before = state.transcript.slice(0, end).find(line => sources.includes(line.audioId));
    return before ? [{
      before: before.audioId, beforeRole: before.role, after, description,
      ...(before.written === undefined ? {} : { beforeWritten: before.written }),
      ...(reply.written === undefined ? {} : { afterWritten: reply.written }),
      beforeEvidenceKind: evidenceKind(state, before), afterEvidenceKind: evidenceKind(state, reply),
    }] : [];
  });
}
