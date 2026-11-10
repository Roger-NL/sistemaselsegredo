import { audio } from "../content/media";
import { catalog } from "../content/catalog";
import { presentationCards } from "../content/presentation";
import { constructionView, practice } from "./practice";
import { listeningTarget } from "./listening";
import type { DemoEvent, DemoState } from "./types";

/** A scene caption and its instruction share one screen. Dialogue stays a separate turn. */
export function sceneReadingGroup(state: DemoState) {
  const cards = presentationCards(catalog[state.nodeId], state);
  let start = 0;
  while (start < cards.length) {
    let end = start + 1;
    if (cards[start].heard?.length) {
      if (cards[end]?.presentation === "prompt") end++;
    } else {
      while (end < cards.length && !cards[end].heard?.length) end++;
    }
    if (state.presentationStep < end) {
      const current = cards[state.presentationStep];
      return { start, end, card: { ...current,
        context: cards.slice(state.presentationStep, end).map(card => card.context).filter(Boolean).join("\n\n"),
        button: cards[end - 1].button,
      } };
    }
    start = end;
  }
  return null;
}

/** UI shortcuts expand to the original journal events, preserving saved v8 replays. */
export function continueSceneEvents(state: DemoState): DemoEvent[] {
  const node = catalog[state.nodeId];
  const target = listeningTarget(state);
  const group = sceneReadingGroup(state);
  const card = group?.card;
  const events: DemoEvent[] = [];
  if (target && !state.audioAccess[target.key]) events.push({ at: node.id, type: "AUDIO_ACCESS", key: target.key, mode: "text" });
  if (card) {
    for (let step = state.presentationStep; step < group!.end; step++) events.push({ at: node.id, type: "ADVANCE_PRESENTATION" });
    if (group!.end === presentationCards(node, state).length && node.kind === "response" && state.phase === "present") events.push({ at: node.id, type: "PREPARE" });
  } else if (node.kind === "response" && state.phase === "present") events.push({ at: node.id, type: "PREPARE" });
  else if (node.kind === "scene") events.push({ at: node.id, type: "NEXT" });
  return events;
}

export function sceneConversation(state: DemoState) {
  const node = catalog[state.nodeId];
  const card = presentationCards(node, state)[state.presentationStep];
  if (card && !card.heard?.length) return null;
  if (node.kind === "response" && !card) {
    const profile = state.assistedBlocks ? "some" : state.activityProfile;
    let composed = state.phase === "write" ? state.draft.trim()
      : state.phase === "select" && state.recognized ? audio[state.recognized].text : "";
    if (state.phase === "build") {
      const exercise = practice(node, profile);
      const view = constructionView(node, profile, state.selected);
      const chosen = view.selected.map(({ id }) => view.blocks.find(block => block.id === id)?.text ?? "").join(" ");
      // A given prefix is not a learner attempt. Once a missing word is chosen,
      // mirror the complete sentence around the gap, without repeating it.
      if (chosen) {
        if (view.kind === "completion") {
          const complete = state.selected.length === exercise.answer.length && state.selected.every((id, index) => id === exercise.answer[index]);
          const ending = view.after && !/^[,.!?;:]/.test(view.after) ? ` ${view.after}` : view.after;
          composed = complete ? audio[node.response].text : [view.before, chosen].filter(Boolean).join(" ") + ending;
        } else composed = chosen;
      }
    }
    return { role: "you" as const, text: composed || audio[node.response].meaning, intention: !composed };
  }
  const heard = card?.heard ?? node.heard ?? (node.kind === "comprehension" ? ["C01"] : []);
  if (heard.length) return { role: "character" as const, text: heard.map(id => audio[id as keyof typeof audio].text).join(" "), intention: false };
  const previous = state.transcript.at(-1);
  if (previous?.role === "you") return { role: "you" as const, text: previous.written ?? audio[previous.audioId].text, intention: false };
  return null;
}
