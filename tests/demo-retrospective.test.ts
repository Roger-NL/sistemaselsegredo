import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DemoAudioContext, type DemoAudio } from "@/features/demo/audio/use-demo-audio";
import { Retrospective } from "@/features/demo/components/Retrospective";
import { catalog } from "@/features/demo/content/catalog";
import { audio } from "@/features/demo/content/media";
import { presentationCards } from "@/features/demo/content/presentation";
import { listeningTarget } from "@/features/demo/model/listening";
import { practice } from "@/features/demo/model/practice";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { retrospective } from "@/features/demo/model/retrospective";
import type { AudioId, DemoEvent, DemoState, ReviewView, SupportProfile } from "@/features/demo/model/types";
import { decodeSnapshot, encodeSnapshot } from "@/features/demo/session/storage";
import legacy from "./fixtures/demo-legacy-navigation.json";

const controller: DemoAudio = {
  playback: { source: null, status: "idle", progress: 0 },
  replay: async () => {}, pause: () => {}, resume: async () => {}, stop: () => {},
  release: () => {}, setPlaybackRate: () => {},
};
function render(state: DemoState, view: ReviewView = "moments") {
  return renderToStaticMarkup(createElement(DemoAudioContext.Provider, { value: controller },
    createElement(Retrospective, { state: { ...state, reviewView: view }, setView: () => {} })));
}
function moment(state: DemoState) {
  const card = render(state).match(/<article class="moment-card">[\s\S]*?<\/article>/)?.[0];
  expect(card).toBeDefined();
  return card!;
}
const paragraph = (text: string) => renderToStaticMarkup(createElement("p", { lang: "en" }, text));
type JourneyOptions = {
  profile?: SupportProfile; written?: Partial<Record<AudioId, string>>; support?: string[];
};
function reach(target: string, { profile = "less", written = {}, support = [] }: JourneyOptions = {}) {
  let state = createDemo(profile, "retrospective-test", 0);
  for (let guard = 0; state.nodeId !== target; guard++) {
    expect(guard).toBeLessThan(100);
    const node = catalog[state.nodeId];
    const act = (event: DemoEvent) => { state = transition(state, event); };
    const listening = listeningTarget(state);
    const before = state;
    if (listening && !state.audioAccess[listening.key]) {
      act({ at: node.id, type: "AUDIO_ACCESS", key: listening.key, mode: "text" });
    } else if (state.presentationStep < presentationCards(node).length) {
      act({ at: node.id, type: "ADVANCE_PRESENTATION" });
    } else if (node.kind === "scene") {
      act({ at: node.id, type: "NEXT" });
    } else if (node.kind === "comprehension") {
      act({ at: node.id, type: "ANSWER_MEANING", correct: true });
    } else if (node.kind === "choice") {
      act({ at: node.id, type: "CHOOSE", choice: "okay" });
    } else if (node.kind === "response") {
      if (state.phase === "present") act({ at: node.id, type: "PREPARE" });
      else if (state.phase === "recall") act({ at: node.id, type: "CHECK" });
      else if (support.includes(node.id)) {
        if (state.phase === "write") act({ at: node.id, type: "TYPE", text: "Unaccepted draft" });
        act({ at: node.id, type: "REVEAL_MODEL" });
        act({ at: node.id, type: "USE_SUPPORT" });
      } else {
        if (state.phase === "write") act({ at: node.id, type: "TYPE", text: written[node.response] ?? audio[node.response].text });
        else if (state.phase === "build") {
          for (const block of practice(node, state.activityProfile).answer) act({ at: node.id, type: "PLACE_BLOCK", block });
        } else if (state.phase === "select") act({ at: node.id, type: "RECOGNIZE", response: node.response });
        act({ at: node.id, type: "SEND_RESPONSE" });
      }
    }
    expect(state).not.toBe(before);
  }
  return state;
}

describe("retrospective of actual conversation responses", () => {
  it("keeps accepted contractions, capitalization, punctuation and spaces literal on both sides", () => {
    const written = { U01: "  NO, it isn't mine!  ", U05: "Yes,  it is mine!" };
    const state = reach("p4.nice-b", { written });
    const highlights = retrospective(state);
    expect(highlights).toHaveLength(1);
    expect(highlights[0]).toMatchObject({
      before: "U01", after: "U05", beforeRole: "you",
      beforeWritten: written.U01, afterWritten: written.U05,
      beforeEvidenceKind: "written", afterEvidenceKind: "written",
    });
    const card = moment(state);
    expect(card).toContain(paragraph(written.U01));
    expect(card).toContain(paragraph(written.U05));
    expect(card).not.toContain(paragraph(audio.U01.text));
    expect(card).not.toContain(paragraph(audio.U05.text));
    expect(card).toContain("Ouvir modelo");
    expect(card).not.toContain("Ouvir trecho");
    expect(retrospective(decodeSnapshot(encodeSnapshot(state))!)).toEqual(highlights);
  });

  it("uses the approved phrase for assembled responses without claiming they were typed", () => {
    const state = reach("p4.nice-b", { profile: "some" });
    expect(retrospective(state)[0]).toMatchObject({ beforeEvidenceKind: "blocks", afterEvidenceKind: "blocks" });
    expect(retrospective(state)[0].beforeWritten).toBeUndefined();
    expect(retrospective(state)[0].afterWritten).toBeUndefined();
    const card = moment(state);
    expect(card).toContain(paragraph(audio.U01.text));
    expect(card).toContain(paragraph(audio.U05.text));
    expect(card).toContain("Ouvir trecho");
    expect(card).not.toContain("Ouvir modelo");
  });

  it("marks the corresponding supported reply and never presents its rejected draft as sent", () => {
    const state = reach("p4.nice-b", { support: ["p4.mine"] });
    const item = retrospective(state)[0];
    expect(item.beforeEvidenceKind).toBe("written");
    expect(item.afterEvidenceKind).toBe("supported");
    expect(item.afterWritten).toBeUndefined();
    const card = moment(state);
    expect(card.match(/Você disse com apoio/g)).toHaveLength(1);
    expect(card).toContain(paragraph(audio.U05.text));
    expect(card).not.toContain("Unaccepted draft");
    expect(render(state)).toContain("1 resposta com apoio");
  });

  it("also marks a supported source response without attributing its support to the later reply", () => {
    const state = reach("p4.nice-b", { support: ["p2.send"] });
    const item = retrospective(state)[0];
    expect(item.beforeEvidenceKind).toBe("supported");
    expect(item.afterEvidenceKind).toBe("written");
    expect(moment(state)).toContain(`<small>Você disse com apoio</small>${paragraph(audio.U01.text)}`);
    expect(moment(state)).toContain(`<small>Você disse</small>${paragraph(audio.U05.text)}`);
  });

  it("does not infer independent performance when support evidence is absent", () => {
    const state = { ...reach("p4.nice-b"), evidence: [] };
    const item = retrospective(state)[0];
    expect(item.beforeEvidenceKind).toBeNull();
    expect(item.afterEvidenceKind).toBeNull();
    const card = moment(state);
    expect(card).not.toMatch(/com apoio|sem apoio|sem ajuda|sozinho|autônom/i);
    expect(render(state)).toContain("Esta conversa não comprova domínio ou memorização.");
  });

  it("does not turn a correct unsent draft into a response or highlight", () => {
    let state = reach("p4.mine");
    while (state.presentationStep < presentationCards(catalog[state.nodeId]).length) {
      state = transition(state, { at: state.nodeId, type: "ADVANCE_PRESENTATION" });
    }
    state = transition(state, { at: state.nodeId, type: "TYPE", text: "Yes, it is mine!" });
    expect(state.draft).toBe("Yes, it is mine!");
    expect(retrospective(state)).toEqual([]);
    expect(state.transcript.some(line => line.audioId === "U05")).toBe(false);
  });

  it("keeps fully skipped legacy endings empty without a participation or proficiency claim", () => {
    const state = decodeSnapshot(JSON.stringify(legacy.skipped))!;
    expect(state).not.toBeNull();
    expect(retrospective(state)).toEqual([]);
    expect(render(state, "end")).not.toContain("Você participou");
    const html = render(state);
    expect(html).toContain("Esta tentativa não tem respostas suas registradas.");
    expect(html).not.toContain("Você disse");
    expect(html).not.toContain("Momento 1 de 0");
    expect(html).toContain("Esta conversa não comprova domínio ou memorização.");
    expect(render(state, "thanks")).toContain("Fim do percurso");
  });
});
