import type { StorySound } from "@/components/interaction/story-sounds";
import type { DemoEvent, DemoState } from "./types";

/** Accents belong to a forward story beat, never a retry, card, return or reload. */
export function storySoundFor(before: DemoState, after: DemoState, event: DemoEvent): StorySound | null {
  if (["BACK", "BACK_SCENE"].includes(event.type) || before.nodeId === after.nodeId) return null;
  if (after.nodeId === "p6.warn") return "story-surprise";
  if (after.nodeId === "p6.safe") return "story-relief";
  if (after.nodeId === "p8.table") return "story-settle";
  return null;
}
