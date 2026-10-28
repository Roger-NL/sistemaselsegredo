import { catalog } from "@/features/demo/content/catalog";
import { decodeSnapshot } from "@/features/demo/session/storage";

/** A branched story can end without answering the unchosen branches. Test skipping is not completion. */
export function completedConversation(raw: string | null): boolean {
  const state = raw ? decodeSnapshot(raw) : null;
  return Boolean(state && catalog[state.nodeId]?.kind === "end" && !state.journal.some(event => event.type === "TEST_FORWARD"));
}
