import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DemoState, SupportProfile } from "@/features/demo/model/types";

const mocks = vi.hoisted(() => ({
  snapshot: { status: "empty", state: null as DemoState | null },
  studyView: "overview" as "overview" | "phrases",
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/features/demo/session/browser", () => ({
  getBrowserSnapshot: () => mocks.snapshot,
  getServerSnapshot: () => mocks.snapshot,
  subscribe: () => () => {},
  remember: vi.fn(),
  restart: vi.fn(),
}));
vi.mock("react", async importOriginal => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    // Select the normal glossary view for SSR. Click/navigation behavior is browser QA.
    useState: (initial: unknown) => react.useState(initial === "overview" ? mocks.studyView : initial),
  };
});

import { Dashboard } from "@/features/dashboard/Dashboard";
import { DemoHost } from "@/features/demo/DemoHost";
import { Retrospective } from "@/features/demo/components/Retrospective";
import { catalog } from "@/features/demo/content/catalog";
import { audio } from "@/features/demo/content/media";
import { presentationCards } from "@/features/demo/content/presentation";
import { listeningTarget } from "@/features/demo/model/listening";
import { practice } from "@/features/demo/model/practice";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { STORAGE_KEY, clearDemo, restoreDemo, saveDemo } from "@/features/demo/session/storage";
import { TheoryExperience } from "@/features/theory/TheoryExperience";
import { THEORY_KEY, completeStep, emptyProgress, normalizeAnswer, studySteps } from "@/features/theory/progress";
import legacy from "./fixtures/demo-legacy-navigation.json";

function storage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
    removeItem: (key: string) => { data.delete(key); },
  };
}
function roundTrip(state: DemoState, store = storage()) {
  expect(saveDemo(store, state)).toBe(true);
  const restored = restoreDemo(store);
  expect(restored.status).toBe("ok");
  if (restored.status !== "ok") throw new Error("Narrative was not restored");
  expect(restored.state).toEqual(state);
  mocks.snapshot = { status: "ok", state: restored.state };
  return store;
}
function walk(profile: SupportProfile, destination = "end", choices: Record<string, string> = {}) {
  let state = createDemo(profile, `study-journey-${profile}`, 1000);
  for (let guard = 0; state.nodeId !== destination && guard < 600; guard++) {
    const node = catalog[state.nodeId];
    const target = listeningTarget(state);
    if (target && !state.audioAccess[target.key]) {
      state = transition(state, { at: node.id, type: "AUDIO_ACCESS", key: target.key, mode: "text" });
    } else if (state.presentationStep < presentationCards(node).length) {
      state = transition(state, { at: node.id, type: "ADVANCE_PRESENTATION" });
    } else if (node.kind === "scene") {
      state = transition(state, { at: node.id, type: "NEXT" });
    } else if (node.kind === "choice") {
      const choice = choices[node.id] ?? node.choices[0].id;
      expect(node.choices.map(item => item.id)).toContain(choice);
      state = transition(state, { at: node.id, type: "CHOOSE", choice });
    } else if (node.kind === "comprehension") {
      state = transition(state, { at: node.id, type: "UNDERSTAND", correct: true });
    } else if (node.kind === "response") {
      if (state.phase === "present") state = transition(state, { at: node.id, type: "PREPARE" });
      else if (state.phase === "recall") state = transition(state, { at: node.id, type: "CHECK" });
      else {
        if (state.phase === "build") {
          for (const block of practice(node, state.activityProfile).answer) state = transition(state, { at: node.id, type: "PLACE_BLOCK", block });
        } else if (state.phase === "write") state = transition(state, { at: node.id, type: "TYPE", text: audio[node.response].text });
        else if (state.phase === "select") state = transition(state, { at: node.id, type: "RECOGNIZE", response: node.response });
        state = transition(state, { at: node.id, type: "SEND_RESPONSE" });
      }
    } else throw new Error(`Unexpected ending before ${destination}`);
  }
  expect(state.nodeId).toBe(destination);
  expect(state.journal.some(event => event.type === "TEST_FORWARD")).toBe(false);
  return state;
}
const panel = () => renderToStaticMarkup(createElement(Dashboard, { account: { name: "", email: "" } }));
const theory = () => renderToStaticMarkup(createElement(TheoryExperience, { publishedAudio: {} }));
const glossary = (html: string) => [...html.matchAll(/<summary><span lang="en">(.*?)<\/span>(.*?)<\/summary>/g)].map(([, phrase, badge]) => ({
  phrase: phrase.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&"),
  lived: badge.includes("Na sua conversa"),
}));

beforeEach(() => { mocks.snapshot = { status: "empty", state: null }; mocks.studyView = "overview"; });

describe("narrative, panel and study journey", () => {
  it("offers a first conversation and direct study without creating narrative evidence", () => {
    expect(panel()).toContain('aria-label="Acessar sua demo"');
    const entry = renderToStaticMarkup(createElement(DemoHost, { experience: true }));
    expect(entry).toContain("Como você prefere começar?");
    expect(entry).toContain('href="/demo/estudo"');
    expect(theory()).toContain('href="/demo"');
    expect(mocks.snapshot.state).toBeNull();
  });

  it("returns from study to a saved unfinished response without changing its draft or evidence", () => {
    let state = walk("less", "p2.send");
    state = transition(state, { at: state.nodeId, type: "TYPE", text: "No, it is not" });
    const store = roundTrip(state);
    const narrativeBeforeStudy = store.getItem(STORAGE_KEY);
    expect(panel()).toContain('aria-label="Continuar a história"');
    const study = completeStep(emptyProgress, studySteps[0].step.id, true);
    store.setItem(THEORY_KEY, JSON.stringify(study));
    expect(theory()).toContain("Seu avanço fica neste navegador.");
    expect(store.getItem(STORAGE_KEY)).toBe(narrativeBeforeStudy);
    const restored = restoreDemo(store);
    expect(restored.status).toBe("ok");
    if (restored.status !== "ok") return;
    expect(restored.state).toEqual(state);
    expect(restored.state.draft).toBe("No, it is not");
    expect(restored.state.transcript.some(line => line.role === "you")).toBe(false);
    expect(restored.state.evidence).toEqual([]);
  });

  for (const [profile, choices] of [
    ["beginner", { "p8.topic": "job", "p9.pause": "stay", "p10.contact": "contact" }],
    ["some", { "p3.intent": "okay", "p8.topic": "english", "p9.pause": "go" }],
    ["less", { "p8.topic": "job", "p9.pause": "go", "p10.contact": "bye" }],
  ] as const) {
    it(`connects a completed ${profile} conversation to review and study without requiring evaluation`, () => {
      const state = walk(profile, "end", choices);
      const store = roundTrip(state);
      const original = store.getItem(STORAGE_KEY);
      expect(panel()).toContain('aria-label="Rever minha conversa"');
      for (const reviewView of ["thanks", "done"] as const) {
        const reviewState = transition(state, { at: "end", type: "REVIEW", view: reviewView });
        const html = renderToStaticMarkup(createElement(Retrospective, { state: reviewState, setView: () => {} }));
        expect(html).toContain('href="/demo/estudo"');
        if (reviewView === "thanks") expect(html).toContain("Terminar sem avaliar");
      }
      expect(theory()).toContain('href="/dashboard"');
      expect(theory()).toContain("Voltar à conversa");
      expect(store.getItem(STORAGE_KEY)).toBe(original);
      expect(restoreDemo(store)).toEqual({ status: "ok", state });
    });
  }

  it("marks glossary phrases only when the saved conversation actually contains them", () => {
    const state = walk("some", "end", { "p8.topic": "job", "p9.pause": "stay", "p10.contact": "bye" });
    roundTrip(state);
    mocks.studyView = "phrases";
    const html = theory();
    const lived = new Set(state.transcript.map(line => normalizeAnswer(audio[line.audioId].text)));
    const entries = glossary(html);
    expect(entries.length).toBeGreaterThan(lived.size);
    for (const entry of entries) {
      expect(entry.lived, entry.phrase).toBe(lived.has(normalizeAnswer(entry.phrase)));
    }
    expect(new Set(Object.values(state.audioAccess))).toEqual(new Set(["text"]));
    expect(html).not.toContain("Você ouviu");
    expect(html).not.toContain("Você aprendeu");
  });

  it("keeps skipped legacy answers unmarked in study and preserves study when restarting the conversation", () => {
    const store = storage();
    store.setItem(STORAGE_KEY, JSON.stringify(legacy.skipped));
    const restored = restoreDemo(store);
    expect(restored.status).toBe("ok");
    if (restored.status !== "ok") return;
    mocks.snapshot = { status: "ok", state: restored.state };
    mocks.studyView = "phrases";
    const html = theory();
    const noReply = glossary(html).find(entry => normalizeAnswer(entry.phrase) === normalizeAnswer(audio.U01.text));
    expect(noReply).toBeDefined();
    expect(noReply!.lived).toBe(false);
    expect(restored.state.transcript.some(line => line.role === "you")).toBe(false);
    expect(restored.state.evidence).toEqual([]);
    const study = JSON.stringify(completeStep(emptyProgress, studySteps[0].step.id, true));
    store.setItem(THEORY_KEY, study);
    store.setItem(`${STORAGE_KEY}.feedback`, "draft");
    expect(clearDemo(store)).toBe(true);
    expect(store.getItem(STORAGE_KEY)).toBeNull();
    expect(store.getItem(`${STORAGE_KEY}.feedback`)).toBeNull();
    expect(store.getItem(THEORY_KEY)).toBe(study);
  });
});
