import { catalog } from "../content/catalog";
import { expressionHistory } from "./history";
import { PROFILES, REVIEW_VIEWS, SCHEMA_VERSION, STORY_VERSION, type DemoEvent, type DemoState, type SupportProfile } from "./types";

function enter(state: DemoState, nodeId: string): DemoState {
  const node = catalog[nodeId];
  const transcript = [...state.transcript];
  for (const audioId of node.heard ?? []) {
    const id = `${nodeId}:${audioId}`;
    if (!transcript.some(line => line.id === id)) transcript.push({ id, nodeId, audioId, part: node.part, role: "character" });
  }
  const phase = node.kind !== "response" ? "scene" : node.teach ? "present"
    : node.mode === "blocks" || node.mode === "recombine" ? "build"
    : node.mode === "recall" && expressionHistory(state, node.response) !== "new" ? "recall" : "ready";
  return { ...state, nodeId, phase, transcript, selected: [], notice: "" };
}

export function createDemo(profile: SupportProfile, runId: string, startedAt: number): DemoState {
  return enter({ schemaVersion: SCHEMA_VERSION, storyVersion: STORY_VERSION, runId, startedAt,
    initialProfile: profile, profile, nodeId: "p1.first", phase: "scene", selected: [], help: {}, checked: [],
    decisions: {}, transcript: [], evidence: [], journal: [], notice: "", reviewView: "end",
  }, "p1.first");
}

/** Pure domain transitions. Stale/double-click events carry their originating node and are ignored. */
export function transition(state: DemoState, event: DemoEvent): DemoState {
  if (event.at !== state.nodeId) return state;
  const node = catalog[state.nodeId];
  let next = state;
  switch (event.type) {
    case "REVIEW":
      if (node.kind !== "end" || !REVIEW_VIEWS.includes(event.view) || event.view === state.reviewView) return state;
      next = { ...state, reviewView: event.view }; break;
    case "PROFILE":
      if (!PROFILES.includes(event.profile) || event.profile === state.profile) return state;
      next = { ...state, profile: event.profile }; break;
    case "NEXT":
      if (node.kind !== "scene") return state;
      next = enter(state, node.next); break;
    case "UNDERSTAND":
      if (node.kind !== "comprehension") return state;
      next = event.correct ? enter(state, node.next) : { ...state, help: { ...state.help, [node.id]: 1 }, notice: "Volte às pistas: this aponta para o café; yours relaciona o copo a você. Tente de novo, sem pressa." }; break;
    case "CHOOSE": {
      if (node.kind !== "choice") return state;
      const selected = node.choices.find(choice => choice.id === event.choice);
      if (!selected) return state;
      next = enter({ ...state, decisions: { ...state.decisions, [node.id]: selected.id } }, selected.next); break;
    }
    case "PREPARE":
      if (node.kind !== "response" || state.phase !== "present") return state;
      next = { ...state, phase: "build", selected: [], notice: "" }; break;
    case "BLOCK":
      if (node.kind !== "response" || state.phase !== "build" || !node.blocks?.some(b => b.id === event.block) || state.selected.includes(event.block)) return state;
      next = { ...state, selected: [...state.selected, event.block], notice: "" }; break;
    case "REMOVE_BLOCK":
      if (state.phase !== "build" || !Number.isInteger(event.index) || event.index < 0 || event.index >= state.selected.length) return state;
      next = { ...state, selected: state.selected.filter((_, i) => i !== event.index), notice: "" }; break;
    case "CLEAR":
      if (state.phase !== "build" || !state.selected.length) return state;
      next = { ...state, selected: [], notice: "" }; break;
    case "CHECK":
      if (node.kind !== "response" || state.phase !== "recall") return state;
      next = { ...state, phase: "ready", checked: [...state.checked, node.id] }; break;
    case "HELP": {
      const level = state.help[node.id] ?? 0;
      if (level >= node.help.length) return state;
      next = { ...state, help: { ...state.help, [node.id]: level + 1 } };
      // An explicitly requested complete model may reveal a recall response.
      if (node.kind === "response" && state.phase === "recall" && level + 1 === node.help.length) next = { ...next, phase: "ready", checked: [...state.checked, node.id] };
      break;
    }
    case "USE_SUPPORT":
    case "SUBMIT": {
      if (node.kind !== "response" || state.phase === "present" || state.phase === "recall") return state;
      const supported = event.type === "USE_SUPPORT";
      if (supported && (state.help[node.id] ?? 0) < node.help.length) return state;
      if (!supported && state.phase === "build" && JSON.stringify(state.selected) !== JSON.stringify(node.answer)) {
        next = { ...state, notice: node.id === "p4.mine" && state.selected.includes("negative")
          ? "Esse trecho diz ‘não é’. Confira #24 no pedido e no copo. Sua montagem foi mantida."
          : "Confira o sentido e a ordem dos blocos. Sua montagem foi mantida; você pode ajustar ou pedir ajuda." }; break;
      }
      if (node.preparationOnly) { next = enter(state, node.next); break; }
      const transcript = [...state.transcript, { id: `${node.id}:${node.response}`, nodeId: node.id, part: node.part, audioId: node.response, role: "you" as const }];
      next = enter({ ...state, transcript, evidence: [...state.evidence, {
        nodeId: node.id, response: node.response,
        kind: supported || state.checked.includes(node.id) || state.phase === "ready" ? "supported" : node.mode === "recombine" ? "recombined" : "blocks",
      }] }, node.next);
      break;
    }
  }
  return next === state ? state : { ...next, journal: [...state.journal, event] };
}
