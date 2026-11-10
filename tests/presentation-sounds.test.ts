// @vitest-environment jsdom
import { act, createElement, Fragment } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ play: vi.fn() }));
vi.mock("@/components/interaction/sounds", async importOriginal => ({
  ...await importOriginal<typeof import("@/components/interaction/sounds")>(), playInteractionSound: mocks.play,
}));
vi.mock("@/features/superuser/TestControls", () => ({ TestControls: () => null }));
import { InteractionSounds } from "@/components/interaction/InteractionSounds";
import { Presentation } from "@/features/onboarding/Presentation";
import { presentationFrames } from "@/features/onboarding/content";

let root: Root;
let container: HTMLElement;
beforeEach(() => {
  vi.clearAllMocks(); mocks.play.mockResolvedValue(undefined);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  window.scrollTo = vi.fn();
  localStorage.clear();
  document.body.innerHTML = '<div id="root"></div>';
  container = document.getElementById("root")!;
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
});
async function mount(review = false, finish = vi.fn()) {
  await act(async () => root.render(createElement(Fragment, null,
    createElement(InteractionSounds), createElement(Presentation, { review, onFinish: finish }),
  )));
  return finish;
}
async function click(selector: string) {
  const target = container.querySelector(selector);
  expect(target, selector).not.toBeNull();
  await act(async () => {
    if (target instanceof HTMLElement) target.click();
    else target!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("sound accompanying actual presentation changes", () => {
  it("starts silently and plays one musical cue, per forward or back action", async () => {
    await mount();
    expect(mocks.play).not.toHaveBeenCalled();
    await click('.presentation-next svg');
    expect(container.querySelector("h1")?.textContent).toContain("Tudo pronto.");
    expect(mocks.play.mock.calls).toEqual([["presentation-ready"]]);
    await click('.presentation-back');
    expect(container.querySelector("h1")?.textContent).toContain("Seu inglês");
    expect(mocks.play.mock.calls).toEqual([["presentation-ready"], ["presentation-welcome"]]);
  });
  it("does not play for the current chapter or locked chapters, and plays for a real chapter jump", async () => {
    await mount();
    await click('[aria-label="Etapa 1: Boas-vindas"]');
    await click('[aria-label="Etapa 5: Meu painel"]');
    expect(mocks.play).not.toHaveBeenCalled();
    await click('.presentation-next');
    await click('.presentation-next');
    expect(container.querySelector("h1")?.textContent).toContain("Você e Lucas");
    mocks.play.mockClear();
    await click('[aria-label="Etapa 2: Conversa"]');
    expect(mocks.play).not.toHaveBeenCalled();
    await click('[aria-label="Etapa 1: Boas-vindas"]');
    expect(mocks.play.mock.calls).toEqual([["presentation-welcome"]]);
    expect(container.querySelector("h1")?.textContent).toContain("Seu inglês");
  });
  it("uses transitions on all eight frame changes, then only the normal navigation cue on completion", async () => {
    const finish = await mount();
    for (let i = 0; i < 8; i++) await click('.presentation-next');
    expect(mocks.play.mock.calls).toEqual(presentationFrames.slice(1).map(frame => [frame.sound]));
    expect(finish).not.toHaveBeenCalled();
    await click('.presentation-next');
    expect(mocks.play.mock.calls.at(-1)).toEqual(["advance"]);
    expect(finish).toHaveBeenCalledOnce();
  });
  it("supports free review jumps without sounding on review mount or adding a transition to its exit", async () => {
    const finish = await mount(true);
    expect(mocks.play).not.toHaveBeenCalled();
    await click('[aria-label="Etapa 5: Meu painel"]');
    expect(mocks.play.mock.calls).toEqual([["presentation-dashboard"]]);
    expect(container.querySelector("h1")?.textContent).toContain("Tudo no seu lugar");
    await click('.presentation-header-actions > button');
    expect(mocks.play.mock.calls.at(-1)).toEqual(["click"]);
    expect(finish).toHaveBeenCalledOnce();
  });
});
