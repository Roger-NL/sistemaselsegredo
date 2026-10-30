import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DemoState, ReviewView } from "@/features/demo/model/types";

const mocks = vi.hoisted(() => ({
  snapshot: null as { status: "ok"; state: DemoState } | null,
  push: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/features/demo/session/browser", () => ({
  getBrowserSnapshot: () => mocks.snapshot,
  getServerSnapshot: () => mocks.snapshot,
  subscribe: () => () => {},
  remember: vi.fn(),
  restart: vi.fn(),
}));

vi.mock("@/features/dashboard/use-student-workspace", () => ({
  useStudentWorkspace: () => ({ status: "ready", generation: 1, saving: false, error: "", notice: "", refresh: vi.fn(), workspace: { account: { id: "student", name: "", email: "", status: "active", role: "student" }, learning: { revision: 0, demoSnapshot: mocks.snapshot ? encodeSnapshot(mocks.snapshot.state) : null, studySnapshot: null, demoPercent: 0, studyCompleted: 0, studyTotal: 24, updatedAt: null }, activities: [], conversations: [], liveClass: null } }),
}));

import { DemoHost } from "@/features/demo/DemoHost";
vi.mock("@/features/onboarding/PresentationGate", () => ({ PresentationGate: ({ children }: { children: (review: () => void) => unknown }) => children(() => {}) }));

import { Dashboard } from "@/features/dashboard/Dashboard";
import { DemoAudioContext, type DemoAudio } from "@/features/demo/audio/use-demo-audio";
import { Retrospective } from "@/features/demo/components/Retrospective";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { decodeSnapshot, encodeSnapshot } from "@/features/demo/session/storage";
import legacy from "./fixtures/demo-legacy-navigation.json";

const audioController: DemoAudio = {
  playback: { source: null, status: "idle", progress: 0 },
  replay: async () => {}, pause: () => {}, resume: async () => {}, stop: () => {},
  release: () => {}, setPlaybackRate: () => {},
};
function restore(snapshot: unknown): DemoState {
  const state = decodeSnapshot(JSON.stringify(snapshot));
  expect(state).not.toBeNull();
  return state!;
}
function renderHost(state: DemoState) {
  mocks.snapshot = { status: "ok", state };
  return renderToStaticMarkup(createElement(DemoHost, { experience: true }));
}
function renderReview(state: DemoState, view: ReviewView) {
  return renderToStaticMarkup(createElement(DemoAudioContext.Provider, { value: audioController },
    createElement(Retrospective, { state: { ...state, reviewView: view }, setView: () => {}, replaying: false, onReplayChange: () => {} })));
}
function mixedLegacyEnding() {
  // Join two frozen journals at the same reaction: one real send, then the old test skips.
  const reaction = legacy.skipped.journal.findIndex(event => event.at === "p2.reaction");
  expect(reaction).toBeGreaterThan(-1);
  return restore({ ...legacy.skipped, journal: [
    ...legacy.beginner.afterSend.journal, ...legacy.skipped.journal.slice(reaction),
  ] });
}

beforeEach(() => { vi.clearAllMocks(); mocks.snapshot = null; });

describe("public story navigation", () => {
  it("keeps Back and Restart without exposing a test skip in the learning menu", () => {
    for (const state of [createDemo("beginner", "navigation-ui", 0), restore(legacy.some.beforeSend), restore(legacy.skipped)]) {
      const html = renderHost(state);
      const header = html.match(/<header class="app-header"[\s\S]*?<\/header>/)?.[0];
      expect(header).toBeDefined();
      expect(header).toContain(">Voltar</button>");
      expect(header).toContain('aria-label="Recomeçar"');
      expect(header).not.toContain("Avançar");
      expect(html).not.toContain("Avançar sem responder");
      expect(html).not.toContain("navegação temporária de teste");
    }
  });

  it("preserves the normal card actions while removing the menu shortcut", () => {
    const title = createDemo("beginner", "normal-card-ui", 0);
    const titleHtml = renderHost(title);
    expect(titleHtml).toContain("Um encontro na cafeteria.");
    expect(titleHtml).toMatch(/class="primary"[^>]*>Avançar<\/button>/);
    const context = transition(title, { at: title.nodeId, type: "NEXT" });
    expect(renderHost(context)).toContain("Começar a história");
  });
});

describe("honest review of saved test attempts", () => {
  it("labels the ending position in the dashboard without claiming skipped activities were completed", () => {
    for (const state of [restore(legacy.skipped), mixedLegacyEnding()]) {
      mocks.snapshot = { status: "ok", state };
      const html = renderToStaticMarkup(createElement(Dashboard, { account: { name: "", email: "" } }));
      expect(html).toContain("Conversa concluída");
      expect(html).toContain('aria-label="Rever minha conversa"');
      expect(html).toContain('aria-label="Começar meu estudo guiado"');
      expect(html).not.toContain("Demo concluída");
    }
  });

  it("does not describe a fully skipped legacy attempt as learner participation", () => {
    const state = restore(legacy.skipped);
    expect(state.transcript.filter(line => line.role === "you")).toEqual([]);
    expect(state.evidence).toEqual([]);
    const html = renderReview(state, "end");
    expect(html).toContain("Você chegou ao fim");
    expect(html).toContain("Esta tentativa não tem respostas suas registradas.");
    expect(html).toContain("Rever cenas e áudios");
    expect(html).toContain("Ver resumo da conversa");
    expect(html).not.toContain("Você participou");
    expect(html).not.toContain("Você disse");
  });

  it("offers history and completion without invented moments or practice counts", () => {
    const html = renderReview(restore(legacy.skipped), "moments");
    expect(html).toContain("Esta tentativa não tem respostas suas registradas.");
    expect(html).toContain("Rever cenas e áudios");
    expect(html).toContain("Ver histórico em texto");
    expect(html).toContain("Concluir demo");
    expect(html).toContain("Esta conversa não comprova domínio ou memorização.");
    expect(html).not.toContain("Percorrer momentos");
    expect(html).not.toContain("Momento 1 de 0");
    expect(html).not.toContain('class="moment-card"');
    expect(html).not.toContain("Você disse");
    expect(html).not.toMatch(/\d+ (respostas escritas|expressões escolhidas|montagens|adaptações|respostas com apoio)/);
  });

  it("keeps study, optional evaluation and an exit reachable for a skipped attempt", () => {
    const state = restore(legacy.skipped);
    const thanks = renderReview(state, "thanks");
    expect(thanks).toContain("Fim do percurso");
    expect(thanks).not.toContain("Demo concluída");
    expect(thanks).toContain('href="/demo/estudo"');
    expect(thanks).toContain("Avaliar a experiência");
    expect(thanks).toContain("Terminar sem avaliar");
    const feedback = renderReview(state, "feedback");
    expect(feedback).toContain("Avaliar é opcional.");
    expect(feedback).toContain("Terminar sem enviar");
    const done = renderReview(state, "done");
    expect(done).toContain('href="/demo/estudo"');
    expect(done).toContain("Rever cenas e áudios");
    expect(done).toContain("Ver resumo da conversa");
  });

  it("counts only the real response in a legacy attempt mixed with test skips", () => {
    const state = mixedLegacyEnding();
    expect(state.nodeId).toBe("end");
    expect(state.transcript.filter(line => line.role === "you").map(line => line.audioId)).toEqual(["U01"]);
    expect(state.evidence).toEqual([{ nodeId: "p2.send", response: "U01", kind: "blocks" }]);
    const html = renderReview(state, "moments");
    expect(html).toContain("1 montagem");
    expect(html).toContain("Ainda não há pares de expressões para destacar.");
    expect(html).not.toContain("Esta tentativa não tem respostas suas registradas.");
    expect(html).not.toContain("Você disse");
    expect(html).not.toContain("Você adaptou");
    expect(html).not.toMatch(/\d+ (respostas escritas|expressões escolhidas|adaptações|respostas com apoio)/);
    expect(html).not.toContain("Momento 1 de 0");
    expect(renderReview(state, "end")).toContain("Você participou desta");
    const thanks = renderReview(state, "thanks");
    expect(thanks).toContain("Fim do percurso");
    expect(thanks).not.toContain("Demo concluída");
  });
});
