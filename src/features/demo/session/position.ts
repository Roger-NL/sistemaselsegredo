import { catalog } from "../content/catalog";
import { decodeSnapshot } from "./storage";

export function conversationPosition(raw: string | null) {
  const state = raw ? decodeSnapshot(raw) : null;
  const node = state && catalog[state.nodeId];
  return node ? { part:node.part, completed:node.kind === "end" } : null;
}
