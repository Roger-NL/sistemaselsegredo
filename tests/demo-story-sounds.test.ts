import { describe, expect, it } from "vitest";
import { catalog } from "@/features/demo/content/catalog";
import { audio } from "@/features/demo/content/media";
import { presentationCards } from "@/features/demo/content/presentation";
import { listeningTarget } from "@/features/demo/model/listening";
import { practice } from "@/features/demo/model/practice";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { storySoundFor } from "@/features/demo/model/story-sound";
import { PROFILES, type DemoEvent } from "@/features/demo/model/types";

describe("narrative sound beats through the real conversation", () => {
  for (const profile of PROFILES) for (const branch of [0, 1]) {
    it(`${profile}, branch ${branch}: one accent per story moment, no accents on cards, attempts or Back`, () => {
      let state = createDemo(profile, `story-${profile}-${branch}`, 0);
      const accents: string[] = [];
      const act = (event: DemoEvent) => {
        const before = state;
        state = transition(state, event);
        const sound = storySoundFor(before, state, event);
        if (sound) accents.push(`${state.nodeId}:${sound}`);
        if (before.nodeId === state.nodeId) expect(sound).toBeNull();
        // Returning to a dramatic frame stays quiet, regardless of profile.
        expect(storySoundFor(state, before, { at: state.nodeId, type: "BACK" })).toBeNull();
      };
      for (let guard = 0; catalog[state.nodeId].kind !== "end"; guard++) {
        expect(guard).toBeLessThan(260);
        const node = catalog[state.nodeId], before = state;
        const target = listeningTarget(state);
        const event = (type: DemoEvent["type"]) => act({ at: node.id, type } as DemoEvent);
        if (target && !state.audioAccess[target.key]) act({ at: node.id, type: "AUDIO_ACCESS", key: target.key, mode: "heard" });
        else if (state.presentationStep < presentationCards(node, state).length) event("ADVANCE_PRESENTATION");
        else if (node.kind === "scene") event("NEXT");
        else if (node.kind === "choice") act({ at: node.id, type: "CHOOSE", choice: node.choices[Math.min(branch, node.choices.length - 1)].id });
        else if (node.kind === "comprehension") act({ at: node.id, type: "ANSWER_MEANING", correct: true });
        else if (node.kind === "response") {
          if (state.phase === "present") event("PREPARE");
          else if (state.phase === "recall") event("CHECK");
          else {
            if (state.phase === "build") for (const block of practice(node, state.assistedBlocks ? "some" : state.activityProfile).answer.slice(state.selected.length)) act({ at: node.id, type: "PLACE_BLOCK", block });
            else if (state.phase === "write") act({ at: node.id, type: "TYPE", text: audio[node.response].text });
            else if (state.phase === "select") act({ at: node.id, type: "RECOGNIZE", response: node.response });
            event("SEND_RESPONSE");
          }
        }
        expect(state).not.toBe(before);
      }
      expect(accents).toEqual(["p6.warn:story-surprise", "p6.safe:story-relief", "p8.table:story-settle"]);
    });
  }
});
