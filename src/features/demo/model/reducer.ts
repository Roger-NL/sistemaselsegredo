import { catalog } from "../content/catalog";
import { presentationCards } from "../content/presentation";
import { acceptsAudioAccess, listeningTarget } from "./listening";
import { acceptsAnswer, practice, recognitionOptions, responsePhase } from "./practice";
import { PROFILES, REVIEW_VIEWS, SCHEMA_VERSION, STORY_VERSION, type DemoEvent, type DemoState, type SupportProfile } from "./types";

function enter(state: DemoState, nodeId: string): DemoState {
  const node = catalog[nodeId];
  const transcript = [...state.transcript];
  for (const audioId of node.heard ?? []) {
    const id = `${nodeId}:${audioId}`;
    if (!transcript.some(line => line.id === id)) transcript.push({ id, nodeId, audioId, part: node.part, role: "character" });
  }
  const entered = { ...state, activityProfile: state.profile, nodeId, transcript, presentationStep: 0, assemblyMistakes: 0, returnedBlocks: [], returnSerial: 0, selected: [], draft: "", recognized: null, assistedBlocks: false, notice: "", modelHidden: false };
  const phase = node.kind === "response" ? responsePhase(entered, node) : "scene";
  return { ...entered, phase };

}

export function createDemo(profile: SupportProfile, runId: string, startedAt: number): DemoState {
  return enter({ schemaVersion: SCHEMA_VERSION, storyVersion: STORY_VERSION, runId, startedAt,
    initialProfile: profile, profile, activityProfile: profile, nodeId: "p1.first", phase: "scene", presentationStep: 0, audioAccess: {}, assemblyMistakes: 0, returnedBlocks: [], returnSerial: 0, selected: [], draft: "", recognized: null, assistedBlocks: false, help: {}, checked: [],
    decisions: {}, transcript: [], evidence: [], journal: [], notice: "", reviewView: "end", modelHidden: false,
  }, "p1.first");
}

/** Rewind one screen advance, not one keystroke/piece/help click. The future is discarded. */
function previousStep(state: DemoState): DemoState {
  let cursor = createDemo(state.initialProfile, state.runId, state.startedAt);
  let previous: DemoState | null = null;
  for (const event of state.journal) {
    const next = replayEvent(cursor, event);
    if (next.nodeId !== cursor.nodeId || next.phase !== cursor.phase || next.reviewView !== cursor.reviewView || next.presentationStep !== cursor.presentationStep || next.audioAccess !== cursor.audioAccess) previous = cursor;
    cursor = next;
  }
  return previous ?? state;
}

/** Current user actions cannot invoke the retired test shortcut. */
export function transition(state: DemoState, event: DemoEvent): DemoState {
  if (event.type === "TEST_FORWARD") return state;
  return replayEvent(state, event);
}

/** Persisted journal replay only. Preserve legacy skips without inventing learner evidence. */
export function replayEvent(state: DemoState, event: DemoEvent): DemoState {
  if (event.at !== state.nodeId) return state;
  if (event.type === "BACK") return previousStep(state);
  const node = catalog[state.nodeId];
  const exercise = node.kind === "response" ? practice(node, state.assistedBlocks ? "some" : state.activityProfile) : null;
  const fail = (notice: string): DemoState => ({ ...state, notice,
    help: state.activityProfile === "beginner" ? { ...state.help, [node.id]: Math.max(1, state.help[node.id] ?? 0) } : state.help });
  const returnMistake = (returned: string[], prefix = state.selected): DemoState => {
    const third = state.assemblyMistakes + 1 >= 3;
    return { ...state, assemblyMistakes: third ? 0 : state.assemblyMistakes + 1,
      selected: third ? [] : prefix, returnedBlocks: third ? [...new Set([...state.selected, ...returned])] : returned,
      returnSerial: state.returnSerial + 1,
      notice: third ? "Montagem reiniciada. Tente novamente." : "Essa peça voltou às opções. Tente novamente." };
  };
  let next = state;
  switch (event.type) {
    // Retired navigation retained only to reconstruct saved attempts and Back.
    case "TEST_FORWARD": {
      const target = listeningTarget(state);
      if (target && !state.audioAccess[target.key]) {
        next = { ...state, audioAccess: { ...state.audioAccess, [target.key]: "text" } };
      } else if (state.presentationStep < presentationCards(node).length) {
        next = { ...state, presentationStep: state.presentationStep + 1 };
      } else if (node.kind === "choice") {
        const choice = node.choices[0];
        if (!choice) return state;
        next = enter({ ...state, decisions: { ...state.decisions, [node.id]: choice.id } }, choice.next);
      } else if (node.kind === "response" && ["present", "recall"].includes(state.phase)) {
        next = { ...state, phase: responsePhase(state, node, false) };
      } else if (node.kind !== "end") {
        next = enter(state, node.next);
      }
      break;
    }
    case "AUDIO_ACCESS":
      if (!["heard", "text"].includes(event.mode) || !acceptsAudioAccess(state, event.key) || state.audioAccess[event.key]) return state;
      next = { ...state, audioAccess: { ...state.audioAccess, [event.key]: event.mode } }; break;
    case "ADVANCE_PRESENTATION":
      if (listeningTarget(state) && !state.audioAccess[listeningTarget(state)!.key]) return state;
      if (state.presentationStep >= presentationCards(node).length) return state;
      next = { ...state, presentationStep: state.presentationStep + 1 }; break;
    case "TYPE":
      if (state.phase !== "write" || typeof event.text !== "string" || event.text.length > 240 || event.text === state.draft) return state;
      next = { ...state, draft: event.text, notice: "" }; break;
    case "RECOGNIZE":
      if (node.kind !== "response" || state.phase !== "select" || !recognitionOptions(node).includes(event.response) || event.response === state.recognized) return state;
      next = { ...state, recognized: event.response, notice: "" }; break;
    case "WRITE_AGAIN":
      if (state.phase !== "build" || !state.assistedBlocks) return state;
      next = { ...state, phase: "write", notice: "Sua escrita e as peças foram preservadas." }; break;
    case "USE_BLOCKS":
      if (node.kind !== "response" || state.phase !== "write") return state;
      next = { ...state, phase: "build", assistedBlocks: true, notice: "Escrita mantida." }; break;
    case "TOGGLE_MODEL":
      if (node.kind !== "response" || !["build", "write", "select"].includes(state.phase) || (state.help[node.id] ?? 0) !== node.help.length) return state;
      next = { ...state, modelHidden: !state.modelHidden }; break;
    case "REVIEW":
      if (node.kind !== "end" || !REVIEW_VIEWS.includes(event.view) || event.view === state.reviewView) return state;
      next = { ...state, reviewView: event.view }; break;
    case "PROFILE":
      if (!PROFILES.includes(event.profile) || event.profile === state.profile) return state;
      next = { ...state, profile: event.profile, notice: "A mudança de apoio vale a partir da próxima atividade. Sua tentativa atual foi preservada." }; break;
    case "NEXT":
      if (node.kind !== "scene") return state;
      next = enter(state, node.next); break;
    case "ANSWER_MEANING":
      if (node.kind !== "comprehension") return state;
      next = event.correct ? enter(state, node.next) : { ...state, notice: "Essa opção não corresponde à fala. Ouça novamente ou tente outra." }; break;
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
      next = { ...state, phase: responsePhase(state, node, false), selected: [], notice: "" }; break;
    // BLOCK/SUBMIT remain replayable for saved attempts from earlier versions.
    // The current UI places pieces through PLACE_BLOCK and SEND_RESPONSE.
    case "PLACE_BLOCK":
      if (node.kind !== "response" || state.phase !== "build" || !exercise?.blocks.some(b => b.id === event.block) || state.selected.includes(event.block)) return state;
      next = event.block === exercise.answer[state.selected.length]
        ? { ...state, selected: [...state.selected, event.block], returnedBlocks: [], notice: "" }
        : returnMistake([event.block]); break;
    case "RETURN_BLOCKS":
      if (state.phase !== "build" || !Number.isInteger(event.index) || event.index < 0 || event.index >= state.selected.length) return state;
      next = { ...state, selected: state.selected.slice(0, event.index), returnedBlocks: state.selected.slice(event.index), returnSerial: state.returnSerial + 1, notice: "" }; break;
    case "BLOCK":
      if (node.kind !== "response" || state.phase !== "build" || !exercise?.blocks.some(b => b.id === event.block) || state.selected.includes(event.block)) return state;
      next = { ...state, selected: [...state.selected, event.block], notice: "" }; break;
    case "REMOVE_BLOCK":
      if (state.phase !== "build" || !Number.isInteger(event.index) || event.index < 0 || event.index >= state.selected.length) return state;
      next = { ...state, selected: state.selected.filter((_, i) => i !== event.index), notice: "" }; break;
    case "CLEAR":
      if (state.phase !== "build" || !state.selected.length) return state;
      next = { ...state, selected: [], notice: "" }; break;
    case "CHECK":
      if (node.kind !== "response" || state.phase !== "recall") return state;
      next = { ...state, phase: responsePhase(state, node, false), checked: [...state.checked, node.id] }; break;
    case "REVEAL_MODEL":
      if (node.kind !== "response" || (state.help[node.id] === node.help.length && !state.modelHidden)) return state;
      next = { ...state, help: { ...state.help, [node.id]: node.help.length }, modelHidden: false };
      if (state.phase === "recall") next = { ...next, phase: responsePhase(state, node, false), checked: [...state.checked, node.id] };
      break;
    case "HELP": {
      const level = state.help[node.id] ?? 0;
      if (level >= node.help.length) return state;
      next = { ...state, help: { ...state.help, [node.id]: level + 1 } };
      // An explicitly requested complete model may reveal a recall response.
      if (node.kind === "response" && state.phase === "recall" && level + 1 === node.help.length) next = { ...next, phase: responsePhase(state, node, false), checked: [...state.checked, node.id] };
      break;
    }
    case "SEND_RESPONSE":
    case "USE_SUPPORT":
    case "SUBMIT": {
      if (node.kind !== "response" || state.phase === "present" || state.phase === "recall") return state;
      const supported = event.type === "USE_SUPPORT";
      if (supported && (state.help[node.id] ?? 0) < node.help.length) return state;
      if (!supported && state.phase === "build" && JSON.stringify(state.selected) !== JSON.stringify(exercise?.answer)) {
        const mismatch = state.selected.findIndex((id, i) => id !== exercise?.answer[i]);
        if (event.type === "SEND_RESPONSE") {
          next = returnMistake(mismatch < 0 ? [] : state.selected.slice(mismatch), mismatch < 0 ? state.selected : state.selected.slice(0, mismatch)); break;
        }
        next = fail(node.id === "p4.mine" && state.selected.includes("negative")
          ? "Esse trecho diz ‘não é’. Confira based no copo. Sua montagem foi mantida."
          : state.activityProfile === "some" ? `Confira a peça ${mismatch >= 0 ? mismatch + 1 : state.selected.length + 1} e o sentido da frase. Sua montagem foi mantida.`
          : `${node.help[0] ?? node.context} Sua montagem foi mantida; tente novamente.`); break;
      }
      if (!supported && state.phase === "write" && !acceptsAnswer(state.draft, node.response)) {
        if (event.type === "SEND_RESPONSE") { next = { ...state, notice: "Ainda não reconheci essa resposta. Revise ou consulte Ajuda." }; break; }
        next = fail("Ainda não reconheci essa formulação entre as respostas previstas para esta situação. Sua escrita foi mantida: revise ou consulte uma pista/modelo."); break;
      }
      if (!supported && state.phase === "select" && state.recognized !== node.response) {
        if (event.type === "SEND_RESPONSE") { next = { ...state, recognized: null, notice: "Tente outra opção." }; break; }
        next = fail(`${node.context} Escolha a expressão que combina com essa intenção.`); break;
      }
      const transcript = [...state.transcript, { id: `${node.id}:${node.response}`, nodeId: node.id, part: node.part, audioId: node.response, role: "you" as const, ...(!supported && state.phase === "write" ? { written: state.draft } : {}) }];
      next = enter({ ...state, transcript, evidence: [...state.evidence, {
        nodeId: node.id, response: node.response,
        kind: supported || (state.checked.includes(node.id) && state.activityProfile !== "less") || state.phase === "ready" || state.assistedBlocks || (state.help[node.id] ?? 0) === node.help.length ? "supported" : state.phase === "write" ? "written" : state.phase === "select" ? "recognized" : node.mode === "recombine" ? "recombined" : "blocks",
      }] }, node.next);
      break;
    }
  }
  return next === state ? state : { ...next, journal: [...state.journal, event] };
}
