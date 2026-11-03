// @vitest-environment jsdom
import { act, createElement, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), flush: vi.fn(), cancel: vi.fn() }));
vi.mock("next/link", () => ({ default: ({ href, children, onClick, prefetch: _prefetch, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) => {
  void _prefetch;
  return createElement("a", { ...props, href, onClick: (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) { event.preventDefault(); mocks.navigate(href); }
  } }, children);
} }));
vi.mock("@/components/navigation/JourneyTransition", () => ({ useJourneyTransition: () => ({ headerTone: "paper", reducedMotion: false }) }));
vi.mock("@/features/dashboard/workspace-store", () => ({ studentWorkspace: { flush: mocks.flush } }));
vi.mock("@/features/superuser/TestControls", () => ({ TestControls: () => null }));
vi.mock("@/features/local-testing/LocalTestLauncher", () => ({ LocalTestStatus: () => null, LocalTestLauncher: () => null }));
import { AppHeader } from "@/components/navigation/AppHeader";

let root: Root, container: HTMLElement;
beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  document.body.innerHTML = '<div id="root"></div><button id="outside">Fora do menu</button>';
  window.history.replaceState(null, "", "/demo");
  container = document.getElementById("root")!; root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });
async function mount(options: { onSettings?: () => void; onAccount?: () => void; back?: () => void; restart?: () => void } = {}) {
  await act(async () => root.render(createElement(AppHeader, { current: "demo", onNavigate: mocks.cancel, onSettings: options.onSettings, onAccount: options.onAccount },
    createElement("button", { onClick: options.back }, "Voltar"),
    createElement("button", { onClick: options.restart }, "Recomeçar"))));
  const menu = container.querySelector<HTMLDetailsElement>("details.app-header-menu")!;
  const summary = menu.querySelector<HTMLElement>("summary")!;
  menu.open = true; summary.focus();
  return { menu, summary };
}
function blurWithoutNewFocus(element: HTMLElement) {
  // Touching a non-focus-taking control can blur summary before click, without
  // providing relatedTarget. Hiding the menu here cancels the browser's click.
  element.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: null }));
}

describe("learning menu activation", () => {
  it("keeps a touch action reachable through a null focus target and then opens settings", async () => {
    const onSettings = vi.fn(); const { menu, summary } = await mount({ onSettings });
    await act(async () => blurWithoutNewFocus(summary));
    expect(menu.open).toBe(true);
    const settings = [...menu.querySelectorAll("button")].find(b => b.textContent === "Configurações")!;
    await act(async () => settings.click());
    expect(onSettings).toHaveBeenCalledOnce(); expect(menu.open).toBe(false);
  });
  it("activates each story control once, then dismisses the menu so the resulting screen is visible", async () => {
    const back = vi.fn(), restart = vi.fn(); const { menu, summary } = await mount({ back, restart });
    for (const [label, callback] of [["Voltar", back], ["Recomeçar", restart]] as const) {
      menu.open = true;
      await act(async () => blurWithoutNewFocus(summary));
      expect(menu.open).toBe(true);
      const control = [...menu.querySelectorAll(".app-menu-story button")].find(button => button.textContent === label)! as HTMLButtonElement;
      await act(async () => control.click());
      expect(callback).toHaveBeenCalledOnce(); expect(menu.open).toBe(false);
    }
  });
  it("preserves links to the live class and account settings after the same touch sequence", async () => {
    const { menu, summary } = await mount();
    for (const href of ["/dashboard#aula-ao-vivo", "/dashboard?painel=configuracoes", "/dashboard?painel=conta", "/demo/estudo"]) {
      menu.open = true;
      await act(async () => blurWithoutNewFocus(summary));
      expect(menu.open).toBe(true);
      await act(async () => menu.querySelector<HTMLAnchorElement>(`a[href="${href}"]`)!.click());
      expect(mocks.navigate).toHaveBeenLastCalledWith(href); expect(menu.open).toBe(false);
    }
    expect(mocks.cancel).toHaveBeenCalledTimes(4); expect(mocks.flush).toHaveBeenCalledTimes(4);
  });
  it("still dismisses on outside pointer, keyboard focus leaving the menu, and Escape", async () => {
    const { menu, summary } = await mount();
    await act(async () => summary.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: menu.querySelector("a") })));
    expect(menu.open).toBe(true);
    await act(async () => summary.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: document.getElementById("outside") })));
    expect(menu.open).toBe(false);
    menu.open = true;
    await act(async () => document.getElementById("outside")!.dispatchEvent(new Event("pointerdown", { bubbles: true })));
    expect(menu.open).toBe(false);
    menu.open = true;
    await act(async () => menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(menu.open).toBe(false); expect(document.activeElement).toBe(summary);
  });
});
