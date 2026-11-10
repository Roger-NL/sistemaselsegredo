// @vitest-environment jsdom
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserText } from "@/components/i18n/BrowserText";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { PROFILES, type DemoState, type SupportProfile } from "@/features/demo/model/types";

const mocks = vi.hoisted(() => ({ remember: vi.fn() }));
vi.mock("@/features/demo/session/browser", () => ({ remember: mocks.remember }));
// Layout effects are unrelated to message presence. Keep the actual activity,
// reducer, translation boundaries and storage-error effect under test.
vi.mock("@/features/demo/components/SceneFrame", () => ({
  SceneFrame: ({ intro, children, actions }: { intro: ReactNode; children: ReactNode; actions: ReactNode }) =>
    createElement("section", null, intro, children, createElement("nav", null, actions)),
}));
vi.mock("@/features/demo/components/SceneArtwork", () => ({ SceneArtwork: () => null }));
import { DemoExperience } from "@/features/demo/DemoExperience";

let root: Root, container: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) as unknown as typeof window.matchMedia;
  mocks.remember.mockReset().mockReturnValue(true);
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });

async function message(value: ReactNode) {
  await act(async () => root.render(createElement("p", { role: "status", className: "notice" }, createElement(BrowserText, null, value))));
  return container.querySelector("p")!;
}
function translate(boundary: Element) {
  const font = document.createElement("font"), nested = document.createElement("font");
  nested.textContent = boundary.textContent; font.append(nested); boundary.replaceChildren(font);
}
function responseActivity(profile: SupportProfile) {
  let state = createDemo(profile, "notice-regression", 0);
  for (let step = 0; step < 12; step++) {
    if (state.nodeId === "p2.send" && ["build", "write", "select"].includes(state.phase)) return state;
    state = state.nodeId === "p2.question"
      ? transition(state, { at: state.nodeId, type: "ANSWER_MEANING", correct: true })
      : transition(state, { at: state.nodeId, type: "CONTINUE_SCENE" });
  }
  throw new Error("NOTICE_ACTIVITY_NOT_REACHED");
}
async function demo(state: DemoState, generation = 1) {
  await act(async () => root.render(createElement(DemoExperience, { initial: state, generation, key: `${state.profile}:${state.notice}` })));
}

describe("empty status text boundaries", () => {
  it("leaves an empty message without a span or text node, and preserves zero", async () => {
    for (const value of ["", null, undefined, false]) {
      const status = await message(value);
      expect(status.matches(":empty")).toBe(true);
      expect(status.childNodes).toHaveLength(0);
    }
    expect((await message(0)).textContent).toBe("0");
    expect(container.querySelector("[data-ui-text]")).not.toBeNull();
  });

  it("preserves deliberate inline whitespace and the original real-message text", async () => {
    expect((await message(" ")).textContent).toBe(" ");
    const status = await message("  Confira sua resposta.  ");
    expect(status.textContent).toBe("  Confira sua resposta.  ");
    expect(status.matches(":empty")).toBe(false);
  });

  it("handles empty, translated message, new message and empty without stale text or DOM errors", async () => {
    expect((await message("")).matches(":empty")).toBe(true);
    await message("Confira sua resposta.");
    const old = container.querySelector("[data-ui-text]")!;
    translate(old);
    expect((await message("Tente novamente.")).textContent).toBe("Tente novamente.");
    expect(old.isConnected).toBe(false);
    old.textContent = "Delayed old translation";
    const current = container.querySelector("[data-ui-text]")!;
    translate(current);
    const cleared = await message("");
    expect(cleared.matches(":empty")).toBe(true);
    expect(current.isConnected).toBe(false);
    current.textContent = "Delayed current translation";
    expect(cleared.childNodes).toHaveLength(0);
  });
});

describe("demo notices", () => {
  for (const profile of PROFILES) it(`keeps empty or whitespace activity notices empty and real notices present for ${profile}`, async () => {
    const state = responseActivity(profile);
    for (const notice of ["", " \n\t", "Confira as peças e tente novamente."]) {
      await demo({ ...state, notice });
      const status = container.querySelector(".activity-content .notice")!;
      expect(status).not.toBeNull();
      expect(status.matches(":empty")).toBe(!notice.trim());
      expect(status.textContent).toBe(notice.trim() ? notice : "");
      expect(status.getAttribute("role")).toBe("status");
      expect(status.hasAttribute("hidden")).toBe(false);
    }
  });

  it("clears translated retry feedback when the learner chooses a correct piece", async () => {
    await demo(responseActivity("beginner"));
    const piece = (text: string) => [...container.querySelectorAll<HTMLButtonElement>(".blocks button")].find(button => button.textContent === text)!;
    await act(async () => piece("mine").click());
    const status = container.querySelector(".activity-content .notice")!;
    expect(status.textContent).toContain("Essa peça voltou às opções.");
    translate(status.querySelector("[data-ui-text]")!);
    await act(async () => piece("No").click());
    expect(status.matches(":empty")).toBe(true);
    expect(status.childNodes).toHaveLength(0);
  });

  it("keeps the separate imperative synchronization-error notice visible after remember fails", async () => {
    const state = createDemo("beginner", "storage-notice-regression", 0);
    await demo(state);
    const status = container.querySelector(".session-notices .notice")!;
    expect(status.matches(":empty")).toBe(true);
    mocks.remember.mockReturnValue(false);
    await demo(state, 2);
    expect(status.textContent).toBe("Não foi possível sincronizar. Atualize seu painel antes de continuar.");
    expect(status.matches(".notice:not(:empty)")).toBe(true);
    expect(status.hasAttribute("hidden")).toBe(false);
    expect(status.getAttribute("role")).toBe("status");
  });
});
