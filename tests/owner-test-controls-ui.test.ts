// @vitest-environment jsdom
import { act, createElement, Fragment, type AnchorHTMLAttributes } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudentWorkspace } from "@/contracts/workspace";
import type { WorkspaceState } from "@/features/dashboard/workspace-store";

const mocks = vi.hoisted(() => ({
  state: {} as WorkspaceState,
  applyTestControl: vi.fn(),
  flush: vi.fn(),
}));
vi.mock("next/link", () => ({ default: ({ children, prefetch: _prefetch, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) => {
  void _prefetch;
  return createElement("a", props, children);
} }));
vi.mock("@/features/dashboard/use-student-workspace", () => ({ useStudentWorkspace: () => mocks.state }));
vi.mock("@/features/dashboard/workspace-store", () => ({ studentWorkspace: { applyTestControl: mocks.applyTestControl, flush: mocks.flush } }));
vi.mock("@/components/navigation/JourneyTransition", () => ({ useJourneyTransition: () => ({ headerTone: "paper", reducedMotion: false }) }));
vi.mock("@/features/local-testing/LocalTestLauncher", () => ({ LocalTestStatus: () => null, LocalTestLauncher: () => null }));

import { AppHeader } from "@/components/navigation/AppHeader";
import { Presentation } from "@/features/onboarding/Presentation";
import { TestControlsOverlay } from "@/features/superuser/TestControls";

function workspace(canTest = true, testMode = false): StudentWorkspace {
  return {
    account: { id: "owner-fixture", name: "Titular de teste", email: "owner@example.test", status: "active", role: "manager", canTest },
    learning: { revision: 3, saveVersion: 8, demoSnapshot: null, studySnapshot: null, demoPercent: 0, studyCompleted: 0, studyTotal: 24, updatedAt: null, testMode },
    activities: [], conversations: [], liveClass: null,
  };
}

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

let root: Root, container: HTMLElement;
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  // A missed mock must fail locally; these component tests never use a service.
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Unexpected network request"); }));
  window.scrollTo = vi.fn();
  mocks.state = { status: "ready", workspace: workspace(), saving: false, error: "", notice: "", generation: 0 };
  mocks.applyTestControl.mockResolvedValue(undefined);
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
  document.body.innerHTML = '<div id="root"></div>';
  container = document.getElementById("root")!;
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
});

async function mount(presentation = false) {
  await act(async () => root.render(createElement(Fragment, null,
    presentation ? createElement(Presentation, { review: true, onFinish: vi.fn() }) : createElement(AppHeader, { current: "dashboard" }),
    createElement(TestControlsOverlay),
  )));
}

function trigger() {
  return container.querySelector<HTMLButtonElement>('button[aria-label="Controles de teste da minha conta"]');
}
async function open() {
  const button = trigger();
  expect(button).not.toBeNull();
  await act(async () => button!.click());
  const dialog = container.querySelector<HTMLDialogElement>("dialog");
  expect(dialog?.open).toBe(true);
  return dialog!;
}

describe("the owner's test controls", () => {
  it.each([false, true])("labels the real trigger Teste with testMode=%s", async testMode => {
    mocks.state.workspace = workspace(true, testMode);
    await mount();
    expect(trigger()?.textContent).toBe("Teste");
    expect(trigger()?.getAttribute("aria-haspopup")).toBe("dialog");
    const dialog = await open();
    expect(dialog.querySelector("h2")?.textContent).toBe("O que você quer fazer?");
    const links = [...dialog.querySelectorAll(".test-page-links a")];
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
      expect(link.textContent).not.toMatch(/[↗\uFE0F]/u);
    }
  });

  it.each([320, 390, 844])("keeps the real trigger beside Menu and opens it at viewport width %i", async width => {
    // This verifies viewport-independent rendering and activation, not browser layout.
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    await mount();
    const tools = trigger()!.parentElement!;
    expect(tools.classList.contains("app-header-tools")).toBe(true);
    expect(trigger()!.nextElementSibling?.matches("details.app-header-menu")).toBe(true);
    expect(tools.querySelector("summary")?.textContent).toBe("Menu");
    await open();
  });

  it.each(["loading", "error", "unauthenticated"] as const)("exposes neither trigger nor dialog while status is %s", async status => {
    mocks.state.status = status;
    await mount();
    expect(trigger()).toBeNull();
    await act(async () => window.dispatchEvent(new Event("basedspeak.test-controls.open")));
    expect(container.querySelector("dialog")).toBeNull();
    expect(mocks.applyTestControl).not.toHaveBeenCalled();
  });

  it.each(["manager", "student", "guest"] as const)("does not grant controls to a %s without canTest", async role => {
    mocks.state.workspace = role === "guest" ? null : workspace(false);
    if (mocks.state.workspace && role !== "guest") mocks.state.workspace.account.role = role;
    await mount();
    expect(trigger()).toBeNull();
    await act(async () => window.dispatchEvent(new Event("basedspeak.test-controls.open")));
    expect(container.querySelector("dialog")).toBeNull();
    expect(mocks.applyTestControl).not.toHaveBeenCalled();
  });

  it("opens the real controls during presentation review and closes them", async () => {
    await mount(true);
    expect(container.querySelector(".presentation-header")?.contains(trigger())).toBe(true);
    const dialog = await open();
    const close = [...dialog.querySelectorAll("button")].find(button => button.textContent?.trim() === "Fechar")!;
    await act(async () => close.click());
    expect(container.querySelector("dialog")).toBeNull();
  });

  it("sends only reset-all, blocks two immediate taps, and makes a failure retryable", async () => {
    const pending = deferred();
    mocks.applyTestControl.mockReturnValueOnce(pending.promise);
    await mount();
    const dialog = await open();
    const reset = dialog.querySelector<HTMLButtonElement>('[data-test-action="reset-all"]')!;
    expect(reset.textContent).toBe("Apagar tudo");
    await act(async () => { reset.click(); reset.click(); });
    expect(mocks.applyTestControl).toHaveBeenCalledExactlyOnceWith({ action: "reset-all" });
    expect(dialog.querySelector("fieldset")?.disabled).toBe(true);
    expect(dialog.querySelector("footer")?.textContent).toBe("Aplicando…");
    await act(async () => pending.reject(new Error("Não foi possível apagar a conta de teste.")));
    expect(dialog.querySelector("fieldset")?.disabled).toBe(false);
    expect(dialog.querySelector("footer")?.textContent).toBe("Não foi possível apagar a conta de teste.");
    // Failed reset stays open and permits another explicit attempt.
    const retry = deferred();
    mocks.applyTestControl.mockReturnValueOnce(retry.promise);
    await act(async () => reset.click());
    expect(mocks.applyTestControl).toHaveBeenCalledTimes(2);
    await act(async () => retry.reject(new Error("Ainda indisponível.")));
  });

  it("blocks a different command and closing while a command is pending, then allows another action", async () => {
    const pending = deferred();
    mocks.applyTestControl.mockReturnValueOnce(pending.promise);
    await mount();
    const dialog = await open();
    const first = dialog.querySelector<HTMLButtonElement>('[data-test-action="complete-study"]')!;
    const second = dialog.querySelector<HTMLButtonElement>('[data-test-action="reset-study"]')!;
    await act(async () => { first.click(); second.click(); });
    expect(mocks.applyTestControl).toHaveBeenCalledExactlyOnceWith({ action: "complete-study" });
    expect(dialog.querySelector("header button")?.hasAttribute("disabled")).toBe(true);
    await act(async () => dialog.dispatchEvent(new Event("cancel", { cancelable: true })));
    expect(dialog.open).toBe(true);
    await act(async () => pending.resolve());
    expect(dialog.querySelector("footer")?.textContent).toBe("Pronto. Progresso atualizado.");
    expect(dialog.querySelector("fieldset")?.disabled).toBe(false);
    await act(async () => second.click());
    expect(mocks.applyTestControl).toHaveBeenLastCalledWith({ action: "reset-study" });
  });

  it("removes both trigger and open dialog when the account loses its authorization", async () => {
    await mount();
    await open();
    mocks.state = { ...mocks.state, workspace: workspace(false) };
    await mount();
    expect(trigger()).toBeNull();
    expect(container.querySelector("dialog")).toBeNull();
  });
});
